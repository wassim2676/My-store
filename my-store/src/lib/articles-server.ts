import type { Article } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { autoExcerpt, readingMinutes } from "@/lib/articles";

// ==================== 📰 مقالات: أدوات الخادم ====================

export function serializeArticle(a: Article) {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    coverImage: a.coverImage,
    category: a.category,
    status: a.status as "DRAFT" | "PUBLISHED",
    seoTitle: a.seoTitle,
    seoDescription: a.seoDescription,
    views: a.views,
    readingMinutes: readingMinutes(a.content),
    publishedAt: a.publishedAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}
export type SerializedArticle = ReturnType<typeof serializeArticle>;

/** بطاقة مقال للقوائم العامة (بدون المحتوى الكامل) */
export function articleSummary(a: Article) {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt || autoExcerpt(a.content, 180),
    coverImage: a.coverImage,
    category: a.category,
    readingMinutes: readingMinutes(a.content),
    publishedAt: (a.publishedAt ?? a.createdAt).toISOString(),
  };
}
export type ArticleSummary = ReturnType<typeof articleSummary>;

/** رابط فريد للمقال داخل صفحة المسوّق */
export async function uniqueArticleSlug(landingPageId: string, base: string, excludeId?: string): Promise<string> {
  const root = (base || `article-${Date.now().toString(36)}`).slice(0, 110);
  let candidate = root;
  for (let i = 2; i < 50; i++) {
    const exists = await prisma.article.findFirst({
      where: { landingPageId, slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!exists) return candidate;
    candidate = `${root.slice(0, 105)}-${i}`;
  }
  return `${root.slice(0, 100)}-${Date.now().toString(36)}`;
}

/** مقالات منشورة لصفحة (الأحدث أولاً) */
export function publishedArticles(landingPageId: string, take?: number) {
  return prisma.article.findMany({
    where: { landingPageId, status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    ...(take ? { take } : {}),
  });
}
