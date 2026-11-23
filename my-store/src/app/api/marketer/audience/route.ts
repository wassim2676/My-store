import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { audienceSchema, parseAudience } from "@/lib/traffic";
import { withApproval } from "@/lib/team";

// ==================== 🛡️ PATCH /api/marketer/audience: إعدادات الجمهور وحماية الروابط ====================
// الأخطاء تُعاد كرموز (error: "invalid_url" ...) وتترجمها الواجهة حسب لغة المستخدم.
async function updateAudience(request: NextRequest) {
  const ctx = await getMarketerSession();
  if (!ctx) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  if (!ctx.landingPage) return NextResponse.json({ success: false, error: "no_page" }, { status: 404 });

  const parsed = audienceSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    const urlIssue = parsed.error.issues.some((i) => i.path[0] === "redirectUrl");
    return NextResponse.json({ success: false, error: urlIssue ? "invalid_url" : "invalid" }, { status: 400 });
  }
  const d = parsed.data;
  if (d.geoMode !== "all" && d.countries.length === 0)
    return NextResponse.json({ success: false, error: "no_countries" }, { status: 400 });
  if (d.blockAction === "redirect" && !d.redirectUrl)
    return NextResponse.json({ success: false, error: "invalid_url" }, { status: 400 });

  // نمرّر عبر parseAudience لتخزين شكل موحّد ونظيف دائماً
  const audience = parseAudience(d);
  await prisma.landingPage.update({ where: { id: ctx.landingPage.id }, data: { audience: { ...audience } } });
  revalidatePath("/dashboard/audience");
  return NextResponse.json({ success: true, data: audience });
}

// 🚦 أعضاء الفريق: يمر عبر موافقة صاحب الصفحة
export const PATCH = withApproval("audience.update", updateAudience, (b) => (audienceSchema.safeParse(b).success ? null : "invalid"));
