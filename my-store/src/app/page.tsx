import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Gem, BadgeCheck, PenLine, BarChart3, Search, ShieldCheck, Languages, Palette, ArrowRight, Star,
} from "lucide-react";
import SiteNavbar from "@/components/site/SiteNavbar";
import SiteFooter from "@/components/site/SiteFooter";
import ClaimLink from "@/components/site/ClaimLink";
import BrandLogo from "@/components/shop/BrandLogo";
import { getActiveBrands } from "@/lib/brands";

// ==================== 🏠 الصفحة الرئيسية للمنصة (للمسوّقين بالعمولة) ====================
export default async function Home() {
  const t = await getTranslations("platform");
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
    { store: "Amazon", color: "#FF9900", title: t("mock.p1"), price: "$249", old: "$329", badge: "Best Pick" },
    { store: "Walmart", color: "#0071CE", title: t("mock.p2"), price: "$89", old: null, badge: null },
    { store: "Target", color: "#CC0000", title: t("mock.p3"), price: "$59", old: "$79", badge: "Trending" },
  ];

  return (
    <div className="min-h-screen bg-[#07090D] text-white antialiased">
      <SiteNavbar />

      <main>
        {/* 🌟 Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-48 left-1/2 h-[640px] w-[1000px] max-w-[160vw] -translate-x-1/2 rounded-full bg-amber-500/[0.12] blur-[140px]" />
          <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 text-center sm:pt-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/[0.06] px-4 py-1.5 text-xs font-medium text-amber-200">
              <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              {t("hero.badge")}
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">{t("hero.subtitle")}</p>
            <div className="mt-10">
              <ClaimLink cta={t("hero.cta")} placeholder={t("hero.placeholder")} />
              <p className="mt-3 text-xs text-white/40">{t("hero.note")}</p>
            </div>

            {/* معاينة بطاقات */}
            <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
              {mock.map((m, i) => (
                <div key={m.store} className={`overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#121621] text-start shadow-2xl ${i === 1 ? "sm:-translate-y-6" : ""}`}>
                  <div className="relative m-2.5 mb-0 aspect-square rounded-2xl bg-gradient-to-br from-white to-neutral-200">
                    <div className="absolute inset-8 rounded-2xl bg-gradient-to-br from-neutral-300/60 to-neutral-100" />
                    {m.badge && <span className="absolute start-2.5 top-2.5 rounded-full bg-[#C8A24A] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black">{m.badge}</span>}
                  </div>
                  <div className="space-y-1.5 px-4 pb-4 pt-3.5">
                    <p className="font-serif font-semibold">{m.title}</p>
                    <p className="flex items-baseline gap-2">
                      <span className="text-lg font-bold">{m.price}</span>
                      {m.old && <span className="text-xs text-white/40 line-through">{m.old}</span>}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[0.08] bg-[#1A1F2C] px-4 py-3">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
                        <BrandLogo brand={{ name: m.store, accentColor: m.color }} size={20} />
                      </span>
                      {m.store}
                    </span>
                    <span className="text-[11px] font-semibold text-[#C8A24A]">{t("mock.read")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🏬 المتاجر المدعومة */}
        {brands.length > 0 && (
          <section className="border-y border-white/[0.06] bg-white/[0.015] py-10">
            <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-white/40">{t("stores.title")}</p>
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3 px-4">
              {brands.map((b) => (
                <span key={b.id} className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm text-white/75">
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-white px-1"><BrandLogo brand={b} size={20} /></span>
                  {b.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ✨ المميزات */}
        <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">{t("features.title")}</h2>
            <p className="mt-4 text-white/55">{t("features.subtitle")}</p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, key }) => (
              <div key={key} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition hover:border-amber-400/30">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-semibold">{t(`features.${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{t(`features.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🪜 كيف تعمل */}
        <section id="how" className="scroll-mt-20 border-t border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="mx-auto max-w-6xl px-4 py-24">
            <h2 className="text-center font-serif text-3xl font-semibold sm:text-4xl">{t("how.title")}</h2>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="relative rounded-3xl border border-white/[0.07] bg-[#0B0E14] p-7">
                  <span className="font-serif text-5xl font-semibold text-amber-300/80">0{n}</span>
                  <h3 className="mt-4 text-lg font-semibold">{t(`how.s${n}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{t(`how.s${n}.desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🚀 دعوة أخيرة */}
        <section className="px-4 pb-24">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-amber-400/20 bg-[radial-gradient(ellipse_80%_120%_at_50%_0%,rgba(200,162,74,0.18),transparent_70%)] px-6 py-16 text-center">
            <h2 className="mx-auto max-w-2xl font-serif text-3xl font-semibold sm:text-4xl">{t("cta.title")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/60">{t("cta.subtitle")}</p>
            <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 px-7 py-3.5 font-semibold text-black hover:brightness-110">
              {t("cta.button")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
