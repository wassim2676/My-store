"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CircleAlert, CircleCheck, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import AuthFrame, { authButtonCls, authInputCls } from "@/components/auth/AuthFrame";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div data-ui="dark" className="min-h-screen bg-[#07090D]" />}>
      <ResetForm />
    </Suspense>
  );
}

// ==================== 🔐 اختيار كلمة مرور جديدة ====================
function ResetForm() {
  const t = useTranslations("platform.auth.reset");
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<"form" | "done" | "invalid">(token ? "form" : "invalid");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError(t("short"));
    if (password !== confirm) return setError(t("mismatch"));
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setState("done");
      else if (data.error === "invalid_token") setState("invalid");
      else setError(data.error === "password_short" ? t("short") : t("error"));
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  if (state !== "form") {
    const ok = state === "done";
    return (
      <AuthFrame>
        <div className="text-center">
          <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${ok ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-amber-400/30 bg-amber-400/10 text-amber-300"}`}>
            {ok ? <CircleCheck className="h-7 w-7" /> : <CircleAlert className="h-7 w-7" />}
          </span>
          <h1 className="mt-5 font-serif text-2xl font-semibold">{ok ? t("doneTitle") : t("badTitle")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{ok ? t("doneBody") : t("badBody")}</p>
          <Link href={ok ? "/login?reset=1" : "/forgot-password"} className={`${authButtonCls} mt-7`}>
            {ok ? t("doneCta") : t("badCta")}
          </Link>
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <h1 className="font-serif text-2xl font-semibold">{t("title")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{t("subtitle")}</p>
        </div>
        {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
        <div className="relative">
          <Lock className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
          <input type={show ? "text" : "password"} required autoFocus autoComplete="new-password" minLength={8} maxLength={128} disabled={loading} className={authInputCls + " pe-10"} placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShow(!show)} className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 cursor-pointer" aria-label="toggle password">
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
          <input type={show ? "text" : "password"} required autoComplete="new-password" maxLength={128} disabled={loading} className={authInputCls} placeholder={t("confirm")} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <p className="text-xs text-white/40">{t("hint")}</p>
        <button type="submit" disabled={loading} className={authButtonCls}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("submit")}
        </button>
      </form>
    </AuthFrame>
  );
}
