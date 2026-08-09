import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthSession } from "@/lib/api-utils";

const updateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "SUSPENDED", "REJECTED"]),
  rejectionReason: z.string().max(500).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return errorResponse("غير مصرح، صلاحيات أدمن مطلوبة", 401);
  }

  const { id } = await params;
  const body = await request.json();
  const validated = updateSchema.safeParse(body);
  if (!validated.success) return errorResponse(validated.error.issues[0].message, 400);

  const vendor = await prisma.vendor.update({
    where: { id },
    data: {
      status: validated.data.status,
      rejectionReason: validated.data.rejectionReason,
      approvedAt: validated.data.status === "APPROVED" ? new Date() : undefined,
    },
  });

  return successResponse(vendor);
}
