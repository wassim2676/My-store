"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HelpCircle, Sparkles } from "lucide-react";

/**
 * ❔ علامة استفهام صغيرة تُظهر شرحاً عند المرور بالفأرة أو التركيز بلوحة المفاتيح،
 * وبالنقر على الهاتف (لا مرور هناك). تُغلق بالنقر خارجها أو بـ Esc.
 */
export function InfoTip({ text, label = "?", className = "" }: { text: string; label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className={`relative inline-flex align-middle ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* span وليس button: قد تكون داخل بطاقة خيار هي نفسها زر (button داخل button غير صالح) */}
      <span
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // لا يختار البطاقة/الخيار الذي يحتويه
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-white/40 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none cursor-help"
      >
        <HelpCircle className="h-[15px] w-[15px]" />
      </span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-64 max-w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-white/10 bg-[#161a22] px-3.5 py-2.5 text-start text-xs font-normal normal-case leading-relaxed tracking-normal text-white/80 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.85)] animate-[lp-pop_120ms_ease-out]"
        >
          {text}
          <span className="absolute left-1/2 top-full -mt-[5px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-e border-white/10 bg-[#161a22]" />
        </span>
      )}
    </span>
  );
}

/** 🏷️ شارة "موصى به" مع شرح السبب عند المرور على علامة الاستفهام */
export function RecommendedBadge({ label, reason, className = "" }: { label: string; reason: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-emerald-300">
        <Sparkles className="h-3 w-3" />
        {label}
      </span>
      <InfoTip text={reason} label={label} />
    </span>
  );
}
