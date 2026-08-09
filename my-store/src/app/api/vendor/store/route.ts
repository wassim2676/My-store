import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { getVendorSession } from "@/lib/vendor-utils";

export async function GET() {
  const ctx = await getVendorSession();
  if (!ctx) return errorResponse("غير مصرح، حساب بائع مطلوب", 403);
  return successResponse(ctx.vendor);
}

const updateSchema = z.object({
  storeName: z.string().min(2).max(150).optional(),
  description: z.string().max(1000).optional().nullable(),
  logo: z.string().url().optional().nullable().or(z.literal("")),
  banner: z.string().url().optional().nullable().or(z.literal("")),
  bannerTitle: z.string().max(150).optional().nullable(),
  bannerSubtitle: z.string().max(255).optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  phone: z.string().max(20).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
});

export async function PATCH(request: NextRequest) {
  const ctx = await getVendorSession();
  if (!ctx) return errorResponse("غير مصرح، حساب بائع مطلوب", 403);

  const body = await request.json();
  const validated = updateSchema.safeParse(body);
  if (!validated.success) return errorResponse(validated.error.issues[0].message, 400);

  const updated = await prisma.vendor.update({
    where: { id: ctx.vendor.id },
    data: validated.data,
  });

  return successResponse(updated);
}
