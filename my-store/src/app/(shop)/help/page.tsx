import StaticPage, { contentMetadata } from "@/components/site/StaticPage";

export const generateMetadata = () => contentMetadata("help");

export default function Page() {
  return <StaticPage pageKey="help" />;
}
