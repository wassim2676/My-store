import { getLocale, getTranslations } from "next-intl/server";
import { Radar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isSource, type TrafficSource } from "@/lib/sources";

// ==================== 📣 مصادر الزيارات (آخر 30 يوماً) ====================
const META: Record<TrafficSource, { name: string; color: string }> = {
  instagram: { name: "Instagram", color: "#E1306C" },
  facebook: { name: "Facebook", color: "#1877F2" },
  tiktok: { name: "TikTok", color: "#25F4EE" },
  whatsapp: { name: "WhatsApp", color: "#25D366" },
  youtube: { name: "YouTube", color: "#FF0033" },
  pinterest: { name: "Pinterest", color: "#E60023" },
  snapchat: { name: "Snapchat", color: "#FFFC00" },
  x: { name: "X", color: "#E7E9EA" },
  telegram: { name: "Telegram", color: "#29B6F6" },
  reddit: { name: "Reddit", color: "#FF4500" },
  linkedin: { name: "LinkedIn", color: "#0A66C2" },
  google: { name: "Google", color: "#4285F4" },
  bing: { name: "Bing", color: "#00A4EF" },
  email: { name: "Email", color: "#A78BFA" },
  qr: { name: "QR code", color: "#F59E0B" },
  direct: { name: "", color: "#9AA1AE" },
  other: { name: "", color: "#6B7280" },
};

export default async function TrafficSources({ landingPageId, since }: { landingPageId: string; since: Date }) {
  const [t, locale] = await Promise.all([getTranslations("dash.overview.sources"), getLocale()]);
  const rows = await prisma.landingPageSourceStat
    .groupBy({ by: ["source"], where: { landingPageId, date: { gte: since } }, _sum: { views: true, clicks: true } })
    .catch(() => []);

  const data = rows
    .filter((r) => isSource(r.source))
    .map((r) => ({ source: r.source as TrafficSource, views: r._sum.views ?? 0, clicks: r._sum.clicks ?? 0 }))
    .filter((r) => r.views || r.clicks)
    .sort((a, b) => b.views - a.views || b.clicks - a.clicks);
  const max = Math.max(1, ...data.map((d) => d.views));
  const totalViews = data.reduce((a, d) => a + d.views, 0);
  const nf = new Intl.NumberFormat(locale);
  const label = (s: TrafficSource) => META[s].name || t(s === "direct" ? "direct" : "other");

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <div>
          <h2 className="font-semibold">{t("title")}</h2>
          <p className="mt-0.5 text-xs text-white/40">{t("subtitle")}</p>
        </div>
        <Radar className="h-4 w-4 text-white/35" />
      </div>
      {data.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-white/45">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-white/40">
              <tr>
                <th className="px-5 py-3 text-start font-medium">{t("source")}</th>
                <th className="hidden px-5 py-3 text-start font-medium sm:table-cell">{t("share")}</th>
                <th className="px-5 py-3 text-end font-medium">{t("views")}</th>
                <th className="px-5 py-3 text-end font-medium">{t("clicks")}</th>
                <th className="px-5 py-3 text-end font-medium">CTR</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.source} className="border-t border-white/[0.05]">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2.5 font-medium">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: META[d.source].color }} />
                      {label(d.source)}
                    </span>
                  </td>
                  <td className="hidden w-[40%] px-5 py-3 sm:table-cell">
                    <span className="flex items-center gap-3">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <span className="block h-full rounded-full" style={{ width: `${(d.views / max) * 100}%`, background: META[d.source].color }} />
                      </span>
                      <span className="w-10 text-end text-xs tabular-nums text-white/45">{totalViews ? Math.round((d.views / totalViews) * 100) : 0}%</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-end tabular-nums text-white/70">{nf.format(d.views)}</td>
                  <td className="px-5 py-3 text-end tabular-nums text-white/70">{nf.format(d.clicks)}</td>
                  <td className="px-5 py-3 text-end tabular-nums text-white/70">{d.views ? ((d.clicks / d.views) * 100).toFixed(1) : "—"}{d.views ? "%" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
