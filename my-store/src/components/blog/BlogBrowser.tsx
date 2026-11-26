"use client";

/* eslint-disable @next/next/no-img-element -- شعارات SVG صغيرة */
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownWideNarrow, ChevronLeft, ChevronRight, LayoutGrid, Search, SearchX, X } from "lucide-react";
import { CardView, type CardData } from "./CardView";

// ==================== 🔎 متصفح المدونة: تبويبات الشبكات + المواضيع + بحث فوري + ترتيب ====================
// بدون أي فلتر نعرض الواجهة الافتراضية (المميّز + أقسام الشبكات) القادمة من السيرفر كـ children.

type Net = { slug: string; name: string; dot: string; count: number };

const TOPICS = [
  { id: "Guide", label: "Program guides" },
  { id: "Commissions", label: "Commissions" },
  { id: "Strategy", label: "Product strategy" },
  { id: "Social", label: "Social media" },
  { id: "Compliance", label: "Compliance" },
];
const SORTS = [
  { id: "new", label: "Newest" },
  { id: "short", label: "Quick reads" },
  { id: "long", label: "In-depth" },
] as const;

export default function BlogBrowser({ cards, networks, children }: { cards: CardData[]; networks: Net[]; children: React.ReactNode }) {
  const [net, setNet] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("new");
  const top = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  // ◀ ▶ أسهم تمرير التبويبات (تظهر فقط عند وجود تبويبات مخفية)
  const measure = () => {
    const el = strip.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const x = Math.abs(el.scrollLeft); // RTL: scrollLeft سالب
    setEdges({ left: x > 4, right: x < max - 4 });
  };
  useEffect(() => {
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);
  const scrollBy = (dir: 1 | -1) => strip.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  const q = query.trim().toLowerCase();
  const filtering = !!(net || topic || q);

  const results = useMemo(() => {
    const list = cards.filter(
      (c) => (!net || c.network === net) && (!topic || c.kind === topic) && (!q || `${c.title} ${c.excerpt} ${c.networkName}`.toLowerCase().includes(q)),
    );
    if (sort === "short") return [...list].sort((a, b) => a.minutes - b.minutes);
    if (sort === "long") return [...list].sort((a, b) => b.minutes - a.minutes);
    return list;
  }, [cards, net, topic, q, sort]);

  /** عند تغيير الفلتر: نعيد العرض لبداية النتائج إن كان الشريط ملتصقاً */
  const jump = () => {
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) window.scrollTo({ top: el.offsetTop - 64, behavior: "smooth" });
  };
  const pickNet = (v: string | null) => { setNet(v); jump(); };
  const pickTopic = (v: string | null) => { setTopic((cur) => (cur === v ? null : v)); jump(); };
  const clear = () => { setNet(null); setTopic(null); setQuery(""); setSort("new"); };

  const topicCount = (id: string) => cards.filter((c) => c.kind === id && (!net || c.network === net)).length;

  return (
    <div ref={top}>
      {/* ==================== 🧭 شريط الفلاتر الملتصق ==================== */}
      <div className="sticky top-16 z-30 border-b border-white/[0.07] bg-[#07090D]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4">
          {/* تبويبات الشبكات */}
          <div className="relative">
            {edges.left && (
              <button type="button" onClick={() => scrollBy(-1)} aria-label="Scroll left" className="absolute left-0 top-0 z-10 flex h-14 w-14 items-center justify-start bg-gradient-to-r from-[#07090D] via-[#07090D]/90 to-transparent">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#11141B] text-white/80 shadow-lg hover:bg-white/10"><ChevronLeft className="h-4 w-4" /></span>
              </button>
            )}
            {edges.right && (
              <button type="button" onClick={() => scrollBy(1)} aria-label="Scroll right" className="absolute right-0 top-0 z-10 flex h-14 w-14 items-center justify-end bg-gradient-to-l from-[#07090D] via-[#07090D]/90 to-transparent">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#11141B] text-white/80 shadow-lg hover:bg-white/10"><ChevronRight className="h-4 w-4" /></span>
              </button>
            )}
            <div ref={strip} onScroll={measure} role="tablist" aria-label="Affiliate networks" className="-mb-px flex gap-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Tab on={!net} onClick={() => pickNet(null)} count={cards.length}>
                <LayoutGrid className="h-4 w-4" /> All guides
              </Tab>
              {networks.map((n) => (
                <Tab key={n.slug} on={net === n.slug} onClick={() => pickNet(n.slug)} count={n.count} accent={n.dot}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white p-[3px]">
                    <img src={`/brands/${n.slug}.svg`} alt="" className="max-h-full max-w-full object-contain" />
                  </span>
                  {n.name}
                </Tab>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 🎛️ المواضيع + البحث + الترتيب ==================== */}
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Topics">
            <Chip on={!topic} onClick={() => { setTopic(null); jump(); }}>All topics</Chip>
            {TOPICS.map((t) => (
              <Chip key={t.id} on={topic === t.id} onClick={() => pickTopic(t.id)}>
                {t.label}
                <span className={`text-[11px] tabular-nums ${topic === t.id ? "text-black/55" : "text-white/35"}`}>{topicCount(t.id)}</span>
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="relative flex-1 lg:w-64 lg:flex-none">
              <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search guides"
                aria-label="Search guides"
                className="h-10 w-full rounded-full border border-white/10 bg-white/[0.04] pe-9 ps-10 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-amber-300/50 focus:bg-white/[0.06] [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute end-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/45 hover:bg-white/10 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>
            <div className="relative">
              <ArrowDownWideNarrow className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                aria-label="Sort guides"
                className="h-10 cursor-pointer appearance-none rounded-full border border-white/10 bg-white/[0.04] pe-4 ps-9 text-sm text-white/85 outline-none transition hover:border-white/20 focus:border-amber-300/50 [&>option]:bg-[#111]"
              >
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {filtering && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4 text-sm">
            <p className="text-white/55">
              <span className="font-semibold text-white">{results.length}</span> {results.length === 1 ? "guide" : "guides"}
              {net && <> for <span className="text-white">{networks.find((n) => n.slug === net)?.name}</span></>}
              {topic && <> in <span className="text-white">{TOPICS.find((t) => t.id === topic)?.label}</span></>}
              {q && <> matching “<span className="text-white">{query.trim()}</span>”</>}
            </p>
            <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 font-medium text-amber-300 hover:text-amber-200">
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ==================== 📚 النتائج ==================== */}
      {filtering ? (
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-8">
          {results.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((c) => <CardView key={c.slug} c={c} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 py-20 text-center">
              <SearchX className="h-10 w-10 text-white/25" />
              <p className="mt-4 font-semibold">No guides match these filters</p>
              <p className="mt-1 text-sm text-white/45">Try another network, topic or keyword.</p>
              <button type="button" onClick={clear} className="mt-5 rounded-full bg-white/[0.08] px-5 py-2 text-sm font-medium hover:bg-white/[0.14]">Clear filters</button>
            </div>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function Tab({ on, onClick, count, accent, children }: { on: boolean; onClick: () => void; count: number; accent?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={on}
      onClick={onClick}
      className={`group relative inline-flex h-14 shrink-0 items-center gap-2 px-3.5 text-[14px] font-medium transition-colors ${on ? "text-white" : "text-white/55 hover:text-white"}`}
    >
      {children}
      <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums transition ${on ? "bg-white/15 text-white" : "bg-white/[0.06] text-white/40"}`}>{count}</span>
      <span
        className={`absolute inset-x-2 bottom-0 h-[3px] rounded-t-full transition-all duration-200 ${on ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
        style={{ background: accent ?? "#FBBF24" }}
      />
    </button>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition ${
        on ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
