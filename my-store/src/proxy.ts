import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// ==================== 🛡️ Proxy (كان middleware سابقاً في Next.js < 16) ====================
type AuthenticatedRequest = NextRequest & {
  auth: { user?: { role?: string } } | null;
};

export default auth((req: AuthenticatedRequest) => {
  const { pathname } = req.nextUrl;

  const DEV_MODE = process.env.NODE_ENV === "development";

  // ==================== المسارات العامة ====================
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/marketplace",
    "/product",
    "/store",
    "/blog",
    "/about",
    "/contact",
    "/help",
    "/shipping",
    "/returns",
    "/faq",
    "/terms",
    "/privacy",
    "/cart",
    "/api/auth",
    "/api/webhooks",
    "/api/locale",
    "/api/products",
    "/api/blog",
    "/api/likes",
    "/api/comments",
    "/api/manual-orders",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ];

  // السماح للملفات الثابتة والمسارات العامة
  if (
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.includes(".") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // ==================== طلبات API ====================
  if (pathname.startsWith("/api/")) {
    if (DEV_MODE) {
      return NextResponse.next();
    }

    // في الإنتاج: تحقق من المصادقة للـ API
    if (!req.auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // حماية إضافية لـ API الخاص بالبائعين
    if (pathname.startsWith("/api/vendor")) {
      const role = req.auth?.user?.role;
      if (role !== "SELLER" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.next();
  }

  // ==================== الحماية في الإنتاج ====================
  if (!DEV_MODE) {
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;

    // حماية لوحة الأدمن
    if (pathname.startsWith("/admin")) {
      if (!isLoggedIn) {
        return NextResponse.redirect(
          new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
        );
      }
      if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    // حماية لوحة تحكم البائع
    if (pathname.startsWith("/vendor")) {
      if (!isLoggedIn) {
        return NextResponse.redirect(
          new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
        );
      }
      if (userRole !== "SELLER" && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    // حماية حساب المستخدم
    if (pathname.startsWith("/account") || pathname.startsWith("/dashboard")) {
      if (!isLoggedIn) {
        return NextResponse.redirect(
          new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
        );
      }
      return NextResponse.next();
    }

    // حماية إتمام الطلب
    if (pathname.startsWith("/checkout")) {
      if (!isLoggedIn) {
        return NextResponse.redirect(
          new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
        );
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
