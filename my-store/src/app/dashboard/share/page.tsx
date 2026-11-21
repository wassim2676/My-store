import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { parseIntegrations } from "@/lib/integrations";
import { pageAbsoluteUrl } from "@/lib/page-urls";
import ShareKit, { type ShareTarget } from "@/components/dashboard/ShareKit";
import PixelsForm from "@/components/dashboard/PixelsForm";

// ==================== 📤 المشاركة والبكسلات ====================
export default async function SharePage() {
  const ctx = await getMarketerSession();
  const page = ctx!.landingPage!;
  const t = await getTranslations("dash.share");

  const [offers, articles] = await Promise.all([
    prisma.offer.findMany({
      where: { landingPageId: page.id, status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { position: "asc" }, { createdAt: "desc" }],
      select: { id: true, slug: true, title: true, shortReview: true },
      take: 200,
    }),
    prisma.article.findMany({
      where: { landingPageId: page.id, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { id: true, slug: true, title: true, excerpt: true, seoDescription: true },
      take: 100,
    }),
  ]);

  const targets: ShareTarget[] = [
    {
      key: "home",
      group: "page",
      label: t("homePage"),
      path: "",
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.tagline || page.bio?.slice(0, 160) || "",
    },
    ...offers.map((o) => ({ key: o.id, group: "offer" as const, label: o.title, path: `/${o.slug}`, title: `${o.title} — ${page.title}`, description: o.shortReview.slice(0, 170) })),
    ...articles.map((a) => ({
      key: a.id,
      group: "article" as const,
      label: a.title,
      path: `/articles/${a.slug}`,
      title: a.title,
      description: a.seoDescription || a.excerpt || "",
    })),
  ];

  // الرابط العام: الدومين الخاص إن كان فعّالاً، وإلا رابط المنصة
  const baseUrl = pageAbsoluteUrl(page).replace(/\/$/, "");

  return (
    <div className="w-full">
      <div className="mb-8 border-b border-white/[0.06] pb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{t("title")}</h1>
        <p className="mt-1 text-sm text-white/50">{t("subtitle")}</p>
      </div>
      <ShareKit baseUrl={baseUrl} ogBase={`/${page.slug}`} targets={targets} />
      <div className="mt-6">
        <PixelsForm initial={parseIntegrations(page.integrations).pixels} />
      </div>
    </div>
  );
}
