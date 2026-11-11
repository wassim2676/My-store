import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({ isPublished: z.boolean() });

// ==================== 🛡️ PATCH: الأدمن يُخفي/يُظهر صفحة مسوّق ====================
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN"))
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ success: false, error: "بيانات غير صحيحة" }, { status: 400 });

  const { id } = await params;
  const page = await prisma.landingPage.update({ where: { id }, data: { isPublished: parsed.data.isPublished } }).catch(() => null);
  if (!page) return NextResponse.json({ success: false, error: "الصفحة غير موجودة" }, { status: 404 });

  revalidatePath(`/${page.slug}`, "layout");
  return NextResponse.json({ success: true });
}
