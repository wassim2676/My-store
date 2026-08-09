import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthSession } from "@/lib/api-utils";

// ==================== 🔍 مخطط التحقق (Zod Schema) ====================
const passwordSchema = z.object({
  currentPassword: z.string()
    .min(6, "كلمة المرور الحالية قصيرة جداً")
    .max(100, "كلمة المرور طويلة جداً"),
  newPassword: z.string()
    .min(6, "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل")
    .max(100, "كلمة المرور الجديدة طويلة جداً")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, 
      "كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز"),
});

// ==================== ✏️ PUT: تغيير كلمة المرور ====================
export async function PUT(request: NextRequest) {
  try {
    // 1️⃣ التحقق من الجلسة
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);

    const body = await request.json();
    
    // 2️⃣ التحقق من صحة البيانات باستخدام safeParse
    const validated = passwordSchema.safeParse(body);
    if (!validated.success) {
      // ✅ التصحيح: استخدام error.issues بدلاً من error.errors
      return errorResponse(validated.error.issues[0].message, 400);
    }

    const { currentPassword, newPassword } = validated.data;

    // 3️⃣ منع إعادة استخدام نفس كلمة المرور
    if (currentPassword === newPassword) {
      return errorResponse("كلمة المرور الجديدة يجب أن تختلف عن الحالية", 400);
    }

    // 4️⃣ جلب المستخدم مع كلمة المرور المشفرة
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        email: true, 
        passwordHash: true,
        role: true,
      },
    });

    if (!user) {
      return errorResponse("المستخدم غير موجود", 404);
    }

    // 5️⃣ التحقق من أن الحساب يستخدم كلمات مرور (ليس حساب اجتماعي)
    if (!user.passwordHash) {
      return errorResponse(
        "حسابك مرتبط بتسجيل الدخول الاجتماعي. يرجى تغيير كلمة المرور من مزود الخدمة", 
        400
      );
    }

    // 6️⃣ مقارنة كلمة المرور الحالية
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      // تسجيل محاولة فاشلة للأمان (اختياري)
      console.warn(`[PASSWORD_CHANGE_FAILED] User: ${user.email}`);
      return errorResponse("كلمة المرور الحالية غير صحيحة", 401);
    }

    // 7️⃣ تشفير كلمة المرور الجديدة
    // ✅ زيادة عدد الجولات لزيادة الأمان (12 بدلاً من 10)
    const hashed = await bcrypt.hash(newPassword, 12);

    // 8️⃣ تحديث كلمة المرور في قاعدة البيانات
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        passwordHash: hashed,
        updatedAt: new Date(),
      },
    });

    // 9️⃣ (اختياري) تسجيل الحدث للأمان
    console.log(`[PASSWORD_CHANGED] User: ${user.email} at: ${new Date().toISOString()}`);

    return successResponse({ 
      message: "تم تغيير كلمة المرور بنجاح",
      // لا نرجع أي بيانات حساسة
    });

  } catch (error) {
    console.error("[CHANGE_PASSWORD_ERROR]", error);

    // ✅ معالجة أخطاء Zod
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }

    // معالجة أخطاء bcrypt
    if (error instanceof Error && error.message.includes("bcrypt")) {
      return errorResponse("حدث خطأ أثناء معالجة كلمة المرور", 500);
    }

    // معالجة أخطاء قاعدة البيانات
    if (error instanceof Error && error.message.includes("P2002")) {
      return errorResponse("حدث تضارب في البيانات", 409);
    }

    // خطأ عام
    return errorResponse("فشل تغيير كلمة المرور", 500);
  }
}