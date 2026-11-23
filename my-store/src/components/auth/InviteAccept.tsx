"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { CircleAlert, Eye, EyeOff, Loader2, Lock, User, Users } from "lucide-react";
import AuthFrame, { authButtonCls, authInputCls } from "./AuthFrame";

// ==================== 👥 قبول دعوة فريق (حساب جديد / حساب موجود) ====================
type Info = { email: string; page: string; inviter: string; approval: boolean };
export type InviteState =
  | { kind: "invalid" }
  | ({ kind: "expired" | "signup" | "login" | "accept" } & Info)
  | ({ kind: "wrong"; current: string } & Info);

export default function InviteAccept({ token, state }: { token: string; state: InviteState }) {
  const t = useTranslations("platform.auth.invite");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (state.kind === "invalid" || state.kind === "expired") {
    return (
      <AuthFrame>
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
            <CircleAlert className="h-7 w-7" />
          </span>
          <h1 className="mt-5 font-serif text-2xl font-semibold">{state.kind === "expired" ? t("expiredTitle") : t("invalidTitle")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{state.kind === "expired" ? t("expiredBody", { name: state.inviter }) : t("invalidBody")}</p>
          <Link href="/" className={`${authButtonCls} mt-7`}>{t("home")}</Link>
        </div>
      </AuthFrame>
    );
  }

  const accept = async (body: Record<string, unknown>) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/team/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, ...body }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(t.has(`errors.${json.error}`) ? t(`errors.${json.error}`) : t("errors.generic"));
        setLoading(false);
        return;
      }
      // حساب جديد: تسجيل دخول تلقائي بنفس البيانات
      if (json.data.created) {
        const r = await signIn("credentials", { email: state.email, password, redirect: false });
        if (r?.error) {
          window.location.href = "/login?callbackUrl=/dashboard";
          return;
        }
      }
      window.location.href = "/dashboard";
    } catch {
      setError(t("errors.generic"));
      setLoading(false);
    }
  };

  const submitSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError(t("errors.weak_password"));
    if (password !== confirm) return setError(t("errors.mismatch"));
    accept({ firstName, lastName: lastName || null, password });
  };

  return (
    <AuthFrame>
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-400/10 text-violet-300">
          <Users className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-serif text-2xl font-semibold">{t("title", { page: state.page })}</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{t("body", { name: state.inviter, page: state.page })}</p>
        <p className="mt-3 rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-white/55">{state.approval ? t("modeApproval") : t("modeDirect")}</p>
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {state.kind === "signup" && (
        <form onSubmit={submitSignup} className="mt-6 space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-white/60" dir="ltr">{state.email}</div>
          <div className="grid grid-cols-2 gap-3">
            <Field icon={User}>
              <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t("firstName")} maxLength={60} className={authInputCls} />
            </Field>
            <Field icon={User}>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={t("lastName")} maxLength={60} className={authInputCls} />
            </Field>
          </div>
          <Field icon={Lock}>
            <input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("password")} autoComplete="new-password" className={`${authInputCls} pe-10`} />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 end-3 flex items-center text-white/40 hover:text-white cursor-pointer" aria-label="show">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </Field>
          <Field icon={Lock}>
            <input type={show ? "text" : "password"} required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={t("confirm")} autoComplete="new-password" className={authInputCls} />
          </Field>
          <button type="submit" disabled={loading} className={`${authButtonCls} mt-2`}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("createAndJoin")}
          </button>
        </form>
      )}

      {state.kind === "accept" && (
        <button type="button" onClick={() => accept({})} disabled={loading} className={`${authButtonCls} mt-7`}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("join")}
        </button>
      )}

      {state.kind === "login" && (
        <div className="mt-7 space-y-3 text-center">
          <p className="text-sm text-white/60">{t("loginFirst", { email: state.email })}</p>
          <Link href={`/login?callbackUrl=${encodeURIComponent(`/invite?token=${token}`)}`} className={authButtonCls}>{t("login")}</Link>
        </div>
      )}

      {state.kind === "wrong" && (
        <div className="mt-7 space-y-3 text-center">
          <p className="text-sm text-white/60">{t("wrongAccount", { current: state.current, email: state.email })}</p>
          <button type="button" onClick={() => signOut({ callbackUrl: `/login?callbackUrl=${encodeURIComponent(`/invite?token=${token}`)}` })} className={authButtonCls}>
            {t("switchAccount")}
          </button>
        </div>
      )}
    </AuthFrame>
  );
}

function Field({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
      {children}
    </div>
  );
}
