import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

// 🗺️ خريطة الموقع: الصفحات العامة + صفحات المسوّقين المنشورة + عروضهم + مقالاتهم (تُحدَّث كل ساعة)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = ["", "/stores", "/blog", "/guide", "/help", "/faq", "/about", "/contact"].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.5,
  }));

  try {
    const pages = await prisma.landingPage.findMany({
      where: { isPublished: true, user: { isActive: true } },
      select: {
        slug: true,
        updatedAt: true,
        offers: { where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } },
        articles: { where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } },
      },
      take: 5000,
    });
    const dynamic = pages.flatMap((p) => [
      { url: `${SITE_URL}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "daily" as const, priority: 0.8 },
      ...p.offers.map((o) => ({ url: `${SITE_URL}/${p.slug}/${o.slug}`, lastModified: o.updatedAt, priority: 0.6 })),
      ...(p.articles.length ? [{ url: `${SITE_URL}/${p.slug}/articles`, lastModified: p.updatedAt, priority: 0.6 }] : []),
      ...p.articles.map((a) => ({ url: `${SITE_URL}/${p.slug}/articles/${a.slug}`, lastModified: a.updatedAt, priority: 0.7 })),
    ]);
    return [...statics, ...dynamic];
  } catch (err) {
    console.error("[SITEMAP_ERROR]", err);
    return statics;
  }
}
