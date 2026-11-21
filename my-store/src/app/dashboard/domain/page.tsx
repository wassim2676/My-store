import { getMarketerSession } from "@/lib/marketer";
import { domainsEnabled } from "@/lib/vercel-domains";
import { parseIntegrations } from "@/lib/integrations";
import { SITE_URL } from "@/lib/site";
import DomainManager from "@/components/dashboard/DomainManager";
import VerificationTags from "@/components/dashboard/VerificationTags";

// ==================== 🌐 الدومين الخاص + وسوم التحقق ====================
export default async function DomainPage() {
  const ctx = await getMarketerSession();
  const page = ctx!.landingPage!;
  const live = page.customDomain && page.customDomainVerifiedAt ? `https://${page.customDomain}` : null;
  return (
    <>
      <DomainManager
        enabled={domainsEnabled()}
        initialDomain={page.customDomain}
        initialActive={!!page.customDomainVerifiedAt}
        platformUrl={`${SITE_URL}/${page.slug}`}
      />
      <VerificationTags initial={parseIntegrations(page.integrations).verify} liveUrl={live} />
    </>
  );
}
