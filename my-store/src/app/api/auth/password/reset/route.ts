import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clearTokens, readToken, requestEmailLocale, sendPasswordChanged } from "@/lib/email/account";

// ==================== 🔐 POST: تعيين كلمة مرور جديدة بالرمز المرسل في الإيميل ====================
const schema = z.object({
  token: z.string().min(20).max(100),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return NextResponse.json({ success: false, error: field === "password" ? "password_short" : "invalid_token" }, { status: 400 });
  }

  const userId = await readToken("reset", parsed.data.token, true);
  if (!userId) return NextResponse.json({ success: false, error: "invalid_token" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, firstName: true, isActive: true, emailVerified: true } });
  if (!user || !user.isActive) return NextResponse.json({ success: false, error: "invalid_token" }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    // الرابط وصل إلى هذا البريد وفُتح منه → البريد مؤكَّد أيضاً
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12), emailVerified: user.emailVerified ?? new Date() },
  });
  await clearTokens("reset", user.id);

  const locale = await requestEmailLocale();
  after(() => sendPasswordChanged(user, locale).catch((err) => console.error("[RESET_NOTICE_EMAIL]", err)));
  return NextResponse.json({ success: true, data: { email: user.email } });
}
