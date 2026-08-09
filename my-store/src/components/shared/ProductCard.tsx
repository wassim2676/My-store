"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingCart, Star, Heart, CheckCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { HomeProduct } from "@/lib/products";

interface ProductCardProps {
  product: HomeProduct;
  // يُستدعى بعد نجاح الإضافة الفعلية للسلة (لعرض إشعار Toast مثلاً)
  onAddToCart?: () => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const t = useTranslations("product");
  const tc = useTranslations("common");
  const { status } = useSession();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
      : 0;
  const inStock = product.stock > 0;

  const handleAddToCart = async () => {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/product/${product.slug}`);
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (res.ok) {
        setAdded(true);
        onAddToCart?.();
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Badge */}
      {discount > 0 && (
        <div className="absolute top-3 start-3 z-10">
          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
            -{discount}%
          </span>
        </div>
      )}

      {/* Wishlist Button */}
      <button
        type="button"
        aria-label="wishlist"
        className="absolute top-3 end-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <Heart className="w-4 h-4" />
      </button>

      {/* Image */}
      <Link href={`/product/${product.slug}`} className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? "fill-amber-400" : "text-slate-300"}`} />
            ))}
          </div>
          <span className="text-xs text-slate-500">({product.reviewCount})</span>
        </div>

        {/* Seller */}
        <p className="text-[11px] text-slate-400 mb-1.5 truncate">
          {t("soldBy")} {product.vendorName || t("platform")}
        </p>

        {/* Title */}
        <Link href={`/product/${product.slug}`} className="mb-2 block">
          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Stock Status */}
        <div className="flex items-center gap-1 mb-3">
          {inStock ? (
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> {t("inStock")}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-red-600">{t("outOfStock")}</span>
          )}
        </div>

        {/* Spacer */}
        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-black text-slate-900">
              {product.price.toFixed(2)} <span className="text-xs font-medium text-slate-500">{tc("currency")}</span>
            </span>
            {discount > 0 && product.compareAt && (
              <span className="text-sm text-slate-400 line-through decoration-red-500/50">
                {product.compareAt.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock || adding}
            className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              inStock
                ? "bg-slate-900 text-white hover:bg-orange-500 active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {adding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : added ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            {inStock ? (added ? "تمت الإضافة" : t("addToCart")) : t("outOfStock")}
          </button>
        </div>
      </div>
    </div>
  );
}
