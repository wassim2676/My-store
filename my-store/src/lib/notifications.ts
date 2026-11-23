import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ==================== 🔔 الإشعارات ====================
// نحفظ النوع + البيانات فقط، والنص يُبنى في الواجهة بلغة المستخدم (messages/platform: dash.notifications.types.*).
export const NOTIFICATION_TYPES = [
  "clicks.milestone", // عرض وصل لعدد نقرات (1, 10, 50, 100...)
  "views.milestone", // الصفحة وصلت لعدد زيارات
  "daily.summary", // ملخص أمس: زيارات، نقرات، نسبة النقر، أفضل مصدر، أفضل عرض
  "team.joined", // عضو قبل الدعوة
  "team.request", // تغيير ينتظر موافقتك
  "team.approved", // صاحب الصفحة وافق على تغييرك
  "team.rejected", // صاحب الصفحة رفض تغييرك
  "team.failed", // تعذّر تطبيق تغيير بعد الموافقة
  "team.removed", // أُزيلت من فريق
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** فئات صفحة الإشعارات */
export const NOTIFICATION_GROUP: Record<NotificationType, "performance" | "team"> = {
  "clicks.milestone": "performance",
  "views.milestone": "performance",
  "daily.summary": "performance",
  "team.joined": "team",
  "team.request": "team",
  "team.approved": "team",
  "team.rejected": "team",
  "team.failed": "team",
  "team.removed": "team",
};

type NotifyInput = { type: NotificationType; data?: Record<string, unknown>; link?: string; dedupeKey?: string };

/** يرسل إشعاراً لمستخدم أو أكثر. dedupeKey يمنع التكرار (نفس المستخدم + نفس المفتاح = إشعار واحد) */
export async function notify(userIds: string | string[], n: NotifyInput) {
  const ids = [...new Set(Array.isArray(userIds) ? userIds : [userIds])].filter(Boolean);
  if (!ids.length) return;
  try {
    await prisma.notification.createMany({
      data: ids.map((userId) => ({
        userId,
        type: n.type,
        data: (n.data ?? {}) as Prisma.InputJsonObject,
        link: n.link ?? null,
        dedupeKey: n.dedupeKey ?? null,
      })),
      skipDuplicates: true,
    });
  } catch (err) {
    console.error("[NOTIFY_ERROR]", n.type, err);
  }
}

// -------------------- 🏁 العتبات --------------------
const CLICK_MILESTONES = [1, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
const VIEW_MILESTONES = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];

/** بعد كل نقرة على زر شراء: هل وصل العرض لعتبة جديدة؟ */
export async function offerClickMilestone(o: { ownerId: string; offerId: string; offerTitle: string; clicks: number }) {
  if (!CLICK_MILESTONES.includes(o.clicks)) return;
  await notify(o.ownerId, {
    type: "clicks.milestone",
    data: { offer: o.offerTitle.slice(0, 120), count: o.clicks },
    link: `/dashboard/offers/${o.offerId}`,
    dedupeKey: `clicks:${o.offerId}:${o.clicks}`,
  });
}

/** بعد كل زيارة للصفحة: هل وصلت الصفحة لعتبة جديدة؟ */
export async function pageViewMilestone(o: { ownerId: string; pageId: string; views: number }) {
  if (!VIEW_MILESTONES.includes(o.views)) return;
  await notify(o.ownerId, { type: "views.milestone", data: { count: o.views }, link: "/dashboard", dedupeKey: `views:${o.pageId}:${o.views}` });
}

// -------------------- 📊 ملخص الأمس (يُنشأ عند أول فتح للإشعارات في اليوم — بدون مهام مجدولة) --------------------
export async function ensureDailySummary(userId: string, landingPageId: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 86_400_000);
  const before = new Date(today.getTime() - 2 * 86_400_000);
  const key = `daily:${landingPageId}:${yesterday.toISOString().slice(0, 10)}`;

  const exists = await prisma.notification.findUnique({ where: { userId_dedupeKey: { userId, dedupeKey: key } }, select: { id: true } });
  if (exists) return;

  const [days, sources] = await Promise.all([
    prisma.landingPageDailyStat.findMany({ where: { landingPageId, date: { in: [yesterday, before] } } }),
    prisma.landingPageSourceStat.findMany({ where: { landingPageId, date: yesterday }, orderBy: { views: "desc" }, take: 1 }),
  ]);
  const y = days.find((d) => d.date.getTime() === yesterday.getTime());
  if (!y || (!y.views && !y.clicks)) return; // لا نشاط: لا ملخص
  const p = days.find((d) => d.date.getTime() === before.getTime());
  const change = (now: number, prev: number | undefined) => (prev ? Math.round(((now - prev) / prev) * 100) : null);

  await notify(userId, {
    type: "daily.summary",
    data: {
      date: yesterday.toISOString().slice(0, 10),
      views: y.views,
      clicks: y.clicks,
      ctr: y.views ? Math.round((y.clicks / y.views) * 1000) / 10 : 0,
      viewsChange: change(y.views, p?.views),
      clicksChange: change(y.clicks, p?.clicks),
      blocked: y.botHits + y.geoBlocked,
      topSource: sources[0]?.source ?? null,
    },
    link: "/dashboard",
    dedupeKey: key,
  });
}
