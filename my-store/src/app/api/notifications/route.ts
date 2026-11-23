import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { ensureDailySummary, NOTIFICATION_GROUP, type NotificationType } from "@/lib/notifications";

// ==================== 🔔 GET/PATCH /api/notifications ====================
// GET  ?limit=20&cursor=<id>&filter=all|unread|performance|team  → { items, unread, nextCursor }
// PATCH { ids: string[] } أو { all: true }                          → تعليم كمقروء
export async function GET(request: NextRequest) {
  const ctx = await getMarketerSession();
  if (!ctx) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const sp = request.nextUrl.searchParams;
  const limit = Math.min(Math.max(Number(sp.get("limit")) || 20, 1), 50);
  const cursor = sp.get("cursor");
  const filter = sp.get("filter") || "all";

  // 📊 ملخص الأمس لصاحب الصفحة (يُنشأ مرة واحدة يومياً عند أول فتح)
  if (ctx.isOwner && ctx.landingPage) await ensureDailySummary(ctx.userId, ctx.landingPage.id).catch(() => null);

  const types = (group: "performance" | "team") => (Object.keys(NOTIFICATION_GROUP) as NotificationType[]).filter((t) => NOTIFICATION_GROUP[t] === group);
  const where: Prisma.NotificationWhereInput = {
    userId: ctx.userId,
    ...(filter === "unread" ? { readAt: null } : {}),
    ...(filter === "performance" || filter === "team" ? { type: { in: types(filter) } } : {}),
  };

  const [rows, unread] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    prisma.notification.count({ where: { userId: ctx.userId, readAt: null } }),
  ]);
  const items = rows.slice(0, limit).map((n) => ({ id: n.id, type: n.type, data: n.data, link: n.link, read: !!n.readAt, createdAt: n.createdAt.toISOString() }));
  return NextResponse.json({ success: true, data: { items, unread, nextCursor: rows.length > limit ? items[items.length - 1].id : null } });
}

export async function PATCH(request: NextRequest) {
  const ctx = await getMarketerSession();
  if (!ctx) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { ids?: unknown; all?: unknown };
  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string").slice(0, 200) : [];
  if (!body.all && !ids.length) return NextResponse.json({ success: false, error: "invalid" }, { status: 400 });
  await prisma.notification.updateMany({
    where: { userId: ctx.userId, readAt: null, ...(body.all ? {} : { id: { in: ids } }) },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
