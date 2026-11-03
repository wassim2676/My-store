import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==================== 🟢 POST: تسجيل ضغطة على زر "اشتري من" (علني بالكامل) ====================
// ⚠️ هذا المسار يجب أن يبقى عاماً بدون أي فحص صلاحيات — أي زائر يضغط زر الشراء يجب أن يُسجَّل
// نفس المبدأ المطبّق على /api/manual-orders: لا auth() هنا إطلاقاً.
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug) return NextResponse.json({ success: false, error: "slug مطلوب" }, { status: 400 });

    // لا نفشل الطلب أبداً بسبب هذا العدّاد — مجرد إحصائية، ليست منطق أساسي
    await prisma.affiliateProduct
      .updateMany({ where: { slug }, data: { clicks: { increment: 1 } } })
      .catch((err: unknown) => console.error("[AFFILIATE_CLICK_COUNT_ERROR]", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AFFILIATE_CLICK_ERROR]", error);
    // نعيد نجاح دائماً هنا لأن فشل التتبع لا يجب أن يمنع الزائر من إكمال الشراء
    return NextResponse.json({ success: true });
  }
}
