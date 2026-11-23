"use client";

import { useLocale, useTranslations } from "next-intl";
import { BarChart3, CheckCircle2, Clock, MousePointerClick, TrendingUp, UserMinus, UserPlus, XCircle, AlertTriangle } from "lucide-react";

// ==================== 🔔 نص الإشعار بلغة المستخدم (من type + data) ====================
export type NotificationItem = { id: string; type: string; data: Record<string, unknown> | null; link: string | null; read: boolean; createdAt: string };

const SOURCE_NAMES: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", whatsapp: "WhatsApp", youtube: "YouTube", pinterest: "Pinterest",
  snapchat: "Snapchat", x: "X", telegram: "Telegram", reddit: "Reddit", linkedin: "LinkedIn", google: "Google", bing: "Bing", email: "Email", qr: "QR",
};

type Tone = "gold" | "green" | "blue" | "red" | "violet";
export const TONE_CLASS: Record<Tone, string> = {
  gold: "bg-amber-400/10 text-amber-300",
  green: "bg-emerald-400/10 text-emerald-300",
  blue: "bg-sky-400/10 text-sky-300",
  red: "bg-rose-500/10 text-rose-300",
  violet: "bg-violet-400/10 text-violet-300",
};

export function useNotificationText() {
  const t = useTranslations("dash.notifications");
  const tk = useTranslations("dash.team.kinds");
  const locale = useLocale();
  const nf = new Intl.NumberFormat(locale);

  const action = (d: Record<string, unknown>) => {
    const kind = typeof d.kind === "string" ? d.kind : "";
    const label = typeof d.label === "string" ? d.label : "";
    return tk.has(kind) ? tk(kind, { label: label || "—" }) : label;
  };

  return (n: NotificationItem): { title: string; body?: string; icon: React.ComponentType<{ className?: string }>; tone: Tone } => {
    const d = (n.data ?? {}) as Record<string, unknown>;
    const num = (k: string) => nf.format(Number(d[k]) || 0);
    switch (n.type) {
      case "clicks.milestone":
        return {
          title: Number(d.count) === 1 ? t("types.clicks.first", { offer: String(d.offer ?? "") }) : t("types.clicks.title", { count: num("count"), offer: String(d.offer ?? "") }),
          body: t("types.clicks.body"),
          icon: MousePointerClick,
          tone: "gold",
        };
      case "views.milestone":
        return { title: t("types.views.title", { count: num("count") }), body: t("types.views.body"), icon: TrendingUp, tone: "green" };
      case "daily.summary": {
        const parts = [t("types.daily.ctr", { ctr: String(d.ctr ?? 0) })];
        if (typeof d.topSource === "string") parts.push(t("types.daily.source", { source: SOURCE_NAMES[d.topSource] ?? t("types.daily.direct") }));
        if (typeof d.viewsChange === "number") parts.push(t(d.viewsChange >= 0 ? "types.daily.up" : "types.daily.down", { pct: String(Math.abs(d.viewsChange)) }));
        if (Number(d.blocked) > 0) parts.push(t("types.daily.blocked", { count: num("blocked") }));
        return { title: t("types.daily.title", { views: num("views"), clicks: num("clicks") }), body: parts.join(" · "), icon: BarChart3, tone: "blue" };
      }
      case "team.joined":
        return { title: t("types.team.joined", { name: String(d.name ?? d.email ?? "") }), body: t("types.team.joinedBody"), icon: UserPlus, tone: "violet" };
      case "team.request":
        return { title: t("types.team.request", { name: String(d.author ?? "") }), body: action(d), icon: Clock, tone: "gold" };
      case "team.approved":
        return { title: t("types.team.approved"), body: action(d), icon: CheckCircle2, tone: "green" };
      case "team.rejected":
        return { title: t("types.team.rejected"), body: [action(d), d.note ? `“${String(d.note)}”` : ""].filter(Boolean).join(" — "), icon: XCircle, tone: "red" };
      case "team.failed":
        return { title: t("types.team.failed"), body: action(d), icon: AlertTriangle, tone: "red" };
      case "team.removed":
        return { title: t("types.team.removed", { page: String(d.page ?? "") }), icon: UserMinus, tone: "red" };
      default:
        return { title: n.type, icon: BarChart3, tone: "blue" };
    }
  };
}

/** "منذ 5 دقائق" بلغة المستخدم */
export function useTimeAgo() {
  const locale = useLocale();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  return (iso: string) => {
    const s = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
    const a = Math.abs(s);
    if (a < 60) return rtf.format(Math.round(s), "second");
    if (a < 3600) return rtf.format(Math.round(s / 60), "minute");
    if (a < 86400) return rtf.format(Math.round(s / 3600), "hour");
    if (a < 86400 * 7) return rtf.format(Math.round(s / 86400), "day");
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso));
  };
}
