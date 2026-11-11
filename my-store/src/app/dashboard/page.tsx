/* eslint-disable @next/next/no-img-element -- صور العروض روابط خارجية */
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Eye, MousePointerClick, Percent, Package, PlusCircle, Palette, Share2, CheckCircle2, Circle, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import CopyLink from "@/components/dashboard/CopyLink";
import DailyBars from "@/components/dashboard/DailyBars";

const DAYS = 30;

export default async function DashboardOverview({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const ctx = await getMarketerSession();
  const page = ctx!.landingPage!;
  const t = await getTranslations("dash");
  const locale = await getLocale();
  const { welcome } = await searchParams;

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (DAYS - 1));

  const [stats, offers, published] = await Promise.all([
    prisma.landingPageDailyStat.findMany({ where: { landingPageId: page.id, date: { gte: since } }, orderBy: { date: "asc" } }),
    prisma.offer.findMany({
      where: { landingPageId: page.id },
      include: { brand: { select: { name: true } } },
      orderBy: [{ clicks: "desc" }, { views: "desc" }],
    }),
    prisma.offer.count({ where: { landingPageId: page.id, status: "PUBLISHED" } }),
  ]);

  // ملء الأيام الفارغة بأصفار
  const byDay = new Map(stats.map((s) => [s.date.toISOString().slice(0, 10), s]));
  const series = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    const s = byDay.get(key);
    return { date: key, views: s?.views ?? 0, clicks: s?.clicks ?? 0 };
  });
  const views30 = series.reduce((a, s) => a + s.views, 0);
  const clicks30 = series.reduce((a, s) => a + s.clicks, 0);
  const ctr = views30 ? (clicks30 / views30) * 100 : 0;
  const nf = new Intl.NumberFormat(locale);

  const hasCustomized = !!(page.bio || page.avatarUrl || page.tagline);
  const checklist = [
    { done: offers.length > 0, label: t("overview.check.offer"), href: "/dashboard/offers/new", icon: PlusCircle },
    { done: hasCustomized, label: t("overview.check.design"), href: "/dashboard/page-settings", icon: Palette },
    { done: views30 > 0, label: t("overview.check.share"), href: `/${page.slug}`, icon: Share2 },
  ];
  const showChecklist = welcome === "1" || checklist.some((c) => !c.done);

  const tiles = [
    { label: t("overview.views30"), value: nf.format(views30), icon: Eye },
    { label: t("overview.clicks30"), value: nf.format(clicks30), icon: MousePointerClick },
    { label: t("overview.ctr"), value: `${ctr.toFixed(1)}%`, icon: Percent },
    { label: t("overview.published"), value: `${published} / ${offers.length}`, icon: Package },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{t("overview.title")}</h1>
          <p className="mt-1 text-white/55">{t("overview.subtitle")}</p>
        </div>
        <Link href="/dashboard/offers/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300">
          <PlusCircle className="h-4 w-4" />
          {t("nav.newOffer")}
        </Link>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-white/40">{t("overview.yourLink")}</p>
        <CopyLink path={`/${page.slug}`} />
      </div>

      {showChecklist && (
        <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.07] to-transparent p-6">
          <h2 className="font-serif text-xl font-semibold">{t("overview.checkTitle")}</h2>
          <p className="mt-1 text-sm text-white/55">{t("overview.checkSubtitle")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {checklist.map((c) => (
              <Link key={c.label} href={c.href} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3 text-sm hover:border-amber-400/40">
                {c.done ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Circle className="h-5 w-5 text-white/30" />}
                <span className={c.done ? "text-white/50 line-through" : ""}>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between text-white/45">
              <span className="text-xs">{tile.label}</span>
              <tile.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DailyBars title={t("overview.viewsChart")} total={nf.format(views30)} data={series.map((s) => ({ date: s.date, value: s.views }))} color="#E5B54A" locale={locale} emptyLabel={t("overview.noData")} />
        <DailyBars title={t("overview.clicksChart")} total={nf.format(clicks30)} data={series.map((s) => ({ date: s.date, value: s.clicks }))} color="#5AA9E6" locale={locale} emptyLabel={t("overview.noData")} />
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2 className="font-semibold">{t("overview.topOffers")}</h2>
          <Link href="/dashboard/offers" className="text-xs text-amber-300 hover:underline">{t("overview.allOffers")}</Link>
        </div>
        {offers.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-white/45">{t("offers.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-white/40">
                <tr>
                  <th className="px-5 py-3 text-start font-medium">{t("offers.col.offer")}</th>
                  <th className="px-5 py-3 text-end font-medium">{t("offers.col.views")}</th>
                  <th className="px-5 py-3 text-end font-medium">{t("offers.col.clicks")}</th>
                  <th className="px-5 py-3 text-end font-medium">{t("overview.ctr")}</th>
                </tr>
              </thead>
              <tbody>
                {offers.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-t border-white/[0.05]">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/offers/${o.id}`} className="flex items-center gap-3 hover:text-amber-300">
                        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white">
                          {o.images[0] && <img src={o.images[0]} alt="" className="h-full w-full object-contain p-1" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{o.title}</span>
                          <span className="text-xs text-white/40">{o.brand?.name || o.storeName}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-end tabular-nums text-white/70">{nf.format(o.views)}</td>
                    <td className="px-5 py-3 text-end tabular-nums text-white/70">{nf.format(o.clicks)}</td>
                    <td className="px-5 py-3 text-end tabular-nums text-white/70">{o.views ? ((o.clicks / o.views) * 100).toFixed(1) : "0.0"}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <a href={`/${page.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
        {t("nav.view")} <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}
