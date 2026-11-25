import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight, BadgeCheck, BarChart3, Check, ChevronDown, Gem, Languages, Minus, Palette, PenLine, Plus, Search, ShieldCheck, Tag, X,
} from "lucide-react";
import SiteNavbar from "@/components/site/SiteNavbar";
import SiteFooter from "@/components/site/SiteFooter";
import ClaimLink from "@/components/site/ClaimLink";
import TourCarousel from "@/components/site/TourCarousel";
import HeroVideo from "@/components/site/HeroVideo";
import BrandCycleButton from "@/components/site/BrandCycleButton";
import BrandLogo from "@/components/shop/BrandLogo";
import { WHITE_LOGO } from "@/components/shop/logo-classes";
import { getActiveBrands } from "@/lib/brands";
import { JsonLd } from "@/components/blog/ArticleCard";
import { SITE_NAME, SITE_URL, CONTACT_EMAIL } from "@/lib/site";


// ✅ توثيق دومين المنصة نفسه لدى Google Search Console وMeta Business (رموز من متغيرات البيئة).
// في الصفحة الرئيسية فقط — لا في الـ layout — حتى لا تُورَّث لصفحات المسوّقين ودوميناتهم الخاصة.
export function generateMetadata(): Metadata {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const meta = process.env.FACEBOOK_DOMAIN_VERIFICATION?.trim();
  const base: Metadata = { alternates: { canonical: "/" } };
  if (!google && !meta) return base;
  return { ...base, verification: { ...(google ? { google } : {}), ...(meta ? { other: { "facebook-domain-verification": meta } } : {}) } };
}

// ==================== 🏠 الصفحة الرئيسية للمنصة (للمسوّقين بالعمولة) ====================
export default async function Home() {
  const t = await getTranslations("platform");
  const tp = await getTranslations("pages.faq");
  const brands = await getActiveBrands().catch(() => []);

  const features = [
    { icon: Gem, key: "luxury" },
    { icon: BadgeCheck, key: "stores" },
    { icon: PenLine, key: "reviews" },
    { icon: BarChart3, key: "analytics" },
    { icon: Search, key: "seo" },
    { icon: ShieldCheck, key: "disclosure" },
    { icon: Languages, key: "languages" },
    { icon: Palette, key: "themes" },
  ] as const;

  const mock = [
    { store: "Amazon", color: "#FF9900", title: t("mock.p1"), price: "$249", old: "$329", badge: "Best Pick", rating: 5 },
    { store: "Walmart", color: "#0071CE", title: t("mock.p2"), price: "$89", old: null, badge: null, rating: 4 },
    { store: "Target", color: "#CC0000", title: t("mock.p3"), price: "$59", old: "$79", badge: "Trending", rating: 5 },
    { store: "Best Buy", color: "#0046BE", title: t("mock.p4"), price: "$45", old: null, badge: null, rating: 4 },
  ];
  // متاجر المنصة الفعلية (من لوحة الأدمن) لعروض الصفحة الرئيسية، مع بديل ثابت إن تعذّر الاتصال
  const tourBrands = (brands.length ? brands : mock.map((m) => ({ name: m.store, accentColor: m.color, logoSvg: null, logoUrl: null }))).map((b) => ({
    name: b.name,
    logoSvg: b.logoSvg,
    logoUrl: b.logoUrl,
    accentColor: b.accentColor,
  }));
  const trust = t.raw("home.trust") as string[];
  const compareRows = t.raw("home.compare.rows") as string[];
  // صفحة الروابط العادية: ✗ لا يوجد، ~ جزئي
  const themHas: ("no" | "partial")[] = ["no", "no", "no", "partial", "no", "no"];
  const faq = (tp.raw("sections") as { h: string; p: string }[]).slice(0, 4);

  return (
    <div data-ui="dark" className="min-h-screen overflow-x-hidden bg-[#07090D] text-white antialiased">
      <SiteNavbar overlay />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/brand/primeshelf-logo-email.png`,
            email: CONTACT_EMAIL,
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            publisher: { "@type": "Organization", name: SITE_NAME },
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: SITE_NAME,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: SITE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          },
        ]}
      />

      {/* عناصر الشبكات تتقلّص لعرض الشاشة (الشريط الأفقي للبطاقات كان يمطّ العمود خارج الهاتف) */}
      <main className="[&_.grid>*]:min-w-0">
        {/* 🌟 Hero: فيديو بعرض الشاشة (مثل Shopify) وفوقه الرسالة والإجراء */}
        <section id="hero" className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
          <HeroVideo
            clips={[
              { src: "/hero/hero-8869.mp4", poster: "/hero/hero-8869.jpg" },
              { src: "/hero/hero-50422.mp4", poster: "/hero/hero-50422.jpg" },
              { src: "/hero/hero-9060.mp4", poster: "/hero/hero-9060.jpg" },
            ]}
          />
          <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-24 pt-32 sm:px-6 lg:px-8">
            <div className="max-w-2xl text-start">
              <h1 className="font-serif text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-7xl">
                {t("hero.title")}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{t("hero.subtitle")}</p>
              <div className="mt-9">
                <ClaimLink cta={t("hero.cta")} placeholder={t("hero.placeholder")} />
              </div>
              <ul className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/70">
                {trust.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-amber-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="#designs" className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white">
                {t("home.designs.cta")}
                <ChevronDown className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* 🎨 تصاميمنا: عنوان ووصف متقابلان + 4 بطاقات ممتدة تعرض ثيمات الصفحات */}
        <section id="designs" className="relative scroll-mt-20 px-4 pb-24 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <SectionHeader title={t("home.designs.title")} desc={t("home.designs.subtitle")} />
            <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {DESIGNS.map((d, i) => (
                <DesignCard key={d.key} theme={d} name={t(`home.designs.cards.${i}.name`)} desc={t(`home.designs.cards.${i}.desc`)} title={t("home.mockPage.title")} products={mock} />
              ))}
            </div>
          </div>
        </section>

        {/* 🏬 المتاجر المدعومة — شريط شعارات متحرك */}
        {brands.length > 0 && (
          <section className="relative border-y border-white/[0.06] bg-white/[0.012] py-12">
            <div className="mx-auto mb-8 flex max-w-7xl items-center justify-center gap-4 px-4">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/20 sm:w-20" />
              <p className="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-white/45">{t("stores.title")}</p>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/20 sm:w-20" />
            </div>
            <div dir="ltr" className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <div className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none">
                {[0, 1].map((copy) => (
                  <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
                    {(brands.length < 6 ? [...brands, ...brands] : brands).map((b, i) => (
                      <li key={`${b.id}-${i}`} className="flex h-12 items-center px-8 sm:px-11" title={b.name}>
                        <span className="text-white/55 transition-colors duration-300 hover:text-white [&_img]:opacity-55 [&_img]:transition-opacity hover:[&_img]:opacity-100">
                          <BrandLogo brand={b} size={26} fallback="name" className={WHITE_LOGO} squareScale={1.6} />
                        </span>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link href="/stores" className="inline-flex items-center gap-1.5 text-xs font-medium text-white/45 transition hover:text-amber-300">
                {t("stores.all")}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </section>
        )}

        {/* 🧭 جولة: الصفحة ← المراجعة ← الإحصائيات */}
        <section id="tour" className="mx-auto max-w-[1440px] scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
          <SectionHeader title={t("home.tour.title")} desc={t("home.tour.subtitle")} />

          <div className="mt-16 space-y-20 lg:space-y-28">
            <TourRow title={t("home.tour.t1.title")} desc={t("home.tour.t1.desc")} points={t.raw("home.tour.t1.points") as string[]}>
              <TourCarousel brands={tourBrands} prevLabel={t("home.tour.prev")} nextLabel={t("home.tour.next")} />
            </TourRow>

            <TourRow reverse title={t("home.tour.t2.title")} desc={t("home.tour.t2.desc")} points={t.raw("home.tour.t2.points") as string[]}>
              <div className="space-y-4 rounded-3xl border border-white/[0.08] bg-[#0B0E14] p-5">
                <div className="flex items-center gap-4">
                  <div className="aspect-square w-24 shrink-0 rounded-2xl bg-gradient-to-br from-white to-neutral-200" />
                  <div>
                    <p className="font-serif text-lg font-semibold">{t("mock.p1")}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm">
                      <span className="font-serif text-2xl font-semibold text-[#C8A24A]">4.8</span>
                      <span className="text-white/45">{t("home.tour.score")}</span>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-3">
                    <p className="mb-2 font-semibold text-emerald-400">{t("home.tour.pros")}</p>
                    <p className="flex items-center gap-1.5 text-white/70"><Check className="h-3 w-3 text-emerald-400" />{t("home.tour.pro1")}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-white/70"><Check className="h-3 w-3 text-emerald-400" />{t("home.tour.pro2")}</p>
                  </div>
                  <div className="rounded-2xl border border-rose-500/25 bg-rose-500/[0.05] p-3">
                    <p className="mb-2 font-semibold text-rose-400">{t("home.tour.cons")}</p>
                    <p className="flex items-center gap-1.5 text-white/70"><Minus className="h-3 w-3 text-rose-400" />{t("home.tour.con1")}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-dashed border-amber-400/30 bg-amber-400/[0.05] px-3 py-2 text-xs">
                  <span className="flex items-center gap-1.5 text-amber-200"><Tag className="h-3.5 w-3.5" />SAVE20</span>
                  <span className="text-white/40">−20%</span>
                </div>
                <BrandCycleButton brands={tourBrands} buyTemplate={t.raw("home.tour.buyOn") as string} anyStore={t("home.tour.anyStore")} />
              </div>
            </TourRow>

            <TourRow title={t("home.tour.t3.title")} desc={t("home.tour.t3.desc")} points={t.raw("home.tour.t3.points") as string[]}>
              <div className="rounded-3xl border border-white/[0.08] bg-[#0B0E14] p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <p className="text-xs text-white/45">{t("home.tour.clicks")}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">1,284</p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <p className="text-xs text-white/45">{t("home.tour.ctr")}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">9.6%</p>
                  </div>
                </div>
                <div className="mt-4 flex h-32 items-end gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4" dir="ltr" aria-hidden>
                  {[22, 35, 28, 46, 38, 55, 49, 62, 58, 70, 64, 82, 76, 90].map((h, i) => (
                    <span key={i} className="flex-1 rounded-t-[4px] bg-[#5AA9E6]" style={{ height: `${h}%`, opacity: 0.45 + i * 0.04 }} />
                  ))}
                </div>
              </div>
            </TourRow>
          </div>
        </section>

        {/* ✨ المميزات: كتلة ذهبية قوية بثماني بطاقات */}
        <section id="features" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#FBDA74] via-[#F4BE3F] to-[#E8A11C] p-7 text-[#14110A] sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/30 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(20,17,10,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(20,17,10,0.05)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_80%_70%_at_70%_0%,black,transparent)]" />
            <div className="relative">
              <SectionHeader title={t("features.title")} desc={t("features.subtitle")} tone="dark" />
              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {features.map(({ icon: Icon, key }, i) => (
                  <div key={key} className="group relative rounded-2xl border border-black/[0.08] bg-white/40 p-6 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/60 hover:shadow-[0_20px_40px_-20px_rgba(20,17,10,0.45)]">
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14110A] text-amber-300 transition group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-xs font-semibold text-black/30">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="mt-6 text-[17px] font-semibold">{t(`features.${key}.title`)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-black/65">{t(`features.${key}.desc`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 🪜 كيف تعمل: عمود ثابت (العنوان + الإجراء) مقابل خط زمني بثلاث خطوات مع معاينة لكل خطوة */}
        <section id="how" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">{t("how.title")}</h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-white/55">{t("how.subtitle")}</p>
              <Link href="/register" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-amber-400 px-6 text-sm font-semibold text-black transition hover:bg-amber-300">
                {t("how.cta")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
            <ol className="relative space-y-5">
              <span className="pointer-events-none absolute bottom-10 start-[35px] top-10 hidden w-px bg-gradient-to-b from-amber-400/50 via-white/10 to-transparent sm:block" />
              {[1, 2, 3].map((n) => (
                <li key={n} className="relative grid gap-5 rounded-3xl border border-white/[0.07] bg-[#0B0E14] p-6 sm:grid-cols-[72px_minmax(0,1fr)] sm:p-7 md:grid-cols-[72px_minmax(0,1fr)_minmax(0,0.9fr)] md:items-center">
                  <span className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-amber-400/25 bg-[#07090D] font-serif text-3xl font-semibold text-amber-300">
                    {String(n).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold">{t(`how.s${n}.title`)}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-white/55">{t(`how.s${n}.desc`)}</p>
                  </div>
                  <StepVisual n={n} t={{ available: t("how.v1"), detected: t("how.v2"), clicks: t("how.v3") }} />
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ⚖️ مقارنة: صفحة روابط عادية مقابل واجهة Primeshelf */}
        <section id="compare" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <SectionHeader title={t("home.compare.title")} desc={t("home.compare.subtitle")} />
            <div className="mt-14 grid gap-5 lg:grid-cols-2">
              {/* صفحة الروابط العادية */}
              <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.015] p-7 sm:p-9">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/40">{t("home.compare.them")}</p>
                <div className="mt-6 space-y-2.5 rounded-2xl border border-white/[0.06] bg-black/30 p-5" aria-hidden>
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-white/10" />
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-10 rounded-full border border-white/[0.08] bg-white/[0.04]" />
                  ))}
                </div>
                <ul className="mt-7 space-y-3.5">
                  {compareRows.map((row, i) => (
                    <li key={row} className="flex items-center gap-3 text-white/45">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-white/35">
                        {themHas[i] === "partial" ? <Minus className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      </span>
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Primeshelf */}
              <div className="relative overflow-hidden rounded-[2rem] border border-amber-400/30 bg-gradient-to-b from-amber-400/[0.09] to-[#0B0E14] p-7 shadow-[0_30px_80px_-40px_rgba(232,161,28,0.45)] sm:p-9">
                <div className="pointer-events-none absolute -top-24 end-0 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
                <p className="relative text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">{t("home.compare.us")}</p>
                <div className="relative mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.08] bg-[#0B0E14] p-4" aria-hidden>
                  {mock.slice(0, 2).map((m) => (
                    <div key={m.store} className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#121621]">
                      <div className="m-1.5 aspect-[4/3] rounded-lg bg-gradient-to-br from-white to-neutral-200" />
                      <div className="space-y-1 px-3 pb-3 pt-1.5">
                        <p className="truncate text-xs font-semibold">{m.title}</p>
                        <p className="text-sm font-bold">{m.price}</p>
                        <span className="mt-1 flex h-7 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-black">{t("home.compare.buy", { store: m.store })}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <ul className="relative mt-7 space-y-3.5">
                  {compareRows.map((row) => (
                    <li key={row} className="flex items-center gap-3 text-white/85">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-black">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ❓ أسئلة: عنوان ووصف في عمود، والأسئلة في العمود المقابل */}
        <section id="faq" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">{t("home.faq.title")}</h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-white/55">{t("home.faq.subtitle")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/faq" className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium transition hover:bg-white/[0.06]">
                  {t("home.faq.more")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
                <Link href="/contact" className="inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-white/60 transition hover:text-white">
                  {t("home.faq.contact")}
                </Link>
              </div>
            </div>
            <div className="border-t border-white/[0.08]">
              {faq.map((s, i) => (
                <details key={i} className="group border-b border-white/[0.08] [&_summary::-webkit-details-marker]:hidden" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold text-white/90 transition-colors hover:text-white sm:text-xl">
                    {s.h}
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all group-open:rotate-45 group-open:border-amber-400/40 group-open:bg-amber-400 group-open:text-black">
                      <Plus className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="-mt-1 max-w-2xl pb-7 text-[15px] leading-relaxed text-white/60 sm:text-base">{s.p}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 🚀 دعوة أخيرة: لقطة سينمائية بعرض الإطار + رسالة وإجراء */}
        <section id="start" className="scroll-mt-20 px-4 pb-24 sm:px-6 lg:px-8">
          <div className="relative mx-auto min-h-[460px] max-w-[1440px] overflow-hidden rounded-[2.25rem] border border-white/[0.08]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero/hero-9060.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,13,0.96)_0%,rgba(7,9,13,0.85)_45%,rgba(7,9,13,0.35)_100%)] rtl:bg-[linear-gradient(270deg,rgba(7,9,13,0.96)_0%,rgba(7,9,13,0.85)_45%,rgba(7,9,13,0.35)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_100%,rgba(232,161,28,0.22),transparent_70%)]" />
            <div className="relative grid h-full items-center gap-10 p-8 sm:p-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:p-16">
              <div className="max-w-xl">
                <h2 className="font-serif text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">{t("cta.title")}</h2>
                <p className="mt-5 text-lg leading-relaxed text-white/70">{t("cta.subtitle")}</p>
                <div className="mt-8">
                  <ClaimLink cta={t("cta.button")} placeholder={t("hero.placeholder")} />
                </div>
                <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/65">
                  {trust.map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-amber-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hidden justify-self-end lg:block" aria-hidden>
                <div className="w-72 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-md">
                    <p className="text-xs text-white/55">{t("home.tour.clicks")}</p>
                    <p className="mt-1 text-3xl font-semibold tabular-nums">1,284</p>
                    <div className="mt-3 flex h-10 items-end gap-1" dir="ltr">
                      {[30, 42, 38, 55, 48, 66, 60, 78, 72, 90].map((h, i) => (
                        <span key={i} className="flex-1 rounded-t-[3px] bg-amber-400" style={{ height: `${h}%`, opacity: 0.4 + i * 0.06 }} />
                      ))}
                    </div>
                  </div>
                  <div className="ms-10 rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-md">
                    <p className="text-xs text-white/55">{t("home.tour.ctr")}</p>
                    <p className="mt-1 text-3xl font-semibold tabular-nums text-amber-300">9.6%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function TourRow({
  title,
  desc,
  points,
  reverse,
  children,
}: {
  title: string;
  desc: string;
  points: string[];
  reverse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={reverse ? "lg:order-2" : ""}>
        <h3 className="font-serif text-2xl font-semibold leading-tight sm:text-4xl">{title}</h3>
        <p className="mt-4 text-lg leading-relaxed text-white/55">{desc}</p>
        <ul className="mt-6 space-y-3">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-3 text-white/75">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                <Check className="h-3 w-3" />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className={`relative ${reverse ? "lg:order-1" : ""}`}>
        <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-amber-500/[0.06] blur-2xl" />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

// ==================== 🧩 عناصر أقسام الصفحة الرئيسية ====================

/** رأس قسم متماثل: العنوان في جهة، والوصف في الجهة المقابلة (يتكدّسان على الهاتف) */
function SectionHeader({ title, desc, tone = "light" }: { title: string; desc: string; tone?: "light" | "dark" }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-16">
      <h2 className={`font-serif text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl ${tone === "dark" ? "text-[#14110A]" : ""}`}>{title}</h2>
      <p className={`max-w-xl text-lg leading-relaxed lg:justify-self-end ${tone === "dark" ? "text-black/65" : "text-white/55"}`}>{desc}</p>
    </div>
  );
}

type DesignTheme = { key: string; bg: string; surface: string; text: string; muted: string; accent: string; accentText: string; dark: boolean };
const DESIGNS: DesignTheme[] = [
  { key: "midnight", bg: "#0B0E14", surface: "#121621", text: "#F3EFE6", muted: "#9AA1AE", accent: "#C8A24A", accentText: "#0A0A0A", dark: true },
  { key: "ivory", bg: "#F8F5EF", surface: "#FFFFFF", text: "#1C1A17", muted: "#6F6A61", accent: "#1C1A17", accentText: "#F8F5EF", dark: false },
  { key: "emerald", bg: "#071A14", surface: "#0D241C", text: "#EEF6F1", muted: "#93AE9F", accent: "#34D399", accentText: "#04120D", dark: true },
  { key: "bordeaux", bg: "#1A0A10", surface: "#241018", text: "#F8EEF1", muted: "#B5949F", accent: "#F472B6", accentText: "#1A0A10", dark: true },
];

/** بطاقة تعرض صفحة مسوّق مصغّرة بثيم معيّن */
function DesignCard({
  theme: c,
  name,
  desc,
  title,
  products,
}: {
  theme: DesignTheme;
  name: string;
  desc: string;
  title: string;
  products: { store: string; color: string; title: string; price: string; old: string | null; badge: string | null }[];
}) {
  return (
    <div className="group rounded-[1.75rem] border border-white/[0.07] bg-white/[0.02] p-2.5 transition duration-300 hover:-translate-y-1.5 hover:border-white/15 hover:shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="overflow-hidden rounded-[1.3rem]" style={{ background: c.bg, color: c.text }} aria-hidden>
        {/* شريط الصفحة */}
        <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: `1px solid ${c.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-serif text-xs font-bold" style={{ background: c.accent, color: c.accentText }}>
            S
          </span>
          <span className="truncate font-serif text-sm font-semibold">{title}</span>
          <span className="ms-auto h-6 w-16 rounded-full" style={{ background: c.dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }} />
        </div>
        {/* النبذة */}
        <div className="px-4 pb-3 pt-4">
          <div className="h-3 w-3/4 rounded-full" style={{ background: c.text, opacity: 0.85 }} />
          <div className="mt-2 h-2 w-1/2 rounded-full" style={{ background: c.muted, opacity: 0.6 }} />
          <div className="mt-3 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-5 rounded-full px-3" style={{ background: i === 0 ? c.accent : "transparent", border: `1px solid ${i === 0 ? c.accent : c.dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`, width: i === 0 ? 36 : 48 }} />
            ))}
          </div>
        </div>
        {/* البطاقات */}
        <div className="grid grid-cols-2 gap-2.5 px-4 pb-4">
          {products.slice(0, 4).map((p, i) => (
            <div key={i} className="overflow-hidden rounded-xl" style={{ background: c.surface, border: `1px solid ${c.dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
              <div className="relative m-1 aspect-square rounded-lg bg-gradient-to-br from-white to-neutral-200">
                <div className="absolute inset-4 rounded-lg bg-gradient-to-br from-neutral-300/70 to-neutral-100" />
                {p.badge && i === 0 && (
                  <span className="absolute start-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase" style={{ background: c.accent, color: c.accentText }}>
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="px-2 pb-2 pt-1">
                <p className="truncate text-[9px] font-semibold">{p.title}</p>
                <p className="mt-0.5 text-[11px] font-bold">{p.price}</p>
                <span className="mt-1.5 block h-4 rounded-full text-center text-[7px] font-bold leading-4" style={{ background: c.accent, color: c.accentText }}>
                  {p.store}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 px-3 pb-2 pt-4">
        <div>
          <p className="font-semibold">{name}</p>
          <p className="mt-1 text-sm leading-relaxed text-white/50">{desc}</p>
        </div>
        <span className="mt-1 h-4 w-4 shrink-0 rounded-full ring-2 ring-white/10" style={{ background: c.accent }} />
      </div>
    </div>
  );
}

/** معاينة صغيرة لكل خطوة من خطوات "كيف تعمل" */
function StepVisual({ n, t }: { n: number; t: { available: string; detected: string; clicks: string } }) {
  if (n === 1)
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-black/30 p-4" aria-hidden>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs" dir="ltr">
          <span className="text-white/40">primeshelf.store/</span>
          <span className="font-medium text-white">sarah</span>
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-300">
          <Check className="h-3.5 w-3.5" />
          {t.available}
        </p>
      </div>
    );
  if (n === 2)
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-black/30 p-4" aria-hidden>
        <div className="truncate rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[11px] text-white/60" dir="ltr">
          amazon.com/dp/B0CX…?tag=sarah-20
        </div>
        <p className="mt-2.5 flex items-center gap-2 text-xs text-white/80">
          <span className="rounded-full bg-[#FF9900]/15 px-2 py-0.5 font-semibold text-[#FFB547]">Amazon</span>
          {t.detected}
        </p>
      </div>
    );
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/30 p-4" aria-hidden>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-semibold tabular-nums">+128</p>
        <p className="text-xs text-white/45">{t.clicks}</p>
      </div>
      <div className="mt-2.5 flex h-8 items-end gap-1" dir="ltr">
        {[25, 40, 32, 55, 48, 70, 64, 88].map((h, i) => (
          <span key={i} className="flex-1 rounded-t-[3px] bg-amber-400" style={{ height: `${h}%`, opacity: 0.35 + i * 0.08 }} />
        ))}
      </div>
    </div>
  );
}
