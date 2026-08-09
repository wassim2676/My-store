import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthSession } from "@/lib/api-utils";

// ==================== 🔍 مخطط التحقق (Zod Schema) ====================
// ✅ التصحيح: استخدام z.string() بدلاً من z.string().cuid() لتوافق أفضل
const wishlistSchema = z.object({ 
  productId: z.string().min(1, "معرف المنتج مطلوب"),
  note: z.string().max(255).optional().or(z.literal("")),
});

// ==================== 📥 GET: جلب قائمة أمنيات المستخدم ====================
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);

    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: { 
        product: { 
          select: { 
            id: true, 
            name: true, 
            price: true, 
            compareAt: true,
            images: true,
            stock: true,
            isActive: true,
          } 
        } 
      },
      orderBy: { addedAt: "desc" },
    });

    // فلترة المنتجات غير النشطة أو غير المتوفرة (اختياري)
    const activeItems = items.filter((item: { product: { isActive: boolean } }) => item.product.isActive);

    return successResponse(activeItems);
  } catch (error) {
    console.error("[GET_WISHLIST_ERROR]", error);
    return errorResponse("فشل جلب قائمة الأمنيات", 500);
  }
}

// ==================== 📤 POST: إضافة/إزالة منتج من الأمنيات (Toggle) ====================
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);

    const body = await request.json();
    
    // ✅ التصحيح: استخدام safeParse() بدلاً من parse() للتعامل الآمن مع الأخطاء
    const validated = wishlistSchema.safeParse(body);
    if (!validated.success) {
      return errorResponse(validated.error.issues[0].message, 400);
    }

    const { productId, note } = validated.data;

    // التحقق من وجود المنتج ونشاطه
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      select: { id: true, name: true, stock: true },
    });

    if (!product) {
      return errorResponse("المنتج غير موجود أو غير نشط", 404);
    }

    // ✅ منطق Toggle: إذا موجود احذفه، وإذا غير موجود أضفه
    const existing = await prisma.wishlistItem.findUnique({
      where: { 
        userId_productId: { 
          userId: session.user.id, 
          productId 
        } 
      },
    });

    if (existing) {
      // إزالة من الأمنيات
      await prisma.wishlistItem.delete({ 
        where: { id: existing.id } 
      });
      
      return successResponse({ 
        message: "تمت الإزالة من قائمة الأمنيات", 
        removed: true,
        productId 
      });
    } else {
      // إضافة للأمنيات
      const newItem = await prisma.wishlistItem.create({
        data: { 
          userId: session.user.id, 
          productId,
          note: note || null,
        },
        include: { 
          product: { 
            select: { 
              id: true, 
              name: true, 
              price: true, 
              images: true,
              stock: true,
            } 
          } 
        },
      });

      return successResponse({ 
        message: "تمت الإضافة لقائمة الأمنيات", 
        added: true,
        data: newItem 
      }, 201);
    }

  } catch (error) {
    console.error("[TOGGLE_WISHLIST_ERROR]", error);

    // ✅ التصحيح: استخدام error.issues بدلاً من error.errors
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }

    // معالجة خطأ التكرار الفريد
    if (error instanceof Error && error.message.includes("P2002")) {
      return errorResponse("هذا المنتج موجود بالفعل في قائمتك", 409);
    }

    return errorResponse("فشل تحديث قائمة الأمنيات", 500);
  }
}

// ==================== ❌ DELETE: إزالة منتج محدد (اختياري) ====================
// المسار: /api/wishlist?productId=xxx
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return errorResponse("معرف المنتج مطلوب", 400);
    }

    // التحقق من وجود العنصر أولاً
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (!existing) {
      return errorResponse("المنتج غير موجود في قائمة أمنياتك", 404);
    }

    // الحذف
    await prisma.wishlistItem.delete({
      where: { id: existing.id },
    });

    return successResponse({ 
      message: "تم حذف المنتج من قائمة الأمنيات",
      productId 
    });

  } catch (error) {
    console.error("[DELETE_WISHLIST_ERROR]", error);
    return errorResponse("فشل حذف المنتج من الأمنيات", 500);
  }
}