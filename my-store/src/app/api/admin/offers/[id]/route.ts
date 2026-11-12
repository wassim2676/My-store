import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);
const schema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
});

async function requireAdmin() {
  const session = await auth();
  return !!session?.user && ADMIN_ROLES.has(session.user.role);
}

function revalidateOffer(slug: string, offerSlug: string) {
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/${offerSlug}`);
}

// ==================== 🛡️ PATCH: الأدمن يغيّر حالة عرض (إخفاء/نشر/أرشفة) ====================
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success || Object.keys(parsed.data).length === 0)
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });

  const { id } = await params;
  const offer = await prisma.offer
    .update({ where: { id }, data: parsed.data, select: { slug: true, landingPage: { select: { slug: true } } } })
    .catch(() => null);
  if (!offer) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  revalidateOffer(offer.landingPage.slug, offer.slug);
  return NextResponse.json({ success: true });
}

// ==================== 🗑️ DELETE: حذف عرض مخالف نهائياً ====================
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const offer = await prisma.offer
    .delete({ where: { id }, select: { slug: true, landingPage: { select: { slug: true } } } })
    .catch(() => null);
  if (!offer) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  revalidateOffer(offer.landingPage.slug, offer.slug);
  return NextResponse.json({ success: true });
}
