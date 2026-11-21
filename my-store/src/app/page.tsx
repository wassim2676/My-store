import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight, BadgeCheck, BarChart3, Check, ChevronDown, Gem, Languages, Minus, Palette, PenLine, Search, Share2, ShieldCheck, SlidersHorizontal, Star, Tag, X,
} from "lucide-react";
import SiteNavbar from "@/components/site/SiteNavbar";
import SiteFooter from "@/components/site/SiteFooter";
import ClaimLink from "@/components/site/ClaimLink";
import TourCarousel from "@/components/site/TourCarousel";
import BrandCycleButton from "@/components/site/BrandCycleButton";
import BrandLogo from "@/components/shop/BrandLogo";
import { WHITE_LOGO } from "@/components/shop/logo-classes";
import { getActiveBrands } from "@/lib/brands";


// ✅ توثيق دومين المنصة نفسه لدى Google Search Console وMeta Business (رموز من متغيرات البيئة).
// في الصفحة الرئيسية فقط — لا في الـ layout — حتى لا تُورَّث لصفحات المسوّقين ودوميناتهم الخاصة.
export function generateMetadata(): Metadata {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const meta = process.env.FACEBOOK_DOMAIN_VERIFICATION?.trim();
  if (!google && !meta) return {};
  return { verification: { ...(google ? { google } : {}), ...(meta ? { other: { "facebook-domain-verification": meta } } : {}) } };
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
      <SiteNavbar />

      {/* عناصر الشبكات تتقلّص لعرض الشاشة (الشريط الأفقي للبطاقات كان يمطّ العمود خارج الهاتف) */}
      <main className="[&_.grid>*]:min-w-0">
        {/* 🌟 Hero */}
        <section className="relative">
          <div className="pointer-events-none absolute -top-48 left-1/2 h-[700px] w-[1100px] max-w-[170vw] -translate-x-1/2 rounded-full bg-amber-500/[0.12] blur-[140px]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_20%,black,transparent)]" />
          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 text-center sm:pt-24">
            <h1 className="mx-auto max-w-4xl bg-gradient-to-b from-white via-white to-white/60 bg-clip-text font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-transparent sm:text-6xl lg:text-7xl">
              {t("hero.title")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">{t("hero.subtitle")}</p>
            <div className="mt-10">
              <ClaimLink cta={t("hero.cta")} placeholder={t("hero.placeholder")} />
              <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/50">
                {trust.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-amber-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* 🖥️ معاينة صفحة هبوط داخل إطار متصفح (نفس ترتيب الصفحة الحقيقية: شريط الهوية والبحث ← الفلاتر ← النبذة ← البطاقات) */}
            <div className="relative mx-auto mt-16 max-w-6xl">
              <div className="pointer-events-none absolute -inset-x-10 -bottom-10 top-20 rounded-[3rem] bg-amber-500/[0.08] blur-3xl" />
              <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0B0E14] text-start shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
                {/* شريط المتصفح */}
                <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/80" />
                  <span className="mx-auto flex items-center gap-1.5 rounded-md bg-white/[0.05] px-4 py-1 text-[11px] text-white/45" dir="ltr">
                    <ShieldCheck className="h-3 w-3 text-emerald-400/70" />
                    sarahfinds.com
                  </span>
                </div>

                {/* شريط الصفحة: الهوية + البحث */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-white/[0.07] bg-[#0B0E14]/95 px-4 py-3 sm:px-6 lg:flex-nowrap">
                  <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C8A24A] font-serif text-base font-semibold text-black ring-2 ring-[#C8A24A]/40 ring-offset-2 ring-offset-[#0B0E14]">
                      S
                    </span>
                    <span className="truncate font-serif text-lg font-semibold tracking-tight">{t("home.mockPage.title")}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/55">
                      <Share2 className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="flex h-10 w-full min-w-0 items-stretch overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] lg:flex-1">
                    <span className="hidden shrink-0 items-center gap-1.5 border-e border-white/10 bg-white/[0.04] px-3.5 text-xs text-white/70 sm:flex">
                      {t("home.mockPage.allCategories")}
                      <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                    </span>
                    <span className="flex min-w-0 flex-1 items-center truncate px-4 text-sm text-white/35">{t("home.mockPage.search")}</span>
                    <span className="flex w-12 shrink-0 items-center justify-center bg-[#C8A24A] text-black">
                      <Search className="h-4.5 w-4.5" />
                    </span>
                  </div>
                </div>

                {/* سطر الفلاتر */}
                <div className="flex items-center gap-2 overflow-hidden border-b border-white/[0.07] px-4 py-2.5 text-xs sm:px-6">
                  <SlidersHorizontal className="me-1 h-3.5 w-3.5 shrink-0 text-white/40" />
                  <span className="shrink-0 rounded-full bg-[#C8A24A] px-3 py-1 font-medium text-black">{t("home.mockPage.all")}</span>
                  {(t.raw("home.mockPage.cats") as string[]).map((c) => (
                    <span key={c} className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-white/60">{c}</span>
                  ))}
                  <span className="mx-1 hidden h-4 w-px shrink-0 bg-white/10 sm:block" />
                  {mock.map((m) => (
                    <span key={m.store} className="hidden shrink-0 rounded-full border border-white/10 px-3 py-1 text-white/60 sm:inline">{m.store}</span>
                  ))}
                </div>

                {/* النبذة */}
                <div className="flex flex-col gap-4 border-b border-white/[0.07] bg-[radial-gradient(ellipse_70%_100%_at_0%_0%,rgba(200,162,74,0.12),transparent_70%)] px-4 py-7 sm:px-6 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-xl">
                    <p className="font-serif text-2xl font-semibold leading-tight sm:text-3xl">{t("home.mockPage.tagline")}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{t("home.mockPage.bio")}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-2.5 md:items-end">
                    <div className="flex gap-2">
                      {["Instagram", "TikTok", "YouTube"].map((s) => (
                        <span key={s} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-white/60">
                          {s}
                          <ArrowRight className="h-3 w-3 -rotate-45 opacity-50 rtl:rotate-[-135deg]" />
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">{t("home.mockPage.offers")}</span>
                  </div>
                </div>

                {/* البطاقات */}
                <div className="grid grid-cols-1 gap-4 px-4 py-6 min-[480px]:grid-cols-2 sm:px-6 lg:grid-cols-4">
                  {mock.map((m, i) => (
                    <div key={m.store + i} className={`overflow-hidden rounded-[1.2rem] border border-white/[0.08] bg-[#121621] ${i === 1 ? "hidden min-[480px]:block" : i > 1 ? "hidden lg:block" : ""}`}>
                      <div className="relative m-2 mb-0 aspect-square rounded-2xl bg-gradient-to-br from-white to-neutral-200">
                        <div className="absolute inset-7 rounded-2xl bg-gradient-to-br from-neutral-300/70 to-neutral-100" />
                        {m.badge && (
                          <span className="absolute start-2 top-2 rounded-full bg-[#C8A24A] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black">{m.badge}</span>
                        )}
                      </div>
                      <div className="space-y-1.5 px-4 pb-3.5 pt-3">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} className={`h-3 w-3 ${s < m.rating ? "fill-[#C8A24A] text-[#C8A24A]" : "text-white/20"}`} />
                          ))}
                        </div>
                        <p className="truncate font-serif font-semibold">{m.title}</p>
                        <p className="flex items-baseline gap-2">
                          <span className="text-lg font-bold">{m.price}</span>
                          {m.old && <span className="text-xs text-white/40 line-through">{m.old}</span>}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/[0.08] bg-[#1A1F2C] px-4 py-3">
                        <span className="flex items-center text-white/90" title={m.store}>
                          <BrandLogo brand={{ name: m.store, accentColor: m.color }} size={20} fallback="name" className={WHITE_LOGO} />
                        </span>
                        <span className="text-[11px] font-semibold text-[#C8A24A]">{t("mock.read")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
        <section id="tour" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-300/90">{t("home.tour.eyebrow")}</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-5xl">{t("home.tour.title")}</h2>
          </div>

          <div className="mt-16 space-y-20 lg:space-y-28">
            <TourRow n="01" eyebrow={t("home.tour.t1.eyebrow")} title={t("home.tour.t1.title")} desc={t("home.tour.t1.desc")} points={t.raw("home.tour.t1.points") as string[]}>
              <TourCarousel brands={tourBrands} prevLabel={t("home.tour.prev")} nextLabel={t("home.tour.next")} />
            </TourRow>

            <TourRow reverse n="02" eyebrow={t("home.tour.t2.eyebrow")} title={t("home.tour.t2.title")} desc={t("home.tour.t2.desc")} points={t.raw("home.tour.t2.points") as string[]}>
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

            <TourRow n="03" eyebrow={t("home.tour.t3.eyebrow")} title={t("home.tour.t3.title")} desc={t("home.tour.t3.desc")} points={t.raw("home.tour.t3.points") as string[]}>
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

        {/* ✨ المميزات */}
        <section id="features" className="scroll-mt-20 border-t border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="mx-auto max-w-7xl px-4 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-semibold sm:text-5xl">{t("features.title")}</h2>
              <p className="mt-4 text-white/55">{t("features.subtitle")}</p>
            </div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, key }) => (
                <div key={key} className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition hover:-translate-y-0.5 hover:border-amber-400/30 hover:bg-white/[0.03]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300 transition group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-semibold">{t(`features.${key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{t(`features.${key}.desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🪜 كيف تعمل */}
        <section id="how" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-24">
            <h2 className="text-center font-serif text-3xl font-semibold sm:text-5xl">{t("how.title")}</h2>
            <div className="relative mt-14 grid gap-6 md:grid-cols-3">
              <div className="pointer-events-none absolute inset-x-[16%] top-12 hidden h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent md:block" />
              {[1, 2, 3].map((n) => (
                <div key={n} className="relative rounded-3xl border border-white/[0.07] bg-[#0B0E14] p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-[#07090D] font-serif text-xl font-semibold text-amber-300">{n}</span>
                  <h3 className="mt-5 text-lg font-semibold">{t(`how.s${n}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{t(`how.s${n}.desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ⚖️ مقارنة */}
        <section className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-[66rem] px-4 py-24">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-semibold sm:text-4xl">{t("home.compare.title")}</h2>
              <p className="mt-4 text-white/55">{t("home.compare.subtitle")}</p>
            </div>
            <div className="mt-12 overflow-hidden rounded-3xl border border-white/[0.08]">
              <div className="grid grid-cols-[1fr_80px_80px] items-center border-b border-white/[0.08] bg-white/[0.03] px-5 py-4 text-xs font-semibold uppercase tracking-wider sm:grid-cols-[1fr_180px_180px] sm:px-8">
                <span />
                <span className="text-center text-amber-300">{t("home.compare.us")}</span>
                <span className="text-center text-white/40">{t("home.compare.them")}</span>
              </div>
              {compareRows.map((row, i) => (
                <div key={row} className="grid grid-cols-[1fr_80px_80px] items-center border-b border-white/[0.05] px-5 py-4 text-sm last:border-b-0 sm:grid-cols-[1fr_180px_180px] sm:px-8 sm:py-5 sm:text-base">
                  <span className="text-white/80">{row}</span>
                  <span className="flex justify-center">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/15 text-amber-300"><Check className="h-3.5 w-3.5" /></span>
                  </span>
                  <span className="flex justify-center text-white/30">
                    {themHas[i] === "partial" ? <Minus className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ❓ أسئلة: ممتدة بعرض إطار الدعوة الأخيرة، أسئلة كبيرة بفواصل خفيفة */}
        <section className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-[66rem] px-4 py-24">
            <h2 className="text-center font-serif text-3xl font-semibold sm:text-4xl">{t("home.faq.title")}</h2>
            <div className="mt-12 border-t border-white/[0.08]">
              {faq.map((s, i) => (
                <details key={i} className="group border-b border-white/[0.08] [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold text-white/90 transition-colors hover:text-white sm:py-7 sm:text-xl">
                    {s.h}
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all group-open:rotate-180 group-open:border-amber-400/40 group-open:text-amber-300 group-hover:border-white/25">
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="-mt-1 max-w-3xl pb-7 text-[15px] leading-relaxed text-white/60 sm:text-base">{s.p}</p>
                </details>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/faq" className="inline-flex items-center gap-1.5 text-sm text-amber-300 hover:text-amber-200">
                {t("home.faq.more")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </section>

        {/* 🚀 دعوة أخيرة */}
        <section className="px-4 pb-24">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-amber-400/20 bg-[radial-gradient(ellipse_80%_120%_at_50%_0%,rgba(200,162,74,0.2),transparent_70%)] px-6 py-16 text-center">
            <h2 className="mx-auto max-w-2xl font-serif text-3xl font-semibold sm:text-5xl">{t("home.final.title")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/60">{t("home.final.subtitle")}</p>
            <div className="mt-8">
              <ClaimLink cta={t("cta.button")} placeholder={t("hero.placeholder")} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function TourRow({
  n,
  eyebrow,
  title,
  desc,
  points,
  reverse,
  children,
}: {
  n: string;
  eyebrow: string;
  title: string;
  desc: string;
  points: string[];
  reverse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={reverse ? "lg:order-2" : ""}>
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300/90">
          <span className="font-serif text-base tracking-normal text-white/30">{n}</span>
          {eyebrow}
        </p>
        <h3 className="mt-4 font-serif text-2xl font-semibold leading-tight sm:text-4xl">{title}</h3>
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
