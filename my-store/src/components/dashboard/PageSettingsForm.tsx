"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Check, ExternalLink, Loader2, Monitor, RotateCcw, Save, Smartphone } from "lucide-react";
import SlugField, { type SlugStatus } from "./SlugField";
import { Toggle } from "./OfferForm";
import { SingleImageField } from "./ImageUpload";
import type { OfferCardData } from "@/components/landing/OfferCard";
import Storefront from "@/components/landing/Storefront";
import LandingFonts from "@/components/landing/LandingFonts";
import {
  BG_STYLES, BUTTON_STYLES, NAV_STYLES, CARD_IMAGE_STYLES, DEFAULT_DESIGN, FONT_STYLES, GRID_COLUMNS, PAGE_LANGUAGES, PRESET_THEMES,
  RADIUS_STYLES, SOCIAL_KEYS, THEMES, deriveTokens, pageDir, publicT, themeStyle, type PageDesign,
} from "@/lib/landing";
import type { SerializedLandingPage } from "@/lib/marketer";

const ACCENTS = ["#C8A24A", "#E8C27A", "#D4AF37", "#B76E79", "#9B87F5", "#5AA9E6", "#34D399", "#F97362", "#F5F5F4", "#111111"];
const NAV_SWATCHES = ["#111111", "#FFFFFF", "#0B1F3A", "#1F3A2E", "#3B0D1C", "#2E1F47", "#F4EDE2", "#E8EEF5", "#C8A24A", "#0071CE"];
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

          {/* 🧭 شريط التنقل */}
          <Card title={t("design.sec.navbar")}>
            <div>
              <p className="mb-2 text-sm text-white/70">{t("design.navStyle")}</p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {NAV_STYLES.map((v) => {
                  const st = themeStyle(f.theme, f.accentColor, { ...design, nav: v }) as Record<string, string>;
                  return (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setD("nav", v)}
                      className={`overflow-hidden rounded-xl border-2 text-start transition cursor-pointer ${design.nav === v ? "border-amber-400" : "border-transparent hover:border-white/20"}`}
                    >
                      <div className="p-2" style={{ background: st.backgroundColor }}>
                        <div className="flex items-center gap-1.5 rounded-md px-1.5 py-1.5" style={{ background: st["--lp-nav-bg"], border: `1px solid ${st["--lp-nav-border"]}` }}>
                          <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: st["--lp-nav-btn"] }} />
                          <span className="h-2.5 flex-1 rounded-full" style={{ background: st["--lp-nav-field"], border: `1px solid ${st["--lp-nav-border"]}` }} />
                          <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: st["--lp-nav-btn"] }} />
                        </div>
                      </div>
                      <p className="truncate bg-white/[0.04] px-2.5 py-1.5 text-[11px]">{t(`design.navStyles.${v}`)}</p>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-white/40">{t("design.navHint")}</p>
            </div>
            {design.nav === "solid" && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-4">
                <p className="mb-2 text-sm text-white/80">{t("design.navColor")}</p>
                <ColorRow value={design.navColor} swatches={NAV_SWATCHES} onChange={(c) => setD("navColor", c)} />
              </div>
            )}
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
            <div className="grid gap-5">
              <div className="space-y-1.5">
                <span className="text-sm text-white/70">{t("design.avatar")}</span>
                <SingleImageField value={f.avatarUrl} onChange={(v) => set("avatarUrl", v)} aspect="square" maxDim={600} />
              </div>
              <div className="space-y-1.5">
                <span className="text-sm text-white/70">{t("design.cover")}</span>
                <SingleImageField value={f.coverUrl} onChange={(v) => set("coverUrl", v)} aspect="wide" maxDim={2000} />
              </div>
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
          <ScaledPreview device={device}>
            <PreviewPage f={f} slug={savedSlug} design={design} socials={socials} offers={sampleOffers} />
          </ScaledPreview>
        </aside>
      </div>
    </form>
  );
}

// ==================== 👁️ المعاينة ====================

/** يرسم المحتوى بعرض حقيقي (1200 أو 390) ثم يصغّره ليناسب العمود */
function ScaledPreview({ device, children }: { device: "desktop" | "mobile"; children: React.ReactNode }) {
  const width = device === "desktop" ? 1200 : 390;
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [innerH, setInnerH] = useState(900);

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const ro = new ResizeObserver(() => {
      // الهاتف: هامش للإطار، ولا نكبّر فوق الحجم الحقيقي
      const avail = device === "mobile" ? o.clientWidth - 48 : o.clientWidth;
      setScale(Math.min(device === "mobile" ? 0.92 : 1, avail / width));
      setInnerH(i.offsetHeight);
    });
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width, device]);

  // المحتوى بعرضه الحقيقي ثم يُصغَّر؛ الحاوية بارتفاع المحتوى بعد التصغير (transform لا يغيّر التخطيط)
  const content = (
    <div className="relative overflow-hidden" style={{ width: width * scale, height: innerH * scale }}>
      <div ref={inner} className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ width, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );

  if (device === "mobile") {
    const screenH = 760 * scale;
    return (
      <div ref={outer} className="flex justify-center rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_70%)] py-6">
        {/* 📱 إطار هاتف */}
        <div className="relative rounded-[2.6rem] border-[10px] border-[#1d1d20] bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          {/* الحافة العلوية مع الكاميرا — فوق الشاشة لا فوق المحتوى */}
          <div className="flex h-7 items-center justify-center rounded-t-[1.9rem] bg-black">
            <span className="h-[18px] w-[86px] rounded-full bg-[#1d1d20]" />
          </div>
          <div className="overflow-y-auto overflow-x-hidden rounded-b-[1.9rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ height: screenH }} dir="ltr">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
      </div>
      <div ref={outer} className="max-h-[640px] overflow-y-auto overflow-x-hidden" dir="ltr">
        {content}
      </div>
    </div>
  );
}

function PreviewPage({
  f,
  slug,
  design,
  socials,
  offers,
}: {
  f: { title: string; tagline: string; bio: string; avatarUrl: string; coverUrl: string; language: string; theme: string; accentColor: string; showDisclosure: boolean; disclosure: string };
  slug: string;
  design: PageDesign;
  socials: Record<string, string>;
  offers: SampleOffer[];
}) {
  const lang = f.language;
  // نفس مكوّن الصفحة العامة تماماً — ما تراه هنا هو ما يراه الزوار
  return (
    <div data-lp dir={pageDir(lang)} lang={lang} style={themeStyle(f.theme, f.accentColor, design)} className="min-h-[900px]">
      <LandingFonts />
      <Storefront
        page={{
          slug,
          title: f.title || "—",
          tagline: f.tagline || null,
          bio: f.bio || null,
          avatarUrl: f.avatarUrl || null,
          coverUrl: f.coverUrl || null,
          language: lang,
        }}
        offers={offers}
        socials={socials}
        columns={design.columns}
      />
      {f.showDisclosure && (
        <div className="mx-auto mb-10 max-w-2xl rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-5 text-[13px] text-[var(--lp-muted)]">
          {f.disclosure || publicT(lang, "disclosureDefault")}
        </div>
      )}
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
