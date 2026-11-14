"use client";
/* eslint-disable @next/next/no-img-element -- معاينة صور خارجية يضيفها المسوّق */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft, Check, Link2, Loader2, Plus, Save, Star, Trash2, X, Wand2,
} from "lucide-react";
import Link from "next/link";
import BrandLogo from "@/components/shop/BrandLogo";
import ClientFonts from "@/components/landing/ClientFonts";
import { ImageDropzone, SingleImageField } from "./ImageUpload";
import OfferCard from "@/components/landing/OfferCard";
import { CURRENCIES, OFFER_BADGES, parseDesign, themeStyle, toSlug, pageDir, type PageDesign } from "@/lib/landing";
import type { SerializedOffer } from "@/lib/marketer";

export interface BrandOption {
  id: string;
  name: string;
  logoSvg: string | null;
  logoUrl: string | null;
  accentColor: string;
}

type Spec = { label: string; value: string };

const OTHER = "__other__";

// خريطة لاكتشاف المتجر تلقائياً من رابط الأفلييت
const HOST_HINTS: [RegExp, string][] = [
  [/(^|\.)amazon\.|(^|\.)amzn\.(to|eu)$/i, "amazon"],
  [/(^|\.)walmart\./i, "walmart"],
  [/(^|\.)target\.com$|(^|\.)goto\.target\.com$/i, "target"],
  [/(^|\.)ebay\./i, "ebay"],
  [/(^|\.)bestbuy\./i, "best buy"],
  [/(^|\.)aliexpress\./i, "aliexpress"],
  [/(^|\.)etsy\./i, "etsy"],
  [/(^|\.)homedepot\./i, "home depot"],
  [/(^|\.)temu\./i, "temu"],
  [/(^|\.)sephora\./i, "sephora"],
];

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50";

export default function OfferForm({
  brands,
  offer,
  page,
}: {
  brands: BrandOption[];
  offer?: SerializedOffer;
  page: { slug: string; theme: string; accentColor: string; language: string; design?: Partial<PageDesign> | null };
}) {
  const t = useTranslations("dash");
  const router = useRouter();
  const isEdit = !!offer;

  const pageDesign = parseDesign(page.design);
  const [f, setF] = useState({
    title: offer?.title ?? "",
    slug: offer?.slug ?? "",
    subtitle: offer?.subtitle ?? "",
    brandId: offer?.brandId ?? (offer?.storeName ? OTHER : ""),
    storeName: offer?.storeName ?? "",
    storeLogo: offer?.storeLogo ?? "",
    affiliateUrl: offer?.affiliateUrl ?? "",
    buttonLabel: offer?.buttonLabel ?? "",
    couponCode: offer?.couponCode ?? "",
    price: offer?.price != null ? String(offer.price) : "",
    compareAt: offer?.compareAt != null ? String(offer.compareAt) : "",
    currency: offer?.currency ?? "USD",
    dealEndsAt: offer?.dealEndsAt ? offer.dealEndsAt.slice(0, 10) : "",
    shortReview: offer?.shortReview ?? "",
    review: offer?.review ?? "",
    verdict: offer?.verdict ?? "",
    rating: offer?.rating ?? 0,
    category: offer?.category ?? "",
    badge: offer?.badge ?? "",
    videoUrl: offer?.videoUrl ?? "",
    isFeatured: offer?.isFeatured ?? false,
    status: offer?.status ?? "PUBLISHED",
  });
  const [images, setImages] = useState<string[]>(offer?.images ?? []);
  const [pros, setPros] = useState<string[]>(offer?.pros ?? []);
  const [cons, setCons] = useState<string[]>(offer?.cons ?? []);
  const [highlights, setHighlights] = useState<string[]>(offer?.highlights ?? []);
  const [specs, setSpecs] = useState<Spec[]>(offer?.specs ?? []);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof typeof f>(key: K, value: (typeof f)[K]) => setF((s) => ({ ...s, [key]: value }));

  const onTitle = (v: string) => setF((s) => ({ ...s, title: v, slug: slugTouched ? s.slug : toSlug(v, 110) }));

  const onAffiliateUrl = (v: string) => {
    set("affiliateUrl", v);
    if (f.brandId) return;
    try {
      const host = new URL(v).hostname;
      const hint = HOST_HINTS.find(([re]) => re.test(host))?.[1];
      const match = hint && brands.find((b) => b.name.toLowerCase() === hint);
      if (match) set("brandId", match.id);
    } catch {
      /* رابط غير مكتمل بعد */
    }
  };

  const selectedBrand = brands.find((b) => b.id === f.brandId) ?? null;

  const submit = async (statusOverride?: "DRAFT" | "PUBLISHED") => {
    setSaving(true);
    setError("");
    setSaved(false);
    const status = statusOverride ?? f.status;
    const body = {
      ...f,
      status,
      brandId: f.brandId && f.brandId !== OTHER ? f.brandId : null,
      storeName: f.brandId === OTHER ? f.storeName : null,
      storeLogo: f.brandId === OTHER ? f.storeLogo || null : null,
      rating: f.rating > 0 ? f.rating : null,
      price: f.price || null,
      compareAt: f.compareAt || null,
      dealEndsAt: f.dealEndsAt || null,
      images,
      pros,
      cons,
      highlights,
      specs,
    };
    try {
      const res = await fetch(isEdit ? `/api/marketer/offers/${offer!.id}` : "/api/marketer/offers", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("common.error"));
      if (isEdit) {
        setF((s) => ({ ...s, status, slug: data.data.slug }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
        router.refresh();
      } else {
        router.push(`/dashboard/offers?created=${data.data.id}`);
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const preview = {
    id: "preview",
    slug: f.slug || "preview",
    title: f.title || t("form.previewTitle"),
    shortReview: f.shortReview || t("form.previewReview"),
    images,
    price: f.price ? Number(f.price) : null,
    compareAt: f.compareAt ? Number(f.compareAt) : null,
    currency: f.currency,
    rating: f.rating || null,
    category: f.category || null,
    badge: f.badge || null,
    isFeatured: f.isFeatured,
    storeName: f.brandId === OTHER ? f.storeName || "Store" : null,
    storeLogo: f.brandId === OTHER ? f.storeLogo || null : null,
    brand: selectedBrand,
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="mx-auto max-w-6xl"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/dashboard/offers" className="mb-2 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("nav.offers")}
          </Link>
          <h1 className="font-serif text-3xl font-semibold">{isEdit ? t("form.editTitle") : t("form.newTitle")}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <a href={`/${page.slug}/${f.slug}`} target="_blank" rel="noopener" className="rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5">
              {t("offers.actions.view")}
            </a>
          )}
          {!isEdit && (
            <button type="button" onClick={() => submit("DRAFT")} disabled={saving} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-50 cursor-pointer">
              {t("form.saveDraft")}
            </button>
          )}
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50 cursor-pointer">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? t("common.saved") : isEdit ? t("common.save") : t("form.publish")}
          </button>
        </div>
      </div>

      {error && <p className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {/* 🔗 المتجر والرابط */}
          <Section title={t("form.sec.store")} hint={t("form.sec.storeHint")}>
            <Label text={t("form.affiliateUrl")} required>
              <div className="relative">
                <Link2 className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input dir="ltr" required type="url" value={f.affiliateUrl} onChange={(e) => onAffiliateUrl(e.target.value)} placeholder="https://www.amazon.com/dp/…?tag=yourtag-20" className={field + " ps-9"} />
              </div>
            </Label>

            <div>
              <p className="mb-2 text-sm text-white/70">{t("form.store")} <span className="text-amber-400">*</span></p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {brands.map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => set("brandId", b.id)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition cursor-pointer ${
                      f.brandId === b.id ? "border-amber-400 bg-amber-400/10" : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    {/* إطار ثابت للشعار: الشعارات العريضة (Sephora/AliExpress) تُصغَّر داخله بدل أن تخرج منه */}
                    <span className="flex h-8 w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-white px-1.5">
                      <BrandLogo brand={b} size={18} className="max-w-full! [&_svg]:max-w-full" />
                    </span>
                    <span className="min-w-0 truncate">{b.name}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => set("brandId", OTHER)}
                  className={`flex items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-2.5 text-sm transition cursor-pointer ${
                    f.brandId === OTHER ? "border-amber-400 bg-amber-400/10" : "border-white/15 text-white/60 hover:border-white/30"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  {t("form.otherStore")}
                </button>
              </div>
              {f.brandId === OTHER && (
                <div className="mt-3 space-y-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <input required value={f.storeName} onChange={(e) => set("storeName", e.target.value)} maxLength={80} placeholder={t("form.storeNamePh")} className={field} />
                  <div>
                    <p className="mb-2 text-sm text-white/70">{t("media.storeLogo")}</p>
                    <SingleImageField value={f.storeLogo} onChange={(v) => set("storeLogo", v)} aspect="logo" maxDim={600} accept="image/svg+xml,image/png,image/webp,.svg" checker />
                    <p className="mt-1.5 text-xs text-white/40">{t("media.storeLogoHint")}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Label text={t("form.buttonLabel")} hint={t("form.buttonLabelHint")}>
                <input value={f.buttonLabel} onChange={(e) => set("buttonLabel", e.target.value)} maxLength={60} placeholder={selectedBrand ? `Buy on ${selectedBrand.name}` : ""} className={field} />
              </Label>
              <Label text={t("form.coupon")}>
                <input dir="ltr" value={f.couponCode} onChange={(e) => set("couponCode", e.target.value.toUpperCase())} maxLength={60} placeholder="SAVE20" className={field + " font-mono"} />
              </Label>
            </div>
          </Section>

          {/* 📝 الأساسيات */}
          <Section title={t("form.sec.basics")}>
            <Label text={t("form.title")} required>
              <input required value={f.title} onChange={(e) => onTitle(e.target.value)} maxLength={200} placeholder={t("form.titlePh")} className={field} />
            </Label>
            <Label text={t("form.subtitle")}>
              <input value={f.subtitle} onChange={(e) => set("subtitle", e.target.value)} maxLength={200} placeholder={t("form.subtitlePh")} className={field} />
            </Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Label text={t("form.slug")} hint={`/${page.slug}/${f.slug || "…"}`}>
                <input
                  dir="ltr"
                  value={f.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  }}
                  maxLength={120}
                  className={field}
                />
              </Label>
              <Label text={t("form.category")}>
                <input value={f.category} onChange={(e) => set("category", e.target.value)} maxLength={80} placeholder={t("form.categoryPh")} className={field} />
              </Label>
            </div>
            <Label text={t("form.badge")}>
              <div className="flex flex-wrap gap-2">
                {OFFER_BADGES.map((b) => (
                  <button type="button" key={b} onClick={() => set("badge", f.badge === b ? "" : b)} className={`rounded-full border px-3 py-1 text-xs transition cursor-pointer ${f.badge === b ? "border-amber-400 bg-amber-400 text-black" : "border-white/10 text-white/60 hover:border-white/25"}`}>
                    {b}
                  </button>
                ))}
                <input value={OFFER_BADGES.includes(f.badge as (typeof OFFER_BADGES)[number]) ? "" : f.badge} onChange={(e) => set("badge", e.target.value)} maxLength={40} placeholder={t("form.customBadge")} className="rounded-full border border-white/10 bg-transparent px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400/50" />
              </div>
            </Label>
          </Section>

          {/* 🖼️ الصور والفيديو */}
          <Section title={t("form.sec.media")} hint={t("form.sec.mediaHint")}>
            <ImagesEditor images={images} onChange={setImages} />
            <Label text={t("form.video")} hint={t("form.videoHint")}>
              <input dir="ltr" type="url" value={f.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://youtube.com/watch?v=…" className={field} />
            </Label>
          </Section>

          {/* 💰 السعر */}
          <Section title={t("form.sec.pricing")} hint={t("form.sec.pricingHint")}>
            <div className="grid gap-4 sm:grid-cols-4">
              <Label text={t("form.price")}>
                <input type="number" step="0.01" min="0" value={f.price} onChange={(e) => set("price", e.target.value)} className={field} />
              </Label>
              <Label text={t("form.compareAt")}>
                <input type="number" step="0.01" min="0" value={f.compareAt} onChange={(e) => set("compareAt", e.target.value)} className={field} />
              </Label>
              <Label text={t("form.currency")}>
                <select value={f.currency} onChange={(e) => set("currency", e.target.value)} className={field + " bg-[#0E1118]"}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Label>
              <Label text={t("form.dealEnds")}>
                <input type="date" value={f.dealEndsAt} onChange={(e) => set("dealEndsAt", e.target.value)} className={field + " [color-scheme:dark]"} />
              </Label>
            </div>
          </Section>

          {/* ✍️ المراجعة */}
          <Section title={t("form.sec.review")}>
            <Label text={t("form.shortReview")} required hint={`${f.shortReview.length}/700 · ${t("form.shortReviewHint")}`}>
              <textarea required rows={3} maxLength={700} value={f.shortReview} onChange={(e) => set("shortReview", e.target.value)} className={field + " resize-y"} />
            </Label>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-white/70">{t("form.rating")}</span>
                <span className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="w-12 font-semibold tabular-nums">{f.rating > 0 ? f.rating.toFixed(1) : "—"}</span>
                  {f.rating > 0 && (
                    <button type="button" onClick={() => set("rating", 0)} className="text-xs text-white/40 hover:text-white cursor-pointer">{t("form.noRating")}</button>
                  )}
                </span>
              </div>
              <input type="range" min={0} max={5} step={0.1} value={f.rating} onChange={(e) => set("rating", Number(e.target.value))} className="w-full accent-amber-400" dir="ltr" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ListEditor title={t("form.pros")} items={pros} onChange={setPros} placeholder={t("form.prosPh")} tone="good" />
              <ListEditor title={t("form.cons")} items={cons} onChange={setCons} placeholder={t("form.consPh")} tone="bad" />
            </div>
            <ListEditor title={t("form.highlights")} items={highlights} onChange={setHighlights} placeholder={t("form.highlightsPh")} />

            <Label text={t("form.fullReview")} hint={t("form.fullReviewHint")}>
              <textarea rows={9} maxLength={20000} value={f.review} onChange={(e) => set("review", e.target.value)} className={field + " resize-y leading-relaxed"} />
            </Label>
            <Label text={t("form.verdict")} hint={`${f.verdict.length}/400`}>
              <textarea rows={2} maxLength={400} value={f.verdict} onChange={(e) => set("verdict", e.target.value)} placeholder={t("form.verdictPh")} className={field + " resize-y"} />
            </Label>
          </Section>

          {/* 📋 المواصفات */}
          <Section title={t("form.sec.specs")}>
            <SpecsEditor specs={specs} onChange={setSpecs} />
          </Section>
        </div>

        {/* 👁️ المعاينة + النشر */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
            <h3 className="text-sm font-semibold">{t("form.sec.publish")}</h3>
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/[0.07] p-1">
              {(["PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((s) => (
                <button type="button" key={s} onClick={() => set("status", s)} className={`rounded-lg py-1.5 text-xs transition cursor-pointer ${f.status === s ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}>
                  {t(`offers.status.${s}`)}
                </button>
              ))}
            </div>
            <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              <span>
                <span className="block">{t("form.featured")}</span>
                <span className="text-xs text-white/40">{t("form.featuredHint")}</span>
              </span>
              <Toggle checked={f.isFeatured} onChange={(v) => set("isFeatured", v)} />
            </label>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <h3 className="mb-3 text-sm font-semibold">{t("form.preview")}</h3>
            <div data-lp style={themeStyle(page.theme, page.accentColor, pageDesign)} dir={pageDir(page.language)} className={`rounded-2xl p-4 pointer-events-none`}>
              <ClientFonts fonts={[pageDesign.font, pageDesign.bodyFont]} />
              <OfferCard offer={preview} pageSlug={page.slug} lang={page.language} />
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

// ==================== 🧩 مكونات مساعدة ====================
function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-xs text-white/45">{hint}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Label({ text, hint, required, children }: { text: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-white/70">
        {text} {required && <span className="text-amber-400">*</span>}
      </span>
      {children}
      {hint && <span className="block text-xs text-white/35">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition cursor-pointer ${checked ? "bg-amber-400" : "bg-white/15"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "start-[22px]" : "start-0.5"}`} />
    </button>
  );
}

function ListEditor({
  title,
  items,
  onChange,
  placeholder,
  tone,
}: {
  title: string;
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  tone?: "good" | "bad";
}) {
  const t = useTranslations("dash");
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || items.length >= 12) return;
    onChange([...items, v]);
    setDraft("");
  };
  const dot = tone === "good" ? "bg-emerald-400" : tone === "bad" ? "bg-rose-400" : "bg-amber-400";
  return (
    <div className="rounded-xl border border-white/[0.07] p-4">
      <p className="mb-3 text-sm text-white/70">{title}</p>
      <ul className="mb-3 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="group flex items-start gap-2.5 rounded-lg bg-white/[0.03] px-3 py-2 text-sm">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span className="flex-1">{item}</span>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-white/30 hover:text-rose-300 cursor-pointer" aria-label="remove">
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          maxLength={200}
          placeholder={placeholder}
          className={field + " py-2"}
        />
        <button type="button" onClick={add} className="rounded-xl border border-white/10 px-3 text-white/70 hover:bg-white/5 cursor-pointer" aria-label={t("common.add")}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ImagesEditor({ images, onChange }: { images: string[]; onChange: (v: string[]) => void }) {
  const t = useTranslations("dash");
  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((src, i) => (
            <div key={src + i} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white">
              <img src={src} alt="" className="h-full w-full object-contain p-2" />
              {i === 0 && <span className="absolute start-1.5 top-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-white">{t("form.cover")}</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-black/70 p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                {i > 0 && (
                  <button type="button" onClick={() => onChange([src, ...images.filter((_, j) => j !== i)])} className="rounded bg-white/90 p-1 text-black cursor-pointer" title={t("form.makeCover")}>
                    <Wand2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="rounded bg-rose-500 p-1 text-white cursor-pointer" aria-label="remove">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ImageDropzone remaining={10 - images.length} onAdd={(urls) => urls.length && onChange([...images, ...urls].slice(0, 10))} />
    </div>
  );
}

function SpecsEditor({ specs, onChange }: { specs: Spec[]; onChange: (v: Spec[]) => void }) {
  const t = useTranslations("dash");
  const update = (i: number, key: keyof Spec, value: string) => onChange(specs.map((s, j) => (j === i ? { ...s, [key]: value } : s)));
  return (
    <div className="space-y-2">
      {specs.map((s, i) => (
        <div key={i} className="flex gap-2">
          <input value={s.label} onChange={(e) => update(i, "label", e.target.value)} maxLength={60} placeholder={t("form.specLabel")} className={field + " w-2/5"} />
          <input value={s.value} onChange={(e) => update(i, "value", e.target.value)} maxLength={200} placeholder={t("form.specValue")} className={field} />
          <button type="button" onClick={() => onChange(specs.filter((_, j) => j !== i))} className="rounded-xl px-2 text-white/35 hover:text-rose-300 cursor-pointer" aria-label="remove">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      {specs.length < 30 && (
        <button type="button" onClick={() => onChange([...specs, { label: "", value: "" }])} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-white/15 px-4 py-2 text-sm text-white/60 hover:border-white/30 hover:text-white cursor-pointer">
          <Plus className="h-4 w-4" />
          {t("form.addSpec")}
        </button>
      )}
    </div>
  );
}
