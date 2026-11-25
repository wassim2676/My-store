"use client";

import { useLayoutEffect, useState } from "react";

// ==================== 📍 تموضع القوائم المنبثقة داخل الشاشة دائماً ====================
// القائمة تُرسم في document.body (عبر portal) بموضع ثابت محسوب من الزر:
// • لا تُقصّ أبداً داخل بطاقة فيها overflow-hidden
// • تفتح للأعلى عند ضيق المساحة أسفل الزر، ويُحدّ ارتفاعها بالمساحة المتاحة
// • لا تلتصق بحواف الشاشة (هامش 12px) وتتبع الزر عند التمرير أو تغيير الحجم
const GAP = 6;
const EDGE = 12;

export type PopoverPos = { top?: number; bottom?: number; left: number; width: number; maxHeight: number; up: boolean };

export function useAnchoredPopover(
  open: boolean,
  anchor: React.RefObject<HTMLElement | null>,
  opts: { minWidth?: number; width?: number; preferHeight?: number; align?: "start" | "end" } = {},
) {
  const { minWidth = 0, width, preferHeight = 320, align = "start" } = opts;
  const [pos, setPos] = useState<PopoverPos | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const el = anchor.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.min(Math.max(width ?? r.width, minWidth), vw - EDGE * 2);
      const rtl = document.documentElement.dir === "rtl";
      const alignEnd = (align === "end") !== rtl;
      let left = alignEnd ? r.right - w : r.left;
      left = Math.max(EDGE, Math.min(left, vw - w - EDGE));
      const below = vh - r.bottom - GAP - EDGE;
      const above = r.top - GAP - EDGE;
      const up = below < Math.min(preferHeight, 240) && above > below;
      const maxHeight = Math.max(140, Math.min(preferHeight, up ? above : below));
      setPos(up ? { bottom: vh - r.top + GAP, left, width: w, maxHeight, up } : { top: r.bottom + GAP, left, width: w, maxHeight, up });
    };
    // القياس في الإطار التالي (بعد رسم الزر)، ثم مع كل تمرير أو تغيير حجم
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      setPos(null);
    };
  }, [open, anchor, width, minWidth, preferHeight, align]);

  return open ? pos : null;
}
