"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50";

export default function AccountForm({ initial }: { initial: { firstName: string; lastName: string; email: string } }) {
  const t = useTranslations("dash");
  const { update } = useSession();
  const [profile, setProfile] = useState({ firstName: initial.firstName, lastName: initial.lastName });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [busy, setBusy] = useState<"profile" | "password" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string; scope: "profile" | "password" } | null>(null);

  const send = async (scope: "profile" | "password", url: string, body: unknown) => {
    setBusy(scope);
    setMsg(null);
    try {
      const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("common.error"));
      setMsg({ kind: "ok", text: t("common.saved"), scope });
      return true;
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : t("common.error"), scope });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const renderMsg = (scope: "profile" | "password") =>
    msg?.scope === scope ? (
      <p className={`text-sm ${msg.kind === "ok" ? "text-emerald-400" : "text-rose-300"}`}>{msg.text}</p>
    ) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-serif text-3xl font-semibold">{t("account.title")}</h1>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (await send("profile", "/api/users/profile", profile)) await update({ user: profile });
        }}
        className="space-y-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
      >
        <h2 className="font-semibold">{t("account.profile")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input required value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} placeholder={t("account.firstName")} className={field} />
          <input required value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} placeholder={t("account.lastName")} className={field} />
        </div>
        <input value={initial.email} disabled dir="ltr" className={field} />
        <div className="flex items-center gap-4">
          <button disabled={busy === "profile"} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50 cursor-pointer">
            {busy === "profile" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {t("common.save")}
          </button>
          {renderMsg("profile")}
        </div>
      </form>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (await send("password", "/api/users/password", pw)) setPw({ currentPassword: "", newPassword: "" });
        }}
        className="space-y-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
      >
        <h2 className="font-semibold">{t("account.password")}</h2>
        <input type="password" required autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} placeholder={t("account.currentPassword")} className={field} />
        <input type="password" required autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} placeholder={t("account.newPassword")} className={field} />
        <p className="text-xs text-white/40">{t("account.passwordHint")}</p>
        <div className="flex items-center gap-4">
          <button disabled={busy === "password"} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-white/5 disabled:opacity-50 cursor-pointer">
            {busy === "password" && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("account.changePassword")}
          </button>
          {renderMsg("password")}
        </div>
      </form>
    </div>
  );
}
