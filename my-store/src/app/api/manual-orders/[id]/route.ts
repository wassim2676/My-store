import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ==================== 🔐 مخططات التحقق ====================
const updateManualOrderSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED", "RETURNED"]).optional(),
  callStatus: z.enum(["NOT_CALLED", "CALLED_SUCCESS", "CALL_FAILED", "CALL_LATER"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  adminNotes: z.string().max(2000).optional(),
  trackingNumber: z.string().max(100).optional(),
  trackingUrl: z.string().url("رابط تتبع غير صالح").optional(),
});

// ==================== 🟢 GET: جلب طلب يدوي محدد ====================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.manualOrder.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        phone: true,
        email: true,
        country: true,
        city: true,
        address: true,
        productType: true,
        quantity: true,
        unitPrice: true,
        totalPrice: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
        callStatus: true,
        customerNote: true,
        adminNotes: true,
        sourcePage: true,
        createdAt: true,
        updatedAt: true,
        calledAt: true,
        cancelledAt: true,
      },
    });

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
/**
 * 🟡 PUT /api/manual-orders/[id]
 * تحديث حالة الطلب أو ملاحظات الأدمن
 * - محمي: Admin/Super Admin فقط
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validated = updateManualOrderSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.issues },
        { status: 400 }
      );
    }

    // التحقق من وجود الطلب
    const existing = await prisma.manualOrder.findUnique({
      where: { id },
      select: { id: true, status: true, paymentStatus: true, adminNotes: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { status, callStatus, paymentStatus, adminNotes, trackingNumber, trackingUrl } = validated.data;

    // منع تعديل الطلبات النهائية
    if (["DELIVERED", "REFUNDED"].includes(existing.status) && status && status !== existing.status) {
      return NextResponse.json(
        { error: `Cannot modify order with status: ${existing.status}` },
        { status: 400 }
      );
    }

    // تحديث الطلب
    const updated = await prisma.manualOrder.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(callStatus && { 
          callStatus,
          ...(callStatus !== "NOT_CALLED" && { calledAt: new Date() })
        }),
        ...(paymentStatus && { paymentStatus }),
        ...(adminNotes !== undefined && {
          adminNotes: existing.status === "CANCELLED"
            ? existing.adminNotes
            : `${existing.adminNotes || ""}\n[Updated by ${session.user.id} at ${new Date().toISOString()}]\n${adminNotes}`,
        }),
        ...(trackingNumber && { trackingNumber }),
        ...(trackingUrl && { trackingUrl }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        callStatus: true,
        paymentStatus: true,
        adminNotes: true,
        updatedAt: true,
        calledAt: true,
      },
    });

    // تسجيل التدقيق
    console.log(`[AUDIT] Admin ${session.user.id} updated manual order #${updated.orderNumber}`, {
      changes: { status, callStatus, paymentStatus },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: updated,
    });

  } catch (error) {
    console.error("[API] Manual order update failed:", error);
    
    if (error instanceof Error && error.message.includes("P2025")) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// ==================== 🔴 DELETE: إلغاء طلب يدوي ====================
/**
 * 🔴 DELETE /api/manual-orders/[id]
 * إلغاء طلب يدوي (Soft Delete)
 * - محمي: Admin/Super Admin فقط
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { id } = await params;

    // التحقق من وجود الطلب
    const existing = await prisma.manualOrder.findUnique({
      where: { id },
      select: { id: true, status: true, paymentStatus: true, adminNotes: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // منع إلغاء الطلبات النهائية
    if (["DELIVERED", "REFUNDED", "CANCELLED"].includes(existing.status)) {
      return NextResponse.json(
        { error: `Cannot cancel order with status: ${existing.status}` },
        { status: 400 }
      );
    }

    // Soft Delete: تعيين الحالة كـ CANCELLED
    const cancelled = await prisma.manualOrder.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        adminNotes: `${existing.adminNotes || ""}\n[Cancelled by ${session.user.id} at ${new Date().toISOString()}]`,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        cancelledAt: true,
        adminNotes: true,
      },
    });

    console.log(`[AUDIT] Admin ${session.user.id} cancelled manual order #${cancelled.orderNumber}`);

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      data: cancelled,
    });

  } catch (error) {
    console.error("[API] Manual order cancellation failed:", error);
    
    if (error instanceof Error && error.message.includes("P2025")) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}