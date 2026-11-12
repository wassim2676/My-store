/* eslint-disable @next/next/no-img-element -- صور الغلاف والصورة الشخصية روابط خارجية يضيفها المسوّق */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPublicLandingPage } from "@/lib/public-page";
import { bumpDailyStat, isCountableRequest } from "@/lib/marketer";
import { parseDesign, parseSocials, publicT } from "@/lib/landing";
import LandingShell from "@/components/landing/LandingShell";
import OfferCard from "@/components/landing/OfferCard";
import OfferGallery from "@/components/landing/OfferGallery";
import SocialLinksRow from "@/components/landing/SocialLinksRow";
import ShareButton from "@/components/landing/ShareButton";

type Props = { params: Promise<{ slug: string }> };

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

export default async function LandingPageView({ params }: Props) {
  const { slug } = await params;
  const data = await getPublicLandingPage(slug);
  if (!data) notFound();

  const { page, offers, isOwner } = data;
  const lang = page.language;

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

  const featured = offers.filter((o) => o.isFeatured).slice(0, 3);
  const socials = parseSocials(page.socialLinks);
  const initials = page.title.trim().slice(0, 1).toUpperCase();

  return (
    <LandingShell page={page} isOwner={isOwner} hiddenNotice={!page.isPublished}>
      {/* 🌌 الواجهة */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          {page.coverUrl ? (
            <>
              <img src={page.coverUrl} alt="" className="h-full w-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[color-mix(in_srgb,var(--lp-bg)_70%,transparent)] to-[var(--lp-bg)]" />
            </>
          ) : (
            <div className="h-full w-full" />
          )}
        </div>

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-12 pt-16 text-center sm:pt-24">
          <div className="rounded-full p-[3px]" style={{ background: "linear-gradient(135deg, var(--lp-accent), transparent 70%)" }}>
            {page.avatarUrl ? (
              <img src={page.avatarUrl} alt={page.title} className="h-24 w-24 rounded-full border-4 border-[var(--lp-bg)] object-cover sm:h-28 sm:w-28" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[var(--lp-bg)] bg-[var(--lp-surface2)] font-serif text-4xl text-[var(--lp-accent)] sm:h-28 sm:w-28">
                {initials}
              </div>
            )}
          </div>

          <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">{page.title}</h1>
          {page.tagline && <p className="mt-3 text-base text-[var(--lp-accent)] sm:text-lg">{page.tagline}</p>}
          {page.bio && <p className="mt-4 max-w-xl whitespace-pre-line text-[15px] leading-relaxed text-[var(--lp-muted)]">{page.bio}</p>}

          <div className="mt-6 flex flex-col items-center gap-4">
            <SocialLinksRow links={socials} />
            <div className="flex items-center gap-3 text-xs text-[var(--lp-muted)]">
              <span>
                {offers.length} {publicT(lang, "offers")}
              </span>
              <span className="h-1 w-1 rounded-full bg-[var(--lp-muted)] opacity-50" />
              <ShareButton title={page.title} lang={lang} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4">
        {/* ⭐ العروض المميزة */}
        {featured.length > 0 && offers.length > featured.length && (
          <section className="mb-14">
            <h2 className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lp-accent)]">
              <span className="h-px w-8 bg-[var(--lp-accent)]" />
              {publicT(lang, "featured")}
            </h2>
            <div className={`grid gap-5 ${featured.length === 1 ? "md:grid-cols-1 max-w-md" : featured.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
              {featured.map((o) => (
                <OfferCard key={o.id} offer={o} pageSlug={page.slug} lang={lang} large />
              ))}
            </div>
          </section>
        )}

        <OfferGallery offers={offers} pageSlug={page.slug} lang={lang} columns={parseDesign(page.design).columns} />
      </main>
    </LandingShell>
  );
}
