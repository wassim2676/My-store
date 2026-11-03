"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import ProductCard from "@/components/shared/ProductCard";
import type { HomeProduct } from "@/lib/products";

interface DealsSectionProps {
  products: HomeProduct[];
  onAddToCart?: () => void;
}

// عداد تنازلي بسيط — ينتهي منتصف الليل كل يوم (يُعاد تلقائياً كل 24 ساعة)
function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight.getTime() - now.getTime());

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

export default function DealsSection({ products, onAddToCart }: DealsSectionProps) {
  const t = useTranslations("home");
  const time = useCountdown();

  if (products.length === 0) return null;

  return (
    <section className="py-8 lg:py-12 bg-slate-900">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 lg:mb-6">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{t("dealsTitle")}</h2>
              <p className="text-slate-400 text-xs sm:text-sm">{t("dealsSubtitle")}</p>
            </div>
          </div>

          {/* العداد التنازلي */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-medium">{t("dealsEndsIn")}</span>
            {[time.h, time.m, time.s].map((unit, i) => (
              <span key={i} className="bg-white/5 border border-white/10 text-white font-bold text-sm rounded-md px-2.5 py-1.5 min-w-[2.25rem] text-center tabular-nums">
                {unit}
              </span>
            ))}
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
            <PackageSearch className="w-10 h-10" />
          </div>
        )}
      </div>
    </section>
  );
}
