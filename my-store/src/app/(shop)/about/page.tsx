/* eslint-disable @next/next/no-img-element -- شعارات وصور الفريق الصغيرة */
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight, ArrowUpRight, Compass, Eye, Handshake, HeartHandshake, Lightbulb, MessageCircleHeart, Palette, PenLine, Rocket, Scale, ShieldCheck, Sparkles, Target, Users, Wrench,
} from "lucide-react";
import { contentMetadata, PageFrame } from "@/components/site/StaticPage";
import { CtaBand, Glow, SectionTitle } from "@/components/site/company";
import { JsonLd } from "@/components/blog/ArticleCard";
import { NETWORKS } from "@/content/blog";
import { TEAM, type TeamRole } from "@/content/team";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

export const generateMetadata = () => contentMetadata("about");

type Item = { h: string; p: string };
const ROLE_ICONS: Record<TeamRole, typeof Rocket> = { founder: Compass, product: Wrench, design: Palette, partnerships: Handshake, content: PenLine, support: MessageCircleHeart };
const GOAL_ICONS = [Sparkles, ShieldCheck, Rocket, Lightbulb];
const VALUE_ICONS = [Users, Eye, Scale, HeartHandshake];

// ==================== 🏛️ صفحة من نحن: التعريف بالمنصة وأهدافها وفريقها ====================
export default async function AboutPage() {
  const [t, locale] = await Promise.all([getTranslations("pages.about"), getLocale()]);
  const story = t.raw("story.p") as string[];
  const goals = t.raw("goals.items") as Item[];
  const values = t.raw("values.items") as Item[];
  const dropCap = locale !== "ar"; // الحرف الأول الكبير يكسر اتصال الحروف العربية

  return (
    <PageFrame>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "AboutPage", name: t("title"), url: `${SITE_URL}/about`, about: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, email: CONTACT_EMAIL, description: t("mission.p") } }} />

      {/* ==================== 🎯 البطل ==================== */}
      <section className="relative overflow-hidden">
        <Glow />
        <div className="relative mx-auto max-w-[1280px] px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-amber-300/90">{t("hero.eyebrow")}</p>
            <h1 className="mt-5 font-serif text-[40px] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[68px]">{t("hero.title")}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl">{t("hero.text")}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/features" className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-semibold text-black shadow-[0_10px_30px_-10px_rgba(245,184,0,0.6)] transition hover:bg-amber-300">
                {t("hero.primary")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/[0.04]">
                {t("hero.secondary")}
              </Link>
            </div>
          </div>

          {/* لوحة الهوية: الشعار + المتاجر */}
          <div className="relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-[#12151C] via-[#0B0E14] to-[#0A0C11]">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]" />
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/[0.14] blur-[110px]" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
            <div className="relative flex flex-col items-center px-6 py-14 text-center sm:py-16">
              <img src="/brand/primeshelf-mark.svg" alt="" className="h-20 w-20 drop-shadow-[0_20px_40px_rgba(245,184,0,0.35)]" />
              <p className="mt-6 max-w-xl font-serif text-2xl font-semibold leading-snug sm:text-3xl">{t("motto")}</p>
              <ul className="mt-10 flex flex-wrap justify-center gap-2.5" aria-label="Supported stores">
                {NETWORKS.map((n) => (
                  <li key={n.slug} className="flex h-11 w-24 items-center justify-center rounded-xl bg-white px-3 shadow-[0_12px_30px_-16px_rgba(0,0,0,0.9)]">
                    <img src={`/brands/${n.slug}.svg`} alt={n.name} loading="lazy" className="max-h-6 max-w-full object-contain" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 🎯 المهمة والرؤية ==================== */}
      <section className="mx-auto grid max-w-[1280px] grid-cols-1 gap-5 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
        {[
          { icon: Target, h: t("mission.h"), p: t("mission.p") },
          { icon: Eye, h: t("vision.h"), p: t("vision.p") },
        ].map((b) => (
          <div key={b.h} className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0C0F15] p-8 sm:p-10">
            <div aria-hidden className="absolute -end-16 -top-16 h-48 w-48 rounded-full bg-amber-400/[0.07] blur-2xl" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300/25 to-amber-500/5 text-amber-300 ring-1 ring-amber-300/20"><b.icon className="h-5 w-5" /></span>
            <h2 className="relative mt-6 font-serif text-2xl font-semibold sm:text-3xl">{b.h}</h2>
            <p className="relative mt-3 text-[17px] leading-[1.8] text-white/60">{b.p}</p>
          </div>
        ))}
      </section>

      {/* ==================== 📖 القصة ==================== */}
      <section className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 lg:px-8 lg:py-20">
        <SectionTitle eyebrow={t("story.eyebrow")} title={t("story.title")} />
        <div className="space-y-6 text-lg leading-[1.8] text-white/65">
          {story.map((p, i) => (
            <p key={i} className={i === 0 ? `text-xl text-white/85 ${dropCap ? "first-letter:float-start first-letter:me-3 first-letter:font-serif first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.9] first-letter:text-amber-300" : ""}` : ""}>{p}</p>
          ))}
        </div>
      </section>

      {/* ==================== 🏁 الأهداف ==================== */}
      <section className="border-y border-white/[0.06] bg-white/[0.012] py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow={t("goals.eyebrow")} title={t("goals.title")} />
          <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {goals.map((g, i) => {
              const Icon = GOAL_ICONS[i % GOAL_ICONS.length];
              return (
                <li key={i} className="group relative flex flex-col rounded-3xl border border-white/[0.08] bg-[#0A0D12] p-7 transition duration-300 hover:-translate-y-1 hover:border-amber-300/25">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300/10 text-amber-300 ring-1 ring-amber-300/15"><Icon className="h-5 w-5" /></span>
                    <span className="font-serif text-3xl font-semibold text-white/10 transition group-hover:text-amber-300/30" dir="ltr">0{i + 1}</span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{g.h}</h3>
                  <p className="mt-2 leading-relaxed text-white/55">{g.p}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ==================== 👥 الفريق ==================== */}
      <section className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionTitle eyebrow={t("team.eyebrow")} title={t("team.title")} text={t("team.text")} />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m) => {
            const Icon = ROLE_ICONS[m.role];
            const role = t(`team.roles.${m.role}.title`);
            return (
              <article key={m.role} className="group flex flex-col rounded-3xl border border-white/[0.08] bg-[#0C0F15] p-7 transition duration-300 hover:border-white/[0.16]">
                {m.photo ? (
                  <img src={m.photo} alt={m.name ?? role} className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10" />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300/30 via-amber-500/10 to-transparent text-amber-200 ring-1 ring-amber-300/20">
                    <Icon className="h-7 w-7" />
                  </span>
                )}
                <h3 className="mt-6 text-lg font-semibold">{m.name || role}</h3>
                {m.name && <p className="text-sm font-medium text-amber-300/90">{role}</p>}
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-white/55">{t(`team.roles.${m.role}.desc`)}</p>
                {m.link && (
                  <a href={m.link} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
                    <ArrowUpRight className="h-4 w-4" /> Profile
                  </a>
                )}
              </article>
            );
          })}
          {/* انضم إلينا */}
          <Link href="/contact" className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/[0.12] via-amber-300/[0.04] to-transparent p-7 transition duration-300 hover:border-amber-300/40 sm:col-span-2">
            <div>
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-amber-300/40 text-amber-300"><Users className="h-7 w-7" /></span>
              <h3 className="mt-6 font-serif text-2xl font-semibold">{t("team.join")}</h3>
              <p className="mt-2 max-w-md text-white/60">{t("team.joinText")}</p>
            </div>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300">
              {t("team.joinCta")} <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* ==================== 🧭 القيم ==================== */}
      <section className="border-t border-white/[0.06] py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow={t("values.eyebrow")} title={t("values.title")} center />
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
              return (
                <div key={i} className="bg-[#090B10] p-8">
                  <Icon className="h-6 w-6 text-amber-300" />
                  <h3 className="mt-5 text-lg font-semibold">{v.h}</h3>
                  <p className="mt-2 leading-relaxed text-white/55">{v.p}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBand title={t("cta.title")} text={t("cta.text")} primary={t("cta.button")} secondary={t("cta.secondary")} secondaryHref="/contact" />
    </PageFrame>
  );
}
