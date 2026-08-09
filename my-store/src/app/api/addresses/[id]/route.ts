import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// مخطط بسيط للتحقق الجزئي عند التعديل
const updateAddressSchema = z.object({
  label: z.string().min(1).max(50).optional(),
  type: z.enum(["SHIPPING", "BILLING", "BOTH"]).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^\+?[0-9\s\-]{8,15}$/).min(8).max(20).optional(),
  company: z.string().max(100).optional(),
  street: z.string().min(5).max(255).optional(),
  address2: z.string().max(255).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(1).max(100).optional(),
  isDefault: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// ==================== 📥 GET: جلب عنوان واحد ====================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const address = await prisma.address.findFirst({
      where: { id, userId: session.user.id, isActive: true },
    });

    if (!address) return NextResponse.json({ error: "Address not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: address });
  } catch (error) {
    console.error("[GET_ADDRESS_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch address" }, { status: 500 });
  }
}

// ==================== ✏️ PUT: تحديث عنوان ====================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.address.findFirst({
      where: { id, userId: session.user.id, isActive: true },
    });
    if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });

    const validated = updateAddressSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
    }

    const { isDefault, ...updateData } = validated.data;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isActive: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: { ...updateData, isDefault },
      select: {
        id: true, label: true, type: true, firstName: true, lastName: true,
        phone: true, street: true, city: true, country: true, isDefault: true, updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[UPDATE_ADDRESS_ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

// ==================== ❌ DELETE: حذف عنوان ====================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: session.user.id, isActive: true },
    });
    if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });

    if (existing.isDefault) {
      const count = await prisma.address.count({
        where: { userId: session.user.id, isActive: true },
      });
      if (count <= 1) {
        return NextResponse.json({ error: "Cannot delete the only default address" }, { status: 400 });
      }
    }

    await prisma.address.update({ where: { id }, data: { isActive: false } });

    return NextResponse.json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.error("[DELETE_ADDRESS_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}