import StaticPage, { contentMetadata } from "@/components/site/StaticPage";

export const generateMetadata = () => contentMetadata("about");

export default function Page() {
  return <StaticPage pageKey="about" />;
}
