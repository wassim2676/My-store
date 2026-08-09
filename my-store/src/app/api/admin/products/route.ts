import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ==================== 🔐 مخططات التحقق (Zod Schemas) ====================

// مخطط إنشاء منتج جديد
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
  images: z.array(z.string().url("Invalid image URL")).max(10).optional().default([]),
  categories: z.array(z.string()).max(10).optional().default([]),
  tags: z.array(z.string()).max(20).optional().default([]),
  brand: z.string().max(100).optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  
  // ✅ التصحيح هنا - اختر أحد الخيارات:
  dimensions: z.record(z.string(), z.unknown()).optional().nullable(),
  
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
});

// مخطط تحديث منتج (جميع الحقول اختيارية)
const updateProductSchema = createProductSchema.partial();

// ==================== 🎯 إعدادات عامة ====================
const PRODUCTS_CACHE_DURATION = 120; // 120 ثانية كاش لـ GET
const MAX_PRODUCTS_PER_PAGE = 100; // حد أقصى للعناصر في الصفحة

// ==================== 🟢 GET: جلب قائمة المنتجات ====================
/**
 * 🟢 GET /api/admin/products
 * يجلب منتجات مع فلترة، بحث، وترقيم صفحات
 * - محمي: Admin/Super Admin فقط
 * - محسّن: استعلامات متوازية + كاش
 * - آمن: لا يعرض بيانات حساسة
 */
export async function GET(request: NextRequest) {
  try {
    // 1️⃣ التحقق من المصادقة والصلاحيات
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // 2️⃣ استخراج وتحليل المعاملات مع تحقق من الصحة
    const { searchParams } = new URL(request.url);
    
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      MAX_PRODUCTS_PER_PAGE,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );
    
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category")?.trim();
    const status = searchParams.get("status"); // 'active' | 'inactive'
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock"); // 'true' | 'false'

    // 3️⃣ بناء شرط الاستعلام الديناميكي
    const where: any = {};

    // فلترة حسب الفئة (Prisma array contains)
    if (category && category !== "all") {
      where.categories = { has: category };
    }

    // فلترة حسب حالة النشاط
    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    // فلترة حسب نطاق السعر
    if (minPrice && !isNaN(Number(minPrice))) {
      where.price = { ...where.price, gte: Number(minPrice) };
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      where.price = { ...where.price, lte: Number(maxPrice) };
    }

    // فلترة حسب توفر المخزون
    if (inStock === "true") {
      where.stock = { gt: 0 };
    } else if (inStock === "false") {
      where.stock = { lte: 0 };
    }

    // بحث شامل (اسم، وصف، SKU، باركود)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    // 4️⃣ تنفيذ الاستعلامات بالتوازي للأداء العالي
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
          // عد العناصر المرتبطة بدون جلبها
          _count: {
            select: {
              orderItems: true,
              wishlistBy: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // 5️⃣ بناء الاستجابة مع بيانات الترقيم
    const response = {
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
        filters: {
          category,
          status,
          search,
          priceRange: { min: minPrice ? Number(minPrice) : undefined, max: maxPrice ? Number(maxPrice) : undefined },
          inStock: inStock ? inStock === "true" : undefined,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        currency: "MAD",
      },
    };

    // 6️⃣ إعداد رؤوس الكاش لـ Vercel CDN
    const headers = new Headers();
    headers.set("Cache-Control", `public, s-maxage=${PRODUCTS_CACHE_DURATION}, stale-while-revalidate`);

    return NextResponse.json(response, { status: 200, headers });

  } catch (error) {
    console.error("[API] Products fetch failed:", error);

    // معالجة أخطاء Prisma المحددة
    if (error instanceof Error) {
      if (error.message.includes("P1001")) {
        return NextResponse.json(
          { error: "Cannot connect to database. Please check your connection." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch products. Please try again later." },
      { status: 500 }
    );
  }
}

// ==================== 🟢 POST: إنشاء منتج جديد ====================
/**
 * 🟢 POST /api/admin/products
 * ينشئ منتجاً جديداً مع تحقق كامل من البيانات
 * - محمي: Admin/Super Admin فقط
 * - مدقق: Zod schema للتحقق من المدخلات
 * - آمن: فحص التكرار، توليد Slug فريد
 */
export async function POST(request: NextRequest) {
  try {
    // 1️⃣ التحقق من المصادقة والصلاحيات
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // 2️⃣ قراءة الجسم والتحقق من صحته باستخدام Zod
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
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

    // 3️⃣ توليد Slug فريد إذا لم يُقدم
    let slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
    
    // التحقق من عدم تكرار الـ Slug
    let slugSuffix = 0;
    let originalSlug = slug;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slugSuffix++;
      slug = `${originalSlug}-${slugSuffix}`;
    }

    // 4️⃣ التحقق من عدم تكرار SKU إذا وُجد
    if (data.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: data.sku },
        select: { id: true },
      });
      if (existingSku) {
        return NextResponse.json(
          { error: "SKU already exists. Please use a unique SKU." },
          { status: 409 }
        );
      }
    }

    // 5️⃣ التحقق من عدم تكرار Barcode إذا وُجد
    if (data.barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode: data.barcode },
        select: { id: true },
      });
      if (existingBarcode) {
        return NextResponse.json(
          { error: "Barcode already exists. Please use a unique barcode." },
          { status: 409 }
        );
      }
    }

    // 6️⃣ إنشاء المنتج في قاعدة البيانات
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
        dimensions: data.dimensions as any,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        // الحقول الافتراضية
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

    // 7️⃣ تسجيل الحدث لأغراض التدقيق
    console.log(`[AUDIT] User ${session.user.id} created product:`, {
      productId: product.id,
      productName: product.name,
      timestamp: new Date().toISOString(),
    });

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

    // معالجة أخطاء Prisma الشائعة
    if (error instanceof Error) {
      if (error.message.includes("P2002")) {
        return NextResponse.json(
          { error: "Duplicate entry. Slug, SKU, or Barcode may already exist." },
          { status: 409 }
        );
      }
      if (error.message.includes("P2025")) {
        return NextResponse.json({ error: "Related record not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Failed to create product. Please try again later." },
      { status: 500 }
    );
  }
}