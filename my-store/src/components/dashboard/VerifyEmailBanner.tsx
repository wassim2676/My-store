"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, MailWarning } from "lucide-react";

// ==================== ✉️ تنبيه: البريد غير مؤكَّد + زر إعادة إرسال رابط التفعيل ====================
export default function VerifyEmailBanner({ email }: { email: string }) {
  const t = useTranslations("platform.auth.banner");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  const resend = async () => {
    setState("loading");
    setMsg("");
    try {
      const res = await fetch("/api/auth/verify-email/resend", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.data?.alreadyVerified) return window.location.reload();
        setState("sent");
      } else {
        setState("error");
        setMsg(data.error === "cooldown" ? t("cooldown", { s: data.retryAfter ?? 60 }) : t("error"));
      }
    } catch {
      setState("error");
      setMsg(t("error"));
    }
  };

  return (
    <div className="mx-auto mb-6 flex max-w-5xl flex-col gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-amber-100">{t("title")}</p>
          <p className="mt-0.5 break-words text-white/60">
            {state === "sent" ? t("sent", { email }) : state === "error" ? msg : t("body", { email })}
          </p>
        </div>
      </div>
      {state === "sent" ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-emerald-300">
          <Check className="h-4 w-4" />
          {t("sentShort")}
        </span>
      ) : (
        <button type="button" onClick={resend} disabled={state === "loading"} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-60 cursor-pointer">
          {state === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("resend")}
        </button>
      )}
    </div>
  );
}
