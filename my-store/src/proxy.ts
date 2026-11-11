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

export default auth((req: AuthenticatedRequest) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const toLogin = () =>
    NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url));

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!isLoggedIn) return toLogin();
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!isLoggedIn) return toLogin();
    if (!role || !ADMIN_ROLES.has(role)) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }

  // المستخدم المسجّل لا يحتاج صفحتي الدخول/التسجيل
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL(role && ADMIN_ROLES.has(role) ? "/admin/dashboard" : "/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
