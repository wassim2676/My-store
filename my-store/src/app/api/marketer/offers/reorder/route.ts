import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";

const schema = z.object({ ids: z.array(z.string()).min(1).max(500) });

// ==================== 🔀 POST: إعادة ترتيب العروض على صفحة الهبوط ====================
export async function POST(request: NextRequest) {
  const ctx = await getMarketerSession();
  if (!ctx?.landingPage) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ success: false, error: "بيانات غير صحيحة" }, { status: 400 });

  const pageId = ctx.landingPage.id;
  await prisma.$transaction(
    parsed.data.ids.map((id, index) =>
      prisma.offer.updateMany({ where: { id, landingPageId: pageId }, data: { position: index } })
    )
  );

  revalidatePath(`/${ctx.landingPage.slug}`, "layout");
  return NextResponse.json({ success: true });
}
