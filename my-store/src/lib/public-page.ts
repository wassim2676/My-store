import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SLUG_PATTERN } from "@/lib/landing";
import { serializeOffer } from "@/lib/marketer";

// ==================== 📄 جلب صفحة هبوط عامة (مع معاينة المالك للصفحات/العروض المخفية) ====================
export const getPublicLandingPage = cache(async (slug: string) => {
  const normalized = slug.toLowerCase();
  if (!SLUG_PATTERN.test(normalized)) return null;

  const page = await prisma.landingPage.findUnique({
    where: { slug: normalized },
    include: {
      user: { select: { firstName: true, lastName: true, isActive: true } },
      offers: {
        where: { status: { not: "ARCHIVED" } },
        include: { brand: true },
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      },
    },
  });
  if (!page || !page.user.isActive) return null;

  const session = await auth();
  const isOwner = session?.user?.id === page.userId;
  if (!page.isPublished && !isOwner) return null;

  const offers = page.offers
    .filter((o) => o.status === "PUBLISHED" || isOwner)
    .map(serializeOffer);

  return { page, offers, isOwner };
});

export type PublicLandingPage = NonNullable<Awaited<ReturnType<typeof getPublicLandingPage>>>;
