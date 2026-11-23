import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ACTIVE_PAGE_COOKIE } from "@/lib/marketer";

// ==================== 🔀 POST /api/team/switch: التبديل بين صفحتي وصفحات الفرق التي أنا عضو فيها ====================
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const { pageId } = (await request.json().catch(() => ({}))) as { pageId?: string };
  if (typeof pageId !== "string") return NextResponse.json({ success: false, error: "invalid" }, { status: 400 });

  const [own, member] = await Promise.all([
    prisma.landingPage.findFirst({ where: { id: pageId, userId: session.user.id }, select: { id: true } }),
    prisma.teamMember.findFirst({ where: { landingPageId: pageId, userId: session.user.id, status: "active" }, select: { id: true } }),
  ]);
  if (!own && !member) return NextResponse.json({ success: false, error: "forbidden" }, { status: 403 });

  const res = NextResponse.json({ success: true });
  res.cookies.set(ACTIVE_PAGE_COOKIE, pageId, { path: "/", sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
