import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse, after } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getMarketerSession, type MarketerContext } from "@/lib/marketer";
import { notify } from "@/lib/notifications";
import { sendEmail } from "@/lib/email/send";
import { changeRequestEmail } from "@/lib/email/templates";
import { SITE_URL } from "@/lib/site";

// ==================== 👥 فرق العمل ====================
// عضو الفريق يعمل على صفحة صاحبها بكل صلاحيات اللوحة، ما عدا:
//   • إيميل وكلمة سر الحساب  • إدارة الفريق  • الدومين الخاص
// وإن كان "يحتاج موافقة" تتحول كل تعديلاته إلى طلبات (ChangeRequest) تُطبَّق فقط عند موافقة صاحب الصفحة.
export const INVITE_DAYS = 7;
export const MAX_MEMBERS = 15;

export const hashToken = (raw: string) => createHash("sha256").update(raw).digest("hex");
export const newInviteToken = () => {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hash: hashToken(raw), expires: new Date(Date.now() + INVITE_DAYS * 86_400_000) };
};
export const inviteUrl = (raw: string) => `${SITE_URL}/invite?token=${raw}`;

/** رد موحّد لما يخص صاحب الصفحة وحده */
export const ownerOnly = () => NextResponse.json({ success: false, error: "owner_only" }, { status: 403 });

// -------------------- 📝 أنواع التغييرات --------------------
export const CHANGE_KINDS = [
  "offer.create", "offer.update", "offer.delete", "offer.reorder",
  "article.create", "article.update", "article.delete",
  "page.update", "audience.update", "integrations.update",
] as const;
export type ChangeKind = (typeof CHANGE_KINDS)[number];

const OFFER_FIELDS = { title: true, slug: true, status: true, isFeatured: true, price: true, compareAt: true, currency: true, affiliateUrl: true, shortReview: true, badge: true, category: true, rating: true, images: true } as const;
const ARTICLE_FIELDS = { title: true, slug: true, status: true, excerpt: true, category: true, coverImage: true, seoTitle: true, seoDescription: true } as const;
const PAGE_FIELDS = { title: true, slug: true, tagline: true, bio: true, avatarUrl: true, coverUrl: true, language: true, theme: true, accentColor: true, isPublished: true, seoTitle: true, seoDescription: true, showDisclosure: true } as const;

/** اسم العنصر المتأثر + لقطة "قبل" للمقارنة في شاشة المراجعة */
async function describe(kind: ChangeKind, pageId: string, params: Record<string, string>, body: Record<string, unknown> | null) {
  const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : "");
  switch (kind) {
    case "offer.create": {
      if (typeof body?.duplicateOf === "string") {
        const src = await prisma.offer.findFirst({ where: { id: body.duplicateOf, landingPageId: pageId }, select: { title: true } });
        return { label: src?.title ?? "", targetId: body.duplicateOf, before: null, duplicate: true };
      }
      return { label: str(body?.title), targetId: null, before: null };
    }
    case "offer.update":
    case "offer.delete": {
      const o = await prisma.offer.findFirst({ where: { id: params.id, landingPageId: pageId }, select: OFFER_FIELDS });
      return { label: o?.title ?? "", targetId: params.id ?? null, before: o ? JSON.parse(JSON.stringify(o)) : null };
    }
    case "article.create":
      return { label: str(body?.title), targetId: null, before: null };
    case "article.update":
    case "article.delete": {
      const a = await prisma.article.findFirst({ where: { id: params.id, landingPageId: pageId }, select: ARTICLE_FIELDS });
      return { label: a?.title ?? "", targetId: params.id ?? null, before: a ? JSON.parse(JSON.stringify(a)) : null };
    }
    case "page.update": {
      const pg = await prisma.landingPage.findUnique({ where: { id: pageId }, select: PAGE_FIELDS });
      return { label: pg?.title ?? "", targetId: pageId, before: pg ? JSON.parse(JSON.stringify(pg)) : null };
    }
    case "audience.update":
    case "integrations.update": {
      const pg = await prisma.landingPage.findUnique({ where: { id: pageId }, select: { audience: true, integrations: true } });
      const snap = kind === "audience.update" ? pg?.audience : pg?.integrations;
      return { label: "", targetId: pageId, before: snap ? JSON.parse(JSON.stringify(snap)) : null };
    }
    default:
      return { label: "", targetId: null, before: null };
  }
}

type RouteCtx = { params?: Promise<Record<string, string>> };
type Handler<C extends RouteCtx> = (req: NextRequest, ctx: C) => Promise<Response>;

/**
 * 🚦 يغلّف route تعديل: صاحب الصفحة أو عضو موثوق ← يُنفَّذ مباشرة.
 * عضو "يحتاج موافقة" ← يُحفظ الطلب كما هو (المسار + البيانات) وينتظر صاحب الصفحة، ثم يُعاد تنفيذه حرفياً عند الموافقة.
 * validate (اختياري): نفس تحقق الـ route، حتى يرى العضو أخطاء البيانات فوراً بدل أن يفشل الطلب لاحقاً.
 */
export function withApproval<C extends RouteCtx>(kind: ChangeKind, handler: Handler<C>, validate?: (body: Record<string, unknown>) => string | null): Handler<C> {
  return async (req, routeCtx) => {
    const ctx = await getMarketerSession();
    if (!ctx?.landingPage || !ctx.member) return handler(req, routeCtx);

    touchMember(ctx.member.id);
    if (!ctx.member.requireApproval) return handler(req, routeCtx);

    const params = routeCtx?.params ? await routeCtx.params : {};
    const body = req.method === "DELETE" ? null : ((await req.clone().json().catch(() => null)) as Record<string, unknown> | null);
    if (body && validate) {
      const error = validate(body);
      if (error) return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const pending = await prisma.changeRequest.count({ where: { landingPageId: ctx.landingPage.id, authorId: ctx.userId, status: "pending" } });
    if (pending >= 100) return NextResponse.json({ success: false, error: "too_many_pending" }, { status: 429 });

    const d = await describe(kind, ctx.landingPage.id, params, body);
    const authorName = authorNameOf(ctx);
    const created = await prisma.changeRequest.create({
      data: {
        landingPageId: ctx.landingPage.id,
        memberId: ctx.member.id,
        authorId: ctx.userId,
        authorName,
        kind: "duplicate" in d && d.duplicate ? "offer.create" : kind,
        method: req.method,
        path: new URL(req.url).pathname,
        params: params as Prisma.InputJsonObject,
        body: (body ?? undefined) as Prisma.InputJsonValue | undefined,
        summary: d.label || "",
        targetId: d.targetId,
        before: (d.before ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    // 🔔 صاحب الصفحة: إشعار + إيميل
    const ownerId = ctx.member.ownerId;
    after(async () => {
      await notify(ownerId, { type: "team.request", data: { author: authorName, kind, label: d.label, requestId: created.id }, link: "/dashboard/team" });
      try {
        const owner = await prisma.user.findUnique({ where: { id: ownerId }, select: { email: true, firstName: true } });
        if (owner) {
          await sendEmail({
            to: owner.email,
            tag: "team-request",
            ...changeRequestEmail({ name: owner.firstName ?? "", author: authorName, action: actionText(kind, d.label), url: `${SITE_URL}/dashboard/team` }),
          });
        }
      } catch (err) {
        console.error("[CHANGE_REQUEST_EMAIL]", err);
      }
    });

    return NextResponse.json({ success: true, pending: true, requestId: created.id }, { status: 202 });
  };
}

function authorNameOf(ctx: MarketerContext) {
  const u = ctx.session.user;
  return ([u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "Team member").slice(0, 120);
}

/** وصف إنجليزي قصير للإيميل (الواجهة تترجم من kind + label) */
export function actionText(kind: ChangeKind, label: string) {
  const q = label ? ` “${label}”` : "";
  const map: Record<ChangeKind, string> = {
    "offer.create": `New offer${q}`,
    "offer.update": `Edit offer${q}`,
    "offer.delete": `Delete offer${q}`,
    "offer.reorder": "Reorder offers",
    "article.create": `New article${q}`,
    "article.update": `Edit article${q}`,
    "article.delete": `Delete article${q}`,
    "page.update": "Edit page design & settings",
    "audience.update": "Edit audience & link protection",
    "integrations.update": "Edit pixels / domain verification",
  };
  return map[kind];
}

/** آخر نشاط للعضو (بدون انتظار) */
function touchMember(id: string) {
  after(() => prisma.teamMember.update({ where: { id }, data: { lastActiveAt: new Date() } }).catch(() => null));
}

/** حساب أُنشئ لعضوية فريق فقط (بلا صفحة خاصة به): إيميله وكلمة سره يديرهما صاحب الفريق */
export async function isTeamOnlyAccount(userId: string) {
  const [own, memberships] = await Promise.all([
    prisma.landingPage.count({ where: { userId } }),
    prisma.teamMember.count({ where: { userId, status: { in: ["active", "suspended"] } } }).catch(() => 0),
  ]);
  return own === 0 && memberships > 0;
}
