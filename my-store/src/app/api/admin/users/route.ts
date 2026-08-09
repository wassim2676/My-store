import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * 🟢 GET /api/admin/users
 * يجلب قائمة المستخدمين مع الفلترة والبحث والترقيم (Pagination)
 * مخصص للمشرفين فقط (Admin/Super Admin)
 */
export async function GET(request: NextRequest) {
  try {
    // 1️⃣ التحقق من المصادقة والصلاحيات
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    // 2️⃣ استخراج وتحليل المعاملات (Query Parameters)
    const { searchParams } = new URL(request.url);

    // ترقيم الصفحات مع حدود أمان (Min 1, Max 100 items per page)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    // معلمات البحث والفلترة
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role"); // e.g., 'USER', 'ADMIN'
    const isActive = searchParams.get("isActive"); // e.g., 'true', 'false'

    // 3️⃣ بناء شرط الاستعلام (Dynamic Where Clause)
    const where: any = {};

    // فلترة حسب الدور (Role)
    if (role && ["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      where.role = role;
    }

    // فلترة حسب حالة الحساب (Active/Inactive)
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    // البحث الشامل (Full-text search simulation)
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // 4️⃣ تنفيذ الاستعلامات بالتوازي للأداء العالي
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" }, // الأحدث أولاً
        skip: (page - 1) * limit,        // تخطي الصفحات السابقة
        take: limit,                     // عدد العناصر في الصفحة
        // ⚠️ مهم: تحديد الحقول المطلوبة فقط (يخفي كلمة المرور تلقائياً)
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          // جلب عدد الطلبات لكل مستخدم لإظهار الإحصائيات
          _count: {
            select: { orders: true }
          }
        },
      }),
      prisma.user.count({ where }), // حساب الإجمالي للترقيم
    ]);

    // 5️⃣ إرجاع الاستجابة بصيغة قياسية
    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error("[API] Failed to fetch users:", error);
    // إرجاع رسالة خطأ عامة للواجهة (لا تكشف تفاصيل السيرفر)
    return NextResponse.json({ 
      success: false, 
      error: "An internal error occurred while fetching users." 
    }, { status: 500 });
  }
}