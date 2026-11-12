import StaticPage, { contentMetadata } from "@/components/site/StaticPage";

export const generateMetadata = () => contentMetadata("cookies");

export default function Page() {
  return <StaticPage pageKey="cookies" />;
}
