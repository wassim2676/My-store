import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// ==================== 🛡️ Proxy (كان middleware قبل Next.js 16) ====================
// الصفحات العامة (الرئيسية، صفحات المسوّقين /{slug}، /go/{id} ...) لا تحتاج أي فحص.
// نحمي هنا صفحات لوحة التحكم والأدمن فقط. واجهات /api تتحقق من الصلاحيات داخل كل route بنفسها.
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

export default auth((req: AuthenticatedRequest) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const origin = requestOrigin(req);
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, origin));

  const toLogin = () => redirectTo(`/login?callbackUrl=${encodeURIComponent(pathname)}`);

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!isLoggedIn) return toLogin();
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
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

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
