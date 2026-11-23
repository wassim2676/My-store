"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Clock, X } from "lucide-react";
import { PENDING_EVENT } from "@/lib/pending-client";

// ==================== ⏳ تنبيه "أُرسل للموافقة" لأعضاء الفريق ====================
export default function PendingToast() {
  const t = useTranslations("dash.team.toast");
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const on = () => {
      setShow(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShow(false), 7000);
    };
    window.addEventListener(PENDING_EVENT, on);
    return () => {
      window.removeEventListener(PENDING_EVENT, on);
      clearTimeout(timer);
    };
  }, []);

  if (!show) return null;
  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-start gap-3 rounded-xl border border-amber-400/25 bg-[#14110A] p-4 shadow-2xl sm:inset-x-auto sm:end-6" role="status">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
        <Clock className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-amber-100">{t("title")}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-amber-100/70">{t("body")}</p>
        <Link href="/dashboard/team" onClick={() => setShow(false)} className="mt-2 inline-block text-xs font-medium text-amber-300 hover:underline">
          {t("view")}
        </Link>
      </div>
      <button type="button" onClick={() => setShow(false)} className="rounded p-1 text-amber-100/50 hover:text-amber-100 cursor-pointer" aria-label="close">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
