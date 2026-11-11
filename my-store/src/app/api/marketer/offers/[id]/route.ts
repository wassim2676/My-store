import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/landing";
import {
  getMarketerSession,
  offerDataFromInput,
  offerSchema,
  serializeOffer,
  uniqueOfferSlug,
} from "@/lib/marketer";

type Ctx = { params: Promise<{ id: string }> };

// تعديل سريع من قائمة العروض (نشر/إخفاء/تمييز) دون إرسال النموذج كاملاً
const quickSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
});

async function loadOwnedOffer(id: string) {
  const ctx = await getMarketerSession();
  if (!ctx?.landingPage) return { error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  const offer = await prisma.offer.findFirst({ where: { id, landingPageId: ctx.landingPage.id } });
  if (!offer) return { error: NextResponse.json({ success: false, error: "العرض غير موجود" }, { status: 404 }) };
  return { page: ctx.landingPage, offer };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const res = await loadOwnedOffer(id);
  if (res.error) return res.error;
  const offer = await prisma.offer.findUnique({ where: { id }, include: { brand: true } });
  return NextResponse.json({ success: true, data: offer ? serializeOffer(offer) : null });
}

// ==================== 🟡 PATCH: تحديث العرض ====================
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const res = await loadOwnedOffer(id);
  if (res.error) return res.error;
  const { page, offer } = res;

  const body = await request.json().catch(() => ({}));
  const isFullUpdate = typeof body?.title === "string";

  let data;
  if (isFullUpdate) {
    const parsed = offerSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    if (parsed.data.brandId && parsed.data.brandId !== offer.brandId) {
      const brand = await prisma.brand.findFirst({ where: { id: parsed.data.brandId, isActive: true } });
      if (!brand) return NextResponse.json({ success: false, error: "المتجر المختار غير متاح" }, { status: 400 });
    }
    const wantedSlug = toSlug(parsed.data.slug || offer.slug, 110);
    data = {
      ...offerDataFromInput(parsed.data),
      slug: wantedSlug === offer.slug ? offer.slug : await uniqueOfferSlug(page.id, wantedSlug, offer.id),
    };
  } else {
    const parsed = quickSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: "بيانات غير صحيحة" }, { status: 400 });
    data = parsed.data;
  }

  const updated = await prisma.offer.update({ where: { id }, data, include: { brand: true } });
  revalidatePath(`/${page.slug}`, "layout");
  return NextResponse.json({ success: true, data: serializeOffer(updated) });
}

// ==================== 🔴 DELETE: حذف العرض ====================
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const res = await loadOwnedOffer(id);
  if (res.error) return res.error;
  await prisma.offer.delete({ where: { id } });
  revalidatePath(`/${res.page.slug}`, "layout");
  return NextResponse.json({ success: true });
}
