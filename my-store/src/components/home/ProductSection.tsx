"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, PackageSearch } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import ProductCard from "@/components/shared/ProductCard";
import type { HomeProduct } from "@/lib/products";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: HomeProduct[];
  viewAllHref?: string;
  onAddToCart?: () => void;
  bgClassName?: string;
}

export default function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref = "/marketplace",
  onAddToCart,
  bgClassName = "bg-slate-50",
}: ProductSectionProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <section className={`py-8 lg:py-12 ${bgClassName}`}>
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between gap-3 mb-5 lg:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-slate-500 text-xs sm:text-sm mt-1">{subtitle}</p>}
          </div>
          <Link
            href={viewAllHref}
            className="text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1 group text-xs sm:text-sm w-fit flex-shrink-0"
          >
            {t("viewAll")}
            <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </span>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
            <PackageSearch className="w-10 h-10" />
            <p className="text-sm font-medium">{t("emptyProducts")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
