import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { cleanPixelId, cleanVerifyToken, parseIntegrations, VERIFY_KEYS, type Integrations, type Pixels } from "@/lib/integrations";
import { withApproval } from "@/lib/team";

// ==================== 🔌 PATCH /api/marketer/integrations: وسوم التحقق و/أو البكسلات ====================
// كل قسم اختياري: { verify?: {...} } أو { pixels?: {...} } — القسم غير المرسَل يبقى كما هو.
const bad = (error: string, field?: string) => NextResponse.json({ success: false, error, field }, { status: 400 });

async function updateIntegrations(request: NextRequest) {
  const ctx = await getMarketerSession();
  if (!ctx) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  if (!ctx.landingPage) return NextResponse.json({ success: false, error: "no_page" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { verify?: Record<string, unknown>; pixels?: Record<string, unknown> };
  const next: Integrations = parseIntegrations(ctx.landingPage.integrations);

  if (body.verify && typeof body.verify === "object") {
    const verify: Integrations["verify"] = {};
    for (const k of VERIFY_KEYS) {
      const v = cleanVerifyToken(body.verify[k]);
      if (v === false) return bad("invalid_token", k);
      if (v) verify[k] = v;
    }
    next.verify = verify;
  }

  if (body.pixels && typeof body.pixels === "object") {
    const pixels: Pixels = {};
    for (const k of ["meta", "tiktok"] as const) {
      const v = cleanPixelId(k, body.pixels[k]);
      if (v === false) return bad("invalid_pixel", k);
      if (v) pixels[k] = v;
    }
    next.pixels = pixels;
  }

  await prisma.landingPage.update({ where: { id: ctx.landingPage.id }, data: { integrations: next } });
  revalidatePath(`/${ctx.landingPage.slug}`, "layout");
  revalidatePath("/dashboard", "layout");
  return NextResponse.json({ success: true, data: next });
}

// 🚦 أعضاء الفريق: يمر عبر موافقة صاحب الصفحة
export const PATCH = withApproval("integrations.update", updateIntegrations);
