import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { getVendorSession } from "@/lib/vendor-utils";

const updateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).optional(),
  shortDesc: z.string().max(255).optional(),
  price: z.number().positive().optional(),
  compareAt: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).optional(),
  categories: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

async function assertOwnership(vendorId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.vendorId !== vendorId) return null;
  return product;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getVendorSession();
  if (!ctx) return errorResponse("غير مصرح، حساب بائع مطلوب", 403);
  const { id } = await params;

  const owned = await assertOwnership(ctx.vendor.id, id);
  if (!owned) return errorResponse("المنتج غير موجود", 404);

  const body = await request.json();
  const validated = updateSchema.safeParse(body);
  if (!validated.success) return errorResponse(validated.error.issues[0].message, 400);

  const updated = await prisma.product.update({ where: { id }, data: validated.data });
  return successResponse(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getVendorSession();
  if (!ctx) return errorResponse("غير مصرح، حساب بائع مطلوب", 403);
  const { id } = await params;

  const owned = await assertOwnership(ctx.vendor.id, id);
  if (!owned) return errorResponse("المنتج غير موجود", 404);

  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return successResponse({ deactivated: true });
}
