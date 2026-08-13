import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";

// ==================== 🟢 GET: جلب عدد الإعجابات الحالي لصفحة معينة ====================
export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) return errorResponse("المعرّف (slug) مطلوب", 400);

    const engagement = await prisma.pageEngagement.findUnique({ where: { slug } });
    return successResponse({ likes: engagement?.likes ?? 0 });
  } catch (error) {
    console.error("[GET_LIKES_ERROR]", error);
    return errorResponse("فشل جلب عدد الإعجابات", 500);
  }
}

const likeSchema = z.object({
  slug: z.string().min(1).max(100),
  action: z.enum(["like", "unlike"]),
});

// ==================== 🟢 POST: إضافة/إزالة إعجاب (بدون تسجيل دخول — مثل منشور فيسبوك عام) ====================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = likeSchema.safeParse(body);
    if (!validated.success) return errorResponse(validated.error.issues[0].message, 400);

    const { slug, action } = validated.data;

    const engagement = await prisma.pageEngagement.upsert({
      where: { slug },
      create: { slug, likes: action === "like" ? 1 : 0 },
      update: { likes: { increment: action === "like" ? 1 : -1 } },
    });

    // حماية بسيطة: لا يقل العدد عن صفر أبداً (في حال تلاعب بالطلبات)
    if (engagement.likes < 0) {
      const fixed = await prisma.pageEngagement.update({ where: { slug }, data: { likes: 0 } });
      return successResponse({ likes: fixed.likes });
    }

    return successResponse({ likes: engagement.likes });
  } catch (error) {
    console.error("[TOGGLE_LIKE_ERROR]", error);
    return errorResponse("فشل تحديث الإعجاب", 500);
  }
}
