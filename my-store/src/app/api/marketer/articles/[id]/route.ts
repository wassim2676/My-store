import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { toSlug } from "@/lib/landing";
import { articleSchema } from "@/lib/articles";
import { serializeArticle, uniqueArticleSlug } from "@/lib/articles-server";

type Ctx = { params: Promise<{ id: string }> };

// تبديل سريع للحالة من القائمة (نشر / مسودة)
const quickSchema = z.object({ status: z.enum(["DRAFT", "PUBLISHED"]) });

async function loadOwned(id: string) {
  const ctx = await getMarketerSession();
  if (!ctx?.landingPage) return { error: NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 }) };
  const article = await prisma.article.findFirst({ where: { id, landingPageId: ctx.landingPage.id } });
  if (!article) return { error: NextResponse.json({ success: false, error: "not_found" }, { status: 404 }) };
  return { page: ctx.landingPage, article };
}

const refresh = (pageSlug: string, articleSlug: string) => {
  revalidatePath(`/${pageSlug}`);
  revalidatePath(`/${pageSlug}/articles`);
  revalidatePath(`/${pageSlug}/articles/${articleSlug}`);
};

// ==================== 🟡 PATCH: تعديل المقال (أو تبديل الحالة فقط) ====================
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const res = await loadOwned(id);
  if (res.error) return res.error;
  const { page, article } = res;
  const body = await request.json().catch(() => ({}));

  const quick = quickSchema.safeParse(body);
  if (quick.success && Object.keys(body).length === 1) {
    const updated = await prisma.article.update({
      where: { id },
      data: { status: quick.data.status, publishedAt: quick.data.status === "PUBLISHED" ? (article.publishedAt ?? new Date()) : article.publishedAt },
    });
    refresh(page.slug, updated.slug);
    return NextResponse.json({ success: true, data: serializeArticle(updated) });
  }

  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "invalid", field: parsed.error.issues[0]?.path[0] }, { status: 400 });
  const d = parsed.data;
  const wanted = d.slug || toSlug(d.title, 110);
  const slug = wanted === article.slug ? article.slug : await uniqueArticleSlug(page.id, wanted, id);

  const updated = await prisma.article.update({
    where: { id },
    data: {
      slug,
      title: d.title,
      excerpt: d.excerpt,
      content: d.content,
      coverImage: d.coverImage,
      category: d.category,
      status: d.status,
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      // تاريخ النشر الأول يبقى ثابتاً (مهم لمحركات البحث)
      publishedAt: d.status === "PUBLISHED" ? (article.publishedAt ?? new Date()) : article.publishedAt,
    },
  });
  refresh(page.slug, article.slug);
  if (slug !== article.slug) refresh(page.slug, slug);
  return NextResponse.json({ success: true, data: serializeArticle(updated) });
}

// ==================== 🔴 DELETE ====================
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const res = await loadOwned(id);
  if (res.error) return res.error;
  await prisma.article.delete({ where: { id } });
  refresh(res.page.slug, res.article.slug);
  return NextResponse.json({ success: true });
}
