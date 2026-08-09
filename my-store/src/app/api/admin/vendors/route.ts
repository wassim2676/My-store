import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthSession } from "@/lib/api-utils";

async function assertAdmin() {
  const session = await getAuthSession();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) return null;
  return session;
}

export async function GET() {
  const session = await assertAdmin();
  if (!session) return errorResponse("غير مصرح، صلاحيات أدمن مطلوبة", 401);

  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, firstName: true, lastName: true, phone: true } },
      _count: { select: { products: true } },
    },
  });

  return successResponse(
    vendors.map((v: (typeof vendors)[number]) => ({
      id: v.id,
      storeName: v.storeName,
      slug: v.slug,
      status: v.status,
      email: v.user.email,
      ownerName: `${v.user.firstName || ""} ${v.user.lastName || ""}`.trim() || v.user.email,
      phone: v.user.phone,
      productsCount: v._count.products,
      totalSales: Number(v.totalSales),
      createdAt: v.createdAt,
    }))
  );
}
