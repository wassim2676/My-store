import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requestEmailLocale, sendPasswordReset } from "@/lib/email/account";

// ==================== 🔑 POST: طلب رابط إعادة تعيين كلمة المرور ====================
// الرد واحد دائماً سواء وُجد الحساب أم لا — لا نكشف أي البريدات مسجّلة لدينا.
const schema = z.object({ email: z.string().trim().toLowerCase().email().max(255) });

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ success: false, error: "invalid_email" }, { status: 400 });

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: parsed.data.email, mode: "insensitive" }, isActive: true, passwordHash: { not: null } },
      select: { id: true, email: true, firstName: true },
    });
    if (user) await sendPasswordReset(user, await requestEmailLocale()); // مهلة الإرسال المتكرر تُطبَّق بصمت
  } catch (err) {
    console.error("[FORGOT_PASSWORD_ERROR]", err);
  }
  return NextResponse.json({ success: true });
}
