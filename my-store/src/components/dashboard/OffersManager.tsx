"use client";
/* eslint-disable @next/next/no-img-element -- صور العروض روابط خارجية */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowDown, ArrowUp, Copy, Eye, EyeOff, ExternalLink, MoreHorizontal, PenLine, PlusCircle, Search, Star, Trash2, Archive, MousePointerClick, Loader2,
} from "lucide-react";
import BrandLogo from "@/components/shop/BrandLogo";
import { resolveStore } from "@/lib/landing";
import type { SerializedOffer } from "@/lib/marketer";

type Filter = "all" | "PUBLISHED" | "DRAFT" | "ARCHIVED";

export default function OffersManager({ initialOffers, pageSlug }: { initialOffers: SerializedOffer[]; pageSlug: string }) {
  const t = useTranslations("dash");
  const router = useRouter();
  const [offers, setOffers] = useState(initialOffers);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [error, setError] = useState("");

  const counts = useMemo(
    () => ({
      all: offers.length,
      PUBLISHED: offers.filter((o) => o.status === "PUBLISHED").length,
      DRAFT: offers.filter((o) => o.status === "DRAFT").length,
      ARCHIVED: offers.filter((o) => o.status === "ARCHIVED").length,
    }),
    [offers]
  );

  const visible = offers.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || `${o.title} ${o.category ?? ""} ${o.brand?.name ?? o.storeName ?? ""}`.toLowerCase().includes(q);
  });
  const canReorder = filter === "all" && !query.trim();

  const call = async (id: string, init: RequestInit & { url?: string }) => {
    setBusy(id);
    setError("");
    try {
      const res = await fetch(init.url || `/api/marketer/offers/${id}`, {
        ...init,
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("common.error"));
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
      return null;
    } finally {
      setBusy(null);
      setMenu(null);
    }
  };

  // تحديث متفائل: الواجهة تتغيّر فوراً، ونرجع للحالة السابقة إن فشل الطلب
  const patch = async (id: string, body: Record<string, unknown>) => {
    const before = offers;
    setOffers((list) => list.map((o) => (o.id === id ? { ...o, ...body } : o)));
    setMenu(null);
    const data = await call(id, { method: "PATCH", body: JSON.stringify(body) });
    if (data?.data) setOffers((list) => list.map((o) => (o.id === id ? data.data : o)));
    else setOffers(before);
  };

  const remove = async (id: string) => {
    if (!confirm(t("offers.confirmDelete"))) return;
    const before = offers;
    setOffers((list) => list.filter((o) => o.id !== id));
    const data = await call(id, { method: "DELETE" });
    if (!data) setOffers(before);
  };

  const duplicate = async (id: string) => {
    const data = await call(id, { method: "POST", url: "/api/marketer/offers", body: JSON.stringify({ duplicateOf: id }) });
    if (data?.data) router.push(`/dashboard/offers/${data.data.id}`);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= offers.length) return;
    setOffers((list) => {
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setOrderDirty(true);
  };

  const saveOrder = async () => {
    const data = await call("order", { method: "POST", url: "/api/marketer/offers/reorder", body: JSON.stringify({ ids: offers.map((o) => o.id) }) });
    if (data) setOrderDirty(false);
  };

  const statusPill = (s: string) =>
    ({
      PUBLISHED: "bg-emerald-400/10 text-emerald-300",
      DRAFT: "bg-amber-400/10 text-amber-300",
      ARCHIVED: "bg-white/5 text-white/45",
    })[s] || "";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{t("offers.title")}</h1>
          <p className="mt-1 text-white/55">{t("offers.subtitle")}</p>
        </div>
        <Link href="/dashboard/offers/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300">
          <PlusCircle className="h-4 w-4" />
          {t("nav.newOffer")}
        </Link>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
          {(["all", "PUBLISHED", "DRAFT", "ARCHIVED"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm transition cursor-pointer ${filter === f ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}
            >
              {t(`offers.filter.${f}`)} <span className="text-white/35">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("offers.search")}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pe-3 ps-9 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
      </div>

      {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

      {orderDirty && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] px-4 py-3 text-sm">
          <span className="text-amber-200">{t("offers.orderChanged")}</span>
          <button onClick={saveOrder} disabled={busy === "order"} className="rounded-lg bg-amber-400 px-4 py-1.5 font-semibold text-black hover:bg-amber-300 disabled:opacity-50 cursor-pointer">
            {busy === "order" ? <Loader2 className="h-4 w-4 animate-spin" /> : t("offers.saveOrder")}
          </button>
        </div>
      )}

      {offers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 px-6 py-20 text-center">
          <p className="font-serif text-2xl">{t("offers.emptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/50">{t("offers.empty")}</p>
          <Link href="/dashboard/offers/new" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300">
            <PlusCircle className="h-4 w-4" />
            {t("nav.newOffer")}
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((o) => {
            const index = offers.indexOf(o);
            const store = resolveStore(o.brand, o.storeName, o.storeLogo);
            return (
              <li key={o.id} className={`flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 sm:gap-4 ${busy === o.id ? "opacity-60" : ""}`}>
                {canReorder && (
                  <div className="hidden flex-col sm:flex">
                    <button onClick={() => move(index, -1)} disabled={index === 0} className="rounded p-1 text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-20 cursor-pointer" aria-label="up">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => move(index, 1)} disabled={index === offers.length - 1} className="rounded p-1 text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-20 cursor-pointer" aria-label="down">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <Link href={`/dashboard/offers/${o.id}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                  {o.images[0] && <img src={o.images[0]} alt="" className="h-full w-full object-contain p-1.5" />}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/dashboard/offers/${o.id}`} className="truncate font-medium hover:text-amber-300">{o.title}</Link>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusPill(o.status)}`}>{t(`offers.status.${o.status}`)}</span>
                    {o.isFeatured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/45">
                    <span className="flex items-center gap-1.5">
                      <span className="flex h-5 min-w-5 items-center justify-center rounded bg-white px-0.5"><BrandLogo brand={store} size={14} /></span>
                      {store.name}
                    </span>
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{o.views}</span>
                    <span className="flex items-center gap-1"><MousePointerClick className="h-3.5 w-3.5" />{o.clicks}</span>
                    {o.category && <span>{o.category}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => patch(o.id, { isFeatured: !o.isFeatured })}
                    title={t("offers.actions.feature")}
                    className="hidden rounded-lg p-2 text-white/45 hover:bg-white/5 hover:text-amber-300 sm:block cursor-pointer"
                  >
                    <Star className={`h-4 w-4 ${o.isFeatured ? "fill-amber-400 text-amber-400" : ""}`} />
                  </button>
                  <Link href={`/dashboard/offers/${o.id}`} title={t("offers.actions.edit")} className="rounded-lg p-2 text-white/45 hover:bg-white/5 hover:text-white">
                    <PenLine className="h-4 w-4" />
                  </Link>
                  <div className="relative">
                    <button onClick={() => setMenu(menu === o.id ? null : o.id)} className="rounded-lg p-2 text-white/45 hover:bg-white/5 hover:text-white cursor-pointer" aria-label="more">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {menu === o.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                        <div className="absolute end-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#11151D] py-1 text-sm shadow-2xl">
                          <a href={`/${pageSlug}/${o.slug}`} target="_blank" rel="noopener" className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-white/5">
                            <ExternalLink className="h-4 w-4 text-white/45" />{t("offers.actions.view")}
                          </a>
                          {o.status !== "PUBLISHED" ? (
                            <button onClick={() => patch(o.id, { status: "PUBLISHED" })} className="flex w-full items-center gap-2.5 px-3.5 py-2 hover:bg-white/5 cursor-pointer">
                              <Eye className="h-4 w-4 text-white/45" />{t("offers.actions.publish")}
                            </button>
                          ) : (
                            <button onClick={() => patch(o.id, { status: "DRAFT" })} className="flex w-full items-center gap-2.5 px-3.5 py-2 hover:bg-white/5 cursor-pointer">
                              <EyeOff className="h-4 w-4 text-white/45" />{t("offers.actions.unpublish")}
                            </button>
                          )}
                          <button onClick={() => patch(o.id, { isFeatured: !o.isFeatured })} className="flex w-full items-center gap-2.5 px-3.5 py-2 hover:bg-white/5 sm:hidden cursor-pointer">
                            <Star className="h-4 w-4 text-white/45" />{t("offers.actions.feature")}
                          </button>
                          <button onClick={() => duplicate(o.id)} className="flex w-full items-center gap-2.5 px-3.5 py-2 hover:bg-white/5 cursor-pointer">
                            <Copy className="h-4 w-4 text-white/45" />{t("offers.actions.duplicate")}
                          </button>
                          {o.status !== "ARCHIVED" && (
                            <button onClick={() => patch(o.id, { status: "ARCHIVED" })} className="flex w-full items-center gap-2.5 px-3.5 py-2 hover:bg-white/5 cursor-pointer">
                              <Archive className="h-4 w-4 text-white/45" />{t("offers.actions.archive")}
                            </button>
                          )}
                          <button onClick={() => remove(o.id)} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-rose-300 hover:bg-rose-500/10 cursor-pointer">
                            <Trash2 className="h-4 w-4" />{t("offers.actions.delete")}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
          {visible.length === 0 && <li className="py-12 text-center text-sm text-white/45">{t("offers.noMatch")}</li>}
        </ul>
      )}
    </div>
  );
}
