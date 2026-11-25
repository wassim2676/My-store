import { blogGenericImage } from "@/lib/og-blog";

export const revalidate = 86400;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Primeshelf Affiliate Academy";

export default async function Image() {
  return blogGenericImage("Affiliate marketing guides for every major network");
}
