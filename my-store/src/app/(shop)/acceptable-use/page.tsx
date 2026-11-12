import StaticPage, { contentMetadata } from "@/components/site/StaticPage";

export const generateMetadata = () => contentMetadata("acceptableUse");

export default function Page() {
  return <StaticPage pageKey="acceptableUse" />;
}
