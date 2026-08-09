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
    <section className={`py-12 lg:py-20 ${bgClassName}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 lg:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-1.5 lg:mb-2">{title}</h2>
            {subtitle && <p className="text-slate-500 text-sm sm:text-lg">{subtitle}</p>}
          </div>
          <Link
            href={viewAllHref}
            className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-1 group text-sm sm:text-base w-fit"
          >
            {t("viewAll")}
            <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </span>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <PackageSearch className="w-10 h-10" />
            <p className="text-sm font-medium">{t("emptyProducts")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
