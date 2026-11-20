import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-utils";
import { requestEmailLocale, sendEmailChangedNotice, sendVerification } from "@/lib/email/account";

// ==================== ✉️ PUT /api/users/email: تغيير البريد الإلكتروني ====================
// البريد هو معرّف تسجيل الدخول، لذا نطلب كلمة المرور الحالية لتأكيد هوية صاحب الحساب.
// الأخطاء تُعاد كرموز (error: "wrong_password" ...) وتترجمها الواجهة حسب لغة المستخدم.
const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  currentPassword: z.string().min(1).max(100),
});

export async function PUT(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return NextResponse.json({ success: false, error: field === "email" ? "invalid_email" : "invalid" }, { status: 400 });
  }
  const { email, currentPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, firstName: true, passwordHash: true } });
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  if (!user.passwordHash) return NextResponse.json({ success: false, error: "no_password" }, { status: 400 });
  if (!(await bcrypt.compare(currentPassword, user.passwordHash)))
    return NextResponse.json({ success: false, error: "wrong_password" }, { status: 400 });
  if (email === user.email.toLowerCase()) return NextResponse.json({ success: false, error: "same_email" }, { status: 400 });

  const taken = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" }, NOT: { id: user.id } }, select: { id: true } });
  if (taken) return NextResponse.json({ success: false, error: "email_taken" }, { status: 409 });

  try {
    // البريد الجديد غير مؤكَّد بعد → رابط تفعيل له + تنبيه أمني للبريد القديم
    await prisma.user.update({ where: { id: user.id }, data: { email, emailVerified: null } });
  } catch (err) {
    console.error("[CHANGE_EMAIL_ERROR]", err);
    return NextResponse.json({ success: false, error: "server" }, { status: 500 });
  }
  const locale = await requestEmailLocale();
  after(async () => {
    await Promise.allSettled([
      sendVerification({ id: user.id, email, firstName: user.firstName }, locale, true),
      sendEmailChangedNotice(user.email, user, email, locale),
    ]);
  });
  return NextResponse.json({ success: true, data: { email } });
}
