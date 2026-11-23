"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { TONE_CLASS, useNotificationText, useTimeAgo, type NotificationItem } from "./useNotificationText";

// ==================== 🔔 قائمة كل الإشعارات مع الفلاتر والتحميل التدريجي ====================
const FILTERS = ["all", "unread", "performance", "team"] as const;
type Filter = (typeof FILTERS)[number];

export default function NotificationsList() {
  const t = useTranslations("dash.notifications");
  const locale = useLocale();
  const router = useRouter();
  const text = useNotificationText();
  const ago = useTimeAgo();
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);

  const load = useCallback(
    async (f: Filter, after: string | null) => {
      const qs = new URLSearchParams({ limit: "25", filter: f, ...(after ? { cursor: after } : {}) });
      const res = await fetch(`/api/notifications?${qs}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!json.success) return;
      setItems((list) => (after ? [...list, ...json.data.items] : json.data.items));
      setCursor(json.data.nextCursor);
      setUnread(json.data.unread);
    },
    [],
  );

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      await load(filter, null);
      if (alive) setLoading(false);
    };
    const id = setTimeout(run, 0);
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, [filter, load]);

  const markRead = async (body: { ids?: string[]; all?: boolean }) => {
    setItems((list) => list.map((n) => (body.all || body.ids?.includes(n.id) ? { ...n, read: true } : n)));
    setUnread((u) => (body.all ? 0 : Math.max(0, u - (body.ids?.length ?? 0))));
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  };

  // تجميع حسب اليوم
  const dayLabel = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const y = new Date(today);
    y.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return t("today");
    if (d.toDateString() === y.toDateString()) return t("yesterday");
    return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(d);
  };
  const groups: { label: string; items: NotificationItem[] }[] = [];
  for (const n of items) {
    const label = dayLabel(n.createdAt);
    const g = groups[groups.length - 1];
    if (g?.label === label) g.items.push(n);
    else groups.push({ label, items: [n] });
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-white/50">{unread ? t("unreadCount", { count: unread }) : t("allCaughtUp")}</p>
        </div>
        {unread > 0 && (
          <button type="button" onClick={() => markRead({ all: true })} className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/10 px-3.5 py-2 text-sm font-medium hover:bg-white/5 cursor-pointer sm:self-auto">
            <CheckCheck className="h-4 w-4" />
            {t("markAll")}
          </button>
        )}
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-lg border border-white/10 p-1 [scrollbar-width:none]">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition cursor-pointer ${filter === f ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
          >
            {t(`filters.${f}`)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-20 text-white/40">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-white/[0.08] bg-[#0A0D12] px-6 py-20 text-center">
            <Bell className="mx-auto h-9 w-9 text-white/20" />
            <p className="mt-4 text-sm text-white/50">{t("empty")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((g) => (
              <section key={g.label}>
                <h2 className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-white/40">{g.label}</h2>
                <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
                  {g.items.map((n) => {
                    const v = text(n);
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          if (!n.read) markRead({ ids: [n.id] });
                          if (n.link) router.push(n.link);
                        }}
                        className={`flex w-full gap-4 border-b border-white/[0.05] px-4 py-4 text-start transition last:border-b-0 hover:bg-white/[0.03] cursor-pointer sm:px-5 ${n.read ? "" : "bg-amber-400/[0.03]"}`}
                      >
                        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TONE_CLASS[v.tone]}`}>
                          <v.icon className="h-[18px] w-[18px]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-[15px] leading-snug ${n.read ? "text-white/75" : "font-medium text-white"}`}>{v.title}</span>
                          {v.body && <span className="mt-1 block text-sm leading-relaxed text-white/50">{v.body}</span>}
                          <span className="mt-1.5 block text-xs text-white/35">{ago(n.createdAt)}</span>
                        </span>
                        {!n.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
            {cursor && (
              <button
                type="button"
                disabled={more}
                onClick={async () => {
                  setMore(true);
                  await load(filter, cursor);
                  setMore(false);
                }}
                className="mx-auto flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium hover:bg-white/5 disabled:opacity-50 cursor-pointer"
              >
                {more && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("loadMore")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
