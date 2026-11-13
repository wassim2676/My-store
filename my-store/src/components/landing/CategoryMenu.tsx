"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, LayoutGrid } from "lucide-react";

export interface CategoryOption {
  value: string;
  label: string;
  count?: number;
}

/**
 * قائمة فئات مخصّصة (بديل <select> الافتراضي للمتصفح) تتبع ألوان/زوايا/خط صفحة الهبوط.
 * - لوحة المفاتيح: ↑ ↓ للتنقل، Enter/Space للاختيار، Esc للإغلاق، Home/End
 * - تُغلق عند النقر خارجها، وتدعم RTL (start/end)
 */
export default function CategoryMenu({
  value,
  onChange,
  options,
  allLabel,
  allCount,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  options: CategoryOption[];
  allLabel: string;
  allCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const items: { value: string | null; label: string; count?: number }[] = [{ value: null, label: allLabel, count: allCount }, ...options];
  const selectedIndex = Math.max(0, items.findIndex((i) => i.value === value));
  const current = items[selectedIndex];

  // إغلاق عند النقر خارج القائمة
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // إبقاء العنصر المحدّد ظاهراً عند التنقل بالأسهم
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openMenu = () => {
    setActive(selectedIndex);
    setOpen(true);
  };
  const choose = (i: number) => {
    onChange(items[i].value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(items.length - 1, a + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(items.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={root} className="relative flex shrink-0">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        className={`flex h-full max-w-[13rem] items-center gap-2 rounded-s-[calc(var(--lp-btn-radius)-1px)] border-e border-[var(--lp-nav-border)] bg-[var(--lp-nav-field2)] ps-4 pe-3 text-[13px] font-medium text-[var(--lp-nav-text)] transition hover:bg-[color-mix(in_srgb,var(--lp-nav-field2)_86%,var(--lp-nav-text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--lp-accent)] cursor-pointer ${
          value ? "font-semibold" : ""
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5 shrink-0 opacity-70" />
        <span className="truncate">{current.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[var(--lp-nav-muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-label={allLabel}
          className="absolute start-0 top-[calc(100%+8px)] z-50 max-h-80 w-64 overflow-y-auto rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] [scrollbar-width:thin] animate-[lp-pop_140ms_ease-out]"
        >
          {items.map((item, i) => {
            const selected = i === selectedIndex;
            return (
              <li
                key={item.value ?? "__all"}
                id={`${id}-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()} // لا نفقد التركيز من الزر
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  i === active ? "bg-[var(--lp-hover)]" : ""
                } ${selected ? "font-semibold text-[var(--lp-accent-ink)]" : "text-[var(--lp-text)]"}`}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">{selected && <Check className="h-4 w-4" />}</span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {typeof item.count === "number" && (
                  <span className="rounded-full bg-[var(--lp-hover-strong)] px-2 py-0.5 text-[11px] font-medium tabular-nums text-[var(--lp-muted)]">{item.count}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
