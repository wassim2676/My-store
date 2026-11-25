/* eslint-disable @next/next/no-img-element -- الغلاف صورة مولَّدة ثابتة (PNG) */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronDown, ChevronRight, Clock, ListOrdered, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageFrame } from "@/components/site/StaticPage";
import Markdown, { parseMarkdown, tocOf } from "@/components/blog/Markdown";
import TocNav from "@/components/blog/TocNav";
import ArticleCard, { coverUrl, formatDate, JsonLd, readableAccent } from "@/components/blog/ArticleCard";
import { ARTICLES, NETWORK_BY_SLUG, getArticle, readingTime, relatedArticles } from "@/content/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// مقالات الشبكات تُبنى مسبقاً (HTML ثابت = أسرع أرشفة)، ومقالات قاعدة البيانات تُعرض عند الطلب
export const revalidate = 3600;
export const generateStaticParams = () => ARTICLES.map((a) => ({ slug: a.slug }));

type Props = { params: Promise<{ slug: string }> };

async function loadPost(slug: string) {
  try {
    const post = await prisma.post.findUnique({ where: { slug } });
    return post && post.status === "PUBLISHED" ? post : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (a) {
    const url = `/blog/${a.slug}`;
    return {
      title: a.seoTitle,
      description: a.description,
      keywords: a.keywords,
      alternates: { canonical: url },
      authors: [{ name: `${SITE_NAME} Editorial Team`, url: `${SITE_URL}/about` }],
      openGraph: {
        type: "article",
        title: a.title,
        description: a.description,
        url,
        publishedTime: a.published,
        modifiedTime: a.updated ?? a.published,
        section: NETWORK_BY_SLUG[a.network].name,
        tags: a.keywords,
        images: [{ url: `${url}/cover.png`, width: 1200, height: 630, alt: a.title }],
      },
      twitter: { card: "summary_large_image", title: a.title, description: a.description, images: [`${url}/cover.png`] },
    };
  }
  const post = await loadPost(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  const description = post.excerpt || post.content.slice(0, 155);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article", title: post.title, description, url: `/blog/${post.slug}`, publishedTime: post.publishedAt?.toISOString(),
      images: [{ url: post.coverImage || `/blog/${post.slug}/cover.png`, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description, images: [post.coverImage || `/blog/${post.slug}/cover.png`] },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return <DbPost slug={slug} />;

  const net = NETWORK_BY_SLUG[a.network];
  const accent = readableAccent(net.color);
  const blocks = parseMarkdown(a.body);
  const toc = tocOf(blocks);
  const guide = a.faq.length ? [...toc, { id: "faq", text: "Frequently asked questions" }] : toc;
  const { minutes, words } = readingTime(a);
  const related = relatedArticles(a, 6);
  const url = `${SITE_URL}/blog/${a.slug}`;

  return (
    <PageFrame>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: a.description,
            image: [`${url}/cover.png`],
            datePublished: a.published,
            dateModified: a.updated ?? a.published,
            wordCount: words,
            keywords: a.keywords.join(", "),
            articleSection: net.name,
            inLanguage: "en",
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            author: { "@type": "Organization", name: `${SITE_NAME} Editorial Team`, url: `${SITE_URL}/about` },
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/primeshelf-logo-email.png` } },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Blog", item: `${SITE_URL}/blog` },
              { "@type": "ListItem", position: 2, name: net.name, item: `${SITE_URL}/blog/network/${net.slug}` },
              { "@type": "ListItem", position: 3, name: a.title, item: url },
            ],
          },
          ...(a.faq.length
            ? [{
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
              }]
            : []),
        ]}
      />

      <article lang="en" className="relative">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[1000px] max-w-[170vw] -translate-x-1/2 rounded-full blur-[130px]" style={{ background: `${net.color}1f` }} />

        {/* ==================== 🎯 الرأس ==================== */}
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-14 px-4 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-8">
          {/* 🧭 الدليل الجانبي — بدون إطار، ثابت أثناء التمرير، يُبرز القسم الحالي */}
          {guide.length > 2 && (
            <aside className="hidden lg:row-span-2 lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8 pt-14 [scrollbar-width:thin]">
                <Link href={`/blog/network/${net.slug}`} className="mb-7 flex items-center gap-2.5 text-[13px] font-medium text-white/55 transition hover:text-white">
                  <span className="h-2 w-2 rounded-full" style={{ background: accent }} /> {net.program}
                </Link>
                <TocNav items={guide} accent={accent} />
              </div>
            </aside>
          )}
        <header className={`w-full max-w-[780px] pt-10 sm:pt-14 ${guide.length > 2 ? "lg:col-start-2" : "lg:col-span-2 lg:mx-auto"}`}>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-white/45">
            <Link href="/blog" className="transition hover:text-white">Blog</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/blog/network/${net.slug}`} className="transition hover:text-white">{net.name}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="line-clamp-1 text-white/70">{a.kind}</span>
          </nav>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ background: net.color, color: net.ink }}>{a.kind}</span>
            <Link href={`/blog/network/${net.slug}`} className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75 transition hover:border-white/30">
              {net.program}
            </Link>
          </div>

          <h1 className="mt-5 font-serif text-[34px] font-semibold leading-[1.12] tracking-tight sm:text-5xl">{a.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/60 sm:text-xl">{a.excerpt}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/45">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-300/15 text-amber-300"><Sparkles className="h-3.5 w-3.5" /></span>
              {SITE_NAME} Editorial Team
            </span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> <time dateTime={a.updated ?? a.published}>{formatDate(a.updated ?? a.published)}</time></span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {minutes} min read</span>
          </div>

          <figure className="mt-10 overflow-hidden rounded-3xl border border-white/[0.08] shadow-2xl shadow-black/40">
            <img src={coverUrl(a.slug)} alt={a.title} width={1200} height={630} fetchPriority="high" className="aspect-[1200/630] w-full object-cover" />
          </figure>
        </header>

        {/* ==================== 📄 المحتوى ==================== */}
          <div className={`w-full max-w-[780px] py-12 sm:py-16 ${guide.length > 2 ? "lg:col-start-2" : "lg:col-span-2 lg:mx-auto"}`}>
            {guide.length > 2 && (
              <details className="group mb-10 border-y border-white/[0.08] py-4 lg:hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                  <span className="inline-flex items-center gap-2"><ListOrdered className="h-4 w-4" style={{ color: accent }} /> In this guide</span>
                  <ChevronDown className="h-4 w-4 text-white/40 transition-transform group-open:rotate-180" />
                </summary>
                <ol className="mt-4 space-y-2.5 border-l border-white/[0.08] text-sm">
                  {guide.map((h) => <li key={h.id}><a href={`#${h.id}`} className="-ml-px block border-l-2 border-transparent pl-4 text-white/60 hover:text-white">{h.text}</a></li>)}
                </ol>
              </details>
            )}

            <Markdown blocks={blocks} accent={accent} />

            {/* ❓ الأسئلة الشائعة */}
            {a.faq.length > 0 && (
              <section className="mt-16" aria-labelledby="faq">
                <h2 id="faq" className="scroll-mt-28 font-serif text-[28px] font-semibold sm:text-[32px]">Frequently asked questions</h2>
                <div className="mt-6 divide-y divide-white/[0.07] rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                  {a.faq.map((f, i) => (
                    <details key={i} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden" open={i === 0}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
                        <h3 className="text-base">{f.q}</h3>
                        <ChevronDown className="h-4 w-4 shrink-0 text-white/40 transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="mt-3 leading-relaxed text-white/60">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* 🚀 دعوة للعمل */}
            <aside className="relative mt-16 overflow-hidden rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/[0.12] via-amber-300/[0.04] to-transparent p-8 sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">Put this guide to work</p>
              <h2 className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">Build a {net.name} landing page in minutes</h2>
              <p className="mt-3 max-w-xl text-white/60">
                {SITE_NAME} turns your affiliate links into a fast, beautiful page with reviews, collections, built-in disclosure and click analytics. Free to start.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-300">
                  Create your free page <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={`/blog/network/${net.slug}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30">
                  More {net.name} guides
                </Link>
              </div>
            </aside>

            <p className="mt-8 text-xs leading-relaxed text-white/35">
              Program terms, commission rates and policies change. Always confirm the latest details in each affiliate program&apos;s official documentation. {SITE_NAME} is not affiliated with or endorsed by {net.name}.
            </p>
          </div>

        </div>
      </article>

      {/* ==================== 🔗 مقالات ذات صلة ==================== */}
      <section className="border-t border-white/[0.06] bg-white/[0.012]" aria-labelledby="related">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="related" className="font-serif text-3xl font-semibold">Keep reading</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <ArticleCard key={r.slug} a={r} />)}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

// ==================== مقال من قاعدة البيانات (لوحة الإدارة) ====================
async function DbPost({ slug }: { slug: string }) {
  const post = await loadPost(slug);
  if (!post) notFound();
  prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {});
  return (
    <PageFrame>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <nav className="mb-8 flex items-center gap-1.5 text-sm text-white/45">
          <Link href="/blog" className="hover:text-white">Blog</Link> <ChevronRight className="h-3.5 w-3.5" /> <span className="line-clamp-1 text-white/70">{post.title}</span>
        </nav>
        {post.category && <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">{post.category}</span>}
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">{post.title}</h1>
        {post.publishedAt && <p className="mt-4 text-sm text-white/45">{post.authorName} · {post.publishedAt.toLocaleDateString("en-US")}</p>}
        <figure className="mt-8 overflow-hidden rounded-3xl border border-white/[0.07]">
          <img src={post.coverImage || coverUrl(post.slug)} alt={post.title} className="aspect-[1200/630] w-full object-cover" />
        </figure>
        <div className="mt-10 whitespace-pre-line text-[17px] leading-[1.85] text-white/70">{post.content}</div>
      </article>
    </PageFrame>
  );
}
