import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// ==================== 🔔 Webhook Stripe: تأكيد الدفع تلقائياً ====================
// أضف رابط هذا المسار في لوحة Stripe → Webhooks: https://your-domain.com/api/webhooks/stripe
// وأضف STRIPE_WEBHOOK_SECRET في .env
export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe غير مُفعّل" }, { status: 400 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "توقيع الطلب مفقود" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[STRIPE_WEBHOOK_SIGNATURE_ERROR]", err);
    return NextResponse.json({ error: "توقيع غير صالح" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { id: string; metadata?: { orderId?: string } };
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "PAID", status: "CONFIRMED", transactionId: session.id },
        });
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as { id: string; metadata?: { orderId?: string } };
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "FAILED" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_HANDLER_ERROR]", error);
    return NextResponse.json({ error: "فشل معالجة الحدث" }, { status: 500 });
  }
}
