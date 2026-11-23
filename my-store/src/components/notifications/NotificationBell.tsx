"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { TONE_CLASS, useNotificationText, useTimeAgo, type NotificationItem } from "./useNotificationText";

// ==================== 🔔 جرس الإشعارات في الشريط العلوي للوحة التحكم ====================
const POLL_MS = 60_000;

export default function NotificationBell() {
  const t = useTranslations("dash.notifications");
  const router = useRouter();
  const text = useNotificationText();
  const ago = useTimeAgo();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=8", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setItems(json.data.items);
        setUnread(json.data.unread);
      }
    } catch {
      /* تجاهل: نعيد المحاولة في الدورة القادمة */
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const id = setInterval(() => document.visibilityState === "visible" && load(), POLL_MS);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearTimeout(first);
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  // إغلاق عند النقر خارج القائمة أو Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markRead = async (body: { ids?: string[]; all?: boolean }) => {
    setItems((list) => list?.map((n) => (body.all || body.ids?.includes(n.id) ? { ...n, read: true } : n)) ?? null);
    setUnread((u) => (body.all ? 0 : Math.max(0, u - (body.ids?.length ?? 0))));
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  };

  const openItem = (n: NotificationItem) => {
    if (!n.read) markRead({ ids: [n.id] });
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) load();
        }}
        aria-label={t("title")}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/[0.06] hover:text-white cursor-pointer"
      >
        <Bell className="h-[19px] w-[19px]" />
        {unread > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#07090D]">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-[min(92vw,400px)] overflow-hidden rounded-xl border border-white/10 bg-[#0D1118] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
            <p className="text-sm font-semibold">{t("title")}</p>
            {unread > 0 && (
              <button type="button" onClick={() => markRead({ all: true })} className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white cursor-pointer">
                <CheckCheck className="h-3.5 w-3.5" />
                {t("markAll")}
              </button>
            )}
          </div>

          <div className="max-h-[min(70vh,480px)] overflow-y-auto">
            {items === null ? (
              <div className="flex justify-center py-10 text-white/40">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Bell className="mx-auto h-7 w-7 text-white/20" />
                <p className="mt-3 text-sm text-white/50">{t("empty")}</p>
              </div>
            ) : (
              items.map((n) => {
                const v = text(n);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => openItem(n)}
                    className={`flex w-full gap-3 border-b border-white/[0.05] px-4 py-3 text-start transition last:border-b-0 hover:bg-white/[0.04] cursor-pointer ${n.read ? "" : "bg-amber-400/[0.03]"}`}
                  >
                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE_CLASS[v.tone]}`}>
                      <v.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm leading-snug ${n.read ? "text-white/75" : "font-medium text-white"}`}>{v.title}</span>
                      {v.body && <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-white/45">{v.body}</span>}
                      <span className="mt-1 block text-[11px] text-white/35">{ago(n.createdAt)}</span>
                    </span>
                    {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-400" />}
                  </button>
                );
              })
            )}
          </div>

          <Link href="/notifications" onClick={() => setOpen(false)} className="block border-t border-white/[0.07] bg-white/[0.02] px-4 py-3 text-center text-sm font-medium text-amber-300 hover:bg-white/[0.04]">
            {t("viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
