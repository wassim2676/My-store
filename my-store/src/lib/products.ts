import { prisma } from "@/lib/prisma";

// ==================== 🛍️ دوال جلب بيانات المنتجات الحقيقية ====================
// تُستخدم في مكوّنات الصفحة الرئيسية (Server Components) لتفادي بيانات وهمية

export type HomeProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAt: number | null;
  image: string;
  rating: number;
  reviewCount: number;
  stock: number;
  vendorName: string | null;
};

function serializeProduct(p: {
  id: string;
  slug: string;
  name: string;
  price: unknown;
  compareAt: unknown;
  images: string[];
  rating: number | null;
  reviewCount: number;
  stock: number;
  vendor?: { storeName: string } | null;
}): HomeProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    compareAt: p.compareAt ? Number(p.compareAt) : null,
    image: p.images?.[0] || "/placeholder-product.png",
    rating: p.rating ?? 0,
    reviewCount: p.reviewCount ?? 0,
    stock: p.stock,
    vendorName: p.vendor?.storeName ?? null,
  };
}

// المنتجات المميزة (isFeatured = true)
export async function getFeaturedProducts(limit = 8): Promise<HomeProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { vendor: { select: { storeName: true } } },
    });
    return products.map(serializeProduct);
  } catch (error) {
    console.error("[getFeaturedProducts]", error);
    return [];
  }
}

// منتجات بها خصم فعلي (compareAt > price) لقسم العروض السريعة
export async function getDealProducts(limit = 8): Promise<HomeProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, compareAt: { not: null } },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: { vendor: { select: { storeName: true } } },
    });
    return products
      .filter((p: { compareAt: unknown; price: unknown }) => p.compareAt && Number(p.compareAt) > Number(p.price))
      .map(serializeProduct);
  } catch (error) {
    console.error("[getDealProducts]", error);
    return [];
  }
}

// أحدث المنتجات (وصل حديثاً)
export async function getNewArrivals(limit = 8): Promise<HomeProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { vendor: { select: { storeName: true } } },
    });
    return products.map(serializeProduct);
  } catch (error) {
    console.error("[getNewArrivals]", error);
    return [];
  }
}
