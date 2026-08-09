import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ==================== 🔐 مخططات التحقق (Zod) ====================

const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  shortDesc: z.string().max(255).optional(),
  price: z.number().positive("Price must be positive").max(999999.99),
  compareAt: z.number().positive().max(999999.99).optional().nullable(),
  costPrice: z.number().positive().max(999999.99).optional().nullable(),
  stock: z.number().int().min(0, "Stock cannot be negative").max(999999),
  sku: z.string().max(100).optional().nullable(),
  barcode: z.string().max(100).optional().nullable(),
  images: z.array(z.string().url()).max(10).optional().default([]),
  categories: z.array(z.string()).max(10).optional().default([]),
  tags: z.array(z.string()).max(20).optional().default([]),
  brand: z.string().max(100).optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  // ✅ التصحيح: استخدام z.any() لـ JSON
  dimensions: z.any().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
});

const updateProductSchema = createProductSchema.partial();

// ==================== 🎯 الثوابت ====================
const PRODUCTS_CACHE_DURATION = 120;
const MAX_PRODUCTS_PER_PAGE = 100;

// ==================== 🟢 GET: جلب المنتجات ====================
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(MAX_PRODUCTS_PER_PAGE, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category")?.trim();
    const status = searchParams.get("status");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");

    const where: any = {};

    if (category && category !== "all") {
      where.categories = { has: category };
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      where.price = { ...where.price, gte: Number(minPrice) };
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      where.price = { ...where.price, lte: Number(maxPrice) };
    }

    if (inStock === "true") {
      where.stock = { gt: 0 };
    } else if (inStock === "false") {
      where.stock = { lte: 0 };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDesc: true,
          price: true,
          compareAt: true,
          stock: true,
          sku: true,
          barcode: true,
          images: true,
          categories: true,
          tags: true,
          brand: true,
          isActive: true,
          isFeatured: true,
          rating: true,
          reviewCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const headers = new Headers();
    headers.set("Cache-Control", `public, s-maxage=${PRODUCTS_CACHE_DURATION}, stale-while-revalidate`);

    return NextResponse.json(
      {
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        },
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("[API] Products fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// ==================== 🟢 POST: إنشاء منتج ====================
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const validated = createProductSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validated.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // توليد Slug فريد
    let slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
    let slugSuffix = 0;
    let originalSlug = slug;
    
    while (await prisma.product.findUnique({ where: { slug } })) {
      slugSuffix++;
      slug = `${originalSlug}-${slugSuffix}`;
    }

    // التحقق من SKU
    if (data.sku) {
      const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (existing) {
        return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
      }
    }

    // التحقق من Barcode
    if (data.barcode) {
      const existing = await prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (existing) {
        return NextResponse.json({ error: "Barcode already exists" }, { status: 409 });
      }
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDesc: data.shortDesc,
        price: data.price,
        compareAt: data.compareAt,
        costPrice: data.costPrice,
        stock: data.stock,
        sku: data.sku,
        barcode: data.barcode,
        images: data.images,
        categories: data.categories,
        tags: data.tags,
        brand: data.brand,
        weight: data.weight,
        dimensions: data.dimensions,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        rating: 0,
        reviewCount: 0,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        sku: true,
        images: true,
        categories: true,
        isActive: true,
        createdAt: true,
      },
    });

    console.log(`[AUDIT] User ${session.user.id} created product: ${product.id}`);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Product creation failed:", error);
    
    if (error instanceof Error && error.message.includes("P2002")) {
      return NextResponse.json({ error: "Duplicate entry" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}