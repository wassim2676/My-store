"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import BrandLogo, { type BrandLogoData } from "@/components/shop/BrandLogo";
import { bestTextOn } from "@/lib/landing";

/**
 * 🔁 زر شراء يتبدّل تلقائياً بين متاجرنا (بلون كل متجر وشعاره)،
 * وينتهي بزر فارغ متقطّع: "أي متجر تريده" — ثم يعيد الدورة.
 * يتوقف عند المرور بالفأرة، ويحترم "تقليل الحركة".
 */
export default function BrandCycleButton({
  brands,
  buyTemplate,
  anyStore,
}: {
  brands: BrandLogoData[];
  /** مثل "Buy on {store}" */
  buyTemplate: string;
  anyStore: string;
}) {
  const total = brands.length + 1; // + الزر الفارغ
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || total < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % total), 1900);
    return () => clearInterval(id);
  }, [paused, total]);

  const b = brands[i];
  const color = b?.accentColor || "#1F2937";

  return (
    <div className="space-y-3" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative h-[54px]" aria-live="polite">
        {b ? (
          <span
            key={b.name}
            className="absolute inset-0 flex animate-[brand-swap_380ms_cubic-bezier(.2,.8,.2,1)] items-center justify-center gap-2.5 rounded-2xl px-5 font-bold transition-colors duration-300"
            style={{ backgroundColor: color, color: bestTextOn(color) }}
            dir="ltr"
          >
            <span className="flex h-7 w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-white px-1.5">
              <BrandLogo brand={b} size={17} className="max-w-full! [&_svg]:max-w-full" />
            </span>
            <span className="truncate">{buyTemplate.replace("{store}", b.name)}</span>
          </span>
        ) : (
          <span
            key="__any"
            className="absolute inset-0 flex animate-[brand-swap_380ms_cubic-bezier(.2,.8,.2,1)] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/25 bg-white/[0.03] px-5 font-semibold text-white/75"
          >
            <Plus className="h-5 w-5" />
            {anyStore}
          </span>
        )}
      </div>

      {/* مؤشر صغير: أي متجر معروض الآن */}
      <div className="flex justify-center gap-1.5" aria-hidden>
        {Array.from({ length: total }).map((_, n) => (
          <button
            key={n}
            type="button"
            tabIndex={-1}
            onClick={() => setI(n)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${n === i ? "w-5 bg-white/70" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
