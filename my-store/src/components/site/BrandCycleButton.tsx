"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import BrandLogo, { type BrandLogoData } from "@/components/shop/BrandLogo";
import Dots from "@/components/shared/Dots";
import { bestTextOn, ensureContrast } from "@/lib/landing";

const INTERVAL = 2400;

/**
 * 🔁 زر شراء يتبدّل تلقائياً بين متاجرنا وينتهي بزر فارغ متقطّع "أي متجر تريده".
 * الحركة: لون الزر يذوب من متجر لآخر، والمحتوى "يتدحرج" عمودياً مع ضبابية خفيفة
 * (الشعار ثم النص بتتابع)، ولمعة ضوء تعبر الزر عند كل تبديل.
 * يتوقف عند المرور بالفأرة ويحترم "تقليل الحركة".
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
  const [state, setState] = useState<{ i: number; prev: number | null; n: number }>({ i: 0, prev: null, n: 0 });
  const [paused, setPaused] = useState(false);

  const show = (next: number) => setState((s) => (next === s.i ? s : { i: next, prev: s.i, n: s.n + 1 }));

  useEffect(() => {
    if (paused || total < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setState((s) => ({ i: (s.i + 1) % total, prev: s.i, n: s.n + 1 })), INTERVAL);
    return () => clearInterval(id);
  }, [paused, total]);

  const brand = brands[state.i];
  const isAny = !brand;
  const color = brand?.accentColor || "#1F2937";

  const content = (idx: number) => {
    const b = brands[idx];
    if (!b) {
      return (
        <>
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current/30 [animation-delay:0ms]">
            <Plus className="h-4 w-4" />
          </span>
          <span className="[animation-delay:70ms]">{anyStore}</span>
        </>
      );
    }
    return (
      <>
        <span className="flex h-7 w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-white px-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
          <BrandLogo brand={b} size={17} className="max-w-full! [&_svg]:max-w-full" />
        </span>
        <span className="truncate">{buyTemplate.replace("{store}", b.name)}</span>
      </>
    );
  };

  return (
    <div className="space-y-2" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div
        className="relative isolate h-[54px] overflow-hidden rounded-2xl border-2 border-dashed font-bold transition-[background-color,color,border-color] duration-500 ease-out"
        style={{
          backgroundColor: isAny ? "rgba(255,255,255,0.03)" : color,
          borderColor: isAny ? "rgba(255,255,255,0.28)" : "transparent",
          color: isAny ? "rgba(255,255,255,0.8)" : bestTextOn(color),
        }}
        aria-live="polite"
        dir="ltr"
      >
        {/* المحتوى السابق يخرج للأعلى */}
        {state.prev !== null && (
          <span key={`out-${state.n}`} aria-hidden className="absolute inset-0 flex animate-[roll-out_420ms_cubic-bezier(.4,0,.2,1)_forwards] items-center justify-center gap-2.5 px-5">
            {content(state.prev)}
          </span>
        )}
        {/* المحتوى الجديد يدخل من الأسفل: الشعار ثم النص */}
        <span key={`in-${state.n}`} className="absolute inset-0 flex items-center justify-center gap-2.5 px-5 [&>*]:animate-[roll-in_520ms_cubic-bezier(.2,.8,.2,1)_both] [&>*:nth-child(2)]:[animation-delay:70ms]">
          {content(state.i)}
        </span>
        {/* لمعة ضوء تعبر الزر عند كل تبديل */}
        {state.n > 0 && !isAny && (
          <span
            key={`sheen-${state.n}`}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 animate-[sheen_900ms_ease-out_forwards] bg-gradient-to-r from-transparent via-white/35 to-transparent"
          />
        )}
      </div>

      <div className="flex justify-center">
        <Dots count={total} active={state.i} onSelect={show} color={isAny ? "#FFFFFF" : ensureContrast(color, ["#0B0E14"], 3)} />
      </div>
    </div>
  );
}
