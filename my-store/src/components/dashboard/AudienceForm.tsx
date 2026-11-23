"use client";

import { announcePending } from "@/lib/pending-client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle, Ban, Bot, Check, CircleSlash, Globe2, Loader2, MapPin, MousePointerClick, Navigation, Save, Search, ShieldCheck, X,
} from "lucide-react";
import { Toggle } from "./OfferForm";
import { InfoTip, RecommendedBadge } from "@/components/shared/InfoTip";
import { COUNTRY_CODES, COUNTRY_PRESETS, isCountryAllowed, type AudienceSettings } from "@/lib/traffic";

const PRESET_KEYS = ["us", "northAmerica", "english", "eu", "gcc"] as const;
const COVERED = ["Facebook", "Instagram", "WhatsApp", "Messenger", "TikTok", "X / Twitter", "LinkedIn", "Telegram", "Pinterest", "Snapchat", "Discord", "Slack", "Reddit", "Google", "Bing", "ChatGPT / AI", "Scripts & headless"];

export default function AudienceForm({
  initial,
  stats,
  myCountry,
}: {
  initial: AudienceSettings;
  stats: { clicks: number; bots: number; geo: number };
  myCountry: string | null;
}) {
  const t = useTranslations("dash.audience");
  const locale = useLocale();
  const router = useRouter();
  const [a, setA] = useState<AudienceSettings>(initial);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof AudienceSettings>(k: K, v: AudienceSettings[K]) => {
    setA((s) => ({ ...s, [k]: v }));
    setDirty(true);
    setSaved(false);
    setError("");
  };

  // تحذير عند مغادرة الصفحة بتعديلات غير محفوظة
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // أسماء الدول بلغة الواجهة (Intl) مرتّبة أبجدياً
  const countries = useMemo(() => {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([locale, "en"], { type: "region" });
    } catch {}
    const en = new Intl.DisplayNames(["en"], { type: "region" });
    return COUNTRY_CODES.map((code) => ({ code, name: names?.of(code) ?? code, en: en.of(code) ?? code })).sort((x, y) =>
      x.name.localeCompare(y.name, locale),
    );
  }, [locale]);
  const nameOf = (code: string) => countries.find((c) => c.code === code)?.name ?? code;

  const selected = new Set(a.countries);
  const q = query.trim().toLowerCase();
  const filtered = q ? countries.filter((c) => c.name.toLowerCase().includes(q) || c.en.toLowerCase().includes(q) || c.code.toLowerCase() === q) : countries;

  const toggleCountry = (code: string) => {
    const next = new Set(selected);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    set("countries", [...next]);
  };
  const addPreset = (codes: string[]) => set("countries", [...new Set([...a.countries, ...codes])]);

  const myAllowed = isCountryAllowed(a, myCountry);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/marketer/audience", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        const code = typeof json.error === "string" ? json.error : "invalid";
        setError(t.has(`errors.${code}`) ? t(`errors.${code}`) : t("errors.invalid"));
        return;
      }
      if (json.pending) {
        announcePending();
        setDirty(false);
        return;
      }
      setA(json.data);
      setDirty(false);
      setSaved(true);
      router.refresh();
    } catch {
      setError(t("errors.network"));
    } finally {
      setSaving(false);
    }
  };

  const nf = new Intl.NumberFormat(locale);

  return (
    <div className="mx-auto max-w-5xl">
      {/* العنوان + الحفظ */}
      <div className="sticky top-16 z-20 -mx-4 mb-6 flex flex-col gap-3 border-b border-white/[0.06] bg-[#07090D]/90 px-4 py-4 backdrop-blur sm:-mx-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">{t("title")}</h1>
          <p className="mt-0.5 text-sm text-white/50">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && !dirty && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <Check className="h-4 w-4" />
              {t("saved")}
            </span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("save")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* 📊 آخر 30 يوماً */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat icon={MousePointerClick} tone="text-emerald-300" value={nf.format(stats.clicks)} label={t("stats.clicks")} hint={t("stats.clicksHint")} />
          <Stat icon={Bot} tone="text-sky-300" value={nf.format(stats.bots)} label={t("stats.bots")} hint={t("stats.botsHint")} tip={t("tips.botsStat")} />
          <Stat icon={Ban} tone="text-amber-300" value={nf.format(stats.geo)} label={t("stats.geo")} hint={t("stats.geoHint")} tip={t("tips.geoStat")} />
        </div>

        {/* 🔄 كيف يعمل */}
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:grid-cols-3 sm:p-5">
          <Flow icon={MousePointerClick} tone="bg-emerald-400/10 text-emerald-300 border-emerald-400/20" title={t("flow.human")} text={t("flow.humanText")} />
          <Flow icon={Bot} tone="bg-sky-400/10 text-sky-300 border-sky-400/20" title={t("flow.bot")} text={t("flow.botText")} />
          <Flow icon={CircleSlash} tone="bg-amber-400/10 text-amber-300 border-amber-400/20" title={t("flow.geo")} text={t("flow.geoText")} />
        </div>

        {/* 🌍 الاستهداف الجغرافي */}
        <Card icon={Globe2} title={t("geo.title")} subtitle={t("geo.subtitle")}>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {(["all", "allow", "block"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set("geoMode", m)}
                className={`rounded-xl border p-4 text-start transition cursor-pointer ${a.geoMode === m ? "border-amber-400 bg-amber-400/[0.06]" : "border-white/10 hover:border-white/25"}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    {t(`geo.modes.${m}`)}
                    {m !== "all" && <InfoTip text={t(`tips.geo_${m}`)} />}
                  </span>
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${a.geoMode === m ? "border-amber-400 bg-amber-400" : "border-white/25"}`}>
                    {a.geoMode === m && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-white/50">{t(`geo.modesHint.${m}`)}</span>
              </button>
            ))}
          </div>

          {a.geoMode !== "all" && (
            <div className="mt-5 space-y-4">
              {/* مجموعات سريعة */}
              <div className="flex flex-wrap gap-2">
                <span className="me-1 self-center text-xs text-white/40">{t("geo.quickAdd")}</span>
                {PRESET_KEYS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => addPreset(COUNTRY_PRESETS[k])}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/75 transition hover:border-amber-400/40 hover:text-white cursor-pointer"
                  >
                    + {t(`geo.presets.${k}`)}
                  </button>
                ))}
              </div>

              {/* الدول المختارة */}
              <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-white/60">
                    {a.geoMode === "allow" ? t("geo.selectedAllow", { n: a.countries.length }) : t("geo.selectedBlock", { n: a.countries.length })}
                  </p>
                  {a.countries.length > 0 && (
                    <button type="button" onClick={() => set("countries", [])} className="text-xs text-white/40 hover:text-rose-300 cursor-pointer">
                      {t("geo.clear")}
                    </button>
                  )}
                </div>
                {a.countries.length === 0 ? (
                  <p className="py-2 text-xs text-amber-200/80">{t("geo.none")}</p>
                ) : (
                  <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
                    {[...a.countries].sort((x, y) => nameOf(x).localeCompare(nameOf(y), locale)).map((code) => (
                      <span
                        key={code}
                        className={`inline-flex items-center gap-1.5 rounded-full border py-1 ps-2.5 pe-1 text-xs ${
                          a.geoMode === "allow" ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-100" : "border-rose-400/25 bg-rose-400/[0.08] text-rose-100"
                        }`}
                      >
                        {nameOf(code)}
                        <button type="button" onClick={() => toggleCountry(code)} className="rounded-full p-0.5 opacity-60 hover:bg-white/10 hover:opacity-100 cursor-pointer" aria-label={t("geo.remove")}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* البحث + القائمة */}
              <div className="overflow-hidden rounded-xl border border-white/10">
                <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] px-3">
                  <Search className="h-4 w-4 shrink-0 text-white/40" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("geo.search", { n: COUNTRY_CODES.length })}
                    className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
                  />
                  {query && (
                    <button type="button" onClick={() => setQuery("")} className="text-white/40 hover:text-white cursor-pointer" aria-label={t("geo.clear")}>
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <ul className="max-h-72 overflow-y-auto p-1.5 [scrollbar-width:thin]">
                  {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-white/40">{t("geo.noResults")}</li>}
                  {filtered.map((c) => {
                    const on = selected.has(c.code);
                    return (
                      <li key={c.code}>
                        <button
                          type="button"
                          onClick={() => toggleCountry(c.code)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm transition-colors cursor-pointer ${on ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"}`}
                        >
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? "border-amber-400 bg-amber-400 text-black" : "border-white/25"}`}>
                            {on && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{c.name}</span>
                          <span className="text-[11px] tabular-nums text-white/30">{c.code}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {/* موقعك الحالي */}
          <div className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${myAllowed ? "border-emerald-400/20 bg-emerald-400/[0.05]" : "border-amber-400/25 bg-amber-400/[0.06]"}`}>
            <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${myAllowed ? "text-emerald-300" : "text-amber-300"}`} />
            <p className="text-white/75">
              {myCountry ? t("geo.you", { country: nameOf(myCountry) }) : t("geo.youUnknown")}{" "}
              <span className={myAllowed ? "font-semibold text-emerald-300" : "font-semibold text-amber-300"}>{myAllowed ? t("geo.youAllowed") : t("geo.youBlocked")}</span>
            </p>
          </div>
        </Card>

        {/* 🚧 وجهة الزوار خارج جمهورك */}
        <Card icon={Navigation} title={t("blocked.title")} subtitle={t("blocked.subtitle")} muted={a.geoMode === "all"}>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {(["page", "redirect"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set("blockAction", m)}
                className={`rounded-xl border p-4 text-start transition cursor-pointer ${a.blockAction === m ? "border-amber-400 bg-amber-400/[0.06]" : "border-white/10 hover:border-white/25"}`}
              >
                <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {t(`blocked.actions.${m}`)}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-white/50">{t(`blocked.actionsHint.${m}`)}</span>
              </button>
            ))}
          </div>
          {a.blockAction === "redirect" && (
            <div className="mt-4">
              <label className="mb-1.5 block text-sm text-white/70">{t("blocked.url")}</label>
              <input
                dir="ltr"
                value={a.redirectUrl ?? ""}
                onChange={(e) => set("redirectUrl", e.target.value || null)}
                placeholder="https://"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/30 focus:border-amber-400/60 focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-white/40">{t("blocked.urlHint")}</p>
            </div>
          )}
        </Card>

        {/* 🤖 حماية الروبوتات */}
        <Card
          icon={ShieldCheck}
          title={t("bots.title")}
          subtitle={t("bots.subtitle")}
          badge={<RecommendedBadge label={t("rec")} reason={t("tips.bots")} />}
          action={<Toggle checked={a.botProtection} onChange={(v) => set("botProtection", v)} />}
        >
          <div className={`space-y-4 transition-opacity ${a.botProtection ? "" : "opacity-45"}`}>
            <ul className="space-y-2.5 text-sm text-white/70">
              {(["p1", "p2", "p3", "p4"] as const).map((k) => (
                <li key={k} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {t(`bots.${k}`)}
                </li>
              ))}
            </ul>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">{t("bots.covered")}</p>
              <div className="flex flex-wrap gap-1.5">
                {COVERED.map((c) => (
                  <span key={c} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs text-white/65">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {!a.botProtection && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-4 py-3 text-sm text-rose-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {t("bots.offWarning")}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

// ==================== 🧱 عناصر ====================
function Card({
  icon: Icon,
  title,
  subtitle,
  action,
  badge,
  muted,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6 ${muted ? "opacity-60" : ""}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-amber-300">
            <Icon className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <h2 className="flex flex-wrap items-center gap-2 font-semibold">
              {title}
              {badge}
            </h2>
            <p className="mt-0.5 text-sm text-white/50">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Stat({ icon: Icon, tone, value, label, hint, tip }: { icon: React.ComponentType<{ className?: string }>; tone: string; value: string; label: string; hint: string; tip?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <Icon className={`h-4.5 w-4.5 ${tone}`} />
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="flex items-center gap-1.5 text-sm text-white/70">
        {label}
        {tip && <InfoTip text={tip} />}
      </p>
      <p className="mt-0.5 text-xs text-white/35">{hint}</p>
    </div>
  );
}

function Flow({ icon: Icon, tone, title, text }: { icon: React.ComponentType<{ className?: string }>; tone: string; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-white/50">{text}</p>
      </div>
    </div>
  );
}
