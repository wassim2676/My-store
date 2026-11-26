"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeDollarSign, ChevronDown, Palette, Rocket, Search, ShieldCheck, Users, X } from "lucide-react";

// ==================== ❓ مستكشف الأسئلة الشائعة: بحث فوري + مواضيع + أكورديون ====================
export type FaqGroup = { id: string; title: string; items: { q: string; a: string }[] };

const ICONS: Record<string, typeof Rocket> = { "getting-started": Rocket, design: Palette, earnings: BadgeDollarSign, compliance: ShieldCheck, account: Users };

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[ً-ْ̀-ͯ]/g, "");

export default function FaqExplorer({ groups, labels }: { groups: FaqGroup[]; labels: { search: string; browse: string; results: string; noResults: string } }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(`${groups[0]?.id}-0`);
  const [active, setActive] = useState(groups[0]?.id);

  const q = norm(query.trim());
  const filtered = useMemo(
    () => groups.map((g) => ({ ...g, items: g.items.map((it, i) => ({ ...it, key: `${g.id}-${i}` })).filter((it) => !q || norm(it.q).includes(q) || norm(it.a).includes(q)) })).filter((g) => g.items.length),
    [groups, q],
  );
  const count = filtered.reduce((n, g) => n + g.items.length, 0);

  // 📍 الموضوع الحالي أثناء التمرير
  useEffect(() => {
    const onScroll = () => {
      let cur = groups[0]?.id;
      for (const g of groups) {
        const el = document.getElementById(`topic-${g.id}`);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.3) cur = g.id;
      }
      setActive(cur);
    };
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [groups]);

  return (
    <div>
      {/* 🔎 البحث */}
      <div className="relative mx-auto max-w-2xl">
        <Search className="pointer-events-none absolute start-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.search}
          aria-label={labels.search}
          className="h-16 w-full rounded-full border border-white/10 bg-white/[0.04] pe-14 ps-14 text-base text-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] outline-none transition placeholder:text-white/35 focus:border-amber-300/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-amber-300/10 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="absolute end-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {q && <p className="mt-4 text-center text-sm text-white/45">{labels.results.replace("{count}", String(count))}</p>}

      <div className="mt-16 grid gap-12 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-16">
        {/* 🧭 المواضيع */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24" aria-label={labels.browse}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/40">{labels.browse}</p>
            <ul className="mt-5 space-y-1">
              {groups.map((g) => {
                const Icon = ICONS[g.id] ?? Rocket;
                const on = active === g.id && !q;
                return (
                  <li key={g.id}>
                    <a href={`#topic-${g.id}`} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition ${on ? "bg-amber-300/[0.08] font-medium text-amber-200" : "text-white/55 hover:bg-white/[0.04] hover:text-white"}`}>
                      <Icon className={`h-4 w-4 ${on ? "text-amber-300" : "text-white/35"}`} />
                      {g.title}
                      <span className="ms-auto text-xs tabular-nums text-white/30">{g.items.length}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* 📚 الأسئلة */}
        <div className="min-w-0">
          {/* شرائح المواضيع للهاتف */}
          <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden [scrollbar-width:none]">
            {groups.map((g) => (
              <a key={g.id} href={`#topic-${g.id}`} className="shrink-0 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70">{g.title}</a>
            ))}
          </div>

          {count === 0 ? (
            <p className="rounded-3xl border border-dashed border-white/10 py-16 text-center text-white/45">{labels.noResults}</p>
          ) : (
            <div className="space-y-14">
              {filtered.map((g) => {
                const Icon = ICONS[g.id] ?? Rocket;
                return (
                  <section key={g.id} id={`topic-${g.id}`} className="scroll-mt-28">
                    <h2 className="flex items-center gap-3 font-serif text-2xl font-semibold sm:text-3xl">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300/10 text-amber-300 ring-1 ring-amber-300/15"><Icon className="h-5 w-5" /></span>
                      {g.title}
                    </h2>
                    <div className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                      {g.items.map((it) => {
                        const isOpen = open === it.key || !!q;
                        return (
                          <div key={it.key}>
                            <button
                              type="button"
                              onClick={() => setOpen(open === it.key ? null : it.key)}
                              aria-expanded={isOpen}
                              className="group flex w-full items-center justify-between gap-6 py-6 text-start"
                            >
                              <h3 className={`text-[17px] font-semibold transition ${isOpen ? "text-white" : "text-white/85 group-hover:text-white"}`}>{it.q}</h3>
                              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${isOpen ? "rotate-180 border-amber-300/40 bg-amber-300/10 text-amber-300" : "border-white/10 text-white/45 group-hover:border-white/25"}`}>
                                <ChevronDown className="h-4 w-4" />
                              </span>
                            </button>
                            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                              <div className="overflow-hidden">
                                <p className="max-w-3xl pb-6 pe-12 text-[16px] leading-[1.8] text-white/60">{it.a}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
