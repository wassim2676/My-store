import { prisma } from "@/lib/prisma";
import { getMarketerSession, serializeLandingPage, serializeOffer } from "@/lib/marketer";
import PageSettingsForm from "@/components/dashboard/PageSettingsForm";

export default async function PageSettingsPage() {
  const ctx = await getMarketerSession();
  const page = ctx!.landingPage!;
  // عروض حقيقية للمعاينة الحية (حتى 4)
  const offers = await prisma.offer.findMany({
    where: { landingPageId: page.id, status: { not: "ARCHIVED" } },
    include: { brand: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    take: 4,
  });
  return <PageSettingsForm initial={serializeLandingPage(page)} sampleOffers={offers.map(serializeOffer)} />;
}
