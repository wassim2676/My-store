import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthSession } from "@/lib/api-utils";
import { stripe, isStripeConfigured } from "@/lib/stripe";

const checkoutSchema = z.object({
  addressId: z.string().min(1, "يجب اختيار عنوان للتوصيل"),
  paymentMethod: z.enum(["COD", "STRIPE"]),
  customerNote: z.string().max(500).optional(),
});

const SHIPPING_FEE = 30;
const FREE_SHIPPING_THRESHOLD = 500;
const TAX_RATE = 0; // معطّلة افتراضياً — فعّلها إن كانت مطلوبة قانونياً في بلدك

// ==================== 📥 GET: طلبات المستخدم الحالي ====================
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(
      orders.map((o: (typeof orders)[number]) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        total: Number(o.total),
        currency: o.currency,
        createdAt: o.createdAt,
        itemsCount: o.items.length,
        items: o.items.map((i: (typeof o.items)[number]) => ({ name: i.name, image: i.image, quantity: i.quantity, price: Number(i.price) })),
      }))
    );
  } catch (error) {
    console.error("[GET_ORDERS_ERROR]", error);
    return errorResponse("فشل جلب الطلبات", 500);
  }
}

// ==================== 📤 POST: إنشاء طلب من محتوى السلة الحالية ====================
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);

    const body = await request.json();
    const validated = checkoutSchema.safeParse(body);
    if (!validated.success) return errorResponse(validated.error.issues[0].message, 400);
    const { addressId, paymentMethod, customerNote } = validated.data;

    // التحقق من العنوان
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });
    if (!address) return errorResponse("العنوان غير موجود", 404);

    // جلب السلة
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return errorResponse("السلة فارغة", 400);
    }

    // التحقق من توفر المخزون لكل عنصر
    for (const item of cart.items) {
      if (!item.product.isActive) return errorResponse(`المنتج "${item.product.name}" لم يعد متوفراً`, 400);
      if (item.product.stock < item.quantity) {
        return errorResponse(`الكمية المطلوبة من "${item.product.name}" غير متوفرة بالمخزون`, 400);
      }
    }

    const subtotal = cart.items.reduce((sum: number, i: (typeof cart.items)[number]) => sum + Number(i.product.price) * i.quantity, 0);
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + shippingFee + tax;

    // إن كان الدفع إلكترونياً عبر Stripe: أنشئ جلسة دفع أولاً قبل إنشاء الطلب النهائي
    if (paymentMethod === "STRIPE") {
      if (!isStripeConfigured() || !stripe) {
        return errorResponse("الدفع الإلكتروني غير مُفعّل حالياً، الرجاء استخدام الدفع عند التوصيل", 400);
      }

      // ننشئ الطلب بحالة PENDING أولاً، ثم نربطه بجلسة Stripe عبر metadata
      const order = await createOrderRecord({
        userId: session.user.id,
        addressId,
        cart,
        subtotal,
        shippingFee,
        tax,
        total,
        paymentMethod: "STRIPE",
        customerNote,
      });

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: cart.items.map((i: (typeof cart.items)[number]) => ({
          price_data: {
            currency: "mad",
            product_data: { name: i.product.name, images: i.product.images?.slice(0, 1) },
            unit_amount: Math.round(Number(i.product.price) * 100),
          },
          quantity: i.quantity,
        })),
        metadata: { orderId: order.id },
        success_url: `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${order.id}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentIntentId: checkoutSession.id },
      });

      return successResponse({ orderId: order.id, checkoutUrl: checkoutSession.url }, 201);
    }

    // الدفع عند التوصيل: ننشئ الطلب مباشرة ونخصم المخزون
    const order = await createOrderRecord({
      userId: session.user.id,
      addressId,
      cart,
      subtotal,
      shippingFee,
      tax,
      total,
      paymentMethod: "COD",
      customerNote,
    });

    return successResponse({ orderId: order.id, orderNumber: order.orderNumber }, 201);
  } catch (error) {
    console.error("[CREATE_ORDER_ERROR]", error);
    return errorResponse("فشل إنشاء الطلب", 500);
  }
}

// دالة مشتركة لإنشاء الطلب داخل معاملة واحدة (تخصم المخزون وتُفرغ السلة)
async function createOrderRecord(params: {
  userId: string;
  addressId: string;
  cart: { id: string; items: { productId: string; quantity: number; product: { id: string; name: string; images: string[]; price: unknown; vendorId: string | null } }[] };
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: "COD" | "STRIPE";
  customerNote?: string;
}) {
  const { userId, cart, subtotal, shippingFee, tax, total, paymentMethod, customerNote } = params;

    return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        subtotal,
        tax,
        shippingFee,
        total,
        paymentMethod,
        paymentStatus: "PENDING",
        status: "PENDING",
        customerNote,
        items: {
          create: cart.items.map((i) => ({
            productId: i.productId,
            vendorId: i.product.vendorId,
            name: i.product.name,
            image: i.product.images?.[0] || null,
            quantity: i.quantity,
            price: Number(i.product.price),
            total: Number(i.product.price) * i.quantity,
          })),
        },
      },
    });

    // خصم المخزون
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // إفراغ السلة
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });
}
