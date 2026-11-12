/* eslint-disable @next/next/no-img-element -- صور العروض روابط خارجية يضيفها المسوّقون */
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { getLocale, getTranslations } from "next-intl/server";
import { ExternalLink, ImageOff, Search, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BrandLogo from "@/components/shop/BrandLogo";
import OfferModeration from "@/components/admin/OfferModeration";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "PUBLISHED", "DRAFT", "ARCHIVED"] as const;
type StatusFilter = (typeof STATUSES)[number];
const PAGE_SIZE = 40;

// ==================== 📦 الأدمن: كل العروض على المنصة (إشراف على المحتوى) ====================
export default async function AdminOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; s?: string; page?: string; p?: string }>;
}) {
  const t = await getTranslations("adm.offers");
  const locale = await getLocale();
  const nf = new Intl.NumberFormat(locale);
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status: StatusFilter = (STATUSES as readonly string[]).includes(sp.s ?? "") ? (sp.s as StatusFilter) : "all";
  const pageId = sp.page || undefined;
  const pageNo = Math.max(1, Number(sp.p) || 1);

  const base: Prisma.OfferWhereInput = {
    ...(pageId && { landingPageId: pageId }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { storeName: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
        { landingPage: { title: { contains: q, mode: "insensitive" } } },
      ],
    }),
  };
  const where: Prisma.OfferWhereInput = { ...base, ...(status !== "all" && { status }) };

  const [total, byStatus, offers, pageInfo] = await Promise.all([
    prisma.offer.count({ where }),
    prisma.offer.groupBy({ by: ["status"], where: base, _count: { _all: true } }),
    prisma.offer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageNo - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, slug: true, title: true, images: true, status: true, clicks: true, views: true, storeName: true, createdAt: true, affiliateUrl: true,
        brand: { select: { name: true, logoSvg: true, logoUrl: true, accentColor: true } },
        landingPage: { select: { slug: true, title: true } },
      },
    }),
    pageId ? prisma.landingPage.findUnique({ where: { id: pageId }, select: { title: true } }) : null,
  ]);
  const countOf = (s: StatusFilter) =>
    s === "all" ? byStatus.reduce((a, b) => a + b._count._all, 0) : byStatus.find((b) => b.status === s)?._count._all ?? 0;
  const pagesCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = (over: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q, s: status === "all" ? undefined : status, page: pageId, p: undefined, ...over } as Record<string, string | number | undefined>;
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "" && !(k === "p" && v === 1)) p.set(k, String(v));
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const labels = {
    publish: t("actions.publish"),
    hide: t("actions.hide"),
    archive: t("actions.archive"),
    remove: t("actions.delete"),
    confirmDelete: t("actions.confirmDelete"),
    error: t("actions.error"),
  };
  const statusCls: Record<string, string> = {
    PUBLISHED: "bg-emerald-400/10 text-emerald-300",
    DRAFT: "bg-amber-400/10 text-amber-300",
    ARCHIVED: "bg-white/[0.06] text-white/50",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{t("title")}</h1>
          <p className="mt-1 text-white/55">{t("subtitle")}</p>
        </div>
        <form className="relative w-full sm:w-80" action="/admin/offers">
          {status !== "all" && <input type="hidden" name="s" value={status} />}
          {pageId && <input type="hidden" name="page" value={pageId} />}
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            name="q"
            defaultValue={q}
            placeholder={t("search")}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 ps-9 pe-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
          />
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/offers${qs({ s: s === "all" ? undefined : s })}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${status === s ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 text-white/60 hover:text-white"}`}
          >
            {t(`status.${s}`)} <span className="ms-1 text-xs opacity-60">{nf.format(countOf(s))}</span>
          </Link>
        ))}
        {pageInfo && (
          <Link href={`/admin/offers${qs({ page: undefined })}`} className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-sm text-amber-200">
            {pageInfo.title}
            <X className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
        {offers.length === 0 ? (
          <p className="py-16 text-center text-sm text-white/40">{t("empty")}</p>
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {offers.map((o) => (
              <li key={o.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                    {o.images[0] ? <img src={o.images[0]} alt="" className="h-full w-full object-contain p-1" /> : <ImageOff className="h-5 w-5 text-neutral-300" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{o.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/45">
                      <span className="inline-flex h-5 items-center rounded bg-white px-1">
                        <BrandLogo brand={o.brand ?? { name: o.storeName || "Store" }} size={13} />
                      </span>
                      <span>{t("by")} {o.landingPage.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusCls[o.status]}`}>{t(`status.${o.status}`)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex gap-4 text-end text-xs">
                    <span>
                      <span className="block text-sm tabular-nums text-white/75">{nf.format(o.views)}</span>
                      <span className="text-white/35">{t("views")}</span>
                    </span>
                    <span>
                      <span className="block text-sm font-semibold tabular-nums">{nf.format(o.clicks)}</span>
                      <span className="text-white/35">{t("clicks")}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <a href={`/${o.landingPage.slug}/${o.slug}`} target="_blank" rel="noopener" title={t("open")} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/55 hover:bg-white/5 hover:text-white">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <OfferModeration id={o.id} status={o.status} labels={labels} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pagesCount > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {pageNo > 1 && <Link href={`/admin/offers${qs({ p: pageNo - 1 })}`} className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/5">‹</Link>}
          <span className="text-white/50">{pageNo} / {pagesCount}</span>
          {pageNo < pagesCount && <Link href={`/admin/offers${qs({ p: pageNo + 1 })}`} className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/5">›</Link>}
        </div>
      )}
    </div>
  );
}
