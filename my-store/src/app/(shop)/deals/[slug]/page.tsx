import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Star, Tag, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";
import ProductGallery from "@/components/shop/ProductGallery";
import ShareButtons from "@/components/shop/ShareButtons";
import BrandLogo from "@/components/shop/BrandLogo";
import AffiliateBuyButton from "@/components/shop/AffiliateBuyButton";
import DealsCard from "@/components/shop/DealsCard";

async function getProduct(slug: string) {
  return prisma.affiliateProduct.findUnique({
    where: { slug },
    include: { brand: true },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.shortReview,
    openGraph: {
      title: product.title,
      description: product.shortReview,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function AffiliateProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || product.status !== "PUBLISHED" || !product.brand.isActive) notFound();

  // 👀 عدّاد مشاهدات بسيط — نُنهيه قبل إرسال الاستجابة (بيئات serverless مثل Vercel
  // قد تقتل أي Promise معلّقة فور انتهاء الطلب، فـ await هنا ضروري لضمان حفظه فعلياً)
  try {
    await prisma.affiliateProduct.update({ where: { id: product.id }, data: { views: { increment: 1 } } });
  } catch (err) {
    console.error("[AFFILIATE_VIEW_COUNT_ERROR]", err);
  }

  const related = await prisma.affiliateProduct.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: product.id },
      category: product.category,
    },
    include: { brand: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const discount =
    product.compareAt && Number(product.compareAt) > 0 && product.price
      ? Math.round(((Number(product.compareAt) - Number(product.price)) / Number(product.compareAt)) * 100)
      : 0;

  const buyLabel = product.brand.buyLabel || `الانتقال للشراء من ${product.brand.name}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* مسار التنقل */}
        <nav className="text-xs sm:text-sm text-slate-500 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-orange-600">الرئيسية</Link> /
          <Link href="/deals" className="hover:text-orange-600">عروض الأفلييت</Link> /
          <Link href={`/deals?category=${encodeURIComponent(product.category)}`} className="hover:text-orange-600">
            {product.category}
          </Link>{" "}
          /
          <span className="text-slate-800 font-medium truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* المعرض */}
          <ProductGallery images={product.images.length ? product.images : ["/placeholder-product.png"]} name={product.title} />

          {/* التفاصيل */}
          <div>
            <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-slate-200 bg-white px-3 py-1.5">
              <BrandLogo brand={product.brand} size={20} />
              <span className="text-sm font-bold text-slate-700">{product.brand.name}</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mb-3 leading-snug">{product.title}</h1>

            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-amber-400" : "text-slate-300"}`} />
                  ))}
                </div>
                <span className="text-sm text-slate-500">({product.reviewCount} تقييم)</span>
              </div>
            )}

            {product.price != null && (
              <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-slate-200">
                <span className="text-3xl font-black text-slate-900">
                  {Number(product.price).toFixed(2)} {product.currency}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-slate-400 line-through">
                      {Number(product.compareAt).toFixed(2)} {product.currency}
                    </span>
                    <span className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded-md">-{discount}%</span>
                  </>
                )}
              </div>
            )}

            {/* المراجعة المختصرة */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
              <h2 className="text-xs font-bold text-slate-400 mb-1.5 tracking-wide">مراجعة مختصرة</h2>
              <p className="text-slate-700 leading-relaxed">{product.shortReview}</p>
            </div>

            <AffiliateBuyButton
              slug={product.slug}
              affiliateUrl={product.affiliateUrl}
              brand={product.brand}
              label={buyLabel}
            />
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              سيتم تحويلك لموقع {product.brand.name} لإكمال الشراء — هذا رابط أفلييت تابع لجهة خارجية.
            </p>

            {/* شارات ثقة مصغّرة */}
            <div className="grid grid-cols-2 gap-2 mt-5 pt-5 border-t border-slate-100">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                <span className="text-[11px] text-slate-500 leading-tight">شراء مباشر وآمن من {product.brand.name}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Tag className="w-5 h-5 text-orange-500" />
                <span className="text-[11px] text-slate-500 leading-tight">{product.category}</span>
              </div>
            </div>

            <ShareButtons title={product.title} />

            {product.description && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h2 className="font-bold text-lg text-slate-900 mb-3">وصف المنتج</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="text-xs font-semibold bg-slate-100 text-slate-600 rounded-full px-3 py-1">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-5">منتجات مشابهة</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.map((item) => (
                <DealsCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </main>

      <MegaFooter />
    </div>
  );
}
