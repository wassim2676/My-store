import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { bumpDailyStat, isCountableRequest } from "@/lib/marketer";

// ==================== ↗️ GET /go/{offerId}: تسجيل النقرة ثم التحويل لرابط الأفلييت ====================
// عام بالكامل (بدون مصادقة). يعمل حتى بدون JavaScript، والتتبع لا يؤخر التحويل.
export async function GET(request: NextRequest, { params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    select: { id: true, affiliateUrl: true, status: true, landingPageId: true, landingPage: { select: { slug: true } } },
  });

  if (!offer || offer.status !== "PUBLISHED") {
    return NextResponse.redirect(new URL(offer ? `/${offer.landingPage.slug}` : "/", request.url));
  }

  if (isCountableRequest(request.headers)) {
    after(async () => {
      try {
        await Promise.all([
          prisma.offer.update({ where: { id: offer.id }, data: { clicks: { increment: 1 } } }),
          bumpDailyStat(offer.landingPageId, "clicks"),
        ]);
      } catch (err) {
        console.error("[OFFER_CLICK_TRACK_ERROR]", err);
      }
    });
  }

  const res = NextResponse.redirect(offer.affiliateUrl, 302);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Referrer-Policy", "no-referrer-when-downgrade");
  return res;
}
