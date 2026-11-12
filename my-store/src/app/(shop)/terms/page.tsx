import StaticPage, { contentMetadata } from "@/components/site/StaticPage";

export const generateMetadata = () => contentMetadata("terms");

export default function Page() {
  return <StaticPage pageKey="terms" />;
}
