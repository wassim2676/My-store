import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-utils";

// يعيد جلسة المستخدم + متجره إن كان بائعاً، أو null إن لم يكن مصرّحاً له
export async function getVendorSession() {
  const session = await getAuthSession();
  if (!session) return null;
  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return null;
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
  if (!vendor) return null;

  return { session, vendor };
}
