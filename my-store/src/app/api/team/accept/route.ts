import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ACTIVE_PAGE_COOKIE } from "@/lib/marketer";
import { hashToken } from "@/lib/team";
import { notify } from "@/lib/notifications";

// ==================== ✅ POST /api/team/accept: قبول دعوة فريق ====================
// • بريد جديد  ← ينشئ حساباً (الاسم + كلمة السر) مفعّلاً مباشرة (رابط الدعوة يثبت ملكية البريد)
// • بريد مسجّل ← يجب أن يكون صاحبه مسجّل الدخول بنفس الحساب
const schema = z.object({
  token: z.string().min(20).max(100),
  firstName: z.string().trim().min(1).max(60).optional(),
  lastName: z.string().trim().max(60).optional().nullable(),
  password: z.string().min(8).max(100).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    const f = parsed.error.issues[0]?.path[0];
    return NextResponse.json({ success: false, error: f === "password" ? "weak_password" : "invalid" }, { status: 400 });
  }
  const d = parsed.data;

  const member = await prisma.teamMember.findUnique({
    where: { inviteToken: hashToken(d.token) },
    include: { landingPage: { select: { id: true, title: true, userId: true } } },
  });
  if (!member || member.status !== "pending") return NextResponse.json({ success: false, error: "invalid_token" }, { status: 400 });
  if (!member.inviteExpires || member.inviteExpires < new Date()) return NextResponse.json({ success: false, error: "expired" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: member.email }, select: { id: true, isActive: true } });
  let userId: string;
  let created = false;

  if (existing) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "login_required" }, { status: 401 });
    if (session.user.id !== existing.id) return NextResponse.json({ success: false, error: "wrong_account" }, { status: 403 });
    if (!existing.isActive) return NextResponse.json({ success: false, error: "account_disabled" }, { status: 403 });
    userId = existing.id;
  } else {
    if (!d.password || !d.firstName) return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
    const user = await prisma.user.create({
      data: {
        email: member.email,
        passwordHash: await bcrypt.hash(d.password, 12),
        firstName: d.firstName,
        lastName: d.lastName || null,
        role: "MARKETER",
        isActive: true,
        emailVerified: new Date(),
      },
      select: { id: true },
    });
    userId = user.id;
    created = true;
  }

  if (member.landingPage.userId === userId) return NextResponse.json({ success: false, error: "self" }, { status: 400 });

  // استعمال واحد: نقبل فقط إن كانت الدعوة ما زالت معلّقة (يمنع القبول المزدوج المتزامن)
  const { count } = await prisma.teamMember.updateMany({
    where: { id: member.id, status: "pending", inviteToken: member.inviteToken },
    data: { status: "active", userId, acceptedAt: new Date(), inviteToken: null, inviteExpires: null, lastActiveAt: new Date() },
  });
  if (count === 0) return NextResponse.json({ success: false, error: "invalid_token" }, { status: 400 });

  await notify(member.landingPage.userId, {
    type: "team.joined",
    data: { name: d.firstName ? [d.firstName, d.lastName].filter(Boolean).join(" ") : member.name || member.email, email: member.email },
    link: "/dashboard/team",
    dedupeKey: `joined:${member.id}`,
  });

  const res = NextResponse.json({ success: true, data: { created, email: member.email } });
  // لوحة التحكم تفتح مباشرة على صفحة الفريق الجديد
  res.cookies.set(ACTIVE_PAGE_COOKIE, member.landingPage.id, { path: "/", sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
