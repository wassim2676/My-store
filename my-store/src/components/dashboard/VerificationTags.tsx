"use client";

import { announcePending } from "@/lib/pending-client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, BadgeCheck, Check, ExternalLink, Loader2, Save } from "lucide-react";
import { VERIFY_KEYS, VERIFY_META_NAME, type VerifyKey } from "@/lib/integrations";

// ==================== ✅ وسوم التحقق من ملكية الدومين (Meta / Pinterest / Google / Bing) ====================
const HELP: Record<VerifyKey, string> = {
  meta: "https://business.facebook.com/settings/owned-domains",
  pinterest: "https://www.pinterest.com/settings/claim",
  google: "https://search.google.com/search-console",
  bing: "https://www.bing.com/webmasters",
};
const LABEL: Record<VerifyKey, string> = { meta: "Meta (Facebook · Instagram)", pinterest: "Pinterest", google: "Google Search Console", bing: "Bing Webmaster" };

export default function VerificationTags({ initial, liveUrl }: { initial: Partial<Record<VerifyKey, string>>; liveUrl: string | null }) {
  const t = useTranslations("dash.domain.verify");
  const [values, setValues] = useState<Record<VerifyKey, string>>(
    Object.fromEntries(VERIFY_KEYS.map((k) => [k, initial[k] ?? ""])) as Record<VerifyKey, string>,
  );
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field?: string; text: string } | null>(null);
  const [done, setDone] = useState(false);
  const dirty = VERIFY_KEYS.some((k) => (values[k] || "") !== (saved[k] || ""));

  const save = async () => {
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const res = await fetch("/api/marketer/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verify: values }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError({ field: json.field, text: json.error === "invalid_token" ? t("invalid") : t("error") });
        return;
      }
      if (json.pending) {
        announcePending();
        setValues(Object.fromEntries(VERIFY_KEYS.map((k) => [k, saved[k] ?? ""])) as Record<VerifyKey, string>);
        return;
      }
      const v = json.data.verify as Partial<Record<VerifyKey, string>>;
      setSaved(v);
      setValues(Object.fromEntries(VERIFY_KEYS.map((k) => [k, v[k] ?? ""])) as Record<VerifyKey, string>);
      setDone(true);
    } catch {
      setError({ text: t("error") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sky-300">
            <BadgeCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">{t("title")}</h2>
            <p className="mt-1 max-w-3xl text-sm text-white/50">{t("text")}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {done && !dirty && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <Check className="h-4 w-4" />
              {t("saved")}
            </span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={busy || !dirty}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/85 disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("save")}
          </button>
        </div>
      </div>

      {!liveUrl && (
        <div className="flex items-start gap-2.5 border-t border-white/[0.06] bg-amber-400/[0.04] px-5 py-3.5 text-xs leading-relaxed text-amber-100/80 sm:px-6">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
          {t("needDomain")}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 border-t border-rose-500/20 bg-rose-500/10 px-5 py-3 text-sm text-rose-200 sm:px-6">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error.text}
        </div>
      )}

      <div className="grid grid-cols-1 divide-y divide-white/[0.06] border-t border-white/[0.06] lg:grid-cols-2 lg:divide-y-0">
        {VERIFY_KEYS.map((k, i) => (
          <label
            key={k}
            className={`block px-5 py-5 sm:px-6 ${i % 2 === 0 ? "lg:border-e lg:border-white/[0.06]" : ""} ${i >= 2 ? "lg:border-t lg:border-white/[0.06]" : ""}`}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                {LABEL[k]}
                {saved[k] && <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">{t("active")}</span>}
              </span>
              <a href={HELP[k]} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/80">
                {t("getCode")}
                <ExternalLink className="h-3 w-3" />
              </a>
            </span>
            <input
              value={values[k]}
              onChange={(e) => {
                setValues((s) => ({ ...s, [k]: e.target.value }));
                setDone(false);
                setError(null);
              }}
              placeholder={`<meta name="${VERIFY_META_NAME[k]}" content="…" />`}
              dir="ltr"
              spellCheck={false}
              autoComplete="off"
              className={`mt-2.5 w-full rounded-lg border bg-black/40 px-3.5 py-2.5 font-mono text-[13px] outline-none placeholder:text-white/20 focus:border-amber-400/60 ${error?.field === k ? "border-rose-500/60" : "border-white/10"}`}
            />
          </label>
        ))}
      </div>
      <p className="border-t border-white/[0.06] px-5 py-3.5 text-xs text-white/40 sm:px-6">{t("hint")}</p>
    </section>
  );
}
