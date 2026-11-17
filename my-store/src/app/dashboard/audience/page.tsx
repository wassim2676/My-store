import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { parseAudience, visitorCountry } from "@/lib/traffic";
import AudienceForm from "@/components/dashboard/AudienceForm";

// ==================== 🛡️ الجمهور وحماية الروابط ====================
export default async function AudiencePage() {
  const ctx = await getMarketerSession();
  const page = ctx!.landingPage!;

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 29);

  const [stats, h] = await Promise.all([
    prisma.landingPageDailyStat.aggregate({
      where: { landingPageId: page.id, date: { gte: since } },
      _sum: { clicks: true, botHits: true, geoBlocked: true },
    }),
    headers(),
  ]);

  return (
    <AudienceForm
      initial={parseAudience(page.audience)}
      stats={{ clicks: stats._sum.clicks ?? 0, bots: stats._sum.botHits ?? 0, geo: stats._sum.geoBlocked ?? 0 }}
      myCountry={visitorCountry(h)}
    />
  );
}
