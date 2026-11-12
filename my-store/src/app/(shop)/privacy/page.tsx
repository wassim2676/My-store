import StaticPage, { contentMetadata } from "@/components/site/StaticPage";

export const generateMetadata = () => contentMetadata("privacy");

export default function Page() {
  return <StaticPage pageKey="privacy" />;
}
