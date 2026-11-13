import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPublicLandingPage } from "@/lib/public-page";
import { bumpDailyStat, isCountableRequest } from "@/lib/marketer";
import { parseDesign, parseSocials } from "@/lib/landing";
import LandingShell from "@/components/landing/LandingShell";
import Storefront from "@/components/landing/Storefront";

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<{ q?: string; c?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicLandingPage(slug);
  if (!data) return { title: "Not found" };
  const { page, offers } = data;
  const description = page.seoDescription || page.tagline || page.bio?.slice(0, 160) || undefined;
  const image = page.coverUrl || page.avatarUrl || offers[0]?.images[0];
  return {
    title: page.seoTitle || page.title,
    description,
    alternates: { canonical: `/${page.slug}` },
    robots: page.isPublished ? undefined : { index: false, follow: false },
    openGraph: { title: page.seoTitle || page.title, description, images: image ? [image] : undefined, type: "website" },
    twitter: { card: "summary_large_image", title: page.seoTitle || page.title, description, images: image ? [image] : undefined },
  };
}

export default async function LandingPageView({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const data = await getPublicLandingPage(slug);
  if (!data) notFound();

  const { page, offers, isOwner } = data;

  // 📊 زيارة (لا تُحتسب زيارات المالك أو الروبوتات)
  const h = await headers();
  if (!isOwner && isCountableRequest(h)) {
    after(async () => {
      try {
        await Promise.all([
          prisma.landingPage.update({ where: { id: page.id }, data: { views: { increment: 1 } } }),
          bumpDailyStat(page.id, "views"),
        ]);
      } catch (err) {
        console.error("[LANDING_VIEW_TRACK_ERROR]", err);
      }
    });
  }

  return (
    <LandingShell page={page} isOwner={isOwner} hiddenNotice={!page.isPublished}>
      <Storefront
        page={{
          slug: page.slug,
          title: page.title,
          tagline: page.tagline,
          bio: page.bio,
          avatarUrl: page.avatarUrl,
          coverUrl: page.coverUrl,
          language: page.language,
        }}
        offers={offers}
        socials={parseSocials(page.socialLinks)}
        columns={parseDesign(page.design).columns}
        initialQuery={typeof sp.q === "string" ? sp.q.slice(0, 100) : ""}
        initialCategory={typeof sp.c === "string" ? sp.c.slice(0, 80) : null}
      />
    </LandingShell>
  );
}
