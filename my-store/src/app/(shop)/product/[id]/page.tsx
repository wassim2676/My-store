import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";
import ProductGallery from "@/components/shop/ProductGallery";
import AddToCartBox from "@/components/shop/AddToCartBox";
import ShareButtons from "@/components/shop/ShareButtons";
import ProductSection from "@/components/home/ProductSection";
import { Star, Store, Truck, ShieldCheck, RotateCcw } from "lucide-react";

// نبحث بالـ slug أولاً (روابط جميلة)، ثم بالـ id كخيار احتياطي
async function getProduct(idOrSlug: string) {
  const bySlug = await prisma.product.findUnique({
    where: { slug: idOrSlug },
    include: {
      vendor: { select: { storeName: true, slug: true, rating: true } },
      reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (bySlug) return bySlug;

  return prisma.product.findUnique({
    where: { id: idOrSlug },
    include: {
      vendor: { select: { storeName: true, slug: true, rating: true } },
      reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product || !product.isActive) notFound();

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      categories: { hasSome: product.categories },
    },
    take: 4,
    include: { vendor: { select: { storeName: true } } },
  });

  const discount =
    product.compareAt && Number(product.compareAt) > Number(product.price)
      ? Math.round(((Number(product.compareAt) - Number(product.price)) / Number(product.compareAt)) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* مسار التنقل */}
        <nav className="text-xs sm:text-sm text-slate-500 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-orange-600">الرئيسية</Link> /
          <Link href="/marketplace" className="hover:text-orange-600">المتجر</Link> /
          <span className="text-slate-800 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* المعرض */}
          <ProductGallery images={product.images.length ? product.images : ["/placeholder-product.png"]} name={product.name} />

          {/* التفاصيل */}
          <div>
            {product.vendor && (
              <Link href={`/store/${product.vendor.slug}`} className="inline-flex items-center gap-1.5 text-sm text-orange-600 font-semibold mb-2 hover:underline">
                <Store className="w-4 h-4" /> {product.vendor.storeName}
              </Link>
            )}

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mb-3 leading-snug">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating || 0) ? "fill-amber-400" : "text-slate-300"}`} />
                ))}
              </div>
              <span className="text-sm text-slate-500">({product.reviewCount} تقييم)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-slate-200">
              <span className="text-3xl font-black text-slate-900">{Number(product.price).toFixed(2)} درهم</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-slate-400 line-through">{Number(product.compareAt).toFixed(2)} درهم</span>
                  <span className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded-md">-{discount}%</span>
                </>
              )}
            </div>

            {product.shortDesc && <p className="text-slate-600 mb-6 leading-relaxed">{product.shortDesc}</p>}

            <AddToCartBox productId={product.id} stock={product.stock} />

            {/* شارات ثقة مصغّرة */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-slate-100">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Truck className="w-5 h-5 text-orange-500" />
                <span className="text-[11px] text-slate-500 leading-tight">توصيل سريع</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                <span className="text-[11px] text-slate-500 leading-tight">دفع آمن 100%</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <RotateCcw className="w-5 h-5 text-orange-500" />
                <span className="text-[11px] text-slate-500 leading-tight">إرجاع مجاني 14 يوم</span>
              </div>
            </div>

            <ShareButtons title={product.name} />

            {product.description && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h2 className="font-bold text-lg text-slate-900 mb-3">وصف المنتج</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* جدول المواصفات */}
            {(product.brand || product.weight || product.sku || product.categories.length > 0) && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h2 className="font-bold text-lg text-slate-900 mb-3">المواصفات</h2>
                <dl className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {product.brand && (
                    <div className="flex justify-between px-4 py-2.5 text-sm odd:bg-slate-50">
                      <dt className="text-slate-500">الماركة</dt>
                      <dd className="font-semibold text-slate-800">{product.brand}</dd>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex justify-between px-4 py-2.5 text-sm odd:bg-slate-50">
                      <dt className="text-slate-500">الوزن</dt>
                      <dd className="font-semibold text-slate-800">{product.weight} كغ</dd>
                    </div>
                  )}
                  {product.sku && (
                    <div className="flex justify-between px-4 py-2.5 text-sm odd:bg-slate-50">
                      <dt className="text-slate-500">رمز المنتج (SKU)</dt>
                      <dd className="font-semibold text-slate-800">{product.sku}</dd>
                    </div>
                  )}
                  {product.categories.length > 0 && (
                    <div className="flex justify-between px-4 py-2.5 text-sm odd:bg-slate-50">
                      <dt className="text-slate-500">الفئات</dt>
                      <dd className="font-semibold text-slate-800">{product.categories.join("، ")}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* التقييمات */}
        {product.reviews.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-black text-slate-900 mb-5">آراء العملاء</h2>
            <div className="space-y-4">
              {product.reviews.map((review: (typeof product.reviews)[number]) => (
                <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400" : "text-slate-300"}`} />
                      ))}
                    </div>
                    {review.title && <span className="font-bold text-sm text-slate-900">{review.title}</span>}
                  </div>
                  {review.comment && <p className="text-sm text-slate-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {related.length > 0 && (
        <ProductSection
          title="منتجات ذات صلة"
          products={related.map((p: (typeof related)[number]) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: Number(p.price),
            compareAt: p.compareAt ? Number(p.compareAt) : null,
            image: p.images?.[0] || "/placeholder-product.png",
            rating: p.rating ?? 0,
            reviewCount: p.reviewCount,
            stock: p.stock,
            vendorName: p.vendor?.storeName ?? null,
          }))}
          bgClassName="bg-white"
        />
      )}

      <MegaFooter />
    </div>
  );
}
