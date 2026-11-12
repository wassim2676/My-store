import StaticPage, { contentMetadata } from "@/components/site/StaticPage";

export const generateMetadata = () => contentMetadata("disclosure");

export default function Page() {
  return <StaticPage pageKey="disclosure" />;
}
