import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ==================== 🔐 مخططات التحقق ====================
// ⚠️ مصححة لتطابق نموذج ManualOrder الفعلي (وليس Order)
const updateManualOrderSchema = z.object({
  customerName: z.string().min(1).max(255).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  productType: z.string().max(255).optional(),
  quantity: z.number().int().min(1).optional(),
  unitPrice: z.number().positive().optional(),
  callStatus: z.enum(["NOT_CALLED", "CALLED_SUCCESS", "CALL_FAILED", "CALL_LATER"]).optional(),
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED", "RETURNED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  adminNotes: z.string().max(2000).optional(),
  customerNote: z.string().max(1000).optional(),
});

async function assertAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) return null;
  return session;
}

// ==================== 🟢 GET: جلب طلب يدوي محدد ====================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await assertAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const order = await prisma.manualOrder.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("[API] Manual order fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// ==================== 🟡 PUT: تحديث طلب يدوي ====================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await assertAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const validated = updateManualOrderSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.issues },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.manualOrder.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (["PAID", "REFUNDED"].includes(existingOrder.paymentStatus)) {
      return NextResponse.json(
        {
          error: `Cannot modify order with payment status: ${existingOrder.paymentStatus}`,
          suggestion: "Use status update instead of deletion",
        },
        { status: 400 }
      );
    }

    const data = validated.data;
    const nextQuantity = data.quantity ?? existingOrder.quantity;
    const nextUnitPrice = data.unitPrice ?? Number(existingOrder.unitPrice);

    const updatedOrder = await prisma.manualOrder.update({
      where: { id },
      data: {
        ...(data.customerName !== undefined && { customerName: data.customerName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.productType !== undefined && { productType: data.productType }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.unitPrice !== undefined && { unitPrice: data.unitPrice }),
        ...((data.quantity !== undefined || data.unitPrice !== undefined) && {
          totalPrice: nextQuantity * nextUnitPrice,
        }),
        ...(data.callStatus && { callStatus: data.callStatus, calledAt: new Date() }),
        ...(data.status && { status: data.status }),
        ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
        ...(data.customerNote !== undefined && { customerNote: data.customerNote }),
        ...(data.adminNotes !== undefined && {
          adminNotes: `${existingOrder.adminNotes || ""}\n[Updated by admin ${session.user.id} at ${new Date().toISOString()}]\n${data.adminNotes}`,
        }),
        updatedAt: new Date(),
      },
    });

    console.log(`[AUDIT] User ${session.user.id} updated manual order ${id}`);

    return NextResponse.json({ success: true, message: "Order updated successfully", data: updatedOrder });
  } catch (error) {
    console.error("[API] Manual order update failed:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// ==================== 🔴 DELETE: حذف طلب يدوي نهائياً ====================
/**
 * 🔴 DELETE /api/manual-orders/[id]
 * حذف حقيقي للطلب من قاعدة البيانات
 * - محمي: Admin/Super Admin فقط
 * - 🛡️ الحماية الوحيدة: لا يمكن حذف طلب تم تحصيل دفعه فعلياً (paymentStatus = PAID)
 *   لأن ذلك سيفقد سجلاً مالياً حقيقياً. بدل الحذف، يمكن للأدمن تغيير حالته إلى CANCELLED عبر PUT.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await assertAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.manualOrder.findUnique({
      where: { id },
      select: { id: true, orderNumber: true, paymentStatus: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (existing.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          error: "لا يمكن حذف طلب تم تحصيل دفعه فعلياً (حفاظاً على السجل المالي). يمكنك تغيير حالته إلى «ملغى» بدل حذفه.",
        },
        { status: 400 }
      );
    }

    await prisma.manualOrder.delete({ where: { id } });

    console.log(`[AUDIT] Admin ${session.user.id} deleted manual order #${existing.orderNumber}`);

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
      data: { id: existing.id },
    });
  } catch (error) {
    console.error("[API] Manual order deletion failed:", error);
    if (error instanceof Error && error.message.includes("P2025")) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
