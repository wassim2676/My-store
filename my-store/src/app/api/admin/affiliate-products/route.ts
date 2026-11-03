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

function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return base || `product-${Date.now()}`;
}

const STATUS_VALUES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

// ==================== 🔐 مخطط إنشاء منتج أفلييت ====================
const createAffiliateProductSchema = z.object({
  title: z.string().trim().min(1, "عنوان المنتج مطلوب").max(255),
  slug: z.string().trim().max(255).optional(),
  shortReview: z.string().trim().min(1, "المراجعة المختصرة مطلوبة").max(600),
  description: z.string().trim().max(10_000).optional().nullable(),
  images: z.array(z.string().trim().min(1)).max(10).optional().default([]),
  price: z.number().positive().max(9_999_999).optional().nullable(),
  compareAt: z.number().positive().max(9_999_999).optional().nullable(),
  currency: z.string().trim().max(10).optional().default("MAD"),
  category: z.string().trim().min(1, "الصنف مطلوب").max(100),
  tags: z.array(z.string().trim()).max(20).optional().default([]),
  affiliateUrl: z
    .string()
    .trim()
    .min(1, "رابط الأفلييت مطلوب")
    .refine((v) => {
      try {
        const u = new URL(v);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    }, "رابط الأفلييت غير صحيح (يجب أن يبدأ بـ https://)"),
  rating: z.number().min(0).max(5).optional().default(0),
  reviewCount: z.number().int().min(0).optional().default(0),
  isFeatured: z.boolean().optional().default(false),
  status: z.enum(STATUS_VALUES).optional().default("PUBLISHED"),
  brandId: z.string().trim().min(1, "العلامة التجارية مطلوبة"),
});

const MAX_PER_PAGE = 100;

// ==================== 🟢 GET: قائمة منتجات الأفلييت (للأدمن) ====================
export async function GET(request: NextRequest) {
  try {
    const session = await assertAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(MAX_PER_PAGE, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category")?.trim();
    const brandId = searchParams.get("brandId")?.trim();
    const status = searchParams.get("status")?.trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { shortReview: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category && category !== "all") where.category = category;
    if (brandId && brandId !== "all") where.brandId = brandId;
    if (status && status !== "all") where.status = status;

    const [items, total] = await Promise.all([
      prisma.affiliateProduct.findMany({
        where,
        include: { brand: { select: { id: true, name: true, accentColor: true, logoSvg: true, logoUrl: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.affiliateProduct.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    console.error("[GET_AFFILIATE_PRODUCTS_ERROR]", error);
    return NextResponse.json({ success: false, error: "فشل جلب منتجات الأفلييت" }, { status: 500 });
  }
}

// ==================== 🟢 POST: إنشاء منتج أفلييت جديد ====================
export async function POST(request: NextRequest) {
  try {
    const session = await assertAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validated = createAffiliateProductSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.issues[0].message }, { status: 400 });
    }

    const data = validated.data;

    const brand = await prisma.brand.findUnique({ where: { id: data.brandId } });
    if (!brand) {
      return NextResponse.json({ success: false, error: "العلامة التجارية المختارة غير موجودة" }, { status: 400 });
    }

    let slug = data.slug ? slugify(data.slug) : slugify(data.title);
    const existingSlug = await prisma.affiliateProduct.findUnique({ where: { slug } });
    if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;

    const product = await prisma.affiliateProduct.create({
      data: {
        title: data.title,
        slug,
        shortReview: data.shortReview,
        description: data.description || null,
        images: data.images,
        price: data.price ?? null,
        compareAt: data.compareAt ?? null,
        currency: data.currency,
        category: data.category,
        tags: data.tags,
        affiliateUrl: data.affiliateUrl,
        rating: data.rating,
        reviewCount: data.reviewCount,
        isFeatured: data.isFeatured,
        status: data.status,
        brandId: data.brandId,
      },
      include: { brand: true },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    if (getPrismaErrorCode(error) === "P2002") {
      return NextResponse.json({ success: false, error: "يوجد منتج بهذا الرابط (slug) مسبقاً" }, { status: 409 });
    }
    console.error("[CREATE_AFFILIATE_PRODUCT_ERROR]", error);
    return NextResponse.json({ success: false, error: "فشل إنشاء المنتج" }, { status: 500 });
  }
}
