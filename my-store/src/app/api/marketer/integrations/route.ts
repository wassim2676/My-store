import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { cleanVerifyToken, parseIntegrations, VERIFY_KEYS, type Integrations } from "@/lib/integrations";

// ==================== 🔌 PATCH /api/marketer/integrations: وسوم التحقق من ملكية الدومين ====================
export async function PATCH(request: NextRequest) {
  const ctx = await getMarketerSession();
  if (!ctx) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  if (!ctx.landingPage) return NextResponse.json({ success: false, error: "no_page" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { verify?: Record<string, unknown> };
  const input = body.verify && typeof body.verify === "object" ? body.verify : {};

  const current = parseIntegrations(ctx.landingPage.integrations);
  const verify: Integrations["verify"] = {};
  for (const k of VERIFY_KEYS) {
    const v = cleanVerifyToken(input[k]);
    if (v === false) return NextResponse.json({ success: false, error: "invalid_token", field: k }, { status: 400 });
    if (v) verify[k] = v;
  }

  const next: Integrations = { ...current, verify };
  await prisma.landingPage.update({ where: { id: ctx.landingPage.id }, data: { integrations: next } });
  revalidatePath(`/${ctx.landingPage.slug}`);
  revalidatePath("/dashboard/domain");
  return NextResponse.json({ success: true, data: next });
}
