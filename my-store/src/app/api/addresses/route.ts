import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthSession } from "@/lib/api-utils";

// ==================== 🔍 مخطط التحقق ====================
const addressSchema = z.object({
  label: z.string().min(1, "اسم العنوان مطلوب").max(50),
  type: z.enum(["SHIPPING", "BILLING", "BOTH"]).default("SHIPPING"),
  firstName: z.string().min(1, "الاسم الأول مطلوب").max(50),
  lastName: z.string().min(1, "اسم العائلة مطلوب").max(50),
  phone: z.string().regex(/^\+?[0-9\s\-]{8,15}$/, "رقم هاتف غير صالح").min(8).max(20),
  company: z.string().max(100).optional().or(z.literal("")),
  street: z.string().min(5, "العنوان التفصيلي مطلوب").max(255),
  address2: z.string().max(255).optional().or(z.literal("")),
  city: z.string().min(1, "المدينة مطلوبة").max(100),
  state: z.string().max(100).optional().or(z.literal("")),
  postalCode: z.string().max(20).optional().or(z.literal("")),
  country: z.string().min(1, "الدولة مطلوبة").max(100).default("Morocco"),
  isDefault: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// ==================== 📥 GET: جلب جميع العناوين ====================
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      select: {
        id: true, label: true, type: true, firstName: true, lastName: true,
        phone: true, company: true, street: true, address2: true, city: true,
        state: true, postalCode: true, country: true, isDefault: true,
        latitude: true, longitude: true, createdAt: true,
      },
    });

    return successResponse(addresses);
  } catch (error) {
    console.error("[GET_ADDRESSES_ERROR]", error);
    return errorResponse("فشل جلب العناوين", 500);
  }
}

// ==================== 📤 POST: إضافة عنوان جديد ====================
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("غير مصرح", 401);

    const body = await request.json();
    const validated = addressSchema.safeParse(body);
    if (!validated.success) {
      return errorResponse(validated.error.issues[0].message, 400);
    }

    const { isDefault, ...addressData } = validated.data;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isActive: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: { ...addressData, isDefault, userId: session.user.id, isActive: true },
      select: {
        id: true, label: true, type: true, firstName: true, lastName: true,
        phone: true, street: true, city: true, country: true, isDefault: true, createdAt: true,
      },
    });

    return successResponse({ message: "تم إضافة العنوان بنجاح", address: newAddress }, 201);
  } catch (error) {
    console.error("[CREATE_ADDRESS_ERROR]", error);
    if (error instanceof z.ZodError) return errorResponse(error.issues[0].message, 400);
    if (error instanceof Error && error.message.includes("P2002")) {
      return errorResponse("اسم هذا العنوان مستخدم مسبقاً", 409);
    }
    return errorResponse("فشل إضافة العنوان", 500);
  }
}