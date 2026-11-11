import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getPrismaErrorCode } from "@/lib/api-utils";
import { getMarketerSession, landingPageSchema, serializeLandingPage } from "@/lib/marketer";

function cleanSocials(input: Record<string, string | undefined> | null | undefined) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input || {})) if (v) out[k] = v;
  return out;
}

// ==================== 🟢 POST: إنشاء صفحة الهبوط لحساب لا يملك صفحة بعد ====================
export async function POST(request: NextRequest) {
  const ctx = await getMarketerSession();
  if (!ctx) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (ctx.landingPage) return NextResponse.json({ success: false, error: "لديك صفحة هبوط بالفعل" }, { status: 409 });

  const parsed = landingPageSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });

  const d = parsed.data;
  try {
    const page = await prisma.$transaction(async (tx) => {
      const created = await tx.landingPage.create({
        data: { ...d, userId: ctx.userId, socialLinks: cleanSocials(d.socialLinks) },
      });
      // ترقية الحسابات القديمة (مشتري/بائع) إلى مسوّق
      await tx.user.updateMany({
        where: { id: ctx.userId, role: { in: ["USER", "SELLER"] } },
        data: { role: "MARKETER" },
      });
      return created;
    });
    return NextResponse.json({ success: true, data: serializeLandingPage(page) }, { status: 201 });
  } catch (error) {
    if (getPrismaErrorCode(error) === "P2002")
      return NextResponse.json({ success: false, error: "هذا الاسم مستخدم، اختر اسماً آخر" }, { status: 409 });
    console.error("[CREATE_LANDING_PAGE_ERROR]", error);
    return NextResponse.json({ success: false, error: "فشل إنشاء الصفحة" }, { status: 500 });
  }
}

// ==================== 🟡 PATCH: تحديث إعدادات صفحة الهبوط ====================
export async function PATCH(request: NextRequest) {
  const ctx = await getMarketerSession();
  if (!ctx) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!ctx.landingPage) return NextResponse.json({ success: false, error: "لا توجد صفحة هبوط" }, { status: 404 });

  const parsed = landingPageSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });

  const d = parsed.data;
  const oldSlug = ctx.landingPage.slug;
  try {
    const page = await prisma.landingPage.update({
      where: { id: ctx.landingPage.id },
      data: {
        ...d,
        tagline: d.tagline || null,
        bio: d.bio || null,
        avatarUrl: d.avatarUrl || null,
        coverUrl: d.coverUrl || null,
        disclosure: d.disclosure || null,
        seoTitle: d.seoTitle || null,
        seoDescription: d.seoDescription || null,
        socialLinks: cleanSocials(d.socialLinks),
      },
    });
    revalidatePath(`/${oldSlug}`, "layout");
    if (page.slug !== oldSlug) revalidatePath(`/${page.slug}`, "layout");
    return NextResponse.json({ success: true, data: serializeLandingPage(page) });
  } catch (error) {
    if (getPrismaErrorCode(error) === "P2002")
      return NextResponse.json({ success: false, error: "هذا الاسم مستخدم، اختر اسماً آخر" }, { status: 409 });
    console.error("[UPDATE_LANDING_PAGE_ERROR]", error);
    return NextResponse.json({ success: false, error: "فشل حفظ الإعدادات" }, { status: 500 });
  }
}
