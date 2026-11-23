import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import { isPlatformHost, normalizeHost } from "@/lib/domains";
import { slugForDomain } from "@/lib/domain-lookup";
import { detectSource, SOURCE_COOKIE } from "@/lib/sources";

// ==================== 🛡️ Proxy (كان middleware قبل Next.js 16) ====================
// 1) دومين خاص لمسوّق (mydeals.com) → نعرض صفحته: "/" ← "/{slug}" و"/x" ← "/{slug}/x" (إعادة كتابة داخلية، الرابط يبقى كما هو)
// 2) دومين المنصة → نحمي لوحة التحكم والأدمن فقط. واجهات /api تتحقق من الصلاحيات داخل كل route بنفسها.
type AuthenticatedRequest = NextRequest & {
  auth: { user?: { role?: string } } | null;
};

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

/**
 * أصل الموقع الحقيقي من رؤوس الطلب.
 * NextAuth يستبدل أصل req.url بقيمة AUTH_URL/NEXTAUTH_URL، فإن كانت خاطئة على السيرفر
 * (مثل http://localhost:3000) ستذهب كل التحويلات إلى localhost. نعتمد على النطاق الذي زاره المستخدم فعلاً.
 */
function requestOrigin(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return req.nextUrl.origin;
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0] ?? (isLocal ? "http" : "https");
  return `${proto}://${host}`;
}

const isUnder = (pathname: string, base: string) => pathname === base || pathname.startsWith(base + "/");

const platformGuard = auth((req: AuthenticatedRequest) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const origin = requestOrigin(req);
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, origin));

  const toLogin = () => redirectTo(`/login?callbackUrl=${encodeURIComponent(pathname)}`);

  if (isUnder(pathname, "/dashboard")) {
    if (!isLoggedIn) return toLogin();
    return NextResponse.next();
  }

  if (isUnder(pathname, "/admin")) {
    if (!isLoggedIn) return toLogin();
    if (!role || !ADMIN_ROLES.has(role)) return redirectTo("/dashboard");
    return NextResponse.next();
  }

  // المستخدم المسجّل لا يحتاج صفحتي الدخول/التسجيل
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return redirectTo(role && ADMIN_ROLES.has(role) ? "/admin/dashboard" : "/dashboard");
  }

  return NextResponse.next();
});

// مسارات المنصة التي لا معنى لها على دومين المسوّق: نرسلها لموقع المنصة
const PLATFORM_ONLY = ["/dashboard", "/admin", "/login", "/register", "/verify-email", "/forgot-password", "/reset-password", "/onboarding", "/invite", "/notifications"];
// مسارات مشتركة تعمل كما هي على أي دومين
const PASS_THROUGH = ["/api", "/go", "/_next", "/brand"];

/**
 * 📣 يحفظ مصدر الزيارة (Instagram/TikTok/...) في كوكي جلسة عند فتح صفحة من خارج الموقع،
 * لتُنسب له النقرات اللاحقة على أزرار الشراء (/go) حتى بعد التنقل داخل الصفحة.
 */
function rememberSource(req: NextRequest, res: NextResponse, host: string) {
  if (req.method !== "GET" || req.headers.get("sec-fetch-dest") === "empty" || req.headers.get("rsc")) return res;
  const source = detectSource({
    userAgent: req.headers.get("user-agent"),
    utmSource: req.nextUrl.searchParams.get("utm_source"),
    referrer: req.headers.get("referer"),
    host,
  });
  if (source && req.cookies.get(SOURCE_COOKIE)?.value !== source) {
    res.cookies.set(SOURCE_COOKIE, source, { path: "/", sameSite: "lax", httpOnly: true, secure: req.nextUrl.protocol === "https:" });
  }
  return res;
}

async function customDomain(req: NextRequest, host: string) {
  const { pathname, search } = req.nextUrl;

  if (PASS_THROUGH.some((p) => isUnder(pathname, p))) return NextResponse.next();
  if (PLATFORM_ONLY.some((p) => isUnder(pathname, p))) return NextResponse.redirect(`${SITE_URL}${pathname}${search}`);

  const slug = await slugForDomain(host);
  if (!slug) {
    return new NextResponse("This domain is not connected to any page.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }

  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    const url = req.nextUrl.clone();
    url.pathname = `/api/site-files/${pathname === "/robots.txt" ? "robots" : "sitemap"}`;
    url.searchParams.set("slug", slug);
    return NextResponse.rewrite(url);
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${slug}${pathname === "/" ? "" : pathname}`;
  return rememberSource(req, NextResponse.rewrite(url), host);
}

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
  const host = normalizeHost(req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  if (!isPlatformHost(host)) return customDomain(req, host);

  const { pathname } = req.nextUrl;
  if (isUnder(pathname, "/dashboard") || isUnder(pathname, "/admin") || pathname === "/login" || pathname === "/register") {
    return (platformGuard as unknown as (r: NextRequest, e: NextFetchEvent) => Promise<Response>)(req, event);
  }
  if (isUnder(pathname, "/api") || isUnder(pathname, "/go")) return NextResponse.next();
  return rememberSource(req, NextResponse.next(), host);
}

export const config = {
  // كل الصفحات (لدعم الدومينات الخاصة) ما عدا ملفات Next الثابتة والصور والخطوط
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpe?g|gif|webp|avif|ico|css|js|map|woff2?|ttf|otf|mp4|webm|pdf|webmanifest)$).*)",
  ],
};
