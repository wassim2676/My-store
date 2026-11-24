import { contentMetadata } from "@/components/site/StaticPage";
import LegalPage from "@/components/site/LegalPage";

export const generateMetadata = () => contentMetadata("acceptableUse");

export default function Page() {
  return <LegalPage docKey="acceptableUse" />;
}
