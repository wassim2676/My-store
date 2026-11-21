import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SLUG_PATTERN } from "@/lib/landing";
import { pageAbsoluteUrl } from "@/lib/page-urls";
import { requestHost } from "@/lib/domains";

// ==================== 🤖 robots.txt و sitemap.xml للدومين الخاص بالمسوّق ====================
// الـ proxy يعيد كتابة mydeals.com/robots.txt و /sitemap.xml إلى هنا مع ?slug=
export async function GET(request: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const slug = request.nextUrl.searchParams.get("slug")?.toLowerCase() ?? "";
  if (!SLUG_PATTERN.test(slug) || (file !== "robots" && file !== "sitemap")) return new Response("Not found", { status: 404 });

  const page = await prisma.landingPage.findUnique({
    where: { slug },
    select: {
      slug: true,
      customDomain: true,
      customDomainVerifiedAt: true,
      isPublished: true,
      updatedAt: true,
      user: { select: { isActive: true } },
      offers: { where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } },
      articles: { where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } },
    },
  });
  const live = !!page && page.isPublished && page.user.isActive;
  // على دومين المسوّق نستعمل دومينه دائماً (حتى قبل اكتمال التحقق)
  const onDomain = !!page?.customDomain && requestHost(request.headers) === page.customDomain;
  const url = (sub = "") => (onDomain ? `https://${page!.customDomain}${sub || "/"}` : pageAbsoluteUrl(page!, sub));
  const headers = { "cache-control": "public, max-age=0, s-maxage=3600" };

  if (file === "robots") {
    const body = live
      ? `User-agent: *\nAllow: /\nDisallow: /go/\nDisallow: /api/\n\nSitemap: ${url("/sitemap.xml")}\n`
      : "User-agent: *\nDisallow: /\n";
    return new Response(body, { headers: { ...headers, "content-type": "text/plain; charset=utf-8" } });
  }

  const urls: { loc: string; lastmod: Date }[] = [];
  if (live) {
    urls.push({ loc: url(), lastmod: page.updatedAt });
    for (const o of page.offers) urls.push({ loc: url(`/${o.slug}`), lastmod: o.updatedAt });
    if (page.articles.length) urls.push({ loc: url("/articles"), lastmod: page.updatedAt });
    for (const a of page.articles) urls.push({ loc: url(`/articles/${a.slug}`), lastmod: a.updatedAt });
  }
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod.toISOString()}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`;
  return new Response(xml, { headers: { ...headers, "content-type": "application/xml; charset=utf-8" } });
}
