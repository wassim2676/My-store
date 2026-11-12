"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import OfferCard, { type OfferCardData } from "./OfferCard";
import { publicT } from "@/lib/landing";

// ==================== 🗂️ معرض العروض: بحث + تصفية حسب الفئة والمتجر ====================
export default function OfferGallery({
  offers,
  pageSlug,
  lang,
  columns = 4,
}: {
  offers: OfferCardData[];
  pageSlug: string;
  lang: string;
  /** عدد الأعمدة على الشاشات الكبيرة (من إعدادات التصميم) */
  columns?: 2 | 3 | 4;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [store, setStore] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(offers.map((o) => o.category).filter((c): c is string => !!c))),
    [offers]
  );
  const stores = useMemo(
    () => Array.from(new Set(offers.map((o) => o.brand?.name || o.storeName).filter((s): s is string => !!s))),
    [offers]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offers.filter((o) => {
      if (category && o.category !== category) return false;
      if (store && (o.brand?.name || o.storeName) !== store) return false;
      if (q && !`${o.title} ${o.shortReview} ${o.category ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [offers, query, category, store]);

  if (offers.length === 0) {
    return <p className="py-24 text-center text-[var(--lp-muted)]">{publicT(lang, "noOffers")}</p>;
  }

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-medium transition cursor-pointer ${
      active
        ? "border-transparent text-[var(--lp-accent-fg)]"
        : "border-[var(--lp-border)] text-[var(--lp-muted)] hover:text-[var(--lp-text)]"
    }`;

  const showFilters = offers.length > 4;

  return (
    <div>
      {showFilters && (
        <div className="mb-8 flex flex-col gap-4">
          <div className="relative mx-auto w-full max-w-md">
            <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--lp-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={publicT(lang, "search")}
              className="w-full rounded-full border border-[var(--lp-border)] bg-[var(--lp-surface)] py-3 pe-4 ps-11 text-sm text-[var(--lp-text)] placeholder:text-[var(--lp-muted)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--lp-accent)_60%,transparent)]"
            />
          </div>

          {(categories.length > 1 || stores.length > 1) && (
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:justify-center [scrollbar-width:none]">
              <button type="button" className={chip(!category && !store)} style={!category && !store ? { background: "var(--lp-accent)" } : undefined} onClick={() => { setCategory(null); setStore(null); }}>
                {publicT(lang, "allOffers")}
              </button>
              {categories.length > 1 &&
                categories.map((c) => (
                  <button key={c} type="button" className={chip(category === c)} style={category === c ? { background: "var(--lp-accent)" } : undefined} onClick={() => setCategory(category === c ? null : c)}>
                    {c}
                  </button>
                ))}
              {stores.length > 1 &&
                stores.map((s) => (
                  <button key={s} type="button" className={chip(store === s)} style={store === s ? { background: "var(--lp-accent)" } : undefined} onClick={() => setStore(store === s ? null : s)}>
                    {s}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[var(--lp-muted)]">{publicT(lang, "noResults")}</p>
      ) : (
        <div className={`grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 ${columns === 2 ? "" : columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"}`}>
          {filtered.map((o) => (
            <OfferCard key={o.id} offer={o} pageSlug={pageSlug} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
