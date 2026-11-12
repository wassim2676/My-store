import StaticPage, { contentMetadata } from "@/components/site/StaticPage";

export const generateMetadata = () => contentMetadata("faq");

export default function Page() {
  return <StaticPage pageKey="faq" />;
}
