import { parseDesign } from "@/lib/landing";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMarketerSession, serializeOffer } from "@/lib/marketer";
import { getActiveBrands } from "@/lib/brands";
import OfferForm from "@/components/dashboard/OfferForm";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getMarketerSession();
  const page = ctx!.landingPage!;
  const [offer, brands] = await Promise.all([
    prisma.offer.findFirst({ where: { id, landingPageId: page.id }, include: { brand: true } }),
    getActiveBrands(),
  ]);
  if (!offer) notFound();

  // إن كان المتجر المرتبط معطّلاً لاحقاً من الأدمن نعرضه رغم ذلك حتى لا يضيع الاختيار
  if (offer.brand && !brands.some((b) => b.id === offer.brand!.id)) {
    const { id: bid, name, logoSvg, logoUrl, accentColor } = offer.brand;
    brands.push({ id: bid, name, logoSvg, logoUrl, accentColor });
  }

  return (
    <OfferForm
      key={offer.id}
      brands={brands}
      offer={serializeOffer(offer)}
      page={{ slug: page.slug, theme: page.theme, accentColor: page.accentColor, language: page.language, design: parseDesign(page.design) }}
    />
  );
}
