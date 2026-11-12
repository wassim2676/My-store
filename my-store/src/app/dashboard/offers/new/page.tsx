import { parseDesign } from "@/lib/landing";
import { getMarketerSession } from "@/lib/marketer";
import { getActiveBrands } from "@/lib/brands";
import OfferForm from "@/components/dashboard/OfferForm";

export default async function NewOfferPage() {
  const ctx = await getMarketerSession();
  const page = ctx!.landingPage!;
  const brands = await getActiveBrands();
  return <OfferForm brands={brands} page={{ slug: page.slug, theme: page.theme, accentColor: page.accentColor, language: page.language, design: parseDesign(page.design) }} />;
}
