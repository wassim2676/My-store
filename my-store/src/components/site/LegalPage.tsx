import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { FileText, Languages, Mail } from "lucide-react";
import { PageFrame } from "./StaticPage";
import { LEGAL_DOCS, type LegalBlock, type LegalKey } from "@/content/legal";
import { CONTACT_EMAIL } from "@/lib/site";

// ==================== ⚖️ قالب الصفحات القانونية: ملخص + فهرس جانبي ثابت + أقسام مرقّمة ====================
const OTHER: { key: LegalKey; href: string }[] = [
  { key: "terms", href: "/terms" },
  { key: "privacy", href: "/privacy" },
  { key: "cookies", href: "/cookies" },
  { key: "disclosure", href: "/affiliate-disclosure" },
  { key: "acceptableUse", href: "/acceptable-use" },
];

function Block({ b }: { b: LegalBlock }) {
  if (typeof b === "string") return <p className="leading-[1.8] text-white/70">{b}</p>;
  if ("list" in b)
    return (
      <ul className="space-y-2.5 ps-1">
        {b.list.map((item, i) => (
          <li key={i} className="flex gap-3 leading-[1.75] text-white/70">
            <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  if ("table" in b)
    return (
      <div className="overflow-x-auto rounded-xl border border-white/[0.08]" dir="ltr">
        <table className="w-full min-w-[560px] text-start text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/45">
            <tr>
              {b.table.head.map((h) => (
                <th key={h} className="px-4 py-3 text-start font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.table.rows.map((row, i) => (
              <tr key={i} className="border-t border-white/[0.06] align-top">
                {row.map((cell, j) => (
                  <td key={j} className={`px-4 py-3 leading-relaxed ${j === 0 ? "font-medium text-white/85" : "text-white/60"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return <p className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3 text-sm leading-relaxed text-amber-100/80">{b.note}</p>;
}

export default async function LegalPage({ docKey }: { docKey: LegalKey }) {
  const t = await getTranslations("pages");
  const locale = await getLocale();
  const doc = LEGAL_DOCS[docKey];

  return (
    <PageFrame>
      {/* الرأس */}
      <header className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[900px] max-w-[160vw] -translate-x-1/2 rounded-full bg-amber-500/[0.08] blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300/90">{t(`${docKey}.eyebrow`)}</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">{t(`${docKey}.title`)}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/55">{t(`${docKey}.intro`)}</p>
          <p className="mt-5 text-sm text-white/40">
            {t("legal.effective")}: <span dir="ltr">{doc.effective}</span>
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14 lg:py-16">
        {/* 🧭 الفهرس */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pe-2">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">{t("legal.toc")}</p>
            <ol className="space-y-1 border-s border-white/[0.08]">
              {doc.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ms-px block border-s border-transparent py-1.5 ps-4 text-[13px] leading-snug text-white/55 transition hover:border-amber-400 hover:text-white" dir="ltr">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
            <div className="mt-8 border-t border-white/[0.08] pt-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">{t("legal.related")}</p>
              <ul className="space-y-2">
                {OTHER.filter((o) => o.key !== docKey).map((o) => (
                  <li key={o.key}>
                    <Link href={o.href} className="flex items-center gap-2 text-[13px] text-white/55 hover:text-amber-300">
                      <FileText className="h-3.5 w-3.5" />
                      {t(`${o.key}.title`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>

        {/* 📄 المحتوى (المرجع الملزم بالإنجليزية) */}
        <article className="min-w-0" dir="ltr" lang="en">
          {locale !== "en" && (
            <div className="mb-8 flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm leading-relaxed text-white/65" dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
              <Languages className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              {t("legal.englishNotice")}
            </div>
          )}

          <section className="mb-12 rounded-2xl border border-amber-400/15 bg-gradient-to-br from-amber-400/[0.06] to-transparent p-6 sm:p-7">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-200/90">Summary</h2>
            <ul className="mt-4 space-y-2.5">
              {doc.summary.map((s, i) => (
                <li key={i} className="flex gap-3 leading-relaxed text-white/75">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-white/40">This summary is for convenience only; the full text below applies.</p>
          </section>

          <div className="space-y-12">
            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">{s.title}</h2>
                <div className="mt-4 space-y-4">
                  {s.body.map((b, i) => (
                    <Block key={i} b={b} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Questions about this document?</p>
              <p className="mt-1 text-sm text-white/50">Our team usually replies within two business days.</p>
            </div>
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 self-start rounded-md bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 sm:self-auto">
              <Mail className="h-4 w-4" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </article>
      </div>
    </PageFrame>
  );
}
