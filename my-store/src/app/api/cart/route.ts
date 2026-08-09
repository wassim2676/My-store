import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthSession } from "@/lib/api-utils";

// ==================== 📥 GET: جلب سلة المستخدم الحالي (تُنشأ تلقائياً إن لم توجد) ====================
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);

    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true, slug: true, name: true, price: true, compareAt: true,
                images: true, stock: true, isActive: true,
                vendor: { select: { storeName: true } },
              },
            },
          },
          orderBy: { addedAt: "desc" },
        },
      },
    });

        if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true, slug: true, name: true, price: true, compareAt: true,
                  images: true, stock: true, isActive: true,
                  vendor: { select: { storeName: true } },
                },
              },
            },
            orderBy: { addedAt: "desc" },
          },
        },
      });
    }

    type RawCartItem = {
      id: string;
      quantity: number;
      product: {
        id: string; slug: string; name: string; price: unknown; compareAt: unknown;
        images: string[]; stock: number; isActive: boolean;
        vendor: { storeName: string } | null;
      };
    };

    const items = (cart.items as RawCartItem[])
      .filter((item) => item.product.isActive)
      .map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          slug: item.product.slug,
          name: item.product.name,
          price: Number(item.product.price),
          compareAt: item.product.compareAt ? Number(item.product.compareAt) : null,
          image: item.product.images?.[0] || "/placeholder-product.png",
          stock: item.product.stock,
          vendorName: item.product.vendor?.storeName ?? null,
        },
      }));

    const subtotal = items.reduce((sum: number, i: (typeof items)[number]) => sum + i.product.price * i.quantity, 0);

    return successResponse({ id: cart.id, items, subtotal, count: items.reduce((s: number, i: (typeof items)[number]) => s + i.quantity, 0) });
  } catch (error) {
    console.error("[GET_CART_ERROR]", error);
    return errorResponse("فشل جلب السلة", 500);
  }
}

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50).default(1),
});

// ==================== 📤 POST: إضافة منتج للسلة (أو زيادة كميته إن كان موجوداً) ====================
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("يجب تسجيل الدخول أولاً", 401);

    const body = await request.json();
    const validated = addItemSchema.safeParse(body);
    if (!validated.success) return errorResponse(validated.error.issues[0].message, 400);

    const { productId, quantity } = validated.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) return errorResponse("المنتج غير متوفر", 404);
    if (product.stock < quantity) return errorResponse("الكمية المطلوبة غير متوفرة بالمخزون", 400);

    const cart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    });

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    const item = existingItem
      ? await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: Math.min(existingItem.quantity + quantity, product.stock) },
        })
      : await prisma.cartItem.create({
          data: { cartId: cart.id, productId, quantity },
        });

    return successResponse(item, 201);
  } catch (error) {
    console.error("[ADD_TO_CART_ERROR]", error);
    return errorResponse("فشل إضافة المنتج للسلة", 500);
  }
}
