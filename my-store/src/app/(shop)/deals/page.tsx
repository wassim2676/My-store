import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";
import DealsCard from "@/components/shop/DealsCard";
import { Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "عروض الأفلييت",
  description: "تصفح أفضل المنتجات المختارة من Walmart و Target و Amazon وغيرها في مكان واحد.",
};

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string }>;
}) {
  const { category, brand } = await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: "PUBLISHED" };
  if (category) where.category = category;
  if (brand) where.brandId = brand;

  const [products, categories, brands] = await Promise.all([
    prisma.affiliateProduct.findMany({
      where,
      include: { brand: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 60,
    }),
    prisma.affiliateProduct.findMany({
      where: { status: "PUBLISHED" },
      select: { category: true },
      distinct: ["category"],
    }),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1.5">عروض الأفلييت</h1>
          <p className="text-slate-500 text-sm">منتجات مختارة من أفضل المتاجر العالمية — تنتقل مباشرة لموقع البائع لإكمال الشراء.</p>
        </div>

        {/* فلاتر العلامات التجارية */}
        {brands.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-3">
            <Link
              href="/deals"
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                !brand ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              الكل
            </Link>
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/deals?brand=${b.id}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                  brand === b.id ? "text-white border-transparent" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
                style={brand === b.id ? { backgroundColor: b.accentColor } : undefined}
              >
                {b.name}
              </Link>
            ))}
          </div>
        )}

        {/* فلاتر الأصناف */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-5 mb-2 border-b border-slate-200">
            <Link
              href={`/deals${brand ? `?brand=${brand}` : ""}`}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                !category ? "bg-orange-50 text-orange-600" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Tag className="w-3.5 h-3.5" /> كل الأصناف
            </Link>
            {categories.map((c) => (
              <Link
                key={c.category}
                href={`/deals?category=${encodeURIComponent(c.category)}${brand ? `&brand=${brand}` : ""}`}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold ${
                  category === c.category ? "bg-orange-50 text-orange-600" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {c.category}
              </Link>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="font-semibold">لا توجد منتجات متاحة حالياً حسب هذا الفلتر.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {products.map((product) => (
              <DealsCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <MegaFooter />
    </div>
  );
}
