import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, Eye, Globe, MousePointerClick, Package, Percent, Store, UserPlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DailyBars from "@/components/dashboard/DailyBars";
import BrandLogo from "@/components/shop/BrandLogo";

const DAYS = 30;

// ==================== 📊 لوحة الأدمن: صحة المنصة كاملة ====================
export default async function AdminOverview() {
  const t = await getTranslations("adm.overview");
  const locale = await getLocale();
  const nf = new Intl.NumberFormat(locale);

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (DAYS - 1));
  const week = new Date(since);
  week.setUTCDate(since.getUTCDate() + DAYS - 7);

  const [
    pagesTotal, pagesLive, offersByStatus, newUsers7, daily, signups, topPagesRaw, topOffers, recentPages, storeGroups, brands,
  ] = await Promise.all([
    prisma.landingPage.count(),
    prisma.landingPage.count({ where: { isPublished: true } }),
    prisma.offer.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.count({ where: { createdAt: { gte: week } } }),
    prisma.landingPageDailyStat.groupBy({ by: ["date"], where: { date: { gte: since } }, _sum: { views: true, clicks: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.landingPageDailyStat.groupBy({
      by: ["landingPageId"],
      where: { date: { gte: since } },
      _sum: { clicks: true, views: true },
      orderBy: { _sum: { clicks: "desc" } },
      take: 6,
    }),
    prisma.offer.findMany({
      where: { clicks: { gt: 0 } },
      orderBy: { clicks: "desc" },
      take: 6,
      select: { id: true, title: true, slug: true, clicks: true, views: true, storeName: true, brand: true, landingPage: { select: { slug: true, title: true } } },
    }),
    prisma.landingPage.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, slug: true, title: true, isPublished: true, createdAt: true, user: { select: { firstName: true, lastName: true, email: true } }, _count: { select: { offers: true } } },
    }),
    prisma.offer.groupBy({ by: ["brandId"], _count: { _all: true } }),
    prisma.brand.findMany({ select: { id: true, name: true, logoSvg: true, logoUrl: true, accentColor: true } }),
  ]);

  // سلاسل 30 يوماً (الأيام الفارغة = 0)
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const byDay = new Map(daily.map((d) => [dayKey(d.date), d._sum]));
  const signupsByDay = new Map<string, number>();
  for (const u of signups) signupsByDay.set(dayKey(u.createdAt), (signupsByDay.get(dayKey(u.createdAt)) ?? 0) + 1);
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    return dayKey(d);
  });
  const viewsSeries = days.map((date) => ({ date, value: byDay.get(date)?.views ?? 0 }));
  const clicksSeries = days.map((date) => ({ date, value: byDay.get(date)?.clicks ?? 0 }));
  const signupSeries = days.map((date) => ({ date, value: signupsByDay.get(date) ?? 0 }));
  const views30 = viewsSeries.reduce((a, s) => a + s.value, 0);
  const clicks30 = clicksSeries.reduce((a, s) => a + s.value, 0);
  const ctr = views30 ? (clicks30 / views30) * 100 : 0;

  const offerCount = (s: string) => offersByStatus.find((o) => o.status === s)?._count._all ?? 0;
  const offersLive = offerCount("PUBLISHED");
  const offersTotal = offersByStatus.reduce((a, o) => a + o._count._all, 0);

  // أفضل الصفحات (30 يوماً)
  const topPageInfo = await prisma.landingPage.findMany({
    where: { id: { in: topPagesRaw.map((p) => p.landingPageId) } },
    select: { id: true, slug: true, title: true },
  });
  const topPages = topPagesRaw
    .map((p) => ({ ...topPageInfo.find((i) => i.id === p.landingPageId), clicks: p._sum.clicks ?? 0, views: p._sum.views ?? 0 }))
    .filter((p) => p.slug);

  // توزيع العروض حسب المتجر
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const stores = storeGroups
    .map((g) => ({ brand: g.brandId ? brandMap.get(g.brandId) ?? null : null, count: g._count._all }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const storeMax = Math.max(1, ...stores.map((s) => s.count));

  const tiles = [
    { label: t("marketers"), value: nf.format(pagesTotal), sub: t("liveOf", { live: nf.format(pagesLive) }), icon: Store, href: "/admin/marketers" },
    { label: t("offers"), value: nf.format(offersTotal), sub: t("liveOf", { live: nf.format(offersLive) }), icon: Package, href: "/admin/offers" },
    { label: t("views30"), value: nf.format(views30), icon: Eye },
    { label: t("clicks30"), value: nf.format(clicks30), icon: MousePointerClick },
    { label: t("ctr"), value: `${ctr.toFixed(1)}%`, icon: Percent },
    { label: t("newUsers7"), value: nf.format(newUsers7), icon: UserPlus, href: "/admin/users" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-white/55">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map((tile) => {
          const body = (
            <>
              <tile.icon className="h-4.5 w-4.5 text-sky-300" />
              <p className="mt-4 text-2xl font-semibold tabular-nums">{tile.value}</p>
              <p className="mt-1 text-xs text-white/50">{tile.label}</p>
              {tile.sub && <p className="mt-0.5 text-[11px] text-white/35">{tile.sub}</p>}
            </>
          );
          return tile.href ? (
            <Link key={tile.label} href={tile.href} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-sky-400/30">
              {body}
            </Link>
          ) : (
            <div key={tile.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              {body}
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DailyBars title={t("viewsChart")} total={nf.format(views30)} data={viewsSeries} color="#E5B54A" locale={locale} emptyLabel={t("noData")} />
        <DailyBars title={t("clicksChart")} total={nf.format(clicks30)} data={clicksSeries} color="#5AA9E6" locale={locale} emptyLabel={t("noData")} />
        <DailyBars title={t("signupsChart")} total={nf.format(signups.length)} data={signupSeries} color="#34D399" locale={locale} emptyLabel={t("noData")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 🏆 أفضل الصفحات */}
        <Panel title={t("topPages")} href="/admin/marketers" more={t("viewAll")}>
          {topPages.length === 0 ? (
            <Empty text={t("noData")} />
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {topPages.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <span className="w-5 text-center text-xs text-white/35">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <a href={`/${p.slug}`} target="_blank" rel="noopener" className="text-xs text-white/40 hover:text-sky-300" dir="ltr">
                      /{p.slug}
                    </a>
                  </div>
                  <Metric label={t("views")} value={nf.format(p.views)} />
                  <Metric label={t("clicks")} value={nf.format(p.clicks)} strong />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* 💎 أفضل العروض */}
        <Panel title={t("topOffers")} href="/admin/offers" more={t("viewAll")}>
          {topOffers.length === 0 ? (
            <Empty text={t("noData")} />
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {topOffers.map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-8 w-14 shrink-0 items-center justify-center rounded-md bg-white px-1">
                    <BrandLogo brand={o.brand ?? { name: o.storeName || "Store" }} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <a href={`/${o.landingPage.slug}/${o.slug}`} target="_blank" rel="noopener" className="block truncate text-sm font-medium hover:text-sky-300">
                      {o.title}
                    </a>
                    <p className="truncate text-xs text-white/40">{o.landingPage.title}</p>
                  </div>
                  <Metric label={t("clicks")} value={nf.format(o.clicks)} strong />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* 🆕 أحدث المسوّقين */}
        <Panel title={t("recent")} href="/admin/marketers" more={t("viewAll")}>
          {recentPages.length === 0 ? (
            <Empty text={t("noData")} />
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {recentPages.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/10 font-serif text-amber-300">
                    {p.title.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {p.title}
                      {!p.isPublished && <span className="ms-2 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300">{t("hidden")}</span>}
                    </p>
                    <p className="truncate text-xs text-white/40">
                      {[p.user.firstName, p.user.lastName].filter(Boolean).join(" ") || p.user.email} · {p._count.offers} {t("offersShort")}
                    </p>
                  </div>
                  <span className="text-xs text-white/35">{new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(p.createdAt)}</span>
                  <a href={`/${p.slug}`} target="_blank" rel="noopener" className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white" aria-label="open">
                    <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* 🏬 العروض حسب المتجر */}
        <Panel title={t("byStore")} href="/admin/brands" more={t("manageStores")}>
          {stores.length === 0 ? (
            <Empty text={t("noData")} />
          ) : (
            <ul className="space-y-3 pt-1">
              {stores.map((s, i) => (
                <li key={s.brand?.id ?? `other-${i}`} className="flex items-center gap-3">
                  <span className="w-28 truncate text-sm text-white/75">{s.brand?.name ?? t("otherStores")}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <div className="h-full rounded-full bg-sky-400/80" style={{ width: `${(s.count / storeMax) * 100}%` }} />
                  </div>
                  <span className="w-10 text-end text-sm tabular-nums text-white/60">{nf.format(s.count)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <p className="flex items-center gap-2 text-xs text-white/35">
        <Globe className="h-3.5 w-3.5" />
        {t("footnote")}
      </p>
    </div>
  );
}

function Panel({ title, href, more, children }: { title: string; href: string; more: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link href={href} className="text-xs text-sky-300 hover:text-sky-200">
          {more}
        </Link>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="w-16 text-end">
      <p className={`text-sm tabular-nums ${strong ? "font-semibold text-white" : "text-white/70"}`}>{value}</p>
      <p className="text-[10px] text-white/35">{label}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-white/35">{text}</p>;
}
