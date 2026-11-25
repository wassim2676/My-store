"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useAnchoredPopover } from "./useAnchoredPopover";

// ==================== 🪟 قائمة منبثقة ثابتة الموضع (قوائم ⋯ والإجراءات) ====================
// تُرسم فوق كل شيء ولا تُقصّ داخل البطاقات، وتنقلب للأعلى قرب أسفل الشاشة.
export default function FloatingPanel({
  anchor,
  onClose,
  width = 224,
  align = "end",
  children,
}: {
  /** العنصر الذي فُتحت منه القائمة (null = مغلقة) */
  anchor: HTMLElement | null;
  onClose: () => void;
  width?: number;
  align?: "start" | "end";
  children: React.ReactNode;
}) {
  const ref = useMemo(() => ({ current: anchor }), [anchor]);
  const panel = useRef<HTMLDivElement>(null);
  const pos = useAnchoredPopover(!!anchor, ref, { width, align, preferHeight: 380 });

  useEffect(() => {
    if (!anchor) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !anchor.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose]);

  if (!anchor || !pos || typeof document === "undefined") return null;
  return createPortal(
    <div
      ref={panel}
      data-ui="dark"
      role="menu"
      style={{ position: "fixed", top: pos.top, bottom: pos.bottom, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }}
      className="z-[200] overflow-y-auto rounded-xl border border-white/10 bg-[#11151D] py-1 text-sm text-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)]"
    >
      {children}
    </div>,
    document.body,
  );
}
