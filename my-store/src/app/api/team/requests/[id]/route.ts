import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { notify } from "@/lib/notifications";
import type { ChangeKind } from "@/lib/team";
import * as offersRoute from "@/app/api/marketer/offers/route";
import * as offerRoute from "@/app/api/marketer/offers/[id]/route";
import * as reorderRoute from "@/app/api/marketer/offers/reorder/route";
import * as articlesRoute from "@/app/api/marketer/articles/route";
import * as articleRoute from "@/app/api/marketer/articles/[id]/route";
import * as pageRoute from "@/app/api/marketer/landing-page/route";
import * as audienceRoute from "@/app/api/marketer/audience/route";
import * as integrationsRoute from "@/app/api/marketer/integrations/route";

// ==================== 📝 POST /api/team/requests/{id}: موافقة / رفض / إلغاء طلب تغيير ====================
// الموافقة تُعيد تنفيذ نفس الطلب الأصلي حرفياً، لكن باسم صاحب الصفحة (فيمر من نفس التحقق والحفظ تماماً).
type AnyHandler = (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;
const HANDLERS: Record<ChangeKind, AnyHandler> = {
  "offer.create": offersRoute.POST as unknown as AnyHandler,
  "offer.update": offerRoute.PATCH as unknown as AnyHandler,
  "offer.delete": offerRoute.DELETE as unknown as AnyHandler,
  "offer.reorder": reorderRoute.POST as unknown as AnyHandler,
  "article.create": articlesRoute.POST as unknown as AnyHandler,
  "article.update": articleRoute.PATCH as unknown as AnyHandler,
  "article.delete": articleRoute.DELETE as unknown as AnyHandler,
  "page.update": pageRoute.PATCH as unknown as AnyHandler,
  "audience.update": audienceRoute.PATCH as unknown as AnyHandler,
  "integrations.update": integrationsRoute.PATCH as unknown as AnyHandler,
};

const schema = z.object({ action: z.enum(["approve", "reject", "cancel"]), note: z.string().trim().max(500).optional() });
type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const ctx = await getMarketerSession();
  if (!ctx?.landingPage) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ success: false, error: "invalid" }, { status: 400 });
  const { action, note } = parsed.data;

  const cr = await prisma.changeRequest.findFirst({ where: { id, landingPageId: ctx.landingPage.id } });
  if (!cr) return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  if (cr.status !== "pending") return NextResponse.json({ success: false, error: "already_reviewed" }, { status: 409 });

  // ✋ صاحب الطلب يلغي طلبه
  if (action === "cancel") {
    if (cr.authorId !== ctx.userId) return NextResponse.json({ success: false, error: "forbidden" }, { status: 403 });
    await prisma.changeRequest.update({ where: { id }, data: { status: "cancelled", reviewedAt: new Date() } });
    return NextResponse.json({ success: true, data: { status: "cancelled" } });
  }

  // بقية الإجراءات لصاحب الصفحة فقط
  if (!ctx.isOwner) return NextResponse.json({ success: false, error: "owner_only" }, { status: 403 });

  // قفل الطلب أولاً (يمنع تنفيذه مرتين عند نقرتين متزامنتين)
  const lock = await prisma.changeRequest.updateMany({ where: { id, status: "pending" }, data: { status: action === "approve" ? "applying" : "rejected", reviewedById: ctx.userId, reviewedAt: new Date(), reviewNote: note || null } });
  if (lock.count === 0) return NextResponse.json({ success: false, error: "already_reviewed" }, { status: 409 });

  const meta = { kind: cr.kind, label: cr.summary, note: note || null, page: ctx.landingPage.title };

  if (action === "reject") {
    await notify(cr.authorId, { type: "team.rejected", data: meta, link: "/dashboard/team" });
    return NextResponse.json({ success: true, data: { status: "rejected" } });
  }

  // ✅ إعادة تنفيذ الطلب الأصلي
  const handler = HANDLERS[cr.kind as ChangeKind];
  let ok = false;
  let error: string | null = null;
  if (!handler) {
    error = "unknown_change";
  } else {
    try {
      const replay = new NextRequest(new URL(cr.path, request.url), {
        method: cr.method,
        headers: { "content-type": "application/json", cookie: request.headers.get("cookie") ?? "" },
        body: cr.method === "DELETE" || cr.body == null ? undefined : JSON.stringify(cr.body),
      });
      const res = await handler(replay, { params: Promise.resolve((cr.params as Record<string, string>) ?? {}) });
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      ok = res.ok && json.success !== false;
      if (!ok) error = (typeof json.error === "string" ? json.error : `HTTP ${res.status}`).slice(0, 300);
    } catch (err) {
      console.error("[CHANGE_APPLY_ERROR]", err);
      error = "apply_failed";
    }
  }

  await prisma.changeRequest.update({ where: { id }, data: { status: ok ? "approved" : "failed", error } });
  await notify(cr.authorId, { type: ok ? "team.approved" : "team.failed", data: { ...meta, error }, link: "/dashboard/team" });
  if (!ok) return NextResponse.json({ success: false, error: "apply_failed", detail: error }, { status: 422 });
  return NextResponse.json({ success: true, data: { status: "approved" } });
}
