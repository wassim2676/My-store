import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma, OrderStatus, CallStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ==================== 🔐 مخططات التحقق (Zod Schemas) ====================
// ⚠️ مصححة لتطابق نموذج ManualOrder الفعلي في قاعدة البيانات (وليس Order)

const createManualOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required").max(255),
  phone: z.string().regex(/^\+?[0-9\s\-]{8,15}$/, "Invalid phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  city: z.string().min(1, "City is required").max(100),
  address: z.string().min(5, "Address is required").max(500),
  country: z.string().max(100).optional().default("Morocco"),
  productType: z.string().min(1, "Product type is required").max(255),
  quantity: z.number().int().min(1).max(999).default(1),
  unitPrice: z.number().positive("Unit price must be positive").max(999999.99),
  callStatus: z.enum(["NOT_CALLED", "CALLED_SUCCESS", "CALL_FAILED", "CALL_LATER"]).optional().default("NOT_CALLED"),
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED", "RETURNED"]).optional().default("PENDING"),
  customerNote: z.string().max(1000).optional(),
  adminNotes: z.string().max(2000).optional(),
  sourcePage: z.string().max(255).optional(),
  isLead: z.boolean().optional().default(false),
});

// ==================== 🎯 الثوابت ====================
const MANUAL_ORDERS_CACHE_DURATION = 60;
const MAX_ORDERS_PER_PAGE = 50;

// ==================== 🟢 GET: جلب الطلبات اليدوية ====================
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(MAX_ORDERS_PER_PAGE, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const status = searchParams.get("status");
    const callStatus = searchParams.get("callStatus");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search")?.trim();
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // بناء شرط الاستعلام (مطابق فعلياً لنموذج ManualOrder)
    const where: Prisma.ManualOrderWhereInput = {};

    if (status && status !== "all") where.status = status as OrderStatus;
    if (callStatus && callStatus !== "all") where.callStatus = callStatus as CallStatus;
    if (paymentStatus && paymentStatus !== "all") where.paymentStatus = paymentStatus as PaymentStatus;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    if (search) {
      const numericSearch = parseInt(search);
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        ...(isNaN(numericSearch) ? [] : [{ orderNumber: { equals: numericSearch } }]),
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.manualOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.manualOrder.count({ where }),
    ]);

    const headers = new Headers();
    headers.set("Cache-Control", `public, s-maxage=${MANUAL_ORDERS_CACHE_DURATION}, stale-while-revalidate`);

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
          filters: { status, callStatus, paymentStatus, search, dateFrom, dateTo },
        },
        meta: { timestamp: new Date().toISOString(), currency: "MAD" },
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

// ==================== 🟢 POST: إنشاء طلب يدوي جديد ====================
// ⚠️ هذا المسار عام بالكامل عمداً (بدون أي تحقق من تسجيل الدخول أو الصلاحيات) —
// يُستدعى مباشرة من صفحات الهبوط العامة (erovia) من قِبل أي زائر مجهول تماماً،
// سواء كان لديه حساب أم لا، مسجّلاً دخوله أم لا، أدمن أم عميلاً عادياً. لا تُضِف
// أي فحص auth()/session هنا مطلقاً مهما كان السبب — الحماية الوحيدة المقصودة
// هي التحقق من صحة البيانات المُدخَلة (Zod) أدناه، وليس هوية المُرسِل.
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
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
    const totalPrice = data.unitPrice * data.quantity;

    const newOrder = await prisma.manualOrder.create({
      data: {
        customerName: data.customerName,
        phone: data.phone,
        email: data.email || null,
        city: data.city,
        address: data.address,
        country: data.country || "Morocco",
        productType: data.productType,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalPrice,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        status: data.status,
        callStatus: data.callStatus,
        customerNote: data.customerNote || null,
        adminNotes: data.adminNotes || null,
        sourcePage: data.sourcePage || "Public",
        isLead: data.isLead,
      },
    });

    console.log(`[AUDIT] Public order created: ${newOrder.id} (source: ${data.sourcePage || "unknown"})`);

    return NextResponse.json(
      { success: true, message: "Manual order created successfully", data: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Manual order creation failed:", error);
    if (error instanceof Error) {
      if (error.message.includes("P2002")) {
        return NextResponse.json({ error: "Duplicate entry. Order number conflict." }, { status: 409 });
      }
      if (error.message.includes("P2025")) {
        return NextResponse.json({ error: "Related record not found" }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Failed to create manual order" }, { status: 500 });
  }
}
