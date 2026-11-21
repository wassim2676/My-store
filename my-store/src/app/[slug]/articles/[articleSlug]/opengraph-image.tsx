import { articleImage } from "@/lib/og-cards";

// 🖼️ صورة المعاينة عند مشاركة الرابط (فيسبوك، واتساب، X، تيليغرام...) — تُخزَّن مؤقتاً وتتحدّث كل ساعة
export const revalidate = 3600;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string; articleSlug: string }> }) {
  const p = await params;
  return articleImage(p.slug, p.articleSlug);
}
