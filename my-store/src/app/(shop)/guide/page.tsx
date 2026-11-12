import StaticPage, { contentMetadata } from "@/components/site/StaticPage";

export const generateMetadata = () => contentMetadata("guide");

export default function Page() {
  return <StaticPage pageKey="guide" />;
}
