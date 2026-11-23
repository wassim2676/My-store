import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { MAX_MEMBERS } from "@/lib/team";
import TeamManager, { type TeamRequest, type TeamMemberRow } from "@/components/dashboard/TeamManager";
import TeamMemberView from "@/components/dashboard/TeamMemberView";

// ==================== 👥 الفريق: الأعضاء + طلبات الموافقة ====================

/** قيمة قصيرة قابلة للعرض في جدول المقارنة */
function show(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "✓" : "✗";
  if (Array.isArray(v)) return v.length ? v.map(show).join(", ") : "—";
  if (typeof v === "object") return JSON.stringify(v).slice(0, 120);
  const s = String(v);
  return s.length > 140 ? `${s.slice(0, 139)}…` : s;
}
const same = (a: unknown, b: unknown) => {
  const n = (v: unknown) => (v === "" || v === undefined ? null : typeof v === "number" ? String(v) : typeof v === "object" ? JSON.stringify(v) : v);
  return n(a) === n(b);
};

/** الحقول التي تغيّرت (قبل ← بعد) */
function diff(kind: string, before: unknown, body: unknown): { field: string; before: string; after: string }[] {
  const b = (before && typeof before === "object" ? before : {}) as Record<string, unknown>;
  const a = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  if (kind.endsWith(".delete")) return Object.keys(b).filter((k) => ["title", "status", "price"].includes(k)).map((k) => ({ field: k, before: show(b[k]), after: "—" }));
  if (kind.endsWith(".create")) {
    return Object.keys(a)
      .filter((k) => ["title", "duplicateOf", "price", "compareAt", "currency", "affiliateUrl", "status", "category", "badge", "excerpt"].includes(k) && a[k] !== "" && a[k] != null)
      .map((k) => ({ field: k, before: "—", after: show(a[k]) }));
  }
  if (kind === "offer.reorder") return [{ field: "order", before: "—", after: `${Array.isArray(a.ids) ? a.ids.length : 0}` }];
  const keys = kind === "page.update" || kind.startsWith("offer.") || kind.startsWith("article.") ? Object.keys(a).filter((k) => k in b) : Object.keys(a);
  return keys.filter((k) => !same(b[k], a[k])).slice(0, 14).map((k) => ({ field: k, before: show(b[k]), after: show(a[k]) }));
}

export default async function TeamPage() {
  const ctx = await getMarketerSession();
  const page = ctx!.landingPage!;

  const toRequest = (r: {
    id: string; kind: string; summary: string; authorName: string; status: string; reviewNote: string | null; error: string | null;
    createdAt: Date; reviewedAt: Date | null; before: unknown; body: unknown;
  }): TeamRequest => ({
    id: r.id,
    kind: r.kind,
    label: r.summary,
    author: r.authorName,
    status: r.status,
    note: r.reviewNote,
    error: r.error,
    createdAt: r.createdAt.toISOString(),
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
    changes: diff(r.kind, r.before, r.body),
  });

  // 🙋 عضو فريق: طلباته فقط
  if (!ctx!.isOwner) {
    const [mine, owner] = await Promise.all([
      prisma.changeRequest.findMany({ where: { landingPageId: page.id, authorId: ctx!.userId }, orderBy: { createdAt: "desc" }, take: 60 }),
      prisma.user.findUnique({ where: { id: page.userId }, select: { firstName: true, lastName: true, email: true } }),
    ]);
    return (
      <TeamMemberView
        pageTitle={page.title}
        ownerName={[owner?.firstName, owner?.lastName].filter(Boolean).join(" ") || owner?.email || ""}
        requireApproval={ctx!.member!.requireApproval}
        requests={mine.map(toRequest)}
      />
    );
  }

  // 👑 صاحب الصفحة
  const [members, pending, history, counts] = await Promise.all([
    prisma.teamMember.findMany({ where: { landingPageId: page.id }, orderBy: { createdAt: "asc" }, include: { user: { select: { firstName: true, lastName: true } } } }),
    prisma.changeRequest.findMany({ where: { landingPageId: page.id, status: "pending" }, orderBy: { createdAt: "asc" }, take: 100 }),
    prisma.changeRequest.findMany({ where: { landingPageId: page.id, status: { not: "pending" } }, orderBy: { createdAt: "desc" }, take: 40 }),
    prisma.changeRequest.groupBy({ by: ["memberId"], where: { landingPageId: page.id, status: "approved" }, _count: { _all: true } }),
  ]);
  const approvedBy = new Map(counts.map((c) => [c.memberId, c._count._all]));

  const rows: TeamMemberRow[] = members.map((m) => ({
    id: m.id,
    email: m.email,
    name: [m.user?.firstName, m.user?.lastName].filter(Boolean).join(" ") || m.name || "",
    status: m.status,
    requireApproval: m.requireApproval,
    expired: m.status === "pending" && (!m.inviteExpires || m.inviteExpires < new Date()),
    inviteExpires: m.inviteExpires?.toISOString() ?? null,
    acceptedAt: m.acceptedAt?.toISOString() ?? null,
    lastActiveAt: m.lastActiveAt?.toISOString() ?? null,
    approved: approvedBy.get(m.id) ?? 0,
  }));

  return <TeamManager members={rows} pending={pending.map(toRequest)} history={history.map(toRequest)} max={MAX_MEMBERS} />;
}
