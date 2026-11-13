"use client";
/* eslint-disable @next/next/no-img-element -- معاينة صور خارجية */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Check, ExternalLink, Loader2, Monitor, RotateCcw, Save, Smartphone } from "lucide-react";
import SlugField, { type SlugStatus } from "./SlugField";
import { Toggle } from "./OfferForm";
import OfferCard, { type OfferCardData } from "@/components/landing/OfferCard";
import LandingFonts from "@/components/landing/LandingFonts";
import {
  BG_STYLES, BUTTON_STYLES, CARD_IMAGE_STYLES, DEFAULT_DESIGN, FONT_STYLES, GRID_COLUMNS, PAGE_LANGUAGES, PRESET_THEMES,
  RADIUS_STYLES, SOCIAL_KEYS, THEMES, deriveTokens, pageDir, publicT, themeStyle, type PageDesign,
} from "@/lib/landing";
import type { SerializedLandingPage } from "@/lib/marketer";

const ACCENTS = ["#C8A24A", "#E8C27A", "#D4AF37", "#B76E79", "#9B87F5", "#5AA9E6", "#34D399", "#F97362", "#F5F5F4", "#111111"];
const BG_SWATCHES = ["#0B0E14", "#1B1B1F", "#14213D", "#0F2A24", "#2B0F1A", "#2E1F47", "#FAF7F2", "#EEF2F6", "#F3E9DC", "#E9F1EC"];

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50";

type SampleOffer = OfferCardData;

export default function PageSettingsForm({ initial, sampleOffers }: { initial: SerializedLandingPage; sampleOffers: SampleOffer[] }) {
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
  const [design, setDesign] = useState<PageDesign>(initial.design);
  const [socials, setSocials] = useState<Record<string, string>>(initial.socialLinks);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("available");
  const [savedSlug, setSavedSlug] = useState(initial.slug);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setF((s) => ({ ...s, [k]: v }));
    setDirty(true);
  };
  const setD = <K extends keyof PageDesign>(k: K, v: PageDesign[K]) => {
    setDesign((s) => ({ ...s, [k]: v }));
    setDirty(true);
  };

  // تحذير عند مغادرة الصفحة بتعديلات غير محفوظة
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (f.slug !== savedSlug && slugStatus !== "available") return setError(t("slug.chooseValid"));
    if (f.slug !== savedSlug && !confirm(t("design.slugConfirm"))) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/marketer/landing-page", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, design, socialLinks: socials }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("common.error"));
      setSavedSlug(data.data.slug);
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 2200);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const customTokens = deriveTokens(design.bgColor);

  return (
    <form onSubmit={submit} className="mx-auto max-w-[1400px]">
      {/* شريط علوي ثابت: العنوان + الحفظ */}
      <div className="sticky top-[57px] z-20 -mx-4 mb-6 flex flex-col gap-3 border-b border-white/[0.06] bg-[#07090D]/90 px-4 py-4 backdrop-blur sm:-mx-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">{t("design.title")}</h1>
          <p className="mt-0.5 text-sm text-white/50">{dirty ? <span className="text-amber-300">{t("design.unsaved")}</span> : t("design.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/${savedSlug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.05]">
            <ExternalLink className="h-4 w-4" />
            {t("nav.view")}
          </a>
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50 cursor-pointer">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? t("common.saved") : t("common.save")}
          </button>
        </div>
      </div>

      {error && <p className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-6">
          {/* 🎨 الألوان */}
          <Card title={t("design.sec.look")}>
            <div>
              <p className="mb-2 text-sm text-white/70">{t("design.theme")}</p>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                {PRESET_THEMES.map((th) => (
                  <ThemeSwatch key={th} active={f.theme === th} label={t(`design.themes.${th}`)} tokens={THEMES[th]} accent={f.accentColor} onClick={() => set("theme", th)} />
                ))}
                <ThemeSwatch
                  active={f.theme === "custom"}
                  label={t("design.themes.custom")}
                  tokens={customTokens}
                  accent={f.accentColor}
                  onClick={() => set("theme", "custom")}
                  rainbow
                />
              </div>
            </div>

            {f.theme === "custom" && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-4">
                <p className="mb-2 text-sm text-white/80">{t("design.bgColor")}</p>
                <ColorRow value={design.bgColor} swatches={BG_SWATCHES} onChange={(c) => setD("bgColor", c)} />
                <p className="mt-2 text-xs text-white/45">{t("design.bgColorHint")}</p>
              </div>
            )}

            <div>
              <p className="mb-2 text-sm text-white/70">{t("design.accent")}</p>
              <ColorRow value={f.accentColor} swatches={ACCENTS} onChange={(c) => set("accentColor", c)} />
            </div>

            <Segmented
              label={t("design.background")}
              value={design.background}
              options={BG_STYLES.map((v) => ({ value: v, label: t(`design.backgrounds.${v}`) }))}
              onChange={(v) => setD("background", v)}
            />
          </Card>

          {/* ✍️ الأسلوب */}
          <Card
            title={t("design.sec.style")}
            action={
              <button
                type="button"
                onClick={() => {
                  setDesign((d) => ({ ...DEFAULT_DESIGN, bgColor: d.bgColor }));
                  setDirty(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t("design.reset")}
              </button>
            }
          >
            <div>
              <p className="mb-2 text-sm text-white/70">{t("design.font")}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <LandingFonts />
                {FONT_STYLES.map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setD("font", v)}
                    className={`rounded-xl border px-3 py-3 text-start transition cursor-pointer ${design.font === v ? "border-amber-400 bg-amber-400/[0.06]" : "border-white/10 hover:border-white/25"}`}
                  >
                    <span className="block text-xl leading-none" style={{ fontFamily: themeStyle("midnight", "#000000", { font: v })["--lp-font-heading" as keyof React.CSSProperties] as string }}>
                      Aa
                    </span>
                    <span className="mt-1.5 block text-xs text-white/55">{t(`design.fonts.${v}`)}</span>
                  </button>
                ))}
              </div>
            </div>
            <Segmented label={t("design.radius")} value={design.radius} options={RADIUS_STYLES.map((v) => ({ value: v, label: t(`design.radii.${v}`) }))} onChange={(v) => setD("radius", v)} />
            <Segmented label={t("design.button")} value={design.button} options={BUTTON_STYLES.map((v) => ({ value: v, label: t(`design.buttons.${v}`) }))} onChange={(v) => setD("button", v)} />
            <Segmented
              label={t("design.columns")}
              value={design.columns}
              options={GRID_COLUMNS.map((v) => ({ value: v, label: String(v) }))}
              onChange={(v) => setD("columns", v)}
            />
            <Segmented
              label={t("design.cardImage")}
              value={design.cardImage}
              options={CARD_IMAGE_STYLES.map((v) => ({ value: v, label: t(`design.cardImages.${v}`) }))}
              onChange={(v) => setD("cardImage", v)}
            />
          </Card>

          {/* 🪪 الهوية */}
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
              <L text={t("design.avatar")} hint={t("design.urlHint")}>
                <input dir="ltr" maxLength={1000} value={f.avatarUrl} onChange={(e) => set("avatarUrl", e.target.value)} placeholder="https://…" className={field} />
              </L>
              <L text={t("design.cover")} hint={t("design.urlHint")}>
                <input dir="ltr" maxLength={1000} value={f.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} placeholder="https://…" className={field} />
              </L>
            </div>
            <L text={t("design.language")} hint={t("design.languageHint")}>
              <select value={f.language} onChange={(e) => set("language", e.target.value)} className={field + " bg-[#0E1118]"}>
                {PAGE_LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {t(`design.languages.${l}`)}
                  </option>
                ))}
              </select>
            </L>
          </Card>

          <Card title={t("design.sec.social")}>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOCIAL_KEYS.map((k) => (
                <L key={k} text={t(`design.socials.${k}`)}>
                  <input
                    dir="ltr"
                    value={socials[k] ?? ""}
                    onChange={(e) => {
                      setSocials((s) => ({ ...s, [k]: e.target.value }));
                      setDirty(true);
                    }}
                    placeholder="https://…"
                    className={field}
                  />
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

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              <span>
                <span className="block font-semibold">{t("design.published")}</span>
                <span className="text-xs text-white/40">{t("design.publishedHint")}</span>
              </span>
              <Toggle checked={f.isPublished} onChange={(v) => set("isPublished", v)} />
            </label>
          </div>
        </div>

        {/* 👁️ معاينة حية بالحجم الحقيقي (مصغّرة) */}
        <aside className="xl:sticky xl:top-[150px] xl:self-start">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-white/70">{t("design.preview")}</p>
            <div className="flex rounded-lg border border-white/10 p-0.5">
              {(["desktop", "mobile"] as const).map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition cursor-pointer ${device === d ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}
                >
                  {d === "desktop" ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                  {t(`design.devices.${d}`)}
                </button>
              ))}
            </div>
          </div>
          <ScaledPreview width={device === "desktop" ? 1200 : 390} maxHeight={device === "desktop" ? 620 : 700}>
            <PreviewPage f={f} design={design} socials={socials} offers={sampleOffers} emptyLabel={t("design.previewEmpty")} />
          </ScaledPreview>
        </aside>
      </div>
    </form>
  );
}

// ==================== 👁️ المعاينة ====================

/** يرسم المحتوى بعرض حقيقي (1200 أو 390) ثم يصغّره ليناسب العمود */
function ScaledPreview({ width, maxHeight, children }: { width: number; maxHeight: number; children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [innerH, setInnerH] = useState(900);

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, o.clientWidth / width));
      setInnerH(i.offsetHeight);
    });
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      </div>
      <div ref={outer} className="overflow-y-auto overflow-x-hidden" style={{ maxHeight }}>
        {/* حاوية بارتفاع المحتوى بعد التصغير (transform لا يغيّر الارتفاع في التخطيط) */}
        <div className="relative mx-auto overflow-hidden" style={{ width: width * scale, height: innerH * scale }}>
          <div ref={inner} className="pointer-events-none absolute start-0 top-0 origin-top-left rtl:origin-top-right" style={{ width, transform: `scale(${scale})` }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewPage({
  f,
  design,
  socials,
  offers,
  emptyLabel,
}: {
  f: { title: string; tagline: string; bio: string; avatarUrl: string; coverUrl: string; language: string; theme: string; accentColor: string; showDisclosure: boolean; disclosure: string };
  design: PageDesign;
  socials: Record<string, string>;
  offers: SampleOffer[];
  emptyLabel: string;
}) {
  const lang = f.language;
  const cols = design.columns === 2 ? "grid-cols-2" : design.columns === 3 ? "grid-cols-3" : "grid-cols-4";
  const socialCount = Object.values(socials).filter(Boolean).length;
  return (
    <div data-lp dir={pageDir(lang)} lang={lang} style={themeStyle(f.theme, f.accentColor, design)} className="min-h-[900px]">
      <header className="relative overflow-hidden">
        {f.coverUrl && (
          <div className="absolute inset-0">
            <img src={f.coverUrl} alt="" className="h-full w-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[color-mix(in_srgb,var(--lp-bg)_70%,transparent)] to-[var(--lp-bg)]" />
          </div>
        )}
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-12 pt-16 text-center">
          <div className="rounded-full p-[3px]" style={{ background: "linear-gradient(135deg, var(--lp-accent), transparent 70%)" }}>
            {f.avatarUrl ? (
              <img src={f.avatarUrl} alt="" className="h-24 w-24 rounded-full border-4 border-[var(--lp-bg)] object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[var(--lp-bg)] bg-[var(--lp-surface2)] font-serif text-4xl text-[var(--lp-accent)]">
                {f.title.trim().slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="mt-6 font-serif text-5xl font-semibold tracking-tight">{f.title || "—"}</h1>
          {f.tagline && <p className="mt-3 text-lg text-[var(--lp-accent)]">{f.tagline}</p>}
          {f.bio && <p className="mt-4 max-w-xl whitespace-pre-line text-[15px] leading-relaxed text-[var(--lp-muted)]">{f.bio}</p>}
          {socialCount > 0 && (
            <div className="mt-6 flex gap-2">
              {Array.from({ length: socialCount }).map((_, i) => (
                <span key={i} className="h-10 w-10 rounded-full border border-[var(--lp-border)] bg-[var(--lp-surface)]" />
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 flex gap-2">
          <span className="rounded-full px-4 py-1.5 text-[13px] font-medium text-[var(--lp-accent-fg)]" style={{ background: "var(--lp-accent)" }}>
            {publicT(lang, "allOffers")}
          </span>
          <span className="rounded-full border border-[var(--lp-border)] px-4 py-1.5 text-[13px] text-[var(--lp-muted)]">Amazon</span>
        </div>
        {offers.length > 0 ? (
          <div className={`grid gap-5 ${cols}`}>
            {offers.map((o) => (
              <OfferCard key={o.id} offer={o} pageSlug="preview" lang={lang} />
            ))}
          </div>
        ) : (
          <div className={`grid gap-5 ${cols}`}>
            {Array.from({ length: design.columns }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-[var(--lp-border)] bg-[var(--lp-surface)]">
                <div className="m-2.5 aspect-square rounded-2xl bg-[var(--lp-card-img)]" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-3/4 rounded-full bg-[var(--lp-text)] opacity-40" />
                  <div className="h-3 w-1/3 rounded-full" style={{ background: "var(--lp-accent)" }} />
                </div>
              </div>
            ))}
            <p className="col-span-full pt-2 text-center text-sm text-[var(--lp-muted)]">{emptyLabel}</p>
          </div>
        )}
        <div className="mx-auto mt-10 max-w-sm">
          <span className="flex items-center justify-center rounded-[var(--lp-btn-radius)] px-6 py-4 font-bold" style={{ background: "var(--lp-accent)", color: "var(--lp-accent-fg)" }}>
            {publicT(lang, "buyOn", { store: "Amazon" })}
          </span>
        </div>
        {f.showDisclosure && (
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-5 text-[13px] text-[var(--lp-muted)]">
            {f.disclosure || publicT(lang, "disclosureDefault")}
          </div>
        )}
      </main>
    </div>
  );
}

// ==================== 🧱 عناصر النموذج ====================

function ThemeSwatch({
  active,
  label,
  tokens,
  accent,
  onClick,
  rainbow,
}: {
  active: boolean;
  label: string;
  tokens: { bg: string; surface: string; border: string; text: string };
  accent: string;
  onClick: () => void;
  rainbow?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`overflow-hidden rounded-xl border-2 text-start transition cursor-pointer ${active ? "border-amber-400" : "border-transparent hover:border-white/20"}`}
    >
      <div className="relative h-14 p-2" style={{ background: tokens.bg }}>
        {rainbow && <span className="absolute end-1.5 top-1.5 h-3 w-3 rounded-full bg-[conic-gradient(#f87171,#fbbf24,#34d399,#60a5fa,#a78bfa,#f87171)]" />}
        <div className="h-full rounded-md border" style={{ background: tokens.surface, borderColor: tokens.border }}>
          <div className="m-1.5 h-1.5 w-7 rounded-full" style={{ background: accent }} />
          <div className="mx-1.5 h-1 w-10 rounded-full opacity-40" style={{ background: tokens.text }} />
        </div>
      </div>
      <p className="truncate bg-white/[0.04] px-2.5 py-1.5 text-[11px]">{label}</p>
    </button>
  );
}

function ColorRow({ value, swatches, onChange }: { value: string; swatches: string[]; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {swatches.map((c) => (
        <button
          type="button"
          key={c}
          onClick={() => onChange(c)}
          className={`h-8 w-8 rounded-full border-2 transition cursor-pointer ${value.toLowerCase() === c.toLowerCase() ? "scale-110 border-amber-300" : "border-white/10"}`}
          style={{ background: c }}
          aria-label={c}
        />
      ))}
      <label className="relative flex h-8 cursor-pointer items-center gap-2 rounded-full border border-white/10 ps-1 pe-3 text-xs text-white/60">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0" />
        <span dir="ltr">{value}</span>
      </label>
    </div>
  );
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-white/70">{label}</p>
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-1">
        {options.map((o) => (
          <button
            type="button"
            key={String(o.value)}
            onClick={() => onChange(o.value)}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${value === o.value ? "bg-amber-400 text-black" : "text-white/60 hover:bg-white/[0.05] hover:text-white"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      <div className="mt-5 space-y-5">{children}</div>
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
