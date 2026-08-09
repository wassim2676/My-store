import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthSession } from "@/lib/api-utils";

const updateSchema = z.object({ quantity: z.number().int().min(1).max(50) });

// ==================== 🟡 PATCH: تحديث كمية عنصر بالسلة ====================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);
    const { itemId } = await params;

    const body = await request.json();
    const validated = updateSchema.safeParse(body);
    if (!validated.success) return errorResponse(validated.error.issues[0].message, 400);

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });

    if (!item || item.cart.userId !== session.user.id) {
      return errorResponse("العنصر غير موجود", 404);
    }
    if (item.product.stock < validated.data.quantity) {
      return errorResponse("الكمية المطلوبة غير متوفرة بالمخزون", 400);
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: validated.data.quantity },
    });

    return successResponse(updated);
  } catch (error) {
    console.error("[UPDATE_CART_ITEM_ERROR]", error);
    return errorResponse("فشل تحديث السلة", 500);
  }
}

// ==================== 🗑️ DELETE: حذف عنصر من السلة ====================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);
    const { itemId } = await params;

    const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
    if (!item || item.cart.userId !== session.user.id) {
      return errorResponse("العنصر غير موجود", 404);
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("[DELETE_CART_ITEM_ERROR]", error);
    return errorResponse("فشل حذف العنصر", 500);
  }
}
