import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getPrismaErrorCode } from "@/lib/api-utils";

async function assertAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) return null;
  return session;
}

const updateBrandSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  logoSvg: z.string().trim().max(50_000).optional().nullable(),
  logoUrl: z.string().trim().max(500).optional().nullable(),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{3,8}$/, "صيغة اللون غير صحيحة (مثال: #1D4ED8)")
    .optional(),
  buyLabel: z.string().trim().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
});

// ==================== 🟢 GET: جلب علامة تجارية محددة ====================
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await assertAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!brand) return NextResponse.json({ success: false, error: "العلامة التجارية غير موجودة" }, { status: 404 });

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error("[GET_BRAND_ERROR]", error);
    return NextResponse.json({ success: false, error: "فشل جلب العلامة التجارية" }, { status: 500 });
  }
}

// ==================== 🟡 PUT: تعديل علامة تجارية ====================
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await assertAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const validated = updateBrandSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.issues[0].message }, { status: 400 });
    }

    const data = validated.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.logoSvg !== undefined) updateData.logoSvg = data.logoSvg || null;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl || null;
    if (data.accentColor !== undefined) updateData.accentColor = data.accentColor;
    if (data.buyLabel !== undefined) updateData.buyLabel = data.buyLabel || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const brand = await prisma.brand.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    if (getPrismaErrorCode(error) === "P2025") {
      return NextResponse.json({ success: false, error: "العلامة التجارية غير موجودة" }, { status: 404 });
    }
    if (getPrismaErrorCode(error) === "P2002") {
      return NextResponse.json({ success: false, error: "يوجد علامة تجارية بهذا الاسم مسبقاً" }, { status: 409 });
    }
    console.error("[UPDATE_BRAND_ERROR]", error);
    return NextResponse.json({ success: false, error: "فشل تعديل العلامة التجارية" }, { status: 500 });
  }
}

// ==================== 🔴 DELETE: حذف علامة تجارية ====================
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await assertAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const productsCount = await prisma.affiliateProduct.count({ where: { brandId: id } });
    if (productsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `لا يمكن حذف هذه العلامة التجارية لأنها مرتبطة بـ ${productsCount} منتج. أزل الربط أولاً أو احذف المنتجات.`,
        },
        { status: 409 }
      );
    }

    await prisma.brand.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    if (getPrismaErrorCode(error) === "P2025") {
      return NextResponse.json({ success: false, error: "العلامة التجارية غير موجودة" }, { status: 404 });
    }
    console.error("[DELETE_BRAND_ERROR]", error);
    return NextResponse.json({ success: false, error: "فشل حذف العلامة التجارية" }, { status: 500 });
  }
}
