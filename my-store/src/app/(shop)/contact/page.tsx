import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen, Check, Flag, Handshake, HelpCircle, LifeBuoy, Mail } from "lucide-react";
import { contentMetadata, PageFrame } from "@/components/site/StaticPage";
import { Glow } from "@/components/site/company";
import ContactForm, { type ContactLabels } from "@/components/site/ContactForm";
import { JsonLd } from "@/components/blog/ArticleCard";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

export const generateMetadata = () => contentMetadata("contact");

const CHANNEL_ICONS: Record<string, typeof Mail> = { support: LifeBuoy, partnership: Handshake, report: Flag };
const SUBJECTS: Record<string, string> = { support: "Support request", partnership: "Partnership inquiry", report: "Report a page" };

// ==================== ✉️ صفحة التواصل ====================
export default async function ContactPage() {
  const t = await getTranslations("pages.contact");
  const promise = t.raw("promise") as string[];
  const form = t.raw("form") as ContactLabels;
  const channels = t.raw("channels.items") as { key: string; h: string; p: string; cta: string }[];
  const quick = [
    { href: "/faq", icon: HelpCircle, title: t("quick.faq"), desc: t("quick.faqDesc") },
    { href: "/help", icon: LifeBuoy, title: t("quick.help"), desc: t("quick.helpDesc") },
    { href: "/blog", icon: BookOpen, title: t("quick.guides"), desc: t("quick.guidesDesc") },
  ];

  return (
    <PageFrame>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", name: t("title"), url: `${SITE_URL}/contact`, mainEntity: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, email: CONTACT_EMAIL, contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: CONTACT_EMAIL, availableLanguage: ["English", "French", "Arabic"] } } }} />

      {/* ==================== 🎯 البطل + النموذج ==================== */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <Glow />
        <div className="relative mx-auto grid max-w-[1280px] gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 lg:px-8 lg:pb-28">
          <div className="lg:pt-6">
            <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-amber-300/90">
              <span className="h-px w-8 bg-amber-300/60" /> {t("hero.eyebrow")}
            </p>
            <h1 className="mt-6 font-serif text-[40px] font-semibold leading-[1.05] tracking-tight sm:text-6xl">{t("hero.title")}</h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">{t("hero.text")}</p>

            <ul className="mt-10 space-y-4">
              {promise.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[15px] text-white/75">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
                  {p}
                </li>
              ))}
            </ul>

            <a href={`mailto:${CONTACT_EMAIL}`} className="group mt-10 inline-flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] py-4 pe-6 ps-4 transition hover:border-amber-300/30">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-black"><Mail className="h-5 w-5" /></span>
              <span>
                <span className="block text-xs uppercase tracking-[0.16em] text-white/40">{t("emailLabel")}</span>
                <span className="block font-semibold text-white group-hover:text-amber-200" dir="ltr">{CONTACT_EMAIL}</span>
              </span>
            </a>
          </div>

          <div className="relative">
            <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-amber-500/[0.06] blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/[0.09] bg-[#0C0F15]/90 p-6 shadow-[0_60px_120px_-50px_rgba(0,0,0,0.95)] backdrop-blur sm:p-10">
              <div aria-hidden className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
              <ContactForm labels={form} />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 📬 قنوات أخرى ==================== */}
      <section className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-amber-300/90">{t("channels.eyebrow")}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {channels.map((c) => {
            const Icon = CHANNEL_ICONS[c.key] ?? Mail;
            return (
              <a
                key={c.key}
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(SUBJECTS[c.key] ?? SITE_NAME)}`}
                className="group flex flex-col rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 transition duration-300 hover:-translate-y-1 hover:border-amber-300/30 hover:bg-white/[0.035]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300/25 to-amber-500/5 text-amber-300 ring-1 ring-amber-300/20"><Icon className="h-5 w-5" /></span>
                <h2 className="mt-6 text-xl font-semibold">{c.h}</h2>
                <p className="mt-2 flex-1 leading-relaxed text-white/55">{c.p}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300">
                  {c.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* ==================== ⚡ إجابات أسرع ==================== */}
      <section className="border-t border-white/[0.06] bg-white/[0.012]">
        <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-semibold tracking-tight">{t("quick.title")}</h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.07] md:grid-cols-3">
            {quick.map((q) => (
              <Link key={q.href} href={q.href} className="group flex items-center gap-4 bg-[#090B10] p-6 transition hover:bg-[#0D1016]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-white/70 transition group-hover:text-amber-300"><q.icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{q.title}</span>
                  <span className="block truncate text-sm text-white/45">{q.desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-white/25 transition group-hover:text-amber-300 rtl:-scale-x-100" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
