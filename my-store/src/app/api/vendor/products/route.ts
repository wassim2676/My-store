import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { getVendorSession } from "@/lib/vendor-utils";

function slugify(input: string): string {
  const base = input.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  return base || `product-${Date.now()}`;
}

export async function GET() {
  const ctx = await getVendorSession();
  if (!ctx) return errorResponse("غير مصرح، حساب بائع مطلوب", 403);

  const products = await prisma.product.findMany({
    where: { vendorId: ctx.vendor.id },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(
    products.map((p: (typeof products)[number]) => ({ ...p, price: Number(p.price), compareAt: p.compareAt ? Number(p.compareAt) : null }))
  );
}

const productSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  shortDesc: z.string().max(255).optional(),
  price: z.number().positive(),
  compareAt: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).min(1, "يجب إضافة صورة واحدة على الأقل"),
  categories: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const ctx = await getVendorSession();
  if (!ctx) return errorResponse("غير مصرح، حساب بائع مطلوب", 403);

  if (ctx.vendor.status !== "APPROVED") {
    return errorResponse("متجرك قيد المراجعة، لا يمكنك إضافة منتجات بعد حتى تتم الموافقة عليه", 403);
  }

  const body = await request.json();
  const validated = productSchema.safeParse(body);
  if (!validated.success) return errorResponse(validated.error.issues[0].message, 400);

  let slug = slugify(validated.data.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const product = await prisma.product.create({
    data: { ...validated.data, slug, vendorId: ctx.vendor.id },
  });

  return successResponse(product, 201);
}
