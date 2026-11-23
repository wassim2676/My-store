import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMarketerSession, ACTIVE_PAGE_COOKIE } from "@/lib/marketer";

// ==================== 🚪 POST /api/team/leave: مغادرة الفريق الحالي ====================
export async function POST() {
  const ctx = await getMarketerSession();
  if (!ctx?.member) return NextResponse.json({ success: false, error: "not_member" }, { status: 400 });
  await prisma.$transaction([
    prisma.changeRequest.updateMany({ where: { memberId: ctx.member.id, status: "pending" }, data: { status: "cancelled" } }),
    prisma.teamMember.delete({ where: { id: ctx.member.id } }),
  ]);
  const res = NextResponse.json({ success: true });
  res.cookies.delete(ACTIVE_PAGE_COOKIE);
  return res;
}
