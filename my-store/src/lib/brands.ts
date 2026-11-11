import { prisma } from "@/lib/prisma";
import type { BrandOption } from "@/components/dashboard/OfferForm";

/** المنصات (Amazon/Walmart/Target...) المفعّلة التي يختار منها المسوّق */
export async function getActiveBrands(): Promise<BrandOption[]> {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, logoSvg: true, logoUrl: true, accentColor: true },
  });
}
