import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-utils";
import { requestEmailLocale, sendVerification } from "@/lib/email/account";

// ==================== 🔁 POST: إعادة إرسال رابط تفعيل الحساب ====================
export async function POST() {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, firstName: true, emailVerified: true } });
  if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  if (user.emailVerified) return NextResponse.json({ success: true, data: { alreadyVerified: true } });

  const result = await sendVerification(user, await requestEmailLocale());
  if (!result.ok) return NextResponse.json({ success: false, error: "cooldown", retryAfter: result.retryAfter }, { status: 429 });
  if (!result.sent) return NextResponse.json({ success: false, error: "send_failed" }, { status: 502 });
  return NextResponse.json({ success: true, data: { email: user.email } });
}
