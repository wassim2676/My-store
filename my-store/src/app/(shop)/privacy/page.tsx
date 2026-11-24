import { contentMetadata } from "@/components/site/StaticPage";
import LegalPage from "@/components/site/LegalPage";

export const generateMetadata = () => contentMetadata("privacy");

export default function Page() {
  return <LegalPage docKey="privacy" />;
}
