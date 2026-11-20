"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, Mail, MailCheck } from "lucide-react";
import AuthFrame, { authButtonCls, authInputCls } from "@/components/auth/AuthFrame";

// ==================== 🔑 نسيت كلمة المرور ====================
export default function ForgotPasswordPage() {
  const t = useTranslations("platform.auth.forgot");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() }) });
      if (res.status === 400) setError(t("invalidEmail"));
      else if (!res.ok) setError(t("error"));
      else setSent(true);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame>
      {sent ? (
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
            <MailCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-5 font-serif text-2xl font-semibold">{t("sentTitle")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{t("sentBody", { email: email.trim() })}</p>
          <p className="mt-4 text-xs text-white/40">{t("sentHint")}</p>
          <button type="button" onClick={() => setSent(false)} className="mt-6 text-sm font-medium text-amber-300 hover:text-amber-200 cursor-pointer">
            {t("again")}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <h1 className="font-serif text-2xl font-semibold">{t("title")}</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{t("subtitle")}</p>
          </div>
          {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
            <input type="email" required autoFocus autoComplete="email" disabled={loading} className={authInputCls} placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className={authButtonCls}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("submit")}
          </button>
        </form>
      )}
      <Link href="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-white/55 hover:text-white">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("back")}
      </Link>
    </AuthFrame>
  );
}
