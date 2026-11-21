/* eslint-disable @next/next/no-img-element -- عناصر صور داخل مولّد Open Graph (Satori) وليست صفحة */
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { bestTextOn, discountPercent, ensureContrast, formatPrice, isHexColor, parseDesign, publicT, resolveStore, resolveTokens } from "@/lib/landing";
import { PLATFORM_APEX } from "@/lib/domains";
import { SITE_NAME } from "@/lib/site";
import { clip, hasArabic, hexToRgba, loadImage, OG_SIZE, ogFonts, sans, serif } from "@/lib/og";

// ==================== 🎴 تصاميم صور المعاينة لصفحات المسوّقين ====================
// نقرأ من القاعدة مباشرة (بدون جلسة) حتى تُخزَّن الصورة مؤقتاً وتُقدَّم بسرعة لزواحف المنصات.

async function loadPage(slug: string) {
  const page = await prisma.landingPage.findUnique({
    where: { slug: slug.toLowerCase() },
    select: {
      id: true, slug: true, title: true, tagline: true, avatarUrl: true, coverUrl: true, language: true, theme: true,
      accentColor: true, design: true, isPublished: true, customDomain: true, customDomainVerifiedAt: true,
      user: { select: { isActive: true } },
    },
  });
  if (!page || !page.isPublished || !page.user.isActive) return null;
  const tokens = resolveTokens(page.theme, parseDesign(page.design));
  const base = isHexColor(page.accentColor) ? page.accentColor : "#C8A24A";
  // لون التمييز مضبوط ليبقى ظاهراً على خلفية الصفحة (لون فاتح على ثيم فاتح لا يختفي)
  const accent = ensureContrast(base, [tokens.bg], 2.6);
  const onAccent = bestTextOn(accent);
  const domain = page.customDomain && page.customDomainVerifiedAt ? page.customDomain : `${PLATFORM_APEX}/${page.slug}`;
  return { page, tokens, accent, onAccent, domain };
}
type Loaded = NonNullable<Awaited<ReturnType<typeof loadPage>>>;

const cache = { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" } };

async function render(node: React.ReactElement, arabic: boolean) {
  return new ImageResponse(node, { ...OG_SIZE, fonts: await ogFonts(arabic), ...cache });
}

// -------------------- 🧩 عناصر مشتركة --------------------
function Avatar({ ctx, src, size }: { ctx: Loaded; src: string | null; size: number }) {
  const { page, accent } = ctx;
  return src ? (
    <img alt="" src={src} width={size} height={size} style={{ width: size, height: size, borderRadius: size, objectFit: "cover", border: `3px solid ${accent}` }} />
  ) : (
    <div
      style={{
        width: size, height: size, borderRadius: size, background: accent, color: ctx.onAccent, display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: size * 0.46, fontWeight: 700,
      }}
    >
      {page.title.trim().slice(0, 1).toUpperCase()}
    </div>
  );
}

function Stars({ rating, color, muted }: { rating: number; color: string; muted: string }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="30" height="30" viewBox="0 0 24 24">
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill={i < Math.round(rating) ? color : muted} />
        </svg>
      ))}
    </div>
  );
}

function Background({ ctx }: { ctx: Loaded }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0, display: "flex",
        backgroundImage: `radial-gradient(circle at 85% 0%, ${hexToRgba(ctx.accent, ctx.tokens.isDark ? 0.22 : 0.16)}, transparent 55%)`,
      }}
    />
  );
}

function Footer({ ctx, cta, arabic }: { ctx: Loaded; cta?: string; arabic: boolean }) {
  const { tokens, accent, domain } = ctx;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: arabic ? "row-reverse" : "row", width: "100%", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, color: tokens.muted, fontFamily: "Inter", whiteSpace: "nowrap", overflow: "hidden", minWidth: 0, flexShrink: 1 }}>
        <div style={{ width: 10, height: 10, borderRadius: 10, background: accent }} />
        {cta ? domain.split("/")[0] : clip(domain, 44)}
      </div>
      {cta && (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "14px 26px", borderRadius: 999, background: accent, whiteSpace: "nowrap", flexShrink: 0,
            color: ctx.onAccent, fontSize: 24, fontWeight: 700, fontFamily: sans(arabic),
          }}
        >
          {cta} {arabic ? "←" : "→"}
        </div>
      )}
    </div>
  );
}

// ==================== 🛍️ صورة العرض ====================
export async function offerImage(slug: string, offerSlug: string) {
  const ctx = await loadPage(slug);
  if (!ctx) return fallbackImage();
  const offer = await prisma.offer.findFirst({
    where: { landingPageId: ctx.page.id, slug: offerSlug.toLowerCase(), status: "PUBLISHED" },
    include: { brand: true },
  });
  if (!offer) return pageImage(slug);

  const { page, tokens, accent } = ctx;
  const lang = page.language;
  const price = offer.price != null ? Number(offer.price) : null;
  const compareAt = offer.compareAt != null ? Number(offer.compareAt) : null;
  const discount = discountPercent(price, compareAt);
  const store = resolveStore(offer.brand, offer.storeName, offer.storeLogo);
  const arabic = lang === "ar" || hasArabic(offer.title, page.title);
  const [img, avatar] = await Promise.all([loadImage(offer.images[0], 900), loadImage(page.avatarUrl, 160)]);
  const dir = arabic ? "row-reverse" : "row";
  const align = arabic ? "flex-end" : "flex-start";

  return render(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: tokens.bg, color: tokens.text, fontFamily: sans(arabic) }}>
      <Background ctx={ctx} />
      <div style={{ display: "flex", flexDirection: dir, width: "100%", height: "100%", padding: 48, gap: 52 }}>
        {/* صورة المنتج */}
        <div style={{ width: 534, height: 534, borderRadius: 36, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0, boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}>
          {img ? (
            <img alt="" src={img} style={{ width: 454, height: 454, objectFit: "contain" }} />
          ) : (
            <div style={{ width: 300, height: 300, borderRadius: 32, background: "#EDEDED", display: "flex" }} />
          )}
          {discount > 0 && (
            <div style={{ position: "absolute", top: 24, left: 24, display: "flex", padding: "10px 20px", borderRadius: 999, background: "#E11D48", color: "#FFFFFF", fontSize: 30, fontWeight: 800, fontFamily: "Inter" }}>
              -{discount}%
            </div>
          )}
          {offer.badge && (
            <div style={{ position: "absolute", top: 24, right: 24, display: "flex", padding: "10px 18px", borderRadius: 999, background: accent, color: ctx.onAccent, fontSize: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
              {clip(offer.badge, 18)}
            </div>
          )}
        </div>

        {/* التفاصيل */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, alignItems: align, minWidth: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: align, gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexDirection: dir }}>
              <Avatar ctx={ctx} src={avatar} size={52} />
              <div style={{ fontSize: 26, color: tokens.muted, fontWeight: 500 }}>{clip(page.title, 30)}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 999, border: `2px solid ${hexToRgba(accent, 0.5)}`, color: accent, fontSize: 22, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, fontFamily: "Inter" }}>
              {clip(store.name, 22)}
            </div>
            <div style={{ fontSize: offer.title.length > 48 ? 42 : 50, fontWeight: 800, lineHeight: 1.14, letterSpacing: -1, textAlign: arabic ? "right" : "left", display: "flex" }}>
              {clip(offer.title, 72)}
            </div>
            {offer.rating ? <Stars rating={offer.rating} color={accent} muted={hexToRgba(tokens.text, 0.18)} /> : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: align, gap: 20, width: "100%" }}>
            {price != null && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 18, flexDirection: dir, fontFamily: "Inter" }}>
                <div style={{ fontSize: 62, fontWeight: 800, letterSpacing: -2 }}>{formatPrice(price, offer.currency, "en")}</div>
                {discount > 0 && compareAt != null && (
                  <div style={{ fontSize: 34, color: tokens.muted, textDecoration: "line-through" }}>{formatPrice(compareAt, offer.currency, "en")}</div>
                )}
              </div>
            )}
            <Footer ctx={ctx} cta={publicT(lang, "viewReview")} arabic={arabic} />
          </div>
        </div>
      </div>
    </div>,
    arabic,
  );
}

// ==================== 🏬 صورة صفحة المسوّق ====================
export async function pageImage(slug: string) {
  const ctx = await loadPage(slug);
  if (!ctx) return fallbackImage();
  const { page, tokens, accent } = ctx;
  const lang = page.language;
  const offers = await prisma.offer.findMany({
    where: { landingPageId: page.id, status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { position: "asc" }, { createdAt: "desc" }],
    select: { images: true },
    take: 6,
  });
  const count = await prisma.offer.count({ where: { landingPageId: page.id, status: "PUBLISHED" } });
  const arabic = lang === "ar" || hasArabic(page.title, page.tagline);
  const [avatar, ...thumbs] = await Promise.all([
    loadImage(page.avatarUrl, 260),
    ...offers.slice(0, 6).map((o) => loadImage(o.images[0], 420)),
  ]);
  const tiles = thumbs.filter((t): t is string => !!t).slice(0, 3);
  const align = arabic ? "flex-end" : "flex-start";

  return render(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: tokens.bg, color: tokens.text, fontFamily: sans(arabic) }}>
      <Background ctx={ctx} />
      <div style={{ display: "flex", flexDirection: arabic ? "row-reverse" : "row", width: "100%", height: "100%", padding: 56, gap: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, alignItems: align, minWidth: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: align, gap: 26 }}>
            <Avatar ctx={ctx} src={avatar} size={128} />
            <div style={{ fontFamily: serif(arabic), fontSize: page.title.length > 22 ? 62 : 74, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5, display: "flex", textAlign: arabic ? "right" : "left" }}>
              {clip(page.title, 40)}
            </div>
            {page.tagline && (
              <div style={{ fontSize: 30, color: tokens.muted, lineHeight: 1.3, display: "flex", textAlign: arabic ? "right" : "left" }}>{clip(page.tagline, 90)}</div>
            )}
            {count > 0 && (
              <div style={{ display: "flex", padding: "10px 20px", borderRadius: 999, background: hexToRgba(accent, 0.14), color: accent, fontSize: 24, fontWeight: 700 }}>
                {count} {publicT(lang, count === 1 ? "offerOne" : "offers")}
              </div>
            )}
          </div>
          <Footer ctx={ctx} arabic={arabic} />
        </div>

        {tiles.length > 0 && (
          <div style={{ display: "flex", gap: 18, width: 470, flexShrink: 0 }}>
            <Tile src={tiles[0]} w={tiles.length > 1 ? 270 : 470} h={518} />
            {tiles.length > 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <Tile src={tiles[1]} w={182} h={250} />
                {tiles[2] ? <Tile src={tiles[2]} w={182} h={250} /> : <div style={{ width: 182, height: 250, borderRadius: 28, background: hexToRgba(accent, 0.12), display: "flex" }} />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    arabic,
  );
}

function Tile({ src, w, h }: { src: string; w: number; h: number }) {
  return (
    <div style={{ width: w, height: h, borderRadius: 28, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 48px rgba(0,0,0,0.3)" }}>
      <img alt="" src={src} style={{ width: w - 36, height: h - 36, objectFit: "contain" }} />
    </div>
  );
}

// ==================== 📰 صورة المقال ====================
export async function articleImage(slug: string, articleSlug: string) {
  const ctx = await loadPage(slug);
  if (!ctx) return fallbackImage();
  const article = await prisma.article.findFirst({
    where: { landingPageId: ctx.page.id, slug: articleSlug.toLowerCase(), status: "PUBLISHED" },
    select: { title: true, coverImage: true },
  });
  if (!article) return pageImage(slug);
  const { page, tokens, accent } = ctx;
  const lang = page.language;
  const arabic = lang === "ar" || hasArabic(article.title);
  const [cover, avatar] = await Promise.all([loadImage(article.coverImage, 1200), loadImage(page.avatarUrl, 160)]);
  const align = arabic ? "flex-end" : "flex-start";

  return render(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: tokens.bg, color: cover ? "#FFFFFF" : tokens.text, fontFamily: sans(arabic) }}>
      {cover ? (
        <>
          <img alt="" src={cover} style={{ position: "absolute", inset: 0, width: 1200, height: 630, objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.88) 100%)" }} />
        </>
      ) : (
        <Background ctx={ctx} />
      )}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: align, width: "100%", height: "100%", padding: 60, gap: 26 }}>
        <div style={{ display: "flex", padding: "8px 18px", borderRadius: 999, background: accent, color: ctx.onAccent, fontSize: 22, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>
          {publicT(lang, "articles")}
        </div>
        <div style={{ fontFamily: serif(arabic), fontSize: article.title.length > 70 ? 54 : 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1, display: "flex", textAlign: arabic ? "right" : "left" }}>
          {clip(article.title, 110)}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexDirection: arabic ? "row-reverse" : "row" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexDirection: arabic ? "row-reverse" : "row" }}>
            <Avatar ctx={ctx} src={avatar} size={52} />
            <div style={{ fontSize: 26, fontWeight: 600 }}>{clip(page.title, 32)}</div>
          </div>
          <div style={{ fontSize: 24, opacity: 0.75, fontFamily: "Inter" }}>{ctx.domain}</div>
        </div>
      </div>
    </div>,
    arabic,
  );
}

// ==================== صورة بديلة (صفحة مخفية/غير موجودة) ====================
export async function fallbackImage() {
  return render(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#07090D", color: "#FFFFFF", fontFamily: "Inter" }}>
      <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2, display: "flex" }}>
        Prime<span style={{ color: "#E9AE3B" }}>shelf</span>
      </div>
    </div>,
    false,
  ).catch(() => new Response(SITE_NAME, { status: 404 }));
}
