import { contentMetadata } from "@/components/site/StaticPage";
import LegalPage from "@/components/site/LegalPage";

export const generateMetadata = () => contentMetadata("disclosure");

export default function Page() {
  return <LegalPage docKey="disclosure" />;
}
