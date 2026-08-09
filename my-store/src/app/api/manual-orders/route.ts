import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ==================== 🔐 مخططات التحقق (Zod) ====================

const createManualOrderSchema = z.object({
  // 👤 معلومات العميل
  customerName: z.string().min(2, "اسم العميل مطلوب").max(255),
  phone: z.string().regex(/^\+?[0-9\s\-]{8,15}$/, "رقم هاتف غير صالح"),
  email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal("")),
  country: z.string().min(1, "الدولة مطلوبة").max(100),
  city: z.string().min(1, "المدينة مطلوبة").max(100),
  address: z.string().min(5, "العنوان مطلوب").max(500),
  
  // 📦 تفاصيل المنتج
  productType: z.string().min(1, "نوع المنتج مطلوب").max(255),
  quantity: z.number().int().min(1, "الكمية يجب أن تكون 1 على الأقل").max(999),
  unitPrice: z.number().positive("السعر غير صالح").max(999999.99),
  
  // 💳 الدفع
  paymentMethod: z.enum(["COD", "STRIPE"]).default("COD"),
  
  // 📝 إضافات
  customerNote: z.string().max(1000).optional(),
  sourcePage: z.string().max(255).optional(),
});

const updateManualOrderSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED", "RETURNED"]).optional(),
  callStatus: z.enum(["NOT_CALLED", "CALLED_SUCCESS", "CALL_FAILED", "CALL_LATER"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  adminNotes: z.string().max(2000).optional(),
  trackingNumber: z.string().max(100).optional(),
});

// ==================== 🎯 الثوابت ====================
const CACHE_DURATION = 60;
const MAX_PER_PAGE = 50;

// ==================== 🟢 GET: جلب الطلبات اليدوية ====================
/**
 * 🟢 GET /api/manual-orders
 * يجلب قائمة الطلبات اليدوية مع فلاتر متقدمة
 * - للجمهور: بدون حماية (للعرض العام)
 * - للأدمن: مع فلاتر إضافية
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
    
    const { searchParams } = new URL(request.url);
    
    // ترقيم الصفحات
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(MAX_PER_PAGE, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    
    // فلاتر البحث
    const status = searchParams.get("status");
    const callStatus = searchParams.get("callStatus");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search")?.trim();
    const city = searchParams.get("city");
    const country = searchParams.get("country");
    const productType = searchParams.get("productType");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const minTotal = searchParams.get("minTotal");
    const maxTotal = searchParams.get("maxTotal");

    // بناء شرط الاستعلام
    const where: any = {};

    // فلاتر الحالة
    if (status && status !== "all") where.status = status;
    if (callStatus && callStatus !== "all") where.callStatus = callStatus;
    if (paymentStatus && paymentStatus !== "all") where.paymentStatus = paymentStatus;
    
    // فلاتر الموقع
    if (city && city !== "all") where.city = { contains: city, mode: "insensitive" as const };
    if (country && country !== "all") where.country = { contains: country, mode: "insensitive" as const };
    
    // فلترة نوع المنتج
    if (productType && productType !== "all") {
      where.productType = { contains: productType, mode: "insensitive" as const };
    }
    
    // فلترة التاريخ
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    
    // فلترة السعر
    if (minTotal || maxTotal) {
      where.totalPrice = {};
      if (minTotal) where.totalPrice.gte = parseFloat(minTotal);
      if (maxTotal) where.totalPrice.lte = parseFloat(maxTotal);
    }
    
    // بحث شامل (للأدمن فقط)
    if (isAdmin && search) {
      const numericSearch = parseInt(search);
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { city: { contains: search, mode: "insensitive" as const } },
        { productType: { contains: search, mode: "insensitive" as const } },
        ...(isNaN(numericSearch) ? [] : [
          { orderNumber: { equals: numericSearch } },
          { totalPrice: { equals: numericSearch } },
        ]),
      ];
    }

    // تنفيذ الاستعلامات بالتوازي
    const [orders, total] = await Promise.all([
      prisma.manualOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          phone: true,
          email: true,
          city: true,
          country: true,
          productType: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          paymentMethod: true,
          paymentStatus: true,
          status: true,
          callStatus: true,
          sourcePage: true,
          createdAt: true,
          updatedAt: true,
          calledAt: true,
        },
      }),
      prisma.manualOrder.count({ where }),
    ]);

    // إعداد رؤوس الكاش
    const headers = new Headers();
    headers.set("Cache-Control", `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`);

    return NextResponse.json(
      {
        success: true,
        data: {
          orders,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
          filters: {
            status, callStatus, paymentStatus, search, city, country, productType, dateFrom, dateTo,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          currency: "MAD",
          isAdmin,
        },
      },
      { status: 200, headers }
    );

  } catch (error) {
    console.error("[API] Manual orders fetch failed:", error);
    
    if (error instanceof Error && error.message.includes("P1001")) {
      return NextResponse.json({ error: "Cannot connect to database" }, { status: 503 });
    }
    
    return NextResponse.json({ error: "Failed to fetch manual orders" }, { status: 500 });
  }
}

// ====================  POST: إنشاء طلب يدوي جديد ====================
/**
 * 🟢 POST /api/manual-orders
 * ينشئ طلباً يدوياً جديداً من النموذج البسيط
 * - متاح للعامة (بدون تسجيل دخول)
 * - مدقق بالكامل باستخدام Zod
 */
export async function POST(request: NextRequest) {
  try {
    // قراءة الجسم والتحقق من صحته
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const validated = createManualOrderSchema.safeParse(body);
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

    // ✅ تصحيح حساب الأسعار - إزالة الضريبة أو جعلها اختيارية
    const subtotal = data.unitPrice * data.quantity;
    
    // الخيار 1: بدون ضريبة نهائياً (الأفضل للمغرب - COD)
    const tax = 0;
    const shippingFee = subtotal >= 500 ? 0 : 30;
    const totalPrice = subtotal + shippingFee;
    
    // الخيار 2: إذا أردت إضافة ضريبة، استخدم هذا الكود بدلاً من الأعلى:
    // const taxRate = body.taxRate || 0; // 0 بشكل افتراضي
    // const tax = subtotal * taxRate;
    // const shippingFee = subtotal >= 500 ? 0 : 30;
    // const totalPrice = subtotal + tax + shippingFee;

    // استخراج معلومات التحليل
    const userAgent = request.headers.get("user-agent") || null;
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || null;

    // إنشاء الطلب
    const newOrder = await prisma.manualOrder.create({
      data: {
        // 👤 معلومات العميل
        customerName: data.customerName,
        phone: data.phone,
        email: data.email || null,
        country: data.country,
        city: data.city,
        address: data.address,
        
        // 📦 تفاصيل المنتج
        productType: data.productType,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalPrice, // السعر الصحيح الآن
        
        //  الدفع
        paymentMethod: data.paymentMethod,
        paymentStatus: "PENDING",
        
        // 📊 الحالة
        status: "PENDING",
        callStatus: "NOT_CALLED",
        
        // 📝 إضافات
        customerNote: data.customerNote || null,
        sourcePage: data.sourcePage || null,
        userAgent,
        ipAddress,
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        phone: true,
        email: true,
        productType: true,
        quantity: true,
        totalPrice: true,
        status: true,
        callStatus: true,
        createdAt: true,
      },
    });

    // تسجيل الحدث للتدقيق
    console.log(`[AUDIT] New manual order created: #${newOrder.orderNumber}`, {
      customer: data.customerName,
      phone: data.phone,
      product: data.productType,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      subtotal,
      tax,
      shippingFee,
      totalPrice,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully. We will contact you soon!",
        data: newOrder,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("[API] Manual order creation failed:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("P2002")) {
        return NextResponse.json({ error: "Duplicate entry. Please try again." }, { status: 409 });
      }
    }
    
    return NextResponse.json({ error: "Failed to create order. Please try again." }, { status: 500 });
  }
}