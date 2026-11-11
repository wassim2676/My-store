import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/landing";
import {
  getMarketerSession,
  offerDataFromInput,
  offerSchema,
  serializeOffer,
  uniqueOfferSlug,
} from "@/lib/marketer";

const MAX_OFFERS = 500;

// ==================== 🟢 GET: عروض المسوّق ====================
export async function GET() {
  const ctx = await getMarketerSession();
  if (!ctx) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!ctx.landingPage) return NextResponse.json({ success: true, data: [] });

  const offers = await prisma.offer.findMany({
    where: { landingPageId: ctx.landingPage.id },
    include: { brand: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ success: true, data: offers.map(serializeOffer) });
}

// ==================== 🟢 POST: إضافة عرض جديد (أو نسخ عرض موجود عبر duplicateOf) ====================
export async function POST(request: NextRequest) {
  const ctx = await getMarketerSession();
  if (!ctx) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!ctx.landingPage)
    return NextResponse.json({ success: false, error: "أنشئ صفحة الهبوط أولاً" }, { status: 400 });

  const page = ctx.landingPage;
  const count = await prisma.offer.count({ where: { landingPageId: page.id } });
  if (count >= MAX_OFFERS)
    return NextResponse.json({ success: false, error: `الحد الأقصى ${MAX_OFFERS} عرض` }, { status: 400 });

  const body = await request.json().catch(() => ({}));

  // 📄 نسخ عرض
  if (typeof body?.duplicateOf === "string") {
    const source = await prisma.offer.findFirst({ where: { id: body.duplicateOf, landingPageId: page.id } });
    if (!source) return NextResponse.json({ success: false, error: "العرض غير موجود" }, { status: 404 });
    const { id: _id, createdAt: _c, updatedAt: _u, views: _v, clicks: _k, ...rest } = source;
    void _id; void _c; void _u; void _v; void _k;
    const copy = await prisma.offer.create({
      data: {
        ...rest,
        specs: rest.specs ?? undefined,
        title: `${source.title} (copy)`.slice(0, 200),
        slug: await uniqueOfferSlug(page.id, `${source.slug}-copy`.slice(0, 110)),
        status: "DRAFT",
        position: count,
      },
      include: { brand: true },
    });
    return NextResponse.json({ success: true, data: serializeOffer(copy) }, { status: 201 });
  }

  const parsed = offerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });

  if (parsed.data.brandId) {
    const brand = await prisma.brand.findFirst({ where: { id: parsed.data.brandId, isActive: true } });
    if (!brand) return NextResponse.json({ success: false, error: "المتجر المختار غير متاح" }, { status: 400 });
  }

  const slug = await uniqueOfferSlug(page.id, toSlug(parsed.data.slug || parsed.data.title, 110));

  // العروض الجديدة تظهر في الأعلى
  await prisma.offer.updateMany({ where: { landingPageId: page.id }, data: { position: { increment: 1 } } });
  const offer = await prisma.offer.create({
    data: { ...offerDataFromInput(parsed.data), slug, position: 0, landingPageId: page.id },
    include: { brand: true },
  });

  revalidatePath(`/${page.slug}`, "layout");
  return NextResponse.json({ success: true, data: serializeOffer(offer) }, { status: 201 });
}
