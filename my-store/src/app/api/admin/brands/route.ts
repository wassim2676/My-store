import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getPrismaErrorCode } from "@/lib/api-utils";

// ==================== 🔐 التحقق من صلاحية الأدمن ====================
async function assertAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) return null;
  return session;
}

// ==================== 🔧 توليد slug من الاسم ====================
function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return base || `brand-${Date.now()}`;
}

// ==================== 🔐 مخطط إنشاء/تعديل علامة تجارية ====================
const brandSchema = z.object({
  name: z.string().trim().min(1, "اسم العلامة التجارية مطلوب").max(100),
  logoSvg: z.string().trim().max(50_000).optional().nullable(),
  logoUrl: z.string().trim().max(500).optional().nullable(),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{3,8}$/, "صيغة اللون غير صحيحة (مثال: #1D4ED8)")
    .optional()
    .default("#1D4ED8"),
  buyLabel: z.string().trim().max(100).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

// ==================== 🟢 GET: جلب كل العلامات التجارية ====================
export async function GET() {
  try {
    const session = await assertAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { offers: true } } },
    });

    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error("[GET_BRANDS_ERROR]", error);
    return NextResponse.json({ success: false, error: "فشل جلب العلامات التجارية" }, { status: 500 });
  }
}

// ==================== 🟢 POST: إضافة علامة تجارية جديدة ====================
export async function POST(request: NextRequest) {
  try {
    const session = await assertAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validated = brandSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validated.data;

    // ✅ لا بد من شعار واحد على الأقل (SVG أو رابط) — غير إلزامي عند الإنشاء، يمكن إضافته بعدها
    let slug = slugify(data.name);
    const existingSlug = await prisma.brand.findUnique({ where: { slug } });
    if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug,
        logoSvg: data.logoSvg || null,
        logoUrl: data.logoUrl || null,
        accentColor: data.accentColor,
        buyLabel: data.buyLabel || null,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error) {
    if (getPrismaErrorCode(error) === "P2002") {
      return NextResponse.json(
        { success: false, error: "يوجد علامة تجارية بهذا الاسم مسبقاً" },
        { status: 409 }
      );
    }
    console.error("[CREATE_BRAND_ERROR]", error);
    return NextResponse.json({ success: false, error: "فشل إنشاء العلامة التجارية" }, { status: 500 });
  }
}
