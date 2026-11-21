/* eslint-disable @next/next/no-img-element -- صور المقالات من الرفع الداخلي أو روابط خارجية */
import Link from "next/link";
import { ArrowUpRight, Clock, Newspaper } from "lucide-react";
import { publicT } from "@/lib/landing";
import type { ArticleSummary } from "@/lib/articles-server";

const fmtDate = (iso: string, lang: string) => new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(new Date(iso));

// ==================== 📰 بطاقة مقال (قائمة المقالات + أحدث المقالات في صفحة المسوّق) ====================
export default function ArticleCard({ article, base, lang }: { article: ArticleSummary; base: string; lang: string }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--lp-radius-lg)] border border-[var(--lp-border)] bg-[var(--lp-surface)] transition hover:-translate-y-0.5 hover:border-[var(--lp-border-strong)]">
      <Link href={`${base}/articles/${article.slug}`} className="block aspect-[16/9] overflow-hidden bg-[var(--lp-surface2)]" tabIndex={-1} aria-hidden>
        {article.coverImage ? (
          <img src={article.coverImage} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--lp-accent)_22%,transparent),transparent_70%)]">
            <Newspaper className="h-9 w-9 text-[var(--lp-accent-ink)] opacity-70" />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {article.category && (
          <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lp-accent-ink)]">{article.category}</span>
        )}
        <h3 className="font-serif text-lg font-semibold leading-snug">
          <Link href={`${base}/articles/${article.slug}`} className="hover:text-[var(--lp-accent-ink)]">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--lp-muted)]">{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-[var(--lp-muted)]">
          <span className="flex items-center gap-3">
            <time dateTime={article.publishedAt}>{fmtDate(article.publishedAt, lang)}</time>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {publicT(lang, "minRead", { n: String(article.readingMinutes) })}
            </span>
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--lp-accent-ink)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
        </div>
      </div>
    </article>
  );
}

/** قسم "أحدث المقالات" أسفل واجهة صفحة المسوّق */
export function LatestArticles({ articles, base, lang }: { articles: ArticleSummary[]; base: string; lang: string }) {
  if (!articles.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8" aria-labelledby="latest-articles">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 id="latest-articles" className="font-serif text-2xl font-semibold sm:text-3xl">{publicT(lang, "latestArticles")}</h2>
        <Link href={`${base}/articles`} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--lp-accent-ink)] hover:underline">
          {publicT(lang, "allArticles")}
          <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} base={base} lang={lang} />
        ))}
      </div>
    </section>
  );
}
