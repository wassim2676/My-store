"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BrandLogo, { type BrandLogoData } from "@/components/shop/BrandLogo";
import { WHITE_LOGO } from "@/components/shop/logo-classes";

/**
 * 🎠 شريط بطاقات أفقي للصفحة الرئيسية: بطاقتان في الكمبيوتر، تمرير جانبي سلس مع التقاط (snap)،
 * أسهم ونقاط تقدّم، ويدعم RTL واللمس والسحب بعجلة الفأرة الأفقية.
 */
export default function TourCarousel({ brands, prevLabel, nextLabel }: { brands: BrandLogoData[]; prevLabel: string; nextLabel: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // في RTL تكون القيمة سالبة
    setAtStart(pos < 4);
    setAtEnd(pos > max - 4);
    setPages(Math.max(1, Math.round(el.scrollWidth / el.clientWidth)));
    setPage(max > 0 ? Math.round((pos / max) * (Math.round(el.scrollWidth / el.clientWidth) - 1)) : 0);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollBy({ left: dir * el.clientWidth * (rtl ? -1 : 1), behavior: "smooth" });
  };

  const arrow = "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 transition hover:border-white/25 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30 cursor-pointer";

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#0B0E14] p-4">
      <div
        ref={track}
        onScroll={measure}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {brands.map((b, i) => (
          <div
            key={b.name + i}
            className="w-[72%] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121621] sm:w-[calc(50%-6px)]"
          >
            <div className="m-1.5 aspect-square rounded-xl bg-gradient-to-br from-white to-neutral-200" />
            <div className="space-y-1.5 p-3">
              <div className="h-2 w-3/4 rounded-full bg-white/25" />
              <div className="h-2 w-1/3 rounded-full bg-[#C8A24A]" />
            </div>
            <div className="flex h-10 items-center border-t border-white/[0.07] bg-[#1A1F2C] px-3 text-white/90">
              <span className="flex h-5 max-w-[70%] items-center overflow-hidden">
                <BrandLogo brand={b} size={15} fallback="name" className={`max-w-full! [&_svg]:max-w-full ${WHITE_LOGO}`} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* التحكم: نقاط التقدّم + الأسهم */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" aria-hidden>
          {Array.from({ length: pages }).map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === page ? "w-6 bg-amber-400" : "w-1.5 bg-white/20"}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(-1)} disabled={atStart} aria-label={prevLabel} className={arrow}>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </button>
          <button type="button" onClick={() => go(1)} disabled={atEnd} aria-label={nextLabel} className={arrow}>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
