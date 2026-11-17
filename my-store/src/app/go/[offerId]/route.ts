import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { bumpDailyStat } from "@/lib/marketer";
import { classifyVisitor, cleanAffiliateUrl, isCountryAllowed, parseAudience, visitorCountry } from "@/lib/traffic";
import { bestTextOn, pageDir, parseDesign, publicT, resolveTokens } from "@/lib/landing";

// ==================== ↗️ GET /go/{offerId}: البوابة الوحيدة لرابط الأفلييت ====================
// عام بالكامل (بدون مصادقة). يعمل حتى بدون JavaScript، والتتبع لا يؤخر التحويل.
// ترتيب الحماية (لكل المتاجر):
//   1) روبوت/زاحف/جلب مسبق → رابط المنتج النظيف في المتجر (بدون معرّف الأفلييت) — أو صفحة المراجعة
//   2) بلد غير مستهدف     → صفحة محايدة أو وجهة يحددها المسوّق — لا يصل لرابط الأفلييت أبداً
//   3) زائر حقيقي مستهدف  → رابط الأفلييت + تسجيل النقرة
export async function GET(request: NextRequest, { params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    select: {
      id: true,
      slug: true,
      affiliateUrl: true,
      status: true,
      landingPageId: true,
      landingPage: { select: { slug: true, title: true, language: true, theme: true, accentColor: true, design: true, audience: true } },
    },
  });

  if (!offer || offer.status !== "PUBLISHED") {
    return NextResponse.redirect(new URL(offer ? `/${offer.landingPage.slug}` : "/", request.url));
  }

  const page = offer.landingPage;
  const audience = parseAudience(page.audience);
  const kind = classifyVisitor(request.headers);
  const reviewUrl = new URL(`/${page.slug}/${offer.slug}`, request.url).toString();

  // 1) 🤖 الروبوتات وزواحف المنصات: لا نكشف رابط الأفلييت ولا نسجّل نقرة
  if (kind !== "human" && audience.botProtection) {
    if (kind === "bot") track(() => bumpDailyStat(offer.landingPageId, "botHits"));
    return redirect(cleanAffiliateUrl(offer.affiliateUrl) ?? reviewUrl);
  }

  // 2) 🌍 الاستهداف الجغرافي
  if (kind === "human" && !isCountryAllowed(audience, visitorCountry(request.headers))) {
    track(() => bumpDailyStat(offer.landingPageId, "geoBlocked"));
    if (audience.blockAction === "redirect" && audience.redirectUrl) return redirect(audience.redirectUrl);
    return regionPage(page, new URL(`/${page.slug}`, request.url).toString());
  }

  // 3) ✅ زائر حقيقي مستهدف
  if (kind === "human") {
    track(() =>
      Promise.all([
        prisma.offer.update({ where: { id: offer.id }, data: { clicks: { increment: 1 } } }),
        bumpDailyStat(offer.landingPageId, "clicks"),
      ]),
    );
  }
  const res = redirect(offer.affiliateUrl);
  res.headers.set("Referrer-Policy", "no-referrer-when-downgrade");
  return res;
}

/** تسجيل بعد إرسال الرد (لا يؤخر التحويل) */
function track(fn: () => Promise<unknown>) {
  after(async () => {
    try {
      await fn();
    } catch (err) {
      console.error("[GO_TRACK_ERROR]", err);
    }
  });
}

function redirect(url: string) {
  const res = NextResponse.redirect(url, 302);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("Vary", "User-Agent");
  return res;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** 🚧 صفحة محايدة للدول المستبعدة: لا روابط خارجية، بألوان صفحة المسوّق ولغتها */
function regionPage(
  page: { title: string; language: string; theme: string; accentColor: string; design: unknown },
  backUrl: string,
) {
  const lang = page.language;
  const t = resolveTokens(page.theme, parseDesign(page.design));
  const html = `<!doctype html>
<html lang="${esc(lang)}" dir="${pageDir(lang)}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(publicT(lang, "regionTitle"))} · ${esc(page.title)}</title>
<style>
  *{box-sizing:border-box}html,body{margin:0;height:100%}
  body{display:flex;align-items:center;justify-content:center;padding:24px;background:${t.bg};color:${t.text};
    font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans Arabic",sans-serif}
  .card{max-width:440px;width:100%;text-align:center;padding:40px 28px;border-radius:24px;background:${t.surface};border:1px solid ${t.border}}
  .icon{width:56px;height:56px;margin:0 auto 18px;border-radius:50%;display:flex;align-items:center;justify-content:center;
    border:1px solid ${t.border};background:${t.surface2}}
  h1{margin:0 0 8px;font-size:21px;line-height:1.3}
  p{margin:0 0 26px;color:${t.muted};font-size:15px}
  a{display:inline-block;padding:12px 22px;border-radius:999px;background:${page.accentColor};color:${bestTextOn(page.accentColor)};text-decoration:none;font-weight:600;font-size:14px}
</style>
</head>
<body>
  <main class="card">
    <div class="icon" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
    <h1>${esc(publicT(lang, "regionTitle"))}</h1>
    <p>${esc(publicT(lang, "regionBody"))}</p>
    <a href="${esc(backUrl)}">${esc(publicT(lang, "backTo", { name: page.title }))}</a>
  </main>
</body>
</html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
