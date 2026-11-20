import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { toSlug } from "@/lib/landing";
import { articleSchema } from "@/lib/articles";
import { serializeArticle, uniqueArticleSlug } from "@/lib/articles-server";

const MAX_ARTICLES = 1000;

// ==================== 🟢 GET: مقالات المسوّق ====================
export async function GET() {
  const ctx = await getMarketerSession();
  if (!ctx) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  if (!ctx.landingPage) return NextResponse.json({ success: true, data: [] });
  const articles = await prisma.article.findMany({ where: { landingPageId: ctx.landingPage.id }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ success: true, data: articles.map(serializeArticle) });
}

// ==================== 🟢 POST: مقال جديد ====================
// الأخطاء رموز (invalid / limit / no_page) تترجمها الواجهة
export async function POST(request: NextRequest) {
  const ctx = await getMarketerSession();
  if (!ctx) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  if (!ctx.landingPage) return NextResponse.json({ success: false, error: "no_page" }, { status: 400 });
  const page = ctx.landingPage;

  if ((await prisma.article.count({ where: { landingPageId: page.id } })) >= MAX_ARTICLES)
    return NextResponse.json({ success: false, error: "limit" }, { status: 400 });

  const parsed = articleSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ success: false, error: "invalid", field: parsed.error.issues[0]?.path[0] }, { status: 400 });
  const d = parsed.data;

  const article = await prisma.article.create({
    data: {
      landingPageId: page.id,
      slug: await uniqueArticleSlug(page.id, d.slug || toSlug(d.title, 110)),
      title: d.title,
      excerpt: d.excerpt,
      content: d.content,
      coverImage: d.coverImage,
      category: d.category,
      status: d.status,
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      publishedAt: d.status === "PUBLISHED" ? new Date() : null,
    },
  });
  revalidatePath(`/${page.slug}`);
  revalidatePath(`/${page.slug}/articles`);
  return NextResponse.json({ success: true, data: serializeArticle(article) }, { status: 201 });
}
