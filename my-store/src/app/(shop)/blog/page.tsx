/* eslint-disable @next/next/no-img-element -- أغلفة المقالات القديمة روابط خارجية */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageFrame } from "@/components/site/StaticPage";
import ArticleCard, { JsonLd, readableAccent } from "@/components/blog/ArticleCard";
import { ARTICLES, NETWORKS, articlesByNetwork } from "@/content/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// المقالات الثابتة تُبنى مسبقاً؛ مقالات قاعدة البيانات (إن وُجدت) تتحدّث كل ساعة
export const revalidate = 3600;

const TITLE = "Affiliate Marketing Blog: Guides for Every Major Network";
const DESCRIPTION =
  "In-depth affiliate marketing guides for Amazon, Walmart, Target, eBay, Best Buy, AliExpress, Etsy, Home Depot, Temu, Sephora and Wayfair — commissions, strategy and compliance.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/blog", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

async function dbPosts() {
  try {
    return await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { id: true, slug: true, title: true, excerpt: true, coverImage: true, category: true },
      take: 30,
    });
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await dbPosts();
  const [featured, ...rest] = ARTICLES;
  const latest = rest.slice(0, 6);

  return (
    <PageFrame>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${SITE_NAME} Affiliate Academy`,
          url: `${SITE_URL}/blog`,
          description: DESCRIPTION,
          publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          blogPost: ARTICLES.slice(0, 20).map((a) => ({ "@type": "BlogPosting", headline: a.title, url: `${SITE_URL}/blog/${a.slug}`, datePublished: a.published })),
        }}
      />

      {/* ==================== 🎯 الرأس ==================== */}
      <header className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[1100px] max-w-[180vw] -translate-x-1/2 rounded-full bg-amber-500/[0.10] blur-[130px]" />
        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-16 text-center sm:pt-20">
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-6xl">
            Grow your affiliate income, <span className="text-amber-300">one network at a time</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/55">
            Practical, in-depth guides for the eleven affiliate programs marketers use most: how to get approved, what each one pays, what to promote and how to stay compliant.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/45">
            <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-amber-300" /> {ARTICLES.length} guides</span>
            <span className="inline-flex items-center gap-2"><Layers className="h-4 w-4 text-amber-300" /> {NETWORKS.length} networks</span>
          </div>
        </div>

        {/* شرائح الشبكات */}
        <nav aria-label="Affiliate networks" className="relative mx-auto max-w-6xl px-4 pb-10">
          <ul className="flex flex-wrap justify-center gap-2.5">
            {NETWORKS.map((n) => (
              <li key={n.slug}>
                <Link
                  href={`/blog/network/${n.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: readableAccent(n.color) }} />
                  {n.name}
                  <span className="text-xs text-white/35">{articlesByNetwork(n.slug).length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        {/* ==================== ⭐ الأحدث ==================== */}
        <section aria-labelledby="latest">
          <h2 id="latest" className="sr-only">Latest guides</h2>
          <ArticleCard a={featured} large />
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((a) => <ArticleCard key={a.slug} a={a} />)}
          </div>
        </section>

        {/* ==================== 📝 مقالات المنصة (قاعدة البيانات) ==================== */}
        {posts.length > 0 && (
          <section className="mt-20" aria-labelledby="news">
            <h2 id="news" className="font-serif text-3xl font-semibold">From the {SITE_NAME} team</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="group overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] transition hover:-translate-y-1 hover:border-white/[0.16]">
                  <div className="relative aspect-[1200/630] bg-white/[0.04]">
                    <img src={p.coverImage || `/blog/${p.slug}/cover.png`} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <div className="p-6">
                    {p.category && <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">{p.category}</span>}
                    <h3 className="mt-2 line-clamp-2 font-serif text-lg font-semibold">{p.title}</h3>
                    {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-white/50">{p.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ==================== 🏬 حسب الشبكة ==================== */}
        {NETWORKS.map((n) => {
          const list = articlesByNetwork(n.slug);
          const accent = readableAccent(n.color);
          return (
            <section key={n.slug} className="mt-20" aria-labelledby={`net-${n.slug}`}>
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.07] pb-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>{n.program}</p>
                  <h2 id={`net-${n.slug}`} className="mt-1.5 font-serif text-2xl font-semibold sm:text-3xl">{n.name} affiliate guides</h2>
                </div>
                <Link href={`/blog/network/${n.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:text-white" style={{ color: accent }}>
                  All {n.name} guides <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {list.slice(0, 3).map((a) => <ArticleCard key={a.slug} a={a} />)}
              </div>
            </section>
          );
        })}
      </div>
    </PageFrame>
  );
}
