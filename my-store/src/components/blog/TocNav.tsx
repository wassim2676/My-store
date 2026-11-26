"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

// ==================== 🧭 دليل المقال الجانبي الذكي ====================
// • بدون إطار وبدون تمرير داخلي: إن كان أطول من الشاشة يتحرك مع الصفحة حتى يظهر آخره ثم يثبت
// • ثابت داخل عمود المقال فقط (لا يصل إلى التذييل)
// • يُبرز القسم الحالي + شريط تقدّم القراءة + زر العودة للأعلى
const NAV_OFFSET = 96; // ارتفاع شريط التنقل العلوي + هامش

export default function TocNav({ items, accent, title = "In this guide" }: { items: { id: string; text: string }[]; accent: string; title?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [top, setTop] = useState(NAV_OFFSET);
  const [progress, setProgress] = useState(0);

  // 📏 موضع الالتصاق: إن تجاوز الدليل ارتفاع الشاشة نجعل "top" سالباً فيلتصق من أسفله
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const h = el.offsetHeight;
      const vh = window.innerHeight;
      setTop(h + NAV_OFFSET + 24 > vh ? vh - h - 24 : NAV_OFFSET);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  // 📍 القسم الحالي + نسبة القراءة
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const article = ref.current?.closest("article");
    if (!els.length) return;
    const onScroll = () => {
      const line = window.innerHeight * 0.3;
      let cur: string | null = null;
      for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id;
      setActive(cur ?? els[0].id);
      if (article) {
        const r = article.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        setProgress(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1);
      }
    };
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  const activeIndex = items.findIndex((i) => i.id === active);
  const pct = Math.round(progress * 100);

  return (
    <div ref={ref} className="sticky pb-6 pt-14" style={{ top }}>
      <nav aria-label={title}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-white/85">{title}</p>
          <span className="text-[11px] font-medium tabular-nums text-white/40">{pct}%</span>
        </div>
        {/* شريط تقدّم القراءة */}
        <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-white/[0.07]" aria-hidden>
          <div className="h-full rounded-full transition-[width] duration-150" style={{ width: `${pct}%`, background: accent }} />
        </div>

        <ol className="mt-5 border-l border-white/[0.08]">
          {items.map((h, i) => {
            const on = i === activeIndex;
            const done = activeIndex > -1 && i < activeIndex;
            return (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  aria-current={on ? "location" : undefined}
                  className={`-ml-px block border-l-2 py-[6px] pl-4 pr-2 text-[13.5px] leading-snug transition-colors duration-200 ${
                    on ? "font-medium" : done ? "border-transparent text-white/65 hover:text-white" : "border-transparent text-white/45 hover:text-white/85"
                  }`}
                  style={on ? { borderColor: accent, color: accent } : undefined}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ol>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`mt-6 inline-flex items-center gap-1.5 text-[12px] font-medium text-white/45 transition hover:text-white ${progress > 0.08 ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <ArrowUp className="h-3.5 w-3.5" /> Back to top
        </button>
      </nav>
    </div>
  );
}
