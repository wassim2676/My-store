import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ==================== 🔐 مخططات التحقق (Zod Schemas) ====================

const updateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^\+?[0-9\s\-]{8,15}$/).optional(),
});

// ==================== 🟢 PUT: تحديث بيانات المستخدم ====================
/**
 * 🟢 PUT /api/admin/users/[id]
 * تحديث بيانات المستخدم أو حالته أو دوره
 * مخصص للمشرفين فقط (Admin/Super Admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1️⃣ التحقق من المصادقة والصلاحيات
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    // 2️⃣ استخراج المعرف والتحقق من صحة المدخلات
    const { id } = await params;
    
    // منع تحديث المستخدم لنفسه (تجنب قفل الحساب عن النفس)
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Admins cannot modify their own account via this endpoint." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = updateUserSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { role, isActive, firstName, lastName, phone } = validated.data;

    // 3️⃣ منع ترقية المستخدم العادي إلى SUPER_ADMIN إلا بواسطة SUPER_ADMIN
    if (role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only SUPER_ADMIN can assign SUPER_ADMIN role." },
        { status: 403 }
      );
    }

    // 4️⃣ تحديث المستخدم في قاعدة البيانات
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // 5️⃣ تسجيل الحدث لأغراض التدقيق (Audit Log)
    console.log(`[AUDIT] User ${session.user.id} updated user ${id}:`, {
      changes: { role, isActive, firstName, lastName, phone },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.error("[API] User update failed:", error);

    // معالجة أخطاء Prisma الشائعة
    if (error instanceof Error) {
      if (error.message.includes("P2025")) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (error.message.includes("P2002")) {
        return NextResponse.json({ error: "Duplicate entry. Phone or email may already exist." }, { status: 409 });
      }
    }

    return NextResponse.json(
      { error: "An internal error occurred while updating the user." },
      { status: 500 }
    );
  }
}

// ==================== 🔴 DELETE: حذف مستخدم (Soft Delete) ====================
/**
 * 🔴 DELETE /api/admin/users/[id]
 * حذف مستخدم بشكل آمن (Soft Delete) مع التحقق من سلامة البيانات
 * مخصص للمشرفين فقط (Admin/Super Admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1️⃣ التحقق من المصادقة والصلاحيات
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { id } = await params;

    // 2️⃣ منع حذف المشرف لنفسه
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Admins cannot delete their own account via this endpoint." },
        { status: 400 }
      );
    }

    // 3️⃣ التحقق من وجود المستخدم قبل الحذف
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4️⃣ منع حذف SUPER_ADMIN إلا بواسطة SUPER_ADMIN
    if (existingUser.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only SUPER_ADMIN can delete SUPER_ADMIN accounts." },
        { status: 403 }
      );
    }

    // 5️⃣ التحقق من سلامة البيانات: لا تحذف مستخدم لديه طلبات
    const orderCount = await prisma.order.count({
      where: { userId: id },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete user with existing orders. Use deactivation instead.",
          suggestion: "Set isActive: false to deactivate the account.",
          orderCount,
        },
        { status: 400 }
      );
    }

    // 6️⃣ Soft Delete: تعطيل الحساب بدلاً من الحذف النهائي
    // هذا يحافظ على سلامة البيانات المرجعية (Referential Integrity)
    const deactivatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
        // يمكن إضافة حقل `deletedAt` إذا أردت تتبع وقت الحذف الناعم
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // 7️⃣ تسجيل حدث الحذف لأغراض التدقيق
    console.log(`[AUDIT] User ${session.user.id} deactivated user ${id}:`, {
      timestamp: new Date().toISOString(),
      reason: "Admin action via API",
    });

    return NextResponse.json({
      success: true,
      message: "User account deactivated successfully",
      data: deactivatedUser,
    });

  } catch (error) {
    console.error("[API] User deletion failed:", error);

    if (error instanceof Error) {
      if (error.message.includes("P2025")) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "An internal error occurred while processing the deletion." },
      { status: 500 }
    );
  }
}