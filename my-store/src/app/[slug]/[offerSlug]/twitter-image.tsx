import { offerImage } from "@/lib/og-cards";

// 🐦 نفس صورة المعاينة لبطاقات X/Twitter
export const revalidate = 3600;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string; offerSlug: string }> }) {
  const p = await params;
  return offerImage(p.slug, p.offerSlug);
}
