import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { getVendorSession } from "@/lib/vendor-utils";

export async function GET() {
  const ctx = await getVendorSession();
  if (!ctx) return errorResponse("غير مصرح، حساب بائع مطلوب", 403);

  const [productsCount, activeProductsCount, orderItems] = await Promise.all([
    prisma.product.count({ where: { vendorId: ctx.vendor.id } }),
    prisma.product.count({ where: { vendorId: ctx.vendor.id, isActive: true } }),
    prisma.orderItem.findMany({ where: { vendorId: ctx.vendor.id }, select: { total: true, orderId: true } }),
  ]);

  const totalRevenue = orderItems.reduce((sum: number, i: (typeof orderItems)[number]) => sum + Number(i.total), 0);
  const ordersCount = new Set(orderItems.map((i: (typeof orderItems)[number]) => i.orderId)).size;

  return successResponse({
    productsCount,
    activeProductsCount,
    ordersCount,
    totalRevenue,
    status: ctx.vendor.status,
  });
}
