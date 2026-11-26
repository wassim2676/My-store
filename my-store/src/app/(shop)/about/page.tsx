/* eslint-disable @next/next/no-img-element -- شعارات SVG صغيرة داخل المعاينة */
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, BadgeCheck, Check, Gauge, Gem, Languages, Lock, MousePointerClick, ShieldCheck, Sparkles } from "lucide-react";
import { contentMetadata, PageFrame } from "@/components/site/StaticPage";
import { CtaBand, Glow, SectionTitle, StatBand, StoreWall } from "@/components/site/company";
import { JsonLd } from "@/components/blog/ArticleCard";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

export const generateMetadata = () => contentMetadata("about");

type Item = { h: string; p: string };
const PRINCIPLE_ICONS = [ShieldCheck, BadgeCheck, Gauge, Gem, Languages, Lock];

// ==================== 🏛️ صفحة من نحن ====================
export default async function AboutPage() {
  const [t, locale] = await Promise.all([getTranslations("pages.about"), getLocale()]);
  // الحرف الأول الكبير يكسر اتصال الحروف العربية
  const dropCap = locale !== "ar";
  const stats = t.raw("stats") as { v: string; l: string }[];
  const story = t.raw("story.p") as string[];
  const principles = t.raw("principles.items") as Item[];
  const care = t.raw("care.items") as string[];

  return (
    <PageFrame>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "AboutPage", name: t("title"), url: `${SITE_URL}/about`, about: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, email: CONTACT_EMAIL } }} />

      {/* ==================== 🎯 البطل ==================== */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <Glow />
        <div className="relative mx-auto grid max-w-[1280px] items-center gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-8 lg:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-amber-300/90">
              <span className="h-px w-8 bg-amber-300/60" /> {t("hero.eyebrow")}
            </p>
            <h1 className="mt-6 font-serif text-[40px] font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-[68px]">{t("hero.title")}</h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/60 sm:text-xl">{t("hero.text")}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-semibold text-black shadow-[0_10px_30px_-10px_rgba(245,184,0,0.6)] transition hover:bg-amber-300">
                {t("hero.primary")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
              <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/[0.04]">
                {t("hero.secondary")}
              </Link>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* ==================== 🔢 الأرقام ==================== */}
      <section className="mx-auto -mt-px max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        <StatBand stats={stats} />
      </section>

      {/* ==================== 📖 القصة ==================== */}
      <section className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 lg:px-8 lg:py-24">
        <SectionTitle eyebrow={t("story.eyebrow")} title={t("story.title")} />
        <div className="space-y-6 text-lg leading-[1.8] text-white/65">
          {story.map((p, i) => (
            <p key={i} className={i === 0 && !dropCap ? "text-xl text-white/85" : i === 0 ? "text-xl text-white/85 first-letter:float-start first-letter:me-3 first-letter:font-serif first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.9] first-letter:text-amber-300" : ""}>{p}</p>
          ))}
        </div>
      </section>

      {/* ==================== 🧭 المبادئ ==================== */}
      <section className="relative border-y border-white/[0.06] bg-white/[0.012] py-20 lg:py-28">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow={t("principles.eyebrow")} title={t("principles.title")} center />
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((p, i) => {
              const Icon = PRINCIPLE_ICONS[i % PRINCIPLE_ICONS.length];
              return (
                <div key={i} className="group relative bg-[#090B10] p-8 transition duration-300 hover:bg-[#0D1016] sm:p-10">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300/25 to-amber-500/5 text-amber-300 ring-1 ring-amber-300/20 transition group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 text-lg font-semibold text-white">{p.h}</h3>
                  <p className="mt-2.5 leading-relaxed text-white/55">{p.p}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== 🛠️ ما نتكفّل به ==================== */}
      <section className="mx-auto grid max-w-[1280px] items-start gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-28">
        <SectionTitle eyebrow={t("care.eyebrow")} title={t("care.title")} />
        <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {care.map((c, i) => (
            <li key={i} className="flex items-start gap-3 border-b border-white/[0.06] py-4 text-[15px] text-white/75">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300"><Check className="h-3 w-3" strokeWidth={3} /></span>
              {c}
            </li>
          ))}
        </ul>
      </section>

      {/* ==================== 🏬 المتاجر ==================== */}
      <section className="mx-auto max-w-[1280px] px-4 pb-24 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle eyebrow={t("stores.eyebrow")} title={t("stores.title")} />
          <Link href="/stores" className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 hover:text-amber-200">
            {t("stores.link")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
        <div className="mt-10"><StoreWall /></div>
      </section>

      <CtaBand title={t("cta.title")} text={t("cta.text")} primary={t("cta.button")} secondary={t("cta.secondary")} secondaryHref="/contact" />
    </PageFrame>
  );
}

/** معاينة مركّبة: صفحة مسوّق + بطاقات عائمة (تصميم بحت بدون صور) */
function HeroVisual() {
  const picks = [
    { slug: "amazon", price: "$249", name: "Noise-cancelling headphones" },
    { slug: "target", price: "$59", name: "Linen throw blanket" },
    { slug: "best-buy", price: "$899", name: "14\" ultralight laptop" },
    { slug: "sephora", price: "$38", name: "Hydrating serum" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-[520px]" aria-hidden dir="ltr">
      <div className="absolute -inset-10 rounded-full bg-amber-500/[0.08] blur-3xl" />
      <div className="relative rotate-[-1.5deg] rounded-[2rem] border border-white/10 bg-[#0D1016] p-3 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)]">
        <div className="overflow-hidden rounded-[1.5rem] bg-[#0B0E14]">
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 font-serif text-sm font-bold text-black">S</span>
            <div>
              <p className="font-serif text-sm font-semibold text-white">Sarah&apos;s Home Finds</p>
              <p className="text-[10px] text-white/45">primeshelf.store/sarah</p>
            </div>
            <span className="ms-auto rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold text-black">Follow</span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            {picks.map((p) => (
              <div key={p.slug} className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121621]">
                <div className="flex h-24 items-center justify-center bg-gradient-to-br from-white to-neutral-200">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-neutral-300 to-neutral-100 shadow-inner" />
                </div>
                <div className="p-2.5">
                  <p className="truncate text-[10px] font-semibold text-white/85">{p.name}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{p.price}</span>
                    <span className="flex h-5 items-center rounded-full bg-white px-1.5"><img src={`/brands/${p.slug}.svg`} alt="" className="h-2.5 w-auto" /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* بطاقات عائمة */}
      <div className="absolute -start-12 bottom-16 hidden rotate-[-4deg] rounded-2xl border border-white/10 bg-[#11141B]/90 p-4 shadow-2xl backdrop-blur sm:block">
        <p className="flex items-center gap-1.5 text-[11px] text-white/50"><MousePointerClick className="h-3.5 w-3.5 text-amber-300" /> Clicks this week</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-white">1,284</p>
        <div className="mt-2 flex h-7 items-end gap-0.5">
          {[30, 45, 38, 60, 52, 72, 90].map((h, i) => <span key={i} className="w-2.5 rounded-t-sm bg-amber-400" style={{ height: `${h}%`, opacity: 0.45 + i * 0.08 }} />)}
        </div>
      </div>
      <div className="absolute -end-8 -top-5 hidden rotate-[3deg] rounded-2xl border border-white/10 bg-[#11141B]/90 px-4 py-3 shadow-2xl backdrop-blur sm:block">
        <p className="flex items-center gap-2 text-xs font-semibold text-white"><ShieldCheck className="h-4 w-4 text-emerald-400" /> 100% of commissions yours</p>
      </div>
      <div className="absolute -bottom-5 end-12 hidden rounded-full border border-white/10 bg-[#11141B]/95 px-4 py-2 shadow-2xl sm:flex sm:items-center sm:gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
        <span className="text-[11px] font-medium text-white/80">Disclosure included</span>
      </div>
    </div>
  );
}
