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

const STATUS_VALUES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

const updateAffiliateProductSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  slug: z.string().trim().max(255).optional(),
  shortReview: z.string().trim().min(1).max(600).optional(),
  description: z.string().trim().max(10_000).optional().nullable(),
  images: z.array(z.string().trim().min(1)).max(10).optional(),
  price: z.number().positive().max(9_999_999).optional().nullable(),
  compareAt: z.number().positive().max(9_999_999).optional().nullable(),
  currency: z.string().trim().max(10).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  tags: z.array(z.string().trim()).max(20).optional(),
  affiliateUrl: z
    .string()
    .trim()
    .min(1)
    .refine((v) => {
      try {
        const u = new URL(v);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    }, "رابط الأفلييت غير صحيح (يجب أن يبدأ بـ https://)")
    .optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(STATUS_VALUES).optional(),
  brandId: z.string().trim().min(1).optional(),
});

function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return base || `product-${Date.now()}`;
}

// ==================== 🟢 GET: جلب منتج أفلييت محدد ====================
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await assertAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const product = await prisma.affiliateProduct.findUnique({ where: { id }, include: { brand: true } });
    if (!product) return NextResponse.json({ success: false, error: "المنتج غير موجود" }, { status: 404 });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("[GET_AFFILIATE_PRODUCT_ERROR]", error);
    return NextResponse.json({ success: false, error: "فشل جلب المنتج" }, { status: 500 });
  }
}

// ==================== 🟡 PUT: تعديل منتج أفلييت ====================
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await assertAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const validated = updateAffiliateProductSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.issues[0].message }, { status: 400 });
    }

    const data = validated.data;

    if (data.brandId) {
      const brand = await prisma.brand.findUnique({ where: { id: data.brandId } });
      if (!brand) {
        return NextResponse.json({ success: false, error: "العلامة التجارية المختارة غير موجودة" }, { status: 400 });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    for (const key of [
      "title",
      "shortReview",
      "description",
      "images",
      "price",
      "compareAt",
      "currency",
      "category",
      "tags",
      "affiliateUrl",
      "rating",
      "reviewCount",
      "isFeatured",
      "status",
      "brandId",
    ] as const) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }

    if (data.slug) {
      let slug = slugify(data.slug);
      const existing = await prisma.affiliateProduct.findFirst({ where: { slug, id: { not: id } } });
      if (existing) slug = `${slug}-${Date.now().toString(36)}`;
      updateData.slug = slug;
    }

    const product = await prisma.affiliateProduct.update({
      where: { id },
      data: updateData,
      include: { brand: true },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    if (getPrismaErrorCode(error) === "P2025") {
      return NextResponse.json({ success: false, error: "المنتج غير موجود" }, { status: 404 });
    }
    if (getPrismaErrorCode(error) === "P2002") {
      return NextResponse.json({ success: false, error: "يوجد منتج بهذا الرابط (slug) مسبقاً" }, { status: 409 });
    }
    console.error("[UPDATE_AFFILIATE_PRODUCT_ERROR]", error);
    return NextResponse.json({ success: false, error: "فشل تعديل المنتج" }, { status: 500 });
  }
}

// ==================== 🔴 DELETE: حذف منتج أفلييت ====================
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await assertAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.affiliateProduct.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    if (getPrismaErrorCode(error) === "P2025") {
      return NextResponse.json({ success: false, error: "المنتج غير موجود" }, { status: 404 });
    }
    console.error("[DELETE_AFFILIATE_PRODUCT_ERROR]", error);
    return NextResponse.json({ success: false, error: "فشل حذف المنتج" }, { status: 500 });
  }
}
