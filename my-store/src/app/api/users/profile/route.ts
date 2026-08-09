import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthSession } from "@/lib/api-utils";

// ==================== 🔍 مخطط التحقق (Zod Schema) ====================
const updateProfileSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب").max(50).optional(),
  lastName: z.string().min(1, "اسم العائلة مطلوب").max(50).optional(),
  phone: z.string()
    .regex(/^\+?[0-9\s\-]{8,15}$/, "رقم هاتف غير صالح")
    .optional()
    .or(z.literal("")),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
});

// ==================== 📥 GET: جلب بيانات المستخدم ====================
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
        city: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) return errorResponse("المستخدم غير موجود", 404);

    return successResponse(user);
  } catch (error) {
    console.error("[GET_PROFILE_ERROR]", error);
    return errorResponse("فشل جلب البيانات", 500);
  }
}

// ==================== 📤 PUT: تحديث بيانات المستخدم ====================
export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);

    // 1️⃣ قراءة وتحليل الجسم
    const body = await request.json();
    const validated = updateProfileSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(validated.error.issues[0].message, 400);
    }

    // 2️⃣ تحديث البيانات في قاعدة البيانات
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: validated.data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
        city: true,
        avatar: true,
      },
    });

    return successResponse({
      message: "تم تحديث الملف الشخصي بنجاح",
      user: updated,
    });
  } catch (error) {
    console.error("[UPDATE_PROFILE_ERROR]", error);

    // معالجة أخطاء Zod
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }

    // معالجة أخطاء Prisma الفريدة
    if (error instanceof Error && error.message.includes("P2002")) {
      return errorResponse("هذا الرقم مسجل مسبقاً", 409);
    }

    return errorResponse("فشل تحديث البيانات", 500);
  }
}

// ==================== ❌ DELETE: حذف الحساب (اختياري) ====================
export async function DELETE() {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);

    // ⚠️ تحذير: هذا يحذف المستخدم نهائياً مع جميع بياناته
    // في الإنتاج، يفضل استخدام "Soft Delete" بإضافة حقل `isDeleted`
    
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return successResponse({ message: "تم حذف الحساب بنجاح" });
  } catch (error) {
    console.error("[DELETE_PROFILE_ERROR]", error);
    return errorResponse("فشل حذف الحساب", 500);
  }
}