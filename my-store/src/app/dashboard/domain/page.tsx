import { getMarketerSession } from "@/lib/marketer";
import { domainsEnabled } from "@/lib/vercel-domains";
import { SITE_URL } from "@/lib/site";
import DomainManager from "@/components/dashboard/DomainManager";

// ==================== 🌐 الدومين الخاص ====================
export default async function DomainPage() {
  const ctx = await getMarketerSession();
  const page = ctx!.landingPage!;
  return (
    <DomainManager
      enabled={domainsEnabled()}
      initialDomain={page.customDomain}
      initialActive={!!page.customDomainVerifiedAt}
      platformUrl={`${SITE_URL}/${page.slug}`}
    />
  );
}
