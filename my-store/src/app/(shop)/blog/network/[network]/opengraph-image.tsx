import { NETWORKS, articlesByNetwork, type NetworkSlug } from "@/content/blog";
import { blogNetworkImage } from "@/lib/og-blog";

export const revalidate = 86400;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Primeshelf affiliate network guides";
export const dynamicParams = false;
export const generateStaticParams = () => NETWORKS.map((n) => ({ network: n.slug }));

export default async function Image({ params }: { params: Promise<{ network: string }> }) {
  const { network } = await params;
  return blogNetworkImage(network as NetworkSlug, articlesByNetwork(network as NetworkSlug).length);
}
