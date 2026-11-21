/* eslint-disable @next/next/no-img-element -- صور المقالات من الرفع الداخلي أو روابط خارجية */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { after } from "next/server";
import { ChevronRight, Clock, ListTree } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPublicLandingPage } from "@/lib/public-page";
import { isCountableRequest } from "@/lib/marketer";
import { publicT } from "@/lib/landing";
import { SITE_URL } from "@/lib/site";
import { pageAbsoluteUrl, pageLinks } from "@/lib/page-urls";
import { autoExcerpt, parseArticle } from "@/lib/articles";
import { articleSummary, publishedArticles } from "@/lib/articles-server";
import LandingShell from "@/components/landing/LandingShell";
import { LandingNavbar } from "@/components/landing/Storefront";
import ArticleBody from "@/components/landing/ArticleBody";
import ArticleCard from "@/components/landing/ArticleCard";
import AdSlot, { AdSenseScript } from "@/components/landing/AdSlot";
import type { OfferCardData } from "@/components/landing/OfferCard";

type Props = { params: Promise<{ slug: string; articleSlug: string }> };

async function load(slug: string, articleSlug: string) {
  const data = await getPublicLandingPage(slug);
  if (!data) return null;
  const article = await prisma.article.findUnique({
    where: { landingPageId_slug: { landingPageId: data.page.id, slug: articleSlug.toLowerCase() } },
  });
  if (!article || (article.status !== "PUBLISHED" && !data.isOwner)) return null;
  return { ...data, article };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, articleSlug } = await params;
  const data = await load(slug, articleSlug);
  if (!data) return { title: "Not found" };
  const { page, article } = data;
  const description = article.seoDescription || article.excerpt || autoExcerpt(article.content, 160);
  return {
    title: article.seoTitle || `${article.title} — ${page.title}`,
    description,
    alternates: { canonical: pageAbsoluteUrl(page, `/articles/${article.slug}`) },
    robots: article.status === "PUBLISHED" && page.isPublished ? undefined : { index: false, follow: false },
    authors: [{ name: page.title, url: pageAbsoluteUrl(page) }],
    openGraph: {
      type: "article",
      title: article.seoTitle || article.title,
      description, // الصورة من opengraph-image.tsx
      publishedTime: (article.publishedAt ?? article.createdAt).toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      section: article.category ?? undefined,
    },
    twitter: { card: "summary_large_image", title: article.title, description },
  };
}

const fmt = (d: Date, lang: string) => new Intl.DateTimeFormat(lang, { dateStyle: "long" }).format(d);

// ==================== 📰 صفحة مقال (تحريرية، صديقة لـ Google وAdSense) ====================
export default async function ArticlePage({ params }: Props) {
  const { slug, articleSlug } = await params;
  const data = await load(slug, articleSlug);
  if (!data) notFound();
  const { page, offers, isOwner, article } = data;
  const lang = page.language;
  const { base, abs } = await pageLinks(page, { sub: `/articles/${article.slug}`, isOwner });

  const h = await headers();
  if (!isOwner && article.status === "PUBLISHED" && isCountableRequest(h)) {
    after(async () => {
      try {
        await prisma.article.update({ where: { id: article.id }, data: { views: { increment: 1 } } });
      } catch (err) {
        console.error("[ARTICLE_VIEW_TRACK_ERROR]", err);
      }
    });
  }

  const blocks = parseArticle(article.content);
  const toc = blocks.flatMap((b) => (b.t === "h2" ? [{ id: b.id, text: b.text.replace(/\*\*|\*|`/g, "") }] : []));
  const offersBySlug: Record<string, OfferCardData> = Object.fromEntries(
    offers.filter((o) => o.status === "PUBLISHED").map((o) => [o.slug, o as OfferCardData]),
  );
  const more = (await publishedArticles(page.id, 4)).filter((a) => a.id !== article.id).slice(0, 3).map(articleSummary);
  const summary = articleSummary(article);
  const published = article.publishedAt ?? article.createdAt;
  const updatedLater = article.updatedAt.getTime() - published.getTime() > 24 * 3600 * 1000;
  const url = abs(`/articles/${article.slug}`);

  // 🔍 بيانات منظّمة: مقال + مسار التنقل
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title.slice(0, 110),
      description: summary.excerpt,
      image: article.coverImage ? [article.coverImage.startsWith("/") ? SITE_URL + article.coverImage : article.coverImage] : undefined,
      datePublished: published.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      author: { "@type": "Person", name: page.title, url: abs() },
      publisher: { "@type": "Organization", name: page.title, url: abs() },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      articleSection: article.category ?? undefined,
      inLanguage: lang,
      wordCount: article.content.split(/\s+/).filter(Boolean).length,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: page.title, item: abs() },
        { "@type": "ListItem", position: 2, name: publicT(lang, "articles"), item: abs("/articles") },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];

  return (
    <LandingShell page={page} isOwner={isOwner} hiddenNotice={!page.isPublished || article.status !== "PUBLISHED"}>
      <AdSenseScript />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <LandingNavbar
        mode="link"
        page={{ slug: page.slug, title: page.title, avatarUrl: page.avatarUrl, language: lang, base }}
        categories={Array.from(new Set(offers.map((o) => o.category).filter((c): c is string => !!c)))}
      />

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* 🧭 مسار التنقل */}
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--lp-muted)]">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href={base || "/"} className="hover:text-[var(--lp-text)]">{page.title}</Link></li>
            <li aria-hidden><ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" /></li>
            <li><Link href={`${base}/articles`} className="hover:text-[var(--lp-text)]">{publicT(lang, "articles")}</Link></li>
            <li aria-hidden><ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" /></li>
            <li className="max-w-[16rem] truncate text-[var(--lp-text)]" aria-current="page">{article.title}</li>
          </ol>
        </nav>

        <article className="mt-8">
          {/* 📰 رأس المقال */}
          <header className="mx-auto max-w-3xl text-center">
            {article.category && (
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lp-accent-ink)]">{article.category}</span>
            )}
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-[1.15] sm:text-5xl">{article.title}</h1>
            {article.excerpt && <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[var(--lp-muted)] sm:text-xl">{article.excerpt}</p>}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[var(--lp-muted)]">
              <Link href={base || "/"} className="flex items-center gap-2 font-medium text-[var(--lp-text)] hover:text-[var(--lp-accent-ink)]">
                {page.avatarUrl ? (
                  <img src={page.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--lp-accent)] text-xs font-semibold text-[var(--lp-accent-fg)]">
                    {page.title.charAt(0).toUpperCase()}
                  </span>
                )}
                {publicT(lang, "byAuthor", { name: page.title })}
              </Link>
              <span aria-hidden>·</span>
              <time dateTime={published.toISOString()}>{publicT(lang, "publishedOn", { date: fmt(published, lang) })}</time>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {publicT(lang, "minRead", { n: String(summary.readingMinutes) })}
              </span>
            </div>
          </header>

          {article.coverImage && (
            <figure className="mx-auto mt-10 max-w-5xl">
              <img src={article.coverImage} alt={article.title} className="aspect-[16/9] w-full rounded-[var(--lp-radius-lg)] border border-[var(--lp-border)] object-cover" />
            </figure>
          )}

          <AdSlot slot="top" className="mx-auto max-w-3xl" />

          {/* 📖 المحتوى + الفهرس */}
          <div className={`mx-auto mt-10 grid gap-12 ${toc.length >= 3 ? "max-w-6xl lg:grid-cols-[minmax(0,1fr)_240px]" : "max-w-3xl"}`}>
            <div className="min-w-0 max-w-3xl">
              {toc.length >= 3 && (
                <details className="mb-8 rounded-[var(--lp-radius-md)] border border-[var(--lp-border)] bg-[var(--lp-surface)] p-4 lg:hidden">
                  <summary className="flex cursor-pointer items-center gap-2 font-semibold">
                    <ListTree className="h-4 w-4 text-[var(--lp-accent-ink)]" />
                    {publicT(lang, "inThisArticle")}
                  </summary>
                  <ol className="mt-3 space-y-2 ps-6 text-sm">
                    {toc.map((t) => (
                      <li key={t.id}><a href={`#${t.id}`} className="text-[var(--lp-muted)] hover:text-[var(--lp-text)]">{t.text}</a></li>
                    ))}
                  </ol>
                </details>
              )}

              <ArticleBody blocks={blocks} offers={offersBySlug} base={base} lang={lang} withAds />

              {updatedLater && (
                <p className="mt-10 text-sm text-[var(--lp-muted)]">
                  <time dateTime={article.updatedAt.toISOString()}>{publicT(lang, "updatedOn", { date: fmt(article.updatedAt, lang) })}</time>
                </p>
              )}

              <AdSlot slot="bottom" />

              {/* ✍️ صندوق الكاتب */}
              <aside className="mt-12 flex gap-4 rounded-[var(--lp-radius-lg)] border border-[var(--lp-border)] bg-[var(--lp-surface)] p-6">
                {page.avatarUrl ? (
                  <img src={page.avatarUrl} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--lp-accent)] font-serif text-xl font-semibold text-[var(--lp-accent-fg)]">
                    {page.title.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-serif text-lg font-semibold">{page.title}</p>
                  {(page.tagline || page.bio) && <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[var(--lp-muted)]">{page.tagline || page.bio}</p>}
                  <Link href={base || "/"} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--lp-accent-ink)] hover:underline">
                    {publicT(lang, "backTo", { name: page.title })}
                  </Link>
                </div>
              </aside>
            </div>

            {toc.length >= 3 && (
              <nav aria-label={publicT(lang, "inThisArticle")} className="hidden lg:block">
                <div className="sticky top-28">
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lp-muted)]">
                    <ListTree className="h-4 w-4" />
                    {publicT(lang, "inThisArticle")}
                  </p>
                  <ol className="space-y-2.5 border-s border-[var(--lp-border)] ps-4 text-sm">
                    {toc.map((t) => (
                      <li key={t.id}><a href={`#${t.id}`} className="text-[var(--lp-muted)] transition-colors hover:text-[var(--lp-text)]">{t.text}</a></li>
                    ))}
                  </ol>
                </div>
              </nav>
            )}
          </div>
        </article>

        {more.length > 0 && (
          <section className="mt-20" aria-labelledby="more-articles">
            <h2 id="more-articles" className="mb-6 font-serif text-2xl font-semibold">{publicT(lang, "moreArticles")}</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((a) => (
                <ArticleCard key={a.slug} article={a} base={base} lang={lang} />
              ))}
            </div>
          </section>
        )}
      </div>
    </LandingShell>
  );
}
