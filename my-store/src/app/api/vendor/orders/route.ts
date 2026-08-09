import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { getVendorSession } from "@/lib/vendor-utils";

export async function GET() {
  const ctx = await getVendorSession();
  if (!ctx) return errorResponse("غير مصرح، حساب بائع مطلوب", 403);

  const items = await prisma.orderItem.findMany({
    where: { vendorId: ctx.vendor.id },
    include: {
      order: {
        select: { id: true, orderNumber: true, status: true, paymentStatus: true, paymentMethod: true, createdAt: true },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  });

  return successResponse(
    items.map((i: (typeof items)[number]) => ({
      id: i.id,
      productName: i.name,
      image: i.image,
      quantity: i.quantity,
      total: Number(i.total),
      order: i.order,
    }))
  );
}
