import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPrismaErrorCode } from "@/lib/api-utils";
import { slugSchema } from "@/lib/marketer";

// ==================== 🧑‍💼 تسجيل مسوّق جديد + إنشاء صفحة الهبوط في نفس العملية ====================
const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل").max(128),
  firstName: z.string().trim().min(1, "الاسم الأول مطلوب").max(60),
  lastName: z.string().trim().max(60).optional(),
  pageTitle: z.string().trim().min(2, "اسم صفحة الهبوط قصير جداً").max(80),
  slug: slugSchema,
});

export async function POST(request: NextRequest) {
  try {
    const validation = registerSchema.safeParse(await request.json().catch(() => ({})));
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { email, password, firstName, lastName, pageTitle, slug } = validation.data;

    const [existingUser, existingSlug] = await Promise.all([
      prisma.user.findUnique({ where: { email }, select: { id: true } }),
      prisma.landingPage.findUnique({ where: { slug }, select: { id: true } }),
    ]);
    if (existingUser) return NextResponse.json({ error: "هذا البريد الإلكتروني مسجل مسبقاً" }, { status: 409 });
    if (existingSlug)
      return NextResponse.json({ error: "اسم الرابط مستخدم، اختر اسماً آخر", field: "slug" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName: lastName || null,
        role: "MARKETER",
        isActive: true,
        landingPage: { create: { slug, title: pageTitle } },
      },
      select: { id: true, email: true, landingPage: { select: { slug: true } } },
    });

    return NextResponse.json({ success: true, message: "تم إنشاء حسابك وصفحتك بنجاح", user }, { status: 201 });
  } catch (error) {
    if (getPrismaErrorCode(error) === "P2002") {
      return NextResponse.json({ error: "البريد أو اسم الرابط مستخدم مسبقاً" }, { status: 409 });
    }
    console.error("[REGISTER_API_ERROR]", error);
    return NextResponse.json({ error: "حدث خطأ غير متوقع أثناء إنشاء الحساب" }, { status: 500 });
  }
}
