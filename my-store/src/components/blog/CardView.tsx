/* eslint-disable @next/next/no-img-element -- الغلاف صورة مولَّدة ثابتة (PNG) ولا تحتاج تحسين next/image */
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";

// ==================== 🃏 بطاقة مقال خفيفة (بدون استيراد المحتوى — آمنة للمتصفح) ====================
export const coverUrl = (slug: string) => `/blog/${slug}/cover.png`;

/** بيانات البطاقة الخفيفة (بدون نص المقال) — صالحة للمكوّنات التفاعلية في المتصفح */
export type CardData = { slug: string; title: string; excerpt: string; kind: string; network: string; networkName: string; accent: string; minutes: number; published: string };

export function CardView({ c: a, large = false }: { c: CardData; large?: boolean }) {
  const accent = a.accent;
  const minutes = a.minutes;
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
          <span style={{ color: accent }}>{a.networkName}</span>
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

