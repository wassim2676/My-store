import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import SiteNavbar from "./SiteNavbar";
import SiteFooter from "./SiteFooter";

export type ContentPageKey =
  | "about" | "faq" | "help" | "terms" | "privacy" | "cookies" | "disclosure" | "acceptableUse" | "contact" | "guide";

type Section = { h: string; p: string };

const LEGAL = new Set<ContentPageKey>(["terms", "privacy", "cookies", "disclosure", "acceptableUse"]);

/** عنوان الصفحة للمتصفح ومحركات البحث، بلغة الزائر */
export async function contentMetadata(key: ContentPageKey): Promise<Metadata> {
  const t = await getTranslations(`pages.${key}`);
  return { title: t("title"), description: t("intro") };
}

/** رأس موحّد للصفحات الداخلية */
export function PageHeader({ eyebrow, title, intro, note }: { eyebrow: string; title: string; intro?: string; note?: string }) {
  return (
    <header className="relative overflow-hidden border-b border-white/[0.06]">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[900px] max-w-[160vw] -translate-x-1/2 rounded-full bg-amber-500/[0.09] blur-[120px]" />
      <div className="relative mx-auto max-w-3xl px-4 pb-14 pt-16 text-center sm:pt-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300/90">{eyebrow}</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        {intro && <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/55">{intro}</p>}
        {note && <p className="mt-4 text-xs text-white/35">{note}</p>}
      </div>
    </header>
  );
}

/** غلاف الصفحات الداخلية: شريط التنقل + المحتوى + التذييل */
export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#07090D] text-white antialiased">
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

/** قالب الصفحات النصية — المحتوى من messages/platform/{locale}.json → pages.{key} */
export default async function StaticPage({ pageKey, children }: { pageKey: ContentPageKey; children?: React.ReactNode }) {
  const t = await getTranslations("pages");
  const sections = t.raw(`${pageKey}.sections`) as Section[];
  const isFaq = pageKey === "faq";

  return (
    <PageFrame>
      <PageHeader
        eyebrow={t(`${pageKey}.eyebrow`)}
        title={t(`${pageKey}.title`)}
        intro={t(`${pageKey}.intro`)}
        note={LEGAL.has(pageKey) ? t("updated") : undefined}
      />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:py-16">
        {children}

        {isFaq ? (
          <div className="divide-y divide-white/[0.07] rounded-3xl border border-white/[0.07] bg-white/[0.02]">
            {sections.map((s, i) => (
              <details key={i} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {s.h}
                  <ChevronDown className="h-4 w-4 shrink-0 text-white/40 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 leading-relaxed text-white/60">{s.p}</p>
              </details>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((s, i) => (
              <section key={i} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-7">
                <h2 className="font-serif text-xl font-semibold">{s.h}</h2>
                <p className="mt-3 leading-relaxed text-white/60">{s.p}</p>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageFrame>
  );
}
