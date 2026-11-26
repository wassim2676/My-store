import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen, LifeBuoy, Mail } from "lucide-react";
import { contentMetadata, PageFrame } from "@/components/site/StaticPage";
import { Glow } from "@/components/site/company";
import FaqExplorer, { type FaqGroup } from "@/components/site/FaqExplorer";
import { JsonLd } from "@/components/blog/ArticleCard";

export const generateMetadata = () => contentMetadata("faq");

// ==================== ❓ صفحة الأسئلة الشائعة ====================
export default async function FaqPage() {
  const t = await getTranslations("pages.faq");
  const groups = t.raw("groups") as FaqGroup[];
  const help = [
    { href: "/contact", icon: Mail, title: t("still.contact"), desc: t("still.contactDesc") },
    { href: "/help", icon: LifeBuoy, title: t("still.help"), desc: t("still.helpDesc") },
    { href: "/blog", icon: BookOpen, title: t("still.guides"), desc: t("still.guidesDesc") },
  ];

  return (
    <PageFrame>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: groups.flatMap((g) => g.items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } }))),
        }}
      />

      <section className="relative overflow-hidden">
        <Glow />
        <div className="relative mx-auto max-w-[1280px] px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-amber-300/90">{t("eyebrow")}</p>
            <h1 className="mt-5 font-serif text-[40px] font-semibold leading-[1.05] tracking-tight sm:text-6xl">{t("title")}</h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/55">{t("intro")}</p>
          </div>
          <div className="mt-12">
            <FaqExplorer groups={groups} labels={{ search: t("searchPlaceholder"), browse: t("browse"), results: t("results"), noResults: t("noResults") }} />
          </div>
        </div>
      </section>

      {/* ==================== 🤝 ما زال لديك سؤال ==================== */}
      <section className="border-t border-white/[0.06] bg-white/[0.012]">
        <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{t("still.title")}</h2>
            <p className="mt-3 text-lg text-white/55">{t("still.text")}</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {help.map((h) => (
              <Link key={h.href} href={h.href} className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7 transition duration-300 hover:-translate-y-1 hover:border-amber-300/30 hover:bg-white/[0.035]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-300 ring-1 ring-amber-300/15"><h.icon className="h-5 w-5" /></span>
                <h3 className="mt-6 text-lg font-semibold">{h.title}</h3>
                <p className="mt-1.5 text-sm text-white/50">{h.desc}</p>
                <ArrowRight className="absolute end-7 top-8 h-5 w-5 text-white/25 transition group-hover:translate-x-1 group-hover:text-amber-300 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
