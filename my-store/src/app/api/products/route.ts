import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("q");
    const vendorId = searchParams.get("vendorId");
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit") || 20)));

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (category) where.categories = { has: category };
    if (featured === "true") where.isFeatured = true;
    if (vendorId) where.vendorId = vendorId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
        ? { price: "desc" }
        : sort === "rating"
        ? { rating: "desc" }
        : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { vendor: { select: { storeName: true, slug: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map((p: (typeof items)[number]) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        compareAt: p.compareAt ? Number(p.compareAt) : null,
        images: p.images,
        rating: p.rating ?? 0,
        reviewCount: p.reviewCount,
        stock: p.stock,
        categories: p.categories,
        vendor: p.vendor ? { name: p.vendor.storeName, slug: p.vendor.slug } : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("[PUBLIC_PRODUCTS_API_ERROR]", error);
    return NextResponse.json({ error: "تعذر جلب المنتجات" }, { status: 500 });
  }
}
