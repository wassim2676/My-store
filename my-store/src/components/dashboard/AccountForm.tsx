"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { localizedApiError } from "@/lib/api-error";
import { Check, KeyRound, Loader2, Lock, Mail, Pencil, ShieldCheck, User, X } from "lucide-react";

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50";

type Profile = { firstName: string; lastName: string; email: string };

/**
 * 👤 الحساب: المعلومات مقفلة افتراضياً (قراءة فقط) — زر "تعديل" يفتح الحقول،
 * و"إلغاء" يعيدها كما كانت. حماية من تغيير حرف بالخطأ.
 * تغيير البريد (معرّف الدخول) يتطلب كلمة المرور الحالية.
 */
export default function AccountForm({ initial }: { initial: Profile }) {
  const t = useTranslations("dash");
  const locale = useLocale();
  const router = useRouter();
  const { update } = useSession();
  const apiError = (status: number, msg: unknown) =>
    localizedApiError(msg, status, locale, { invalid: t("common.errors.invalid"), conflict: t("common.errors.conflict"), unauthorized: t("common.errors.unauthorized"), generic: t("common.error") });

  // ---------- الملف الشخصي ----------
  const [saved, setSaved] = useState<Profile>(initial);
  const [draft, setDraft] = useState<Profile>(initial);
  const [editing, setEditing] = useState(false);
  const [emailPassword, setEmailPassword] = useState("");
  const [busy, setBusy] = useState<"profile" | "password" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string; scope: "profile" | "password" } | null>(null);

  const emailChanged = draft.email.trim().toLowerCase() !== saved.email.toLowerCase();
  const namesChanged = draft.firstName.trim() !== saved.firstName || draft.lastName.trim() !== saved.lastName;

  const startEdit = () => {
    setDraft(saved);
    setEmailPassword("");
    setMsg(null);
    setEditing(true);
  };
  const cancelEdit = () => {
    setDraft(saved);
    setEmailPassword("");
    setMsg(null);
    setEditing(false);
  };

  const saveProfile = async () => {
    if (!namesChanged && !emailChanged) return setEditing(false);
    setBusy("profile");
    setMsg(null);
    try {
      const next = { ...saved };
      if (namesChanged) {
        const body = { firstName: draft.firstName.trim(), lastName: draft.lastName.trim() };
        const res = await fetch("/api/users/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(apiError(res.status, data.error));
        Object.assign(next, body);
      }
      if (emailChanged) {
        const res = await fetch("/api/users/email", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: draft.email.trim(), currentPassword: emailPassword }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const code = typeof data.error === "string" ? data.error : "";
          throw new Error(t.has(`account.errors.${code}`) ? t(`account.errors.${code}`) : t("common.error"));
        }
        next.email = data.data.email;
      }
      await update({ user: { firstName: next.firstName, lastName: next.lastName, email: next.email } });
      setSaved(next);
      setDraft(next);
      setEmailPassword("");
      setEditing(false);
      setMsg({ kind: "ok", text: t("common.saved"), scope: "profile" });
      router.refresh();
    } catch (e) {
      // إن نجح تحديث الاسم وفشل البريد: الاسم محفوظ، نُبقي وضع التعديل لتصحيح البريد
      setMsg({ kind: "err", text: e instanceof Error ? e.message : t("common.error"), scope: "profile" });
    } finally {
      setBusy(null);
    }
  };

  // ---------- كلمة المرور ----------
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });

  const savePassword = async () => {
    setBusy("password");
    setMsg(null);
    try {
      const res = await fetch("/api/users/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pw) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(apiError(res.status, data.error));
      setPw({ currentPassword: "", newPassword: "" });
      setPwOpen(false);
      setMsg({ kind: "ok", text: t("account.passwordChanged"), scope: "password" });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : t("common.error"), scope: "password" });
    } finally {
      setBusy(null);
    }
  };

  const renderMsg = (scope: "profile" | "password") =>
    msg?.scope === scope ? (
      <p className={`flex items-center gap-1.5 text-sm ${msg.kind === "ok" ? "text-emerald-400" : "text-rose-300"}`}>
        {msg.kind === "ok" && <Check className="h-4 w-4" />}
        {msg.text}
      </p>
    ) : null;

  const editBtn = (onClick: () => void, label: string) => (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-white/25 hover:bg-white/[0.05] hover:text-white cursor-pointer"
    >
      <Pencil className="h-3.5 w-3.5" />
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">{t("account.title")}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-white/45">
          <ShieldCheck className="h-4 w-4 text-emerald-400/80" />
          {t("account.lockedHint")}
        </p>
      </div>

      {/* 👤 الملف الشخصي */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveProfile();
        }}
        className={`space-y-5 rounded-2xl border bg-white/[0.02] p-6 transition-colors ${editing ? "border-amber-400/30" : "border-white/[0.07]"}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">{t("account.profile")}</h2>
          {!editing && editBtn(startEdit, t("account.edit"))}
        </div>

        {!editing ? (
          <dl className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-black/20">
            <Row icon={User} label={t("account.name")} value={`${saved.firstName} ${saved.lastName}`.trim() || "—"} />
            <Row icon={Mail} label={t("account.email")} value={saved.email} ltr />
          </dl>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-sm text-white/70">{t("account.firstName")}</span>
                <input required autoFocus maxLength={50} value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} className={field} />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm text-white/70">{t("account.lastName")}</span>
                <input required maxLength={50} value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} className={field} />
              </label>
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm text-white/70">{t("account.email")}</span>
              <input required type="email" dir="ltr" maxLength={255} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={field} />
            </label>
            {emailChanged && (
              <div className="space-y-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.05] p-4">
                <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-100/90">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                  {t("account.emailConfirmHint")}
                </p>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder={t("account.currentPassword")}
                  className={field}
                />
              </div>
            )}
          </div>
        )}

        {(editing || msg?.scope === "profile") && (
          <div className="flex flex-wrap items-center gap-3">
            {editing && (
              <>
                <button
                  disabled={busy === "profile" || (!namesChanged && !emailChanged)}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-40 cursor-pointer disabled:cursor-default"
                >
                  {busy === "profile" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {t("common.save")}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={busy === "profile"}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/75 hover:bg-white/5 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  {t("account.cancel")}
                </button>
              </>
            )}
            {renderMsg("profile")}
          </div>
        )}
      </form>

      {/* 🔑 كلمة المرور */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          savePassword();
        }}
        className={`space-y-4 rounded-2xl border bg-white/[0.02] p-6 transition-colors ${pwOpen ? "border-amber-400/30" : "border-white/[0.07]"}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">{t("account.password")}</h2>
          {!pwOpen &&
            editBtn(() => {
              setMsg(null);
              setPwOpen(true);
            }, t("account.changePassword"))}
        </div>

        {!pwOpen ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
            <KeyRound className="h-4 w-4 text-white/40" />
            <span className="font-mono tracking-[0.3em] text-white/50">••••••••</span>
          </div>
        ) : (
          <>
            <input type="password" required autoFocus autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} placeholder={t("account.currentPassword")} className={field} />
            <input type="password" required autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} placeholder={t("account.newPassword")} className={field} />
            <p className="text-xs text-white/40">{t("account.passwordHint")}</p>
          </>
        )}

        {(pwOpen || msg?.scope === "password") && (
          <div className="flex flex-wrap items-center gap-3">
            {pwOpen && (
              <>
                <button disabled={busy === "password"} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50 cursor-pointer">
                  {busy === "password" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {t("account.changePassword")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPw({ currentPassword: "", newPassword: "" });
                    setPwOpen(false);
                    setMsg(null);
                  }}
                  disabled={busy === "password"}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/75 hover:bg-white/5 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  {t("account.cancel")}
                </button>
              </>
            )}
            {renderMsg("password")}
          </div>
        )}
      </form>
    </div>
  );
}

function Row({ icon: Icon, label, value, ltr }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon className="h-4 w-4 shrink-0 text-white/35" />
      <dt className="w-28 shrink-0 text-sm text-white/45">{label}</dt>
      <dd className="min-w-0 flex-1 truncate text-sm font-medium" dir={ltr ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}
