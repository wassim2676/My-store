import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// دالة توليد slug آمن من اسم المتجر (يدعم الحروف العربية عبر fallback)
function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return base || `store-${Date.now()}`;
}

const registerSchema = z.object({
  email: z.string().email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  firstName: z.string().min(1, "الاسم الأول مطلوب").optional(),
  lastName: z.string().min(1, "اسم العائلة مطلوب").optional(),
  phone: z.string().optional(),
  accountType: z.enum(["BUYER", "SELLER"]).default("BUYER"),
  storeName: z.string().min(2, "اسم المتجر قصير جداً").optional(),
}).refine(
  (data) => data.accountType !== "SELLER" || !!data.storeName,
  { message: "اسم المتجر مطلوب لحساب البائع", path: ["storeName"] }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, phone, accountType, storeName } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل مسبقاً" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // إنشاء المستخدم، وإن كان بائعاً: إنشاء متجره في نفس العملية (transaction)
    const user = await prisma.$transaction(async (tx: typeof prisma) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName: firstName || null,
          lastName: lastName || null,
          phone: phone || null,
          role: accountType === "SELLER" ? "SELLER" : "USER",
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });

      if (accountType === "SELLER" && storeName) {
        let slug = slugify(storeName);

        // ضمان تفرّد الـ slug
        const existingSlug = await tx.vendor.findUnique({ where: { slug } });
        if (existingSlug) {
          slug = `${slug}-${newUser.id.slice(-6)}`;
        }

        await tx.vendor.create({
          data: {
            userId: newUser.id,
            storeName,
            slug,
            contactEmail: email,
            phone: phone || null,
            status: "PENDING",
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message:
          accountType === "SELLER"
            ? "تم إنشاء حساب البائع وسيتم مراجعة متجرك قريباً"
            : "تم إنشاء حسابك بنجاح",
        user,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("[REGISTER_API_ERROR]", error);

    if (error instanceof Error && error.message.includes("P2002")) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل مسبقاً" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء إنشاء الحساب" },
      { status: 500 }
    );
  }
}
