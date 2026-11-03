import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import BrandLogo, { type BrandLogoData } from "./BrandLogo";

export interface DealsCardProduct {
  id: string;
  slug: string;
  title: string;
  shortReview: string;
  images: string[];
  // ⚠️ Decimal من Prisma لا يطابق number|string مباشرة في TypeScript — نتركه فضفاضاً هنا
  // ونحوّله بـ Number() عند الاستخدام (آمن لأن Prisma.Decimal يملّك toString/valueOf).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  price: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  compareAt: any;
  currency: string;
  category: string;
  rating: number;
  reviewCount: number;
  brand: BrandLogoData;
}

export default function DealsCard({ product }: { product: DealsCardProduct }) {
  const price = product.price != null ? Number(product.price) : null;
  const compareAt = product.compareAt != null ? Number(product.compareAt) : null;
  const discount = price && compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  return (
    <Link
      href={`/deals/${product.slug}`}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
    >
      <div className="relative aspect-square bg-slate-50">
        <Image
          src={product.images?.[0] || "/placeholder-product.png"}
          alt={product.title}
          fill
          className="object-contain p-4 group-hover:scale-[1.03] transition-transform"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {discount > 0 && (
          <span className="absolute top-2 start-2 bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-md">
            -{discount}%
          </span>
        )}
        <span className="absolute top-2 end-2 bg-white/90 backdrop-blur-sm rounded-md p-1 shadow-sm">
          <BrandLogo brand={product.brand} size={20} />
        </span>
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <span className="text-[11px] font-semibold text-slate-400">{product.category}</span>
        <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{product.title}</h3>
        <p className="text-xs text-slate-500 leading-snug line-clamp-2">{product.shortReview}</p>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-slate-500">
              {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
          </div>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between">
          {price != null ? (
            <span className="font-black text-slate-900 text-sm">
              {price.toFixed(2)} {product.currency}
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-400">عرض السعر في {product.brand.name}</span>
          )}
          <span className="text-[11px] font-bold" style={{ color: product.brand.accentColor || "#1D4ED8" }}>
            تصفح المنتج ←
          </span>
        </div>
      </div>
    </Link>
  );
}
