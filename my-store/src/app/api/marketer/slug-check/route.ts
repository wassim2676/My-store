import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkSlugFormat } from "@/lib/landing";

// ==================== 🔎 GET: هل اسم صفحة الهبوط متاح؟ (عام — يُستعمل في التسجيل) ====================
export async function GET(request: NextRequest) {
  const slug = (request.nextUrl.searchParams.get("slug") || "").trim().toLowerCase();

  const problem = checkSlugFormat(slug);
  if (problem) return NextResponse.json({ available: false, reason: problem });

  const existing = await prisma.landingPage.findUnique({ where: { slug }, select: { userId: true } });
  if (!existing) return NextResponse.json({ available: true });

  // الاسم الحالي لصاحب الصفحة نفسه يُعتبر متاحاً له
  const session = await auth();
  if (session?.user?.id && existing.userId === session.user.id) return NextResponse.json({ available: true, own: true });

  return NextResponse.json({ available: false, reason: "taken" });
}
