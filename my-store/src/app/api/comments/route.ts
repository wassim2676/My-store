import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";

// ==================== 🟢 GET: جلب كل تعليقات وردود صفحة معينة (مسطّحة، يُنظّمها العميل شجرياً) ====================
export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) return errorResponse("المعرّف (slug) مطلوب", 400);

    const comments = await prisma.pageComment.findMany({
      where: { slug, approved: true },
      orderBy: { createdAt: "asc" },
      take: 300,
      select: { id: true, parentId: true, name: true, message: true, likes: true, createdAt: true },
    });

    return successResponse(comments);
  } catch (error) {
    console.error("[GET_COMMENTS_ERROR]", error);
    return errorResponse("فشل جلب التعليقات", 500);
  }
}

const commentSchema = z.object({
  slug: z.string().min(1).max(100),
  parentId: z.string().min(1).max(100).optional(),
  name: z.string().trim().min(2, "الاسم قصير جداً").max(60, "الاسم طويل جداً"),
  message: z.string().trim().min(1, "التعليق فارغ").max(500, "التعليق طويل جداً (الحد الأقصى 500 حرف)"),
  // 🛡️ حقل خفي لمكافحة السبام (Honeypot) — إن امتلأ فهذا بوت وليس إنساناً
  website: z.string().max(0).optional().or(z.literal("")),
});

// ==================== 🟢 POST: إضافة تعليق جديد أو رد على تعليق موجود ====================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = commentSchema.safeParse(body);
    if (!validated.success) return errorResponse(validated.error.issues[0].message, 400);

    // إن كان الحقل الخفي (website) مملوءاً، تجاهل الطلب بصمت (على الأغلب بوت)
    if (validated.data.website) {
      return successResponse({ id: "ignored", parentId: null, name: "", message: "", likes: 0, createdAt: new Date() }, 201);
    }

    const { slug, parentId, name, message } = validated.data;

    // 🛡️ إن كان رداً على تعليق: تأكد أن التعليق الأصل موجود فعلاً وينتمي لنفس الصفحة
    if (parentId) {
      const parent = await prisma.pageComment.findUnique({ where: { id: parentId }, select: { slug: true, parentId: true } });
      if (!parent || parent.slug !== slug) {
        return errorResponse("التعليق الأصل غير موجود", 404);
      }
      // نمنع الردّ على رد (نُبقي الشجرة بمستويين فقط، كما تفعل معظم منصات التواصل)
      if (parent.parentId) {
        return errorResponse("لا يمكن الرد على رد، فقط على التعليقات الرئيسية", 400);
      }
    }

    const comment = await prisma.pageComment.create({
      data: { slug, parentId: parentId || null, name, message },
      select: { id: true, parentId: true, name: true, message: true, likes: true, createdAt: true },
    });

    return successResponse(comment, 201);
  } catch (error) {
    console.error("[CREATE_COMMENT_ERROR]", error);
    return errorResponse("فشل إرسال التعليق", 500);
  }
}
