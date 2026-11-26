import { NETWORK_BY_SLUG, readingTime, type BlogArticle } from "@/content/blog";
import { ensureContrast } from "@/lib/landing";
import { CardView, coverUrl, type CardData } from "./CardView";

export { CardView, coverUrl, type CardData };

export const BLOG_BG = "#07090D";
/** لون الشبكة مضبوط ليبقى مقروءاً على الخلفية الداكنة */
export const readableAccent = (hex: string) => ensureContrast(hex, [BLOG_BG], 4.5);


export const formatDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export function toCard(a: BlogArticle): CardData {
  const net = NETWORK_BY_SLUG[a.network];
  return { slug: a.slug, title: a.title, excerpt: a.excerpt, kind: a.kind, network: a.network, networkName: net.name, accent: readableAccent(net.color), minutes: readingTime(a).minutes, published: a.published };
}

export default function ArticleCard({ a, large = false }: { a: BlogArticle; large?: boolean }) {
  return <CardView c={toCard(a)} large={large} />;
}

/** بيانات منظّمة JSON-LD (آمنة من حقن </script>) */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
