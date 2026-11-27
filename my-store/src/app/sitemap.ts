import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { ARTICLES, NETWORKS } from "@/content/blog";

// 🗺️ خريطة الموقع: الصفحات العامة + صفحات المسوّقين المنشورة + عروضهم + مقالاتهم (تُحدَّث كل ساعة)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const core = ["", "/features", "/blog", "/stores", "/guide", "/help", "/faq", "/about", "/contact"].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : p === "/blog" ? 0.9 : 0.6,
  }));
  const legal = ["/terms", "/privacy", "/cookies", "/affiliate-disclosure", "/acceptable-use"].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));
  // 📰 المدونة: صفحات الشبكات + المقالات (محتوى ثابت)
  const hubs = NETWORKS.map((n) => ({ url: `${SITE_URL}/blog/network/${n.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }));
  const articles = ARTICLES.map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: new Date(`${a.updated ?? a.published}T12:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: 0.8,
    images: [`${SITE_URL}/blog/${a.slug}/cover.png`],
  }));
  const statics = [...core, ...hubs, ...articles, ...legal];

  try {
    const pages = await prisma.landingPage.findMany({
      // صفحات الدومين الخاص الفعّال لها خريطتها على دومينها (mydeals.com/sitemap.xml)
      where: { isPublished: true, user: { isActive: true }, customDomainVerifiedAt: null },
      select: {
        slug: true,
        updatedAt: true,
        offers: { where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } },
        articles: { where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } },
      },
      take: 5000,
    });
    // مقالات المنصة من لوحة الإدارة (إن وُجدت)
    const posts = await prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true }, take: 1000 });
    const staticSlugs = new Set(ARTICLES.map((a) => a.slug));
    const postUrls = posts.filter((p) => !staticSlugs.has(p.slug)).map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 }));
    const dynamic = pages.flatMap((p) => [
      { url: `${SITE_URL}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "daily" as const, priority: 0.8 },
      ...p.offers.map((o) => ({ url: `${SITE_URL}/${p.slug}/${o.slug}`, lastModified: o.updatedAt, priority: 0.6 })),
      ...(p.articles.length ? [{ url: `${SITE_URL}/${p.slug}/articles`, lastModified: p.updatedAt, priority: 0.6 }] : []),
      ...p.articles.map((a) => ({ url: `${SITE_URL}/${p.slug}/articles/${a.slug}`, lastModified: a.updatedAt, priority: 0.7 })),
    ]);
    return [...statics, ...postUrls, ...dynamic];
  } catch (err) {
    console.error("[SITEMAP_ERROR]", err);
    return statics;
  }
}
