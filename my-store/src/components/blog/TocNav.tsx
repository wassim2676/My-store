"use client";

import { useEffect, useState } from "react";

// ==================== 🧭 دليل المقال الجانبي (بدون إطار) — يُبرز القسم الحالي أثناء التمرير ====================
export default function TocNav({ items, accent, title = "In this guide" }: { items: { id: string; text: string }[]; accent: string; title?: string }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const onScroll = () => {
      // آخر عنوان تجاوز ثلث الشاشة العلوي هو القسم الحالي
      const line = window.innerHeight * 0.3;
      let cur: string | null = null;
      for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id;
      setActive(cur ?? els[0].id);
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

  return (
    <nav aria-label={title}>
      <p className="text-[13px] font-semibold text-white/85">{title}</p>
      <ol className="mt-4 space-y-0.5 border-l border-white/[0.08]">
        {items.map((h) => {
          const on = h.id === active;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={on ? "location" : undefined}
                className={`-ml-px block border-l-2 py-[7px] pl-4 pr-2 text-[14px] leading-snug transition-colors ${on ? "font-medium text-white" : "border-transparent text-white/50 hover:text-white/85"}`}
                style={on ? { borderColor: accent, color: accent } : undefined}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
