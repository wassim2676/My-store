import { prisma } from "@/lib/prisma";
import { parseDesign } from "@/lib/landing";
import { serializeOffer } from "@/lib/marketer";
import type { LandingPage } from "@prisma/client";

/** بيانات المحرر: معلومات الصفحة (للمعاينة بنفس التصميم) + العروض المنشورة (للتضمين) */
export async function editorData(page: LandingPage) {
  const offers = await prisma.offer.findMany({
    where: { landingPageId: page.id, status: "PUBLISHED" },
    include: { brand: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
  return {
    page: { slug: page.slug, title: page.title, theme: page.theme, accentColor: page.accentColor, language: page.language, design: parseDesign(page.design) },
    offers: offers.map(serializeOffer),
  };
}
