"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAnchoredPopover } from "./useAnchoredPopover";
import { Check, ChevronDown, Search } from "lucide-react";

// ==================== 🔽 قائمة منسدلة موحّدة (بديل <select> الأصلي) ====================
// • العناوين الطويلة تُختصر بنقاط (…) بدل أن تملأ الشاشة، والعنوان الكامل يظهر عند المرور
// • ارتفاع محدود مع تمرير، وتفتح للأعلى تلقائياً عند ضيق المساحة أسفلها
// • بحث تلقائي عندما تكثر الخيارات · لوحة المفاتيح: ↑ ↓ Enter Esc
export type SelectOption = { value: string; label: string; hint?: string };
export type SelectGroup = { label?: string; options: SelectOption[] };

export default function Select({
  value,
  onChange,
  options,
  groups,
  placeholder = "—",
  searchPlaceholder = "Search…",
  emptyText = "No results",
  searchable,
  size = "md",
  className = "",
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** افتراضياً: يظهر البحث عند أكثر من 8 خيارات */
  searchable?: boolean;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}) {
  const all: SelectGroup[] = useMemo(() => groups ?? [{ options: options ?? [] }], [groups, options]);
  const flat = useMemo(() => all.flatMap((g) => g.options), [all]);
  const selected = flat.find((o) => o.value === value);
  const withSearch = searchable ?? flat.length > 8;

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;
    return all.map((g) => ({ ...g, options: g.options.filter((o) => `${o.label} ${o.hint ?? ""}`.toLowerCase().includes(s)) })).filter((g) => g.options.length);
  }, [all, q]);
  const pos = useAnchoredPopover(open, root, { minWidth: 240, preferHeight: withSearch ? 360 : 320 });
  const visible = useMemo(() => filtered.flatMap((g) => g.options), [filtered]);
  const indexOf = useMemo(() => new Map(visible.map((o, i) => [o.value, i])), [visible]);

  const toggle = () => {
    if (!open && root.current) {
      setCursor(Math.max(0, flat.findIndex((o) => o.value === value)));
      setQ("");
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!root.current?.contains(t) && !panel.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    const id = setTimeout(() => (withSearch ? search.current?.focus() : list.current?.focus()), 60);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      clearTimeout(id);
    };
  }, [open, withSearch]);

  // إبقاء العنصر المحدد بلوحة المفاتيح ظاهراً
  useEffect(() => {
    if (!open) return;
    list.current?.querySelector(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor, open]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(visible.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = visible[cursor];
      if (o) pick(o.value);
    }
  };

  const h = size === "sm" ? "h-9 text-xs" : "h-11 text-sm";

  return (
    <div ref={root} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={toggle}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            toggle();
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        aria-label={ariaLabel}
        title={selected?.label}
        className={`flex w-full min-w-0 items-center gap-2 rounded-lg border bg-black/40 px-3.5 text-start outline-none transition cursor-pointer ${h} ${open ? "border-amber-400/60 ring-2 ring-amber-400/15" : "border-white/10 hover:border-white/20"}`}
      >
        <span className={`min-w-0 flex-1 truncate ${selected ? "text-white/90" : "text-white/35"}`}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && pos && typeof document !== "undefined" && createPortal(
        <div
          ref={panel}
          data-ui="dark"
          style={{ position: "fixed", top: pos.top, bottom: pos.bottom, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }}
          className="z-[200] flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#11151D] text-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)]"
        >
          {withSearch && (
            <div className="relative shrink-0 border-b border-white/[0.07] p-2">
              <Search className="pointer-events-none absolute start-4.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
              <input
                ref={search}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={onKey}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-lg bg-white/[0.05] ps-8 pe-3 text-sm outline-none placeholder:text-white/30"
              />
            </div>
          )}
          <div ref={list} id={id} role="listbox" tabIndex={-1} onKeyDown={onKey} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 outline-none">
            {visible.length === 0 && <p className="px-3 py-6 text-center text-xs text-white/40">{emptyText}</p>}
            {filtered.map((g, gi) => (
              <div key={gi} role="group" aria-label={g.label}>
                {g.label && <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">{g.label}</p>}
                {g.options.map((o) => {
                  const i = indexOf.get(o.value) ?? 0;
                  const isSel = o.value === value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={isSel}
                      data-index={i}
                      title={o.label}
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => pick(o.value)}
                      className={`flex w-full min-w-0 items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm transition cursor-pointer ${i === cursor ? "bg-white/[0.07]" : ""} ${isSel ? "text-amber-200" : "text-white/80"}`}
                    >
                      <span className="min-w-0 flex-1 truncate">{o.label}</span>
                      {o.hint && <span className="shrink-0 text-xs text-white/35">{o.hint}</span>}
                      {isSel && <Check className="h-3.5 w-3.5 shrink-0 text-amber-300" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
