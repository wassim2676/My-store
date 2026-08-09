import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ==================== 🎯 إعدادات الكاش (لـ Vercel Edge/Serverless) ====================
// الإحصائيات لا تتغير كل ثانية، لذا نسمح بالكاش لتحسين الأداء
const STATS_CACHE_DURATION = 60; // 60 ثانية

// ==================== 🟢 GET: جلب إحصائيات لوحة التحكم ====================
/**
 * 🟢 GET /api/admin/stats
 * يجلب إحصائيات شاملة للوحة تحكم الأدمن
 * - محمي: Admin/Super Admin فقط
 * - محسّن: استعلامات متوازية + كاش اختياري
 * - آمن: لا يعرض بيانات حساسة
 */
export async function GET(request: NextRequest) {
  try {
    // 1️⃣ التحقق من المصادقة والصلاحيات (أمان أولاً)
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // 2️⃣ استخراج معاملات الوقت (اختياري - للفلترة الزمنية)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all"; // 'all', 'today', 'week', 'month'

    // 3️⃣ بناء فلاتر التاريخ الديناميكية
    const now = new Date();
    const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};

    switch (period) {
      case "today":
        dateFilter.createdAt = {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lte: new Date(now.setHours(23, 59, 59, 999)),
        };
        break;
      case "week": {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter.createdAt = { gte: startOfWeek };
        break;
      }
      case "month":
        dateFilter.createdAt = {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        };
        break;
      // 'all' لا يضيف فلتر
    }

    // 4️⃣ تنفيذ جميع الاستعلامات بالتوازي (أداء عالي)
    const [
      totalOrders,
      revenueResult,
      totalCustomers,
      totalProducts,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockProducts,
      // إحصائيات إضافية للرسوم البيانية
      recentOrdersGrowth,
      revenueGrowth,
    ] = await Promise.all([
      // إجمالي الطلبات
      prisma.order.count({
        where: { ...dateFilter },
      }),

      // إجمالي الإيرادات (استبعاد الطلبات الملغاة)
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { notIn: ["CANCELLED", "REFUNDED"] },
          ...dateFilter,
        },
      }),

      // إجمالي العملاء النشطين
      prisma.user.count({
        where: {
          role: "USER",
          isActive: true,
          ...(period !== "all" && {
            createdAt: dateFilter.createdAt,
          }),
        },
      }),

      // إجمالي المنتجات النشطة
      prisma.product.count({
        where: { isActive: true },
      }),

      // توزيع حالات الطلبات
      prisma.order.count({
        where: { status: "PENDING", ...dateFilter },
      }),
      prisma.order.count({
        where: { status: "CONFIRMED", ...dateFilter },
      }),
      prisma.order.count({
        where: { status: "PROCESSING", ...dateFilter },
      }),
      prisma.order.count({
        where: { status: "SHIPPED", ...dateFilter },
      }),
      prisma.order.count({
        where: { status: "DELIVERED", ...dateFilter },
      }),
      prisma.order.count({
        where: { status: "CANCELLED", ...dateFilter },
      }),

      // المنتجات ذات المخزون المنخفض (أقل من أو يساوي 5)
      prisma.product.count({
        where: {
          stock: { lte: 5 },
          isActive: true,
        },
      }),

      // 📈 نمو الطلبات (مقارنة بالفترة السابقة)
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // آخر 30 يوم
          },
        },
      }),

      // 📈 نمو الإيرادات (آخر 30 يوم)
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { notIn: ["CANCELLED", "REFUNDED"] },
          createdAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // 5️⃣ معالجة البيانات بأمان (تجنب null/undefined)
    const safeRevenue = Number(revenueResult._sum.total) || 0;
    const safeGrowthRevenue = Number(revenueGrowth._sum.total) || 0;

    // 6️⃣ حساب النسب المئوية للتغير (للعرض في البطاقات)
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // 7️⃣ بناء كائن الاستجابة النهائي
    const stats = {
      summary: {
        totalOrders,
        revenue: safeRevenue,
        customers: totalCustomers,
        products: totalProducts,
      },
      orderBreakdown: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      alerts: {
        lowStockProducts,
        pendingOrdersCount: pendingOrders,
      },
      trends: {
        ordersLast30Days: recentOrdersGrowth,
        revenueLast30Days: safeGrowthRevenue,
        // يمكن إضافة حساب النسبة هنا إذا توفرت بيانات الفترة السابقة
      },
      meta: {
        period,
        generatedAt: new Date().toISOString(),
        currency: "MAD",
      },
    };

    // 8️⃣ إعداد رؤوس الكاش (مهم لـ Vercel CDN)
    const headers = new Headers();
    headers.set("Cache-Control", `public, s-maxage=${STATS_CACHE_DURATION}, stale-while-revalidate`);

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200, headers }
    );

  } catch (error) {
    console.error("[API] Stats fetch failed:", error);

    // معالجة أخطاء Prisma المحددة
    if (error instanceof Error) {
      if (error.message.includes("P1001")) {
        return NextResponse.json(
          { error: "Cannot connect to database. Please check your connection." },
          { status: 503 }
        );
      }
      if (error.message.includes("P2024")) {
        return NextResponse.json(
          { error: "Database connection timeout. Please try again." },
          { status: 504 }
        );
      }
    }

    // خطأ عام للواجهة (لا تكشف تفاصيل تقنية)
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics. Please try again later." },
      { status: 500 }
    );
  }
}