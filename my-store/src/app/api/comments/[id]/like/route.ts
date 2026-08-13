import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";

const likeSchema = z.object({ action: z.enum(["like", "unlike"]) });

// ==================== 🟢 POST: إعجاب/إلغاء إعجاب على تعليق أو رد محدد ====================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = likeSchema.safeParse(body);
    if (!validated.success) return errorResponse(validated.error.issues[0].message, 400);

    const existing = await prisma.pageComment.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return errorResponse("التعليق غير موجود", 404);

    const updated = await prisma.pageComment.update({
      where: { id },
      data: { likes: { increment: validated.data.action === "like" ? 1 : -1 } },
      select: { likes: true },
    });

    // حماية بسيطة: لا يقل العدد عن صفر أبداً
    if (updated.likes < 0) {
      const fixed = await prisma.pageComment.update({ where: { id }, data: { likes: 0 }, select: { likes: true } });
      return successResponse({ likes: fixed.likes });
    }

    return successResponse({ likes: updated.likes });
  } catch (error) {
    console.error("[TOGGLE_COMMENT_LIKE_ERROR]", error);
    return errorResponse("فشل تحديث الإعجاب", 500);
  }
}
