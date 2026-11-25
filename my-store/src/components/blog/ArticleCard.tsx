/* eslint-disable @next/next/no-img-element -- الغلاف صورة مولَّدة ثابتة (PNG) ولا تحتاج تحسين next/image */
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { NETWORK_BY_SLUG, readingTime, type BlogArticle } from "@/content/blog";
import { ensureContrast } from "@/lib/landing";

export const BLOG_BG = "#07090D";
/** لون الشبكة مضبوط ليبقى مقروءاً على الخلفية الداكنة */
export const readableAccent = (hex: string) => ensureContrast(hex, [BLOG_BG], 4.5);

export const coverUrl = (slug: string) => `/blog/${slug}/cover.png`;

export const formatDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export default function ArticleCard({ a, large = false }: { a: BlogArticle; large?: boolean }) {
  const net = NETWORK_BY_SLUG[a.network];
  const accent = readableAccent(net.color);
  const { minutes } = readingTime(a);
  return (
    <Link
      href={`/blog/${a.slug}`}
      className={`group flex w-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] transition duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-white/[0.035] ${large ? "lg:flex-row" : ""}`}
    >
      <div className={`relative aspect-[1200/630] overflow-hidden bg-white/[0.04] ${large ? "lg:w-[58%] lg:shrink-0" : ""}`}>
        <img
          src={coverUrl(a.slug)}
          alt={a.title}
          width={1200}
          height={630}
          loading={large ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className={`flex flex-1 flex-col p-6 ${large ? "lg:justify-center lg:p-10" : ""}`}>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]">
          <span style={{ color: accent }}>{net.name}</span>
          <span className="text-white/25">•</span>
          <span className="text-white/45">{a.kind}</span>
        </div>
        <h3 className={`mt-2.5 font-serif font-semibold leading-snug text-white transition-colors group-hover:text-amber-100 ${large ? "text-2xl sm:text-3xl" : "line-clamp-2 text-lg"}`}>
          {a.title}
        </h3>
        <p className={`mt-2.5 text-sm leading-relaxed text-white/50 ${large ? "sm:text-base" : "line-clamp-2"}`}>{a.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-5 text-xs text-white/40">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {minutes} min read
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
            Read guide
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** بيانات منظّمة JSON-LD (آمنة من حقن </script>) */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
