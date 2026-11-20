import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPublicLandingPage } from "@/lib/public-page";
import { publicT } from "@/lib/landing";
import { SITE_URL } from "@/lib/site";
import { articleSummary } from "@/lib/articles-server";
import LandingShell from "@/components/landing/LandingShell";
import { LandingNavbar } from "@/components/landing/Storefront";
import ArticleCard from "@/components/landing/ArticleCard";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const data = await getPublicLandingPage(slug);
  if (!data) return null;
  const articles = await prisma.article.findMany({
    where: { landingPageId: data.page.id, ...(data.isOwner ? {} : { status: "PUBLISHED" }) },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 120,
  });
  return { ...data, articles };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: "Not found" };
  const { page } = data;
  const title = `${publicT(page.language, "articles")} — ${page.title}`;
  const description = publicT(page.language, "articlesIntro", { name: page.title });
  return {
    title,
    description,
    alternates: { canonical: `/${page.slug}/articles` },
    robots: page.isPublished ? undefined : { index: false, follow: false },
    openGraph: { title, description, type: "website" },
  };
}

// ==================== 📚 مدونة صفحة المسوّق: كل المقالات ====================
export default async function ArticlesIndex({ params }: Props) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { page, offers, isOwner, articles } = data;
  const lang = page.language;

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: page.title, item: `${SITE_URL}/${page.slug}` },
      { "@type": "ListItem", position: 2, name: publicT(lang, "articles"), item: `${SITE_URL}/${page.slug}/articles` },
    ],
  };

  return (
    <LandingShell page={page} isOwner={isOwner} hiddenNotice={!page.isPublished}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} />
      <LandingNavbar
        mode="link"
        page={{ slug: page.slug, title: page.title, avatarUrl: page.avatarUrl, language: lang }}
        categories={Array.from(new Set(offers.map((o) => o.category).filter((c): c is string => !!c)))}
      />

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link href={`/${page.slug}`} className="inline-flex items-center gap-2 text-sm text-[var(--lp-muted)] hover:text-[var(--lp-text)]">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {publicT(lang, "backTo", { name: page.title })}
        </Link>

        <header className="mt-8 max-w-2xl">
          <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">{publicT(lang, "articles")}</h1>
          <p className="mt-3 text-lg text-[var(--lp-muted)]">{publicT(lang, "articlesIntro", { name: page.title })}</p>
        </header>

        {articles.length === 0 ? (
          <p className="mt-16 rounded-[var(--lp-radius-lg)] border border-dashed border-[var(--lp-border)] py-20 text-center text-[var(--lp-muted)]">
            {publicT(lang, "noArticles")}
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={articleSummary(a)} pageSlug={page.slug} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </LandingShell>
  );
}
