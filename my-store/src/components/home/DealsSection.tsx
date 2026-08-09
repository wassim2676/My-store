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
    <section className="py-12 lg:py-20 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 lg:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">{t("dealsTitle")}</h2>
              <p className="text-slate-400 text-xs sm:text-base">{t("dealsSubtitle")}</p>
            </div>
          </div>

          {/* العداد التنازلي */}
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-xs sm:text-sm font-medium">{t("dealsEndsIn")}</span>
            {[time.h, time.m, time.s].map((unit, i) => (
              <span key={i} className="bg-white/10 text-white font-black text-sm sm:text-lg rounded-lg px-2.5 py-1.5 min-w-[2.5rem] text-center tabular-nums">
                {unit}
              </span>
            ))}
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
            <PackageSearch className="w-10 h-10" />
          </div>
        )}
      </div>
    </section>
  );
}
