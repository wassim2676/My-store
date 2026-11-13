"use client";
/* eslint-disable @next/next/no-img-element -- صور المسوّق روابط خارجية */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import OfferCard, { type OfferCardData } from "./OfferCard";
import ShareButton from "./ShareButton";
import SocialLinksRow from "./SocialLinksRow";
import { publicT, type SocialLinks } from "@/lib/landing";

export interface StorefrontPage {
  slug: string;
  title: string;
  tagline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  language: string;
}

const gridCols = (columns: 2 | 3 | 4) =>
  columns === 2
    ? "grid-cols-1 min-[480px]:grid-cols-2"
    : columns === 3
      ? "grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      : "grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

// ==================== 🧭 شريط تنقل صفحة الهبوط ====================
/**
 * الشعار + اسم الصفحة + المشاركة على سطر واحد، وبحث طويل بأسلوب Amazon (قائمة فئات + حقل + زر)،
 * وتحته سطر فلاتر الفئات والمتاجر. في صفحة العرض (mode="link") البحث ينقل إلى صفحة الهبوط.
 */
export function LandingNavbar({
  page,
  categories,
  stores = [],
  query,
  onQuery,
  category,
  onCategory,
  store,
  onStore,
  mode = "live",
}: {
  page: Pick<StorefrontPage, "slug" | "title" | "avatarUrl" | "language">;
  categories: string[];
  stores?: string[];
  query?: string;
  onQuery?: (v: string) => void;
  category?: string | null;
  onCategory?: (v: string | null) => void;
  store?: string | null;
  onStore?: (v: string | null) => void;
  mode?: "live" | "link";
}) {
  const router = useRouter();
  const lang = page.language;
  const [draft, setDraft] = useState(query ?? "");
  const value = mode === "live" ? query ?? "" : draft;
  const [linkCategory, setLinkCategory] = useState<string | null>(null);
  const currentCategory = mode === "live" ? category ?? null : linkCategory;

  const goTo = (q: string, c: string | null) => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (c) sp.set("c", c);
    const qs = sp.toString();
    router.push(`/${page.slug}${qs ? `?${qs}` : ""}`);
  };

  const chip = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition cursor-pointer ${
      active
        ? "border-transparent bg-[var(--lp-accent)] text-[var(--lp-accent-fg)]"
        : "border-[var(--lp-border)] text-[var(--lp-muted)] hover:border-[color-mix(in_srgb,var(--lp-text)_25%,transparent)] hover:text-[var(--lp-text)]"
    }`;
  const hasFilterRow = categories.length > 0 || stores.length > 1;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--lp-border)] bg-[color-mix(in_srgb,var(--lp-bg)_88%,transparent)] backdrop-blur-xl">
      <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        {/* الهوية: الشعار + الاسم + المشاركة */}
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
          <Link href={`/${page.slug}`} className="flex min-w-0 items-center gap-3">
            {page.avatarUrl ? (
              <img src={page.avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[var(--lp-accent)] ring-offset-2 ring-offset-[var(--lp-bg)]" />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--lp-accent)] font-serif text-lg font-semibold text-[var(--lp-accent-fg)]">
                {page.title.trim().slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="truncate font-serif text-lg font-semibold tracking-tight sm:text-xl">{page.title}</span>
          </Link>
          <ShareButton title={page.title} lang={lang} variant="icon" />
        </div>

        {/* 🔎 بحث بأسلوب Amazon */}
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (mode === "link") goTo(draft, linkCategory);
          }}
          className="group flex h-11 w-full min-w-0 items-stretch overflow-hidden rounded-[var(--lp-btn-radius)] border border-[var(--lp-border)] bg-[var(--lp-surface)] transition focus-within:border-[var(--lp-accent)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--lp-accent)_35%,transparent)] lg:flex-1"
        >
          {categories.length > 0 && (
            <label className="relative hidden shrink-0 items-center border-e border-[var(--lp-border)] bg-[var(--lp-surface2)] sm:flex">
              <select
                value={currentCategory ?? ""}
                onChange={(e) => {
                  const v = e.target.value || null;
                  if (mode === "live") onCategory?.(v);
                  else setLinkCategory(v);
                }}
                aria-label={publicT(lang, "allCategories")}
                className="h-full max-w-[11rem] cursor-pointer appearance-none bg-transparent ps-4 pe-9 text-[13px] font-medium text-[var(--lp-text)] focus:outline-none"
              >
                <option value="">{publicT(lang, "allCategories")}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3 h-3.5 w-3.5 text-[var(--lp-muted)]" />
            </label>
          )}
          <input
            type="search"
            value={value}
            onChange={(e) => (mode === "live" ? onQuery?.(e.target.value) : setDraft(e.target.value))}
            placeholder={publicT(lang, "searchIn", { name: page.title })}
            aria-label={publicT(lang, "search")}
            className="min-w-0 flex-1 bg-transparent px-4 text-[15px] text-[var(--lp-text)] placeholder:text-[var(--lp-muted)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {value && mode === "live" && (
            <button type="button" onClick={() => onQuery?.("")} className="px-2 text-[var(--lp-muted)] hover:text-[var(--lp-text)] cursor-pointer" aria-label={publicT(lang, "clear")}>
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="flex w-14 shrink-0 items-center justify-center bg-[var(--lp-accent)] text-[var(--lp-accent-fg)] transition hover:brightness-110 cursor-pointer"
            aria-label={publicT(lang, "search")}
          >
            <Search className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* سطر الفلاتر */}
      {hasFilterRow && (
        <div className="flex w-full items-center gap-2 overflow-x-auto border-t border-[var(--lp-border)] px-4 py-2.5 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
          <SlidersHorizontal className="me-1 h-4 w-4 shrink-0 text-[var(--lp-muted)]" />
          {mode === "live" ? (
            <>
              <button type="button" className={chip(!category && !store)} onClick={() => { onCategory?.(null); onStore?.(null); }}>
                {publicT(lang, "allOffers")}
              </button>
              {categories.map((c) => (
                <button key={c} type="button" className={chip(category === c)} onClick={() => onCategory?.(category === c ? null : c)}>
                  {c}
                </button>
              ))}
              {stores.length > 1 && (
                <>
                  <span className="mx-1 h-5 w-px shrink-0 bg-[var(--lp-border)]" />
                  {stores.map((s) => (
                    <button key={s} type="button" className={chip(store === s)} onClick={() => onStore?.(store === s ? null : s)}>
                      {s}
                    </button>
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              <Link href={`/${page.slug}`} className={chip(false)}>
                {publicT(lang, "allOffers")}
              </Link>
              {categories.map((c) => (
                <Link key={c} href={`/${page.slug}?c=${encodeURIComponent(c)}`} className={chip(false)}>
                  {c}
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </header>
  );
}

// ==================== 🛍️ واجهة صفحة الهبوط كاملة ====================
export default function Storefront({
  page,
  offers,
  socials,
  columns = 4,
  initialQuery = "",
  initialCategory = null,
}: {
  page: StorefrontPage;
  offers: OfferCardData[];
  socials: SocialLinks;
  columns?: 2 | 3 | 4;
  initialQuery?: string;
  initialCategory?: string | null;
}) {
  const lang = page.language;
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [store, setStore] = useState<string | null>(null);

  const categories = useMemo(() => Array.from(new Set(offers.map((o) => o.category).filter((c): c is string => !!c))), [offers]);
  const stores = useMemo(
    () => Array.from(new Set(offers.map((o) => o.brand?.name || o.storeName).filter((s): s is string => !!s))),
    [offers]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offers.filter((o) => {
      if (category && o.category !== category) return false;
      if (store && (o.brand?.name || o.storeName) !== store) return false;
      if (q && !`${o.title} ${o.shortReview} ${o.category ?? ""} ${o.brand?.name ?? o.storeName ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [offers, query, category, store]);

  const filtering = !!(query.trim() || category || store);
  const featured = filtering ? [] : offers.filter((o) => o.isFeatured).slice(0, 3);
  const showFeatured = featured.length > 0 && offers.length > featured.length;
  const countLabel = offers.length === 1 ? `1 ${publicT(lang, "offerOne")}` : `${offers.length} ${publicT(lang, "offers")}`;
  const hasAbout = !!(page.tagline || page.bio || Object.values(socials).some(Boolean));

  return (
    <>
      <LandingNavbar
        page={page}
        categories={categories}
        stores={stores}
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
        store={store}
        onStore={setStore}
      />

      {/* 📝 عن الصفحة */}
      <section className="relative w-full overflow-hidden border-b border-[var(--lp-border)]">
        {page.coverUrl && (
          <div className="absolute inset-0">
            <img src={page.coverUrl} alt="" className="h-full w-full object-cover opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--lp-bg)] via-[color-mix(in_srgb,var(--lp-bg)_75%,transparent)] to-[color-mix(in_srgb,var(--lp-bg)_40%,transparent)]" />
          </div>
        )}
        <div className="relative flex w-full flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8 lg:py-10">
          <div className="max-w-3xl">
            {page.tagline ? (
              <h1 className="font-serif text-2xl font-semibold leading-tight sm:text-4xl">{page.tagline}</h1>
            ) : (
              <h1 className="font-serif text-2xl font-semibold leading-tight sm:text-4xl">{page.title}</h1>
            )}
            {page.bio && <p className="mt-3 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-[var(--lp-muted)]">{page.bio}</p>}
            {!hasAbout && <p className="mt-2 text-sm text-[var(--lp-muted)]">{countLabel}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
            <SocialLinksRow links={socials} className="justify-start md:justify-end" />
            {hasAbout && <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--lp-muted)]">{countLabel}</span>}
          </div>
        </div>
      </section>

      {/* 🛒 البطاقات */}
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        {offers.length === 0 ? (
          <p className="py-24 text-center text-[var(--lp-muted)]">{publicT(lang, "noOffers")}</p>
        ) : (
          <>
            {showFeatured && (
              <section className="mb-10">
                <h2 className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lp-accent)]">
                  <span className="h-px w-8 bg-[var(--lp-accent)]" />
                  {publicT(lang, "featured")}
                </h2>
                <div className={`grid gap-5 ${featured.length === 1 ? "max-w-md" : featured.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                  {featured.map((o) => (
                    <OfferCard key={o.id} offer={o} pageSlug={page.slug} lang={lang} large />
                  ))}
                </div>
              </section>
            )}

            {filtering && (
              <div className="mb-5 flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--lp-muted)]">{filtered.length === 1 ? publicT(lang, "resultOne") : publicT(lang, "results", { n: String(filtered.length) })}</span>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory(null);
                    setStore(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-[var(--lp-accent)] hover:underline cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  {publicT(lang, "clear")}
                </button>
              </div>
            )}

            {filtered.length === 0 ? (
              <p className="py-16 text-center text-[var(--lp-muted)]">{publicT(lang, "noResults")}</p>
            ) : (
              <div className={`grid gap-5 ${gridCols(columns)}`}>
                {filtered.map((o) => (
                  <OfferCard key={o.id} offer={o} pageSlug={page.slug} lang={lang} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
