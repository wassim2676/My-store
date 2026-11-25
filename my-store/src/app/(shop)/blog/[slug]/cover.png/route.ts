import { ARTICLES, getArticle, readingTime } from "@/content/blog";
import { blogArticleImage, blogGenericImage } from "@/lib/og-blog";
import { prisma } from "@/lib/prisma";

// 🖼️ غلاف المقال برابط ثابت /blog/{slug}/cover.png — يظهر داخل الموقع وكصورة مشاركة (Open Graph/X)
// يُبنى مسبقاً لكل مقالات الشبكات، ومقالات قاعدة البيانات تُولَّد عند الطلب
export const revalidate = 86400;
export const generateStaticParams = () => ARTICLES.map((a) => ({ slug: a.slug }));

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (a) return blogArticleImage({ title: a.title, kind: a.kind, network: a.network, minutes: readingTime(a).minutes });
  const post = await prisma.post.findUnique({ where: { slug }, select: { title: true, category: true, status: true } }).catch(() => null);
  if (!post || post.status !== "PUBLISHED") return new Response("Not found", { status: 404 });
  return blogGenericImage(post.title, post.category ?? undefined);
}
