"use client";
/* eslint-disable @next/next/no-img-element -- معاينة صور خارجية */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Check, Loader2, Save } from "lucide-react";
import SlugField, { type SlugStatus } from "./SlugField";
import { Toggle } from "./OfferForm";
import { PAGE_LANGUAGES, PAGE_THEMES, SOCIAL_KEYS, THEMES, publicT, themeStyle, pageDir } from "@/lib/landing";
import type { SerializedLandingPage } from "@/lib/marketer";

const ACCENTS = ["#C8A24A", "#E8C27A", "#D4AF37", "#B76E79", "#9B87F5", "#5AA9E6", "#34D399", "#F97362"];

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50";

export default function PageSettingsForm({ initial }: { initial: SerializedLandingPage }) {
  const t = useTranslations("dash");
  const router = useRouter();
  const [f, setF] = useState({
    title: initial.title,
    slug: initial.slug,
    tagline: initial.tagline ?? "",
    bio: initial.bio ?? "",
    avatarUrl: initial.avatarUrl ?? "",
    coverUrl: initial.coverUrl ?? "",
    language: initial.language,
    theme: initial.theme,
    accentColor: initial.accentColor,
    showDisclosure: initial.showDisclosure,
    disclosure: initial.disclosure ?? "",
    seoTitle: initial.seoTitle ?? "",
    seoDescription: initial.seoDescription ?? "",
    isPublished: initial.isPublished,
  });
  const [socials, setSocials] = useState<Record<string, string>>(initial.socialLinks);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("available");
  const [savedSlug, setSavedSlug] = useState(initial.slug);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.slug !== savedSlug && slugStatus !== "available") return setError(t("slug.chooseValid"));
    if (f.slug !== savedSlug && !confirm(t("design.slugConfirm"))) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/marketer/landing-page", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, socialLinks: socials }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("common.error"));
      setSavedSlug(data.data.slug);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{t("design.title")}</h1>
          <p className="mt-1 text-white/55">{t("design.subtitle")}</p>
        </div>
        <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50 cursor-pointer">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? t("common.saved") : t("common.save")}
        </button>
      </div>

      {error && <p className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card title={t("design.sec.identity")}>
            <L text={t("design.pageTitle")}>
              <input required maxLength={80} value={f.title} onChange={(e) => set("title", e.target.value)} className={field} />
            </L>
            <div className="space-y-1.5">
              <span className="text-sm text-white/70">{t("design.slug")}</span>
              <SlugField value={f.slug} onChange={(v) => set("slug", v)} onStatus={setSlugStatus} currentSlug={savedSlug} />
              {f.slug !== savedSlug && (
                <p className="flex items-start gap-2 text-xs text-amber-300/90">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {t("design.slugWarning")}
                </p>
              )}
            </div>
            <L text={t("design.tagline")} hint={t("design.taglineHint")}>
              <input maxLength={160} value={f.tagline} onChange={(e) => set("tagline", e.target.value)} className={field} />
            </L>
            <L text={t("design.bio")} hint={`${f.bio.length}/2000`}>
              <textarea rows={4} maxLength={2000} value={f.bio} onChange={(e) => set("bio", e.target.value)} className={field + " resize-y"} />
            </L>
            <div className="grid gap-4 sm:grid-cols-2">
              <L text={t("design.avatar")}>
                <input dir="ltr" type="url" value={f.avatarUrl} onChange={(e) => set("avatarUrl", e.target.value)} placeholder="https://…" className={field} />
              </L>
              <L text={t("design.cover")}>
                <input dir="ltr" type="url" value={f.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} placeholder="https://…" className={field} />
              </L>
            </div>
          </Card>

          <Card title={t("design.sec.look")}>
            <div>
              <p className="mb-2 text-sm text-white/70">{t("design.theme")}</p>
              <div className="grid grid-cols-3 gap-3">
                {PAGE_THEMES.map((th) => (
                  <button
                    type="button"
                    key={th}
                    onClick={() => set("theme", th)}
                    className={`overflow-hidden rounded-xl border-2 text-start transition cursor-pointer ${f.theme === th ? "border-amber-400" : "border-transparent hover:border-white/20"}`}
                  >
                    <div className="h-16 p-2.5" style={{ background: THEMES[th].bg }}>
                      <div className="h-full rounded-md border" style={{ background: THEMES[th].surface, borderColor: THEMES[th].border }}>
                        <div className="m-1.5 h-1.5 w-8 rounded-full" style={{ background: f.accentColor }} />
                        <div className="mx-1.5 h-1 w-12 rounded-full opacity-40" style={{ background: THEMES[th].text }} />
                      </div>
                    </div>
                    <p className="bg-white/[0.04] px-3 py-1.5 text-xs">{t(`design.themes.${th}`)}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm text-white/70">{t("design.accent")}</p>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENTS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => set("accentColor", c)}
                    className={`h-8 w-8 rounded-full border-2 transition cursor-pointer ${f.accentColor.toLowerCase() === c.toLowerCase() ? "border-white scale-110" : "border-transparent"}`}
                    style={{ background: c }}
                    aria-label={c}
                  />
                ))}
                <label className="relative flex h-8 cursor-pointer items-center gap-2 rounded-full border border-white/10 ps-1 pe-3 text-xs text-white/60">
                  <input type="color" value={f.accentColor} onChange={(e) => set("accentColor", e.target.value.toUpperCase())} className="h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0" />
                  <span dir="ltr">{f.accentColor}</span>
                </label>
              </div>
            </div>
            <L text={t("design.language")} hint={t("design.languageHint")}>
              <select value={f.language} onChange={(e) => set("language", e.target.value)} className={field + " bg-[#0E1118]"}>
                {PAGE_LANGUAGES.map((l) => (
                  <option key={l} value={l}>{t(`design.languages.${l}`)}</option>
                ))}
              </select>
            </L>
          </Card>

          <Card title={t("design.sec.social")}>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOCIAL_KEYS.map((k) => (
                <L key={k} text={t(`design.socials.${k}`)}>
                  <input dir="ltr" type="url" value={socials[k] ?? ""} onChange={(e) => setSocials((s) => ({ ...s, [k]: e.target.value }))} placeholder="https://…" className={field} />
                </L>
              ))}
            </div>
          </Card>

          <Card title={t("design.sec.disclosure")}>
            <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              <span>
                <span className="block">{t("design.showDisclosure")}</span>
                <span className="text-xs text-white/40">{t("design.showDisclosureHint")}</span>
              </span>
              <Toggle checked={f.showDisclosure} onChange={(v) => set("showDisclosure", v)} />
            </label>
            {f.showDisclosure && (
              <L text={t("design.disclosureText")} hint={t("design.disclosureHint")}>
                <textarea rows={3} maxLength={1500} value={f.disclosure} onChange={(e) => set("disclosure", e.target.value)} placeholder={publicT(f.language, "disclosureDefault")} className={field + " resize-y"} />
              </L>
            )}
          </Card>

          <Card title={t("design.sec.seo")}>
            <L text={t("design.seoTitle")} hint={`${f.seoTitle.length}/70`}>
              <input maxLength={70} value={f.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={f.title} className={field} />
            </L>
            <L text={t("design.seoDescription")} hint={`${f.seoDescription.length}/170`}>
              <textarea rows={2} maxLength={170} value={f.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} placeholder={f.tagline} className={field + " resize-y"} />
            </L>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              <span>
                <span className="block font-semibold">{t("design.published")}</span>
                <span className="text-xs text-white/40">{t("design.publishedHint")}</span>
              </span>
              <Toggle checked={f.isPublished} onChange={(v) => set("isPublished", v)} />
            </label>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
            <div style={themeStyle(f.theme, f.accentColor)} dir={pageDir(f.language)} className="relative">
              {f.coverUrl ? (
                <img src={f.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,color-mix(in_srgb,var(--lp-accent)_25%,transparent),transparent_70%)]" />
              )}
              <div className="relative flex flex-col items-center px-5 py-10 text-center">
                {f.avatarUrl ? (
                  <img src={f.avatarUrl} alt="" className="h-16 w-16 rounded-full border-2 object-cover" style={{ borderColor: "var(--lp-accent)" }} />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 bg-[var(--lp-surface2)] font-serif text-2xl text-[var(--lp-accent)]" style={{ borderColor: "var(--lp-accent)" }}>
                    {f.title.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <p className="mt-3 font-serif text-xl font-semibold">{f.title || "—"}</p>
                {f.tagline && <p className="mt-1 text-xs text-[var(--lp-accent)]">{f.tagline}</p>}
                {f.bio && <p className="mt-2 line-clamp-3 text-xs text-[var(--lp-muted)]">{f.bio}</p>}
                <div className="mt-5 grid w-full grid-cols-2 gap-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface)] p-1.5">
                      <div className="aspect-square rounded-md bg-white" />
                      <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-[var(--lp-text)] opacity-50" />
                      <div className="mt-1 h-1.5 w-1/2 rounded-full" style={{ background: "var(--lp-accent)" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function L({ text, hint, children }: { text: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-white/70">{text}</span>
      {children}
      {hint && <span className="block text-xs text-white/35">{hint}</span>}
    </label>
  );
}
