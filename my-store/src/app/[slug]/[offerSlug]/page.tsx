import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { after } from "next/server";
import { ArrowLeft, Check, Minus, Clock, Sparkles, PlayCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPublicLandingPage } from "@/lib/public-page";
import { bumpDailyStat, isCountableRequest } from "@/lib/marketer";
import { discountPercent, formatPrice, publicT, resolveStore, toEmbedUrl } from "@/lib/landing";
import LandingShell from "@/components/landing/LandingShell";
import OfferImages from "@/components/landing/OfferImages";
import OfferCard from "@/components/landing/OfferCard";
import CouponCopy from "@/components/landing/CouponCopy";
import { LandingNavbar } from "@/components/landing/Storefront";
import BuyButton from "@/components/landing/BuyButton";
import Stars from "@/components/landing/Stars";
import BrandLogo from "@/components/shop/BrandLogo";

type Props = { params: Promise<{ slug: string; offerSlug: string }> };

async function load(slug: string, offerSlug: string) {
  const data = await getPublicLandingPage(slug);
  if (!data) return null;
  const offer = data.offers.find((o) => o.slug === offerSlug.toLowerCase());
  if (!offer) return null;
  return { ...data, offer };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, offerSlug } = await params;
  const data = await load(slug, offerSlug);
  if (!data) return { title: "Not found" };
  const { offer, page } = data;
  return {
    title: `${offer.title} — ${page.title}`,
    description: offer.shortReview.slice(0, 170),
    alternates: { canonical: `/${page.slug}/${offer.slug}` },
    robots: offer.status === "PUBLISHED" && page.isPublished ? undefined : { index: false, follow: false },
    openGraph: { title: offer.title, description: offer.shortReview.slice(0, 200), images: offer.images.slice(0, 1), type: "article" },
    twitter: { card: "summary_large_image", title: offer.title, description: offer.shortReview.slice(0, 200), images: offer.images.slice(0, 1) },
  };
}

export default async function OfferPage({ params }: Props) {
  const { slug, offerSlug } = await params;
  const data = await load(slug, offerSlug);
  if (!data) notFound();

  const { page, offer, offers, isOwner } = data;
  const lang = page.language;
  const store = resolveStore(offer.brand, offer.storeName);

  const h = await headers();
  if (!isOwner && isCountableRequest(h)) {
    after(async () => {
      try {
        await Promise.all([
          prisma.offer.update({ where: { id: offer.id }, data: { views: { increment: 1 } } }),
          bumpDailyStat(page.id, "views"),
        ]);
      } catch (err) {
        console.error("[OFFER_VIEW_TRACK_ERROR]", err);
      }
    });
  }

  const discount = discountPercent(offer.price, offer.compareAt);
  const price = formatPrice(offer.price, offer.currency, lang);
  const compareAt = discount ? formatPrice(offer.compareAt, offer.currency, lang) : null;
  const dealEnds = offer.dealEndsAt && new Date(offer.dealEndsAt) > new Date()
    ? new Intl.DateTimeFormat(lang === "ar" ? "ar" : lang, { dateStyle: "medium" }).format(new Date(offer.dealEndsAt))
    : null;
  const embed = toEmbedUrl(offer.videoUrl);
  const more = offers.filter((o) => o.id !== offer.id && o.status === "PUBLISHED").slice(0, 4);

  // 🔍 بيانات منظّمة لمحركات البحث (مراجعة منتج)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: offer.title,
    image: offer.images,
    description: offer.shortReview,
    ...(offer.rating
      ? {
          review: {
            "@type": "Review",
            reviewRating: { "@type": "Rating", ratingValue: offer.rating, bestRating: 5 },
            author: { "@type": "Person", name: page.title },
            reviewBody: offer.shortReview,
          },
        }
      : {}),
    ...(offer.price != null
      ? { offers: { "@type": "Offer", price: offer.price, priceCurrency: offer.currency, url: offer.affiliateUrl } }
      : {}),
  };

  return (
    <LandingShell page={page} isOwner={isOwner} hiddenNotice={!page.isPublished || offer.status !== "PUBLISHED"}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <LandingNavbar
        mode="link"
        page={{ slug: page.slug, title: page.title, avatarUrl: page.avatarUrl, language: page.language }}
        categories={Array.from(new Set(offers.map((o) => o.category).filter((c): c is string => !!c)))}
      />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href={`/${page.slug}`} className="inline-flex items-center gap-2 text-sm text-[var(--lp-muted)] hover:text-[var(--lp-text)]">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {publicT(lang, "backTo", { name: page.title })}
          </Link>
        </div>

        {/* 🛍️ رأس العرض */}
        <section className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
          <OfferImages images={offer.images} alt={offer.title} />

          <div className="flex flex-col gap-5 md:pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {offer.badge && (
                <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--lp-accent-fg)]" style={{ background: "var(--lp-accent)" }}>
                  {offer.badge}
                </span>
              )}
              {offer.category && (
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lp-accent)]">{offer.category}</span>
              )}
            </div>

            <div>
              <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">{offer.title}</h1>
              {offer.subtitle && <p className="mt-2 text-[var(--lp-muted)]">{offer.subtitle}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <span className="flex h-11 items-center rounded-xl border border-[var(--lp-border)] bg-white px-3 text-neutral-900" title={store.name}>
                <BrandLogo brand={store} size={22} fallback="name" />
              </span>
              {offer.rating != null && offer.rating > 0 && (
                <span className="flex items-center gap-2">
                  <Stars value={offer.rating} size={16} />
                  <span className="text-sm font-semibold">{offer.rating.toFixed(1)}</span>
                  <span className="text-xs text-[var(--lp-muted)]">/ 5</span>
                </span>
              )}
            </div>

            <p className="text-[15.5px] leading-relaxed text-[var(--lp-muted)]">{offer.shortReview}</p>

            <div className="rounded-3xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-5 space-y-4">
              {price && (
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-bold">{price}</span>
                  {compareAt && <span className="text-base text-[var(--lp-muted)] line-through">{compareAt}</span>}
                  {discount > 0 && (
                    <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-black text-white">
                      -{discount}% {publicT(lang, "off")}
                    </span>
                  )}
                </div>
              )}
              {dealEnds && (
                <p className="flex items-center gap-2 text-sm text-amber-500">
                  <Clock className="h-4 w-4" />
                  {publicT(lang, "endsOn", { date: dealEnds })}
                </p>
              )}
              {offer.couponCode && <CouponCopy code={offer.couponCode} lang={lang} />}
              <BuyButton offerId={offer.id} store={store} label={offer.buttonLabel} lang={lang} fallbackColor={page.accentColor} />
              <p className="text-center text-[11.5px] text-[var(--lp-muted)]">{publicT(lang, "priceNote", { store: store.name })}</p>
            </div>
          </div>
        </section>

        {/* ✨ المميزات */}
        {offer.highlights.length > 0 && (
          <section className="mt-16">
            <SectionTitle>{publicT(lang, "highlights")}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {offer.highlights.map((hl, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-4">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lp-accent)]" />
                  <span className="text-[15px]">{hl}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 👍👎 الإيجابيات والسلبيات */}
        {(offer.pros.length > 0 || offer.cons.length > 0) && (
          <section className="mt-12 grid gap-4 md:grid-cols-2">
            {offer.pros.length > 0 && (
              <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/[0.06] p-6">
                <h3 className="mb-4 font-serif text-xl font-semibold text-emerald-500">{publicT(lang, "pros")}</h3>
                <ul className="space-y-3">
                  {offer.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {offer.cons.length > 0 && (
              <div className="rounded-3xl border border-rose-500/25 bg-rose-500/[0.05] p-6">
                <h3 className="mb-4 font-serif text-xl font-semibold text-rose-500">{publicT(lang, "cons")}</h3>
                <ul className="space-y-3">
                  {offer.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/15">
                        <Minus className="h-3.5 w-3.5 text-rose-500" />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* 📖 المراجعة الكاملة */}
        {offer.review && (
          <section className="mt-16 max-w-3xl">
            <SectionTitle>{publicT(lang, "fullReview")}</SectionTitle>
            <div className="space-y-4 text-[16px] leading-[1.85] text-[var(--lp-text)] opacity-90">
              {offer.review.split(/\n{2,}/).map((para, i) => (
                <p key={i} className="whitespace-pre-line">{para}</p>
              ))}
            </div>
          </section>
        )}

        {/* 🎬 فيديو */}
        {embed && (
          <section className="mt-16">
            <SectionTitle>
              <PlayCircle className="h-4 w-4" />
              {publicT(lang, "video")}
            </SectionTitle>
            <div className="aspect-video overflow-hidden rounded-3xl border border-[var(--lp-border)] bg-black">
              <iframe
                src={embed}
                title={offer.title}
                className="h-full w-full"
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* 📋 المواصفات */}
        {offer.specs.length > 0 && (
          <section className="mt-16 max-w-3xl">
            <SectionTitle>{publicT(lang, "specs")}</SectionTitle>
            <dl className="overflow-hidden rounded-3xl border border-[var(--lp-border)]">
              {offer.specs.map((s, i) => (
                <div key={i} className={`grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-5 py-3.5 text-sm ${i % 2 ? "bg-[var(--lp-surface)]" : "bg-[var(--lp-surface2)]"}`}>
                  <dt className="text-[var(--lp-muted)]">{s.label}</dt>
                  <dd className="font-medium">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* 🏁 الخلاصة */}
        <section className="mt-16 overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--lp-accent)_35%,transparent)] bg-[radial-gradient(ellipse_80%_100%_at_0%_0%,color-mix(in_srgb,var(--lp-accent)_14%,transparent),transparent_70%)] p-6 sm:p-10">
          <div className="grid items-center gap-8 md:grid-cols-[auto_1fr_minmax(0,320px)]">
            {offer.rating != null && offer.rating > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lp-muted)]">{publicT(lang, "ourScore")}</span>
                <span className="font-serif text-6xl font-semibold text-[var(--lp-accent)]">{offer.rating.toFixed(1)}</span>
                <Stars value={offer.rating} size={14} />
              </div>
            )}
            <div>
              <h2 className="font-serif text-2xl font-semibold">{publicT(lang, "verdict")}</h2>
              <p className="mt-2 leading-relaxed text-[var(--lp-muted)]">{offer.verdict || offer.shortReview}</p>
            </div>
            <BuyButton offerId={offer.id} store={store} label={offer.buttonLabel} lang={lang} fallbackColor={page.accentColor} size="md" />
          </div>
        </section>

        {/* 🔁 المزيد */}
        {more.length > 0 && (
          <section className="mt-20">
            <SectionTitle>{publicT(lang, "moreFrom", { name: page.title })}</SectionTitle>
            <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {more.map((o) => (
                <OfferCard key={o.id} offer={o} pageSlug={page.slug} lang={lang} />
              ))}
            </div>
          </section>
        )}
      </div>
    </LandingShell>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lp-accent)]">
      <span className="h-px w-8 bg-[var(--lp-accent)]" />
      {children}
    </h2>
  );
}
