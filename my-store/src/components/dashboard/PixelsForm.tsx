"use client";

import { announcePending } from "@/lib/pending-client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Activity, AlertTriangle, Check, ExternalLink, Loader2, Save } from "lucide-react";
import type { Pixels } from "@/lib/integrations";

// ==================== 📈 بكسل Meta وبكسل TikTok للمسوّق ====================
const FIELDS = [
  { key: "meta", name: "Meta Pixel (Facebook · Instagram)", placeholder: "123456789012345", help: "https://business.facebook.com/events_manager2" },
  { key: "tiktok", name: "TikTok Pixel", placeholder: "C4ABCD1234EFGH5678IJ", help: "https://ads.tiktok.com/i18n/events_manager" },
] as const;

export default function PixelsForm({ initial }: { initial: Pixels }) {
  const t = useTranslations("dash.share.pixels");
  const [values, setValues] = useState({ meta: initial.meta ?? "", tiktok: initial.tiktok ?? "" });
  const [saved, setSaved] = useState<Pixels>(initial);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<{ field?: string; text: string } | null>(null);
  const dirty = values.meta !== (saved.meta ?? "") || values.tiktok !== (saved.tiktok ?? "");

  const save = async () => {
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const res = await fetch("/api/marketer/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixels: values }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError({ field: json.field, text: json.error === "invalid_pixel" ? t("invalid") : t("error") });
        return;
      }
      if (json.pending) {
        announcePending();
        setValues({ meta: saved.meta ?? "", tiktok: saved.tiktok ?? "" });
        return;
      }
      const p = json.data.pixels as Pixels;
      setSaved(p);
      setValues({ meta: p.meta ?? "", tiktok: p.tiktok ?? "" });
      setDone(true);
    } catch {
      setError({ text: t("error") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-violet-300">
            <Activity className="h-5 w-5" />
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

      {error && (
        <div className="flex items-center gap-2 border-t border-rose-500/20 bg-rose-500/10 px-5 py-3 text-sm text-rose-200 sm:px-6">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error.text}
        </div>
      )}

      <div className="grid grid-cols-1 divide-y divide-white/[0.06] border-t border-white/[0.06] lg:grid-cols-2 lg:divide-x lg:divide-y-0 rtl:lg:divide-x-reverse">
        {FIELDS.map((f) => (
          <label key={f.key} className="block px-5 py-5 sm:px-6">
            <span className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                {f.name}
                {saved[f.key] && <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">{t("active")}</span>}
              </span>
              <a href={f.help} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/80">
                {t("find")}
                <ExternalLink className="h-3 w-3" />
              </a>
            </span>
            <input
              value={values[f.key]}
              onChange={(e) => {
                setValues((s) => ({ ...s, [f.key]: e.target.value }));
                setDone(false);
                setError(null);
              }}
              placeholder={f.placeholder}
              dir="ltr"
              spellCheck={false}
              autoComplete="off"
              className={`mt-2.5 w-full rounded-lg border bg-black/40 px-3.5 py-2.5 font-mono text-[13px] outline-none placeholder:text-white/20 focus:border-amber-400/60 ${error?.field === f.key ? "border-rose-500/60" : "border-white/10"}`}
            />
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-2 border-t border-white/[0.06] bg-white/[0.015] px-5 py-4 text-xs text-white/55 sm:grid-cols-3 sm:px-6">
        <p><span className="font-mono text-white/80">PageView</span> · {t("ev.page")}</p>
        <p><span className="font-mono text-white/80">ViewContent</span> · {t("ev.view")}</p>
        <p><span className="font-mono text-white/80">InitiateCheckout / ClickButton</span> · {t("ev.click")}</p>
      </div>
      <p className="border-t border-white/[0.06] px-5 py-3.5 text-xs text-white/40 sm:px-6">{t("hint")}</p>
    </section>
  );
}
