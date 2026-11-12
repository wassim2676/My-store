import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { getLocale, getTranslations } from "next-intl/server";
import { ExternalLink, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AdminSwitch from "@/components/admin/AdminSwitch";

export const dynamic = "force-dynamic";

const FILTERS = ["all", "live", "hidden", "suspended"] as const;
type Filter = (typeof FILTERS)[number];
const PAGE_SIZE = 50;

// ==================== 👥 الأدمن: المسوّقون وصفحاتهم ====================
export default async function AdminMarketersPage({ searchParams }: { searchParams: Promise<{ q?: string; f?: string; p?: string }> }) {
  const t = await getTranslations("adm.marketers");
  const locale = await getLocale();
  const nf = new Intl.NumberFormat(locale);
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const filter: Filter = (FILTERS as readonly string[]).includes(sp.f ?? "") ? (sp.f as Filter) : "all";
  const pageNo = Math.max(1, Number(sp.p) || 1);

  const where: Prisma.LandingPageWhereInput = {
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { slug: { contains: q.toLowerCase() } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { firstName: { contains: q, mode: "insensitive" } } },
        { user: { lastName: { contains: q, mode: "insensitive" } } },
      ],
    }),
    ...(filter === "live" && { isPublished: true, user: { isActive: true } }),
    ...(filter === "hidden" && { isPublished: false }),
    ...(filter === "suspended" && { user: { isActive: false } }),
  };

  const [total, counts, pages] = await Promise.all([
    prisma.landingPage.count({ where }),
    Promise.all([
      prisma.landingPage.count(),
      prisma.landingPage.count({ where: { isPublished: true, user: { isActive: true } } }),
      prisma.landingPage.count({ where: { isPublished: false } }),
      prisma.landingPage.count({ where: { user: { isActive: false } } }),
    ]),
    prisma.landingPage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageNo - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, slug: true, title: true, isPublished: true, views: true, createdAt: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true } },
        _count: { select: { offers: true } },
      },
    }),
  ]);
  const clicks = await prisma.offer.groupBy({
    by: ["landingPageId"],
    where: { landingPageId: { in: pages.map((p) => p.id) } },
    _sum: { clicks: true },
  });
  const clicksOf = new Map(clicks.map((c) => [c.landingPageId, c._sum.clicks ?? 0]));
  const pagesCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const df = new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" });

  const qs = (over: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q, f: filter === "all" ? undefined : filter, p: undefined, ...over } as Record<string, string | number | undefined>;
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "" && !(k === "p" && v === 1)) p.set(k, String(v));
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{t("title")}</h1>
          <p className="mt-1 text-white/55">{t("subtitle", { count: nf.format(counts[0]) })}</p>
        </div>
        <form className="relative w-full sm:w-80" action="/admin/marketers">
          {filter !== "all" && <input type="hidden" name="f" value={filter} />}
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            name="q"
            defaultValue={q}
            placeholder={t("search")}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 ps-9 pe-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
          />
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f, i) => (
          <Link
            key={f}
            href={`/admin/marketers${qs({ f: f === "all" ? undefined : f })}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${filter === f ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 text-white/60 hover:text-white"}`}
          >
            {t(`filters.${f}`)} <span className="ms-1 text-xs opacity-60">{nf.format(counts[i])}</span>
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
        {pages.length === 0 ? (
          <p className="py-16 text-center text-sm text-white/40">{t("empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-start text-xs uppercase tracking-wider text-white/40">
                  <th className="px-5 py-3 text-start font-medium">{t("col.page")}</th>
                  <th className="px-3 py-3 text-start font-medium">{t("col.marketer")}</th>
                  <th className="px-3 py-3 text-end font-medium">{t("col.offers")}</th>
                  <th className="px-3 py-3 text-end font-medium">{t("col.views")}</th>
                  <th className="px-3 py-3 text-end font-medium">{t("col.clicks")}</th>
                  <th className="px-3 py-3 text-start font-medium">{t("col.joined")}</th>
                  <th className="px-3 py-3 text-center font-medium">{t("col.public")}</th>
                  <th className="px-3 py-3 text-center font-medium">{t("col.account")}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {pages.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-white/40" dir="ltr">/{p.slug}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p>{[p.user.firstName, p.user.lastName].filter(Boolean).join(" ") || "—"}</p>
                      <p className="text-xs text-white/40">{p.user.email}</p>
                    </td>
                    <td className="px-3 py-3 text-end tabular-nums">{nf.format(p._count.offers)}</td>
                    <td className="px-3 py-3 text-end tabular-nums text-white/70">{nf.format(p.views)}</td>
                    <td className="px-3 py-3 text-end font-semibold tabular-nums">{nf.format(clicksOf.get(p.id) ?? 0)}</td>
                    <td className="px-3 py-3 text-white/55">{df.format(p.createdAt)}</td>
                    <td className="px-3 py-3 text-center">
                      <AdminSwitch url={`/api/admin/landing-pages/${p.id}`} field="isPublished" initial={p.isPublished} label={t("col.public")} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <AdminSwitch url={`/api/admin/users/${p.user.id}`} method="PUT" field="isActive" initial={p.user.isActive} label={t("col.account")} tone="sky" />
                    </td>
                    <td className="px-5 py-3 text-end">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/offers?page=${p.id}`} className="rounded-lg px-2.5 py-1.5 text-xs text-sky-300 hover:bg-sky-400/10">
                          {t("viewOffers")}
                        </Link>
                        <a href={`/${p.slug}`} target="_blank" rel="noopener" className="rounded-lg p-1.5 text-white/50 hover:bg-white/5 hover:text-white" aria-label="open">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagesCount > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {pageNo > 1 && <Link href={`/admin/marketers${qs({ p: pageNo - 1 })}`} className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/5">‹</Link>}
          <span className="text-white/50">{pageNo} / {pagesCount}</span>
          {pageNo < pagesCount && <Link href={`/admin/marketers${qs({ p: pageNo + 1 })}`} className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/5">›</Link>}
        </div>
      )}
      <p className="text-xs text-white/35">{t("note")}</p>
    </div>
  );
}
