import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight, BookOpen, Clock, Flag, Handshake, HelpCircle, Languages, LifeBuoy, Mail } from "lucide-react";
import { contentMetadata, PageFrame } from "@/components/site/StaticPage";
import { Glow } from "@/components/site/company";
import ContactForm, { type ContactLabels } from "@/components/site/ContactForm";
import { JsonLd } from "@/components/blog/ArticleCard";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

export const generateMetadata = () => contentMetadata("contact");

const CHANNEL_ICONS: Record<string, typeof Mail> = { support: LifeBuoy, partnership: Handshake, report: Flag };
const SUBJECTS: Record<string, string> = { support: "Support request", partnership: "Partnership inquiry", report: "Report a page" };

const card = "rounded-2xl border border-white/[0.08] bg-[#0C0F15] p-6 shadow-[0_40px_80px_-50px_rgba(0,0,0,0.9)] sm:p-8";

// ==================== ✉️ صفحة التواصل: رأس في المنتصف + بطاقتان متوازنتان ====================
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

      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <Glow />
        <div className="relative mx-auto max-w-[1120px] px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:pb-24">
          {/* 🎯 الرأس */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-amber-300/90">{t("hero.eyebrow")}</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">{t("hero.title")}</h1>
            <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-white/55">{t("hero.text")}</p>
          </div>

          {/* ⚖️ بطاقتان بنفس العرض والارتفاع */}
          <div className="mt-12 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
            {/* معلومات التواصل */}
            <div className={`${card} flex flex-col`}>
              <h2 className="text-lg font-semibold tracking-tight">{t("direct")}</h2>
              <p className="mt-1 text-sm text-white/45">{t("directText")}</p>

              <div className="mt-6 divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.07]">
                <a href={`mailto:${CONTACT_EMAIL}`} className="group flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-white/[0.03]">
                  <Icon><Mail className="h-4 w-4" /></Icon>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] text-white/40">{t("emailLabel")}</span>
                    <span className="block truncate text-sm font-medium text-white group-hover:text-amber-200" dir="ltr">{CONTACT_EMAIL}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-white/25 transition group-hover:text-amber-300" />
                </a>
                {channels.map((c) => {
                  const I = CHANNEL_ICONS[c.key] ?? Mail;
                  return (
                    <a key={c.key} href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(SUBJECTS[c.key] ?? SITE_NAME)}`} className="group flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-white/[0.03]">
                      <Icon><I className="h-4 w-4" /></Icon>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-white">{c.h}</span>
                        <span className="block truncate text-[12px] text-white/40">{c.p}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-white/25 transition group-hover:text-amber-300" />
                    </a>
                  );
                })}
              </div>

              <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
                <Fact icon={<Clock className="h-4 w-4" />} label={t("responseLabel")} value={t("response")} />
                <Fact icon={<Languages className="h-4 w-4" />} label="EN · FR · AR" value={promise[1] ?? ""} />
              </div>
            </div>

            {/* النموذج */}
            <div className={card}>
              <ContactForm labels={form} />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ⚡ إجابات أسرع ==================== */}
      <section className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight">{t("quick.title")}</h2>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {quick.map((q) => (
            <Link key={q.href} href={q.href} className="group flex items-center gap-3.5 rounded-xl border border-white/[0.08] bg-[#0C0F15] px-4 py-3.5 transition hover:border-white/[0.16]">
              <Icon><q.icon className="h-4 w-4" /></Icon>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{q.title}</span>
                <span className="block truncate text-[12px] text-white/40">{q.desc}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-white/25 transition group-hover:text-amber-300 rtl:-scale-x-100" />
            </Link>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-amber-300">{children}</span>;
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
      <p className="flex items-center gap-2 text-[12px] text-white/40"><span className="text-amber-300">{icon}</span>{label}</p>
      <p className="mt-1 text-sm font-medium text-white/85">{value}</p>
    </div>
  );
}
