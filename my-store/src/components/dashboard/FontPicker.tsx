"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { loadStylesheet } from "@/components/landing/ClientFonts";
import { ARABIC_SAMPLE, FONT_CATEGORIES, FONTS, fontPreviewHref, fontStack, getFont, type FontCategory } from "@/lib/fonts";

type Tab = "all" | FontCategory;
const TABS: Tab[] = ["all", ...FONT_CATEGORIES];

/** روابط معاينة خفيفة: رابط لكل فئة (Google يرفض رابطاً واحداً لكل الخطوط) بالحروف المطلوبة فقط */
const PREVIEW_HREFS = FONT_CATEGORIES.map((cat) => {
  const fams = FONTS.filter((f) => f.category === cat).map((f) => f.family);
  const chars = [...new Set(fams.join("") + "Aa" + ARABIC_SAMPLE)].sort().join("");
  return fontPreviewHref(fams, chars);
});

/**
 * 🔤 منتقي خطوط احترافي (على طريقة Canva):
 * بحث فوري، تصنيفات، كل خط يُعرض بشكله الحقيقي، معاينة حية عند المرور، ولوحة مفاتيح كاملة.
 */
export default function FontPicker({
  label,
  value,
  onChange,
  onPreview,
  preferArabic,
}: {
  label: string;
  value: string;
  onChange: (family: string) => void;
  /** يُستدعى عند المرور على خط (لمعاينته مباشرة في الصفحة) و null عند الخروج */
  onPreview?: (family: string | null) => void;
  /** صفحة عربية: الخطوط الداعمة للعربية أولاً */
  preferArabic?: boolean;
}) {
  const t = useTranslations("dash.design");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const current = getFont(value);

  const filterFonts = (query: string, tab: Tab) => {
    const q = query.trim().toLowerCase();
    let list = FONTS.filter((f) => {
      if (tab === "arabic" ? !f.arabic : tab !== "all" && f.category !== tab) return false;
      return !q || f.family.toLowerCase().includes(q) || t(`fontCats.${f.category}`).toLowerCase().includes(q);
    });
    if (preferArabic && tab === "all") list = [...list.filter((f) => f.arabic), ...list.filter((f) => !f.arabic)];
    return list;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const results = useMemo(() => filterFonts(query, tab), [query, tab, preferArabic, t]);

  const close = () => {
    setOpen(false);
    onPreview?.(null);
  };

  const openPicker = () => {
    PREVIEW_HREFS.forEach(loadStylesheet); // معاينات أسماء الخطوط: تُحمَّل عند أول فتح فقط (بضعة كيلوبايتات)
    setQuery("");
    setTab("all");
    setActive(Math.max(0, filterFonts("", "all").findIndex((f) => f.family === value)));
    setOpen(true);
  };

  // عند الفتح: التركيز على البحث والتمرير إلى الخط الحالي
  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    // العنصر المحدّد معلَّم بـ aria-selected
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: "center" }));
     
  }, [open]);

  // إغلاق عند النقر خارج المنتقي
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const choose = (family: string) => {
    onChange(family);
    close();
  };

  const moveActive = (i: number) => {
    const n = Math.max(0, Math.min(results.length - 1, i));
    setActive(n);
    listRef.current?.querySelector<HTMLElement>(`[data-index="${n}"]`)?.scrollIntoView({ block: "nearest" });
    if (results[n]) onPreview?.(results[n].family);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveActive(active + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveActive(active - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (results[active]) choose(results[active].family);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
    }
  };

  return (
    <div ref={root} className="relative">
      {/* معاينات أسماء الخطوط: تُحمَّل عند أول فتح فقط، ببضعة كيلوبايتات */}

      <p className="mb-2 text-sm text-white/70">{label}</p>
      <button
        type="button"
        onClick={() => (open ? close() : openPicker())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-start transition cursor-pointer ${open ? "border-amber-400 bg-white/[0.04]" : "border-white/10 bg-white/[0.02] hover:border-white/25"}`}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg leading-tight" style={{ fontFamily: fontStack(value) }}>
            {value}
          </span>
          {current && <span className="mt-0.5 block text-[11px] text-white/45">{t(`fontCats.${current.category}`)}</span>}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-40 min-w-[18rem] overflow-hidden rounded-2xl border border-white/10 bg-[#121317] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85)] animate-[lp-pop_140ms_ease-out]">
          {/* 🔍 البحث */}
          <div className="border-b border-white/[0.07] p-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 focus-within:border-amber-400/70">
              <Search className="h-4 w-4 shrink-0 text-white/40" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                  listRef.current?.scrollTo({ top: 0 });
                }}
                onKeyDown={onKeyDown}
                placeholder={t("fontSearch", { n: FONTS.length })}
                role="combobox"
                aria-expanded
                aria-controls={`${id}-list`}
                aria-activedescendant={results[active] ? `${id}-opt-${active}` : undefined}
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="text-white/40 hover:text-white cursor-pointer" aria-label="clear">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* التصنيفات */}
            <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => {
                    setTab(c);
                    setActive(0);
                    listRef.current?.scrollTo({ top: 0 });
                    searchRef.current?.focus();
                  }}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${tab === c ? "bg-amber-400 text-black" : "bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white"}`}
                >
                  {t(`fontCats.${c}`)}
                </button>
              ))}
            </div>
          </div>

          {/* القائمة */}
          <ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            aria-label={label}
            onMouseLeave={() => onPreview?.(null)}
            className="max-h-80 overflow-y-auto p-1.5 [scrollbar-width:thin]"
          >
            {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-white/40">{t("fontNone")}</li>}
            {results.map((f, i) => {
              const selected = f.family === value;
              return (
                <li
                  key={f.family}
                  id={`${id}-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => {
                    setActive(i);
                    onPreview?.(f.family);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(f.family)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${i === active ? "bg-white/[0.07]" : ""}`}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center text-amber-400">{selected && <Check className="h-4 w-4" />}</span>
                  <span className={`min-w-0 flex-1 truncate text-[17px] leading-snug ${selected ? "text-amber-300" : "text-white"}`} style={{ fontFamily: fontStack(f.family) }}>
                    {f.family}
                  </span>
                  {f.arabic && (
                    <span dir="rtl" className="shrink-0 text-[15px] text-white/60" style={{ fontFamily: fontStack(f.family) }}>
                      {ARABIC_SAMPLE}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="border-t border-white/[0.07] px-3.5 py-2 text-[11px] text-white/35">{t("fontCount", { n: results.length })}</div>
        </div>
      )}
    </div>
  );
}
