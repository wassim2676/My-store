/* eslint-disable @next/next/no-img-element -- صور المسوّقين من نطاقات خارجية متعددة (Amazon/Walmart CDN...) */
import Link from "next/link";
import { ArrowUpRight, ImageOff } from "lucide-react";
import BrandLogo from "@/components/shop/BrandLogo";
import Stars from "./Stars";
import { discountPercent, formatPrice, publicT, resolveStore, type StoreBrand } from "@/lib/landing";

export interface OfferCardData {
  id: string;
  slug: string;
  title: string;
  shortReview: string;
  images: string[];
  price: number | null;
  compareAt: number | null;
  currency: string;
  rating: number | null;
  category: string | null;
  badge: string | null;
  isFeatured: boolean;
  storeName: string | null;
  brand: StoreBrand | null;
}

// ==================== 💎 بطاقة عرض فخمة + شعار المتجر في الأسفل ====================
export default function OfferCard({
  offer,
  pageSlug,
  lang,
  large = false,
}: {
  offer: OfferCardData;
  pageSlug: string;
  lang: string;
  large?: boolean;
}) {
  const store = resolveStore(offer.brand, offer.storeName);
  const discount = discountPercent(offer.price, offer.compareAt);
  const price = formatPrice(offer.price, offer.currency, lang);
  const compareAt = discount ? formatPrice(offer.compareAt, offer.currency, lang) : null;

  return (
    <Link
      href={`/${pageSlug}/${offer.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-[1.35rem] border border-[var(--lp-border)] bg-[var(--lp-surface)] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_20px_40px_-24px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--lp-accent)_45%,transparent)] hover:shadow-[0_30px_60px_-28px_color-mix(in_srgb,var(--lp-accent)_45%,transparent)]"
    >
      {/* 🖼️ الصورة */}
      <div className={`relative m-2.5 mb-0 overflow-hidden rounded-2xl bg-white ${large ? "aspect-[5/4]" : "aspect-square"}`}>
        {offer.images[0] ? (
          <img
            src={offer.images[0]}
            alt={offer.title}
            loading="lazy"
            className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <ImageOff className="h-10 w-10" />
          </div>
        )}

        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          {offer.badge ? (
            <span className="rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-black shadow-sm" style={{ background: "var(--lp-accent)" }}>
              {offer.badge}
            </span>
          ) : (
            <span />
          )}
          {discount > 0 && (
            <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* 📝 المحتوى */}
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3.5">
        {offer.category && (
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--lp-accent)]">{offer.category}</span>
        )}
        <h3 className={`font-serif font-semibold leading-snug text-[var(--lp-text)] line-clamp-2 ${large ? "text-xl" : "text-[15.5px]"}`}>
          {offer.title}
        </h3>
        <p className={`text-[13px] leading-relaxed text-[var(--lp-muted)] ${large ? "line-clamp-3" : "line-clamp-2"}`}>{offer.shortReview}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            {price ? (
              <span className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[var(--lp-text)]">{price}</span>
                {compareAt && <span className="text-xs text-[var(--lp-muted)] line-through">{compareAt}</span>}
              </span>
            ) : (
              <span className="text-xs font-medium text-[var(--lp-muted)]">{publicT(lang, "checkPrice", { store: store.name })}</span>
            )}
          </div>
          {offer.rating != null && offer.rating > 0 && (
            <span className="flex items-center gap-1.5">
              <Stars value={offer.rating} size={12} />
              <span className="text-xs font-semibold text-[var(--lp-text)]">{offer.rating.toFixed(1)}</span>
            </span>
          )}
        </div>
      </div>

      {/* 🏬 شعار المتجر */}
      <div className="flex items-center justify-between gap-3 border-t border-[var(--lp-border)] bg-[var(--lp-surface2)] px-4 py-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-white px-1.5 shadow-sm">
            <BrandLogo brand={store} size={22} />
          </span>
          <span className="truncate text-[12.5px] font-semibold text-[var(--lp-text)]">{store.name}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[var(--lp-accent)]">
          {publicT(lang, "viewReview")}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
        </span>
      </div>
    </Link>
  );
}
