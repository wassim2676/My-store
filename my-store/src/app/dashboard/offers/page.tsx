import { prisma } from "@/lib/prisma";
import { getMarketerSession, serializeOffer } from "@/lib/marketer";
import OffersManager from "@/components/dashboard/OffersManager";

export default async function OffersPage() {
  const ctx = await getMarketerSession();
  const page = ctx!.landingPage!;
  const offers = await prisma.offer.findMany({
    where: { landingPageId: page.id },
    include: { brand: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
  return <OffersManager initialOffers={offers.map(serializeOffer)} pageSlug={page.slug} />;
}
