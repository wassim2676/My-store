"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard, Package, PlusCircle, Palette, UserCog, LogOut, Menu, X, ExternalLink, Sparkles, ShieldCheck,
} from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import CopyLink from "./CopyLink";
import { SITE_NAME } from "@/lib/site";

export default function DashboardShell({
  page,
  user,
  children,
}: {
  page: { slug: string; title: string; isPublished: boolean };
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const t = useTranslations("dash");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/dashboard", label: t("nav.overview"), icon: LayoutDashboard, exact: true },
    { href: "/dashboard/offers", label: t("nav.offers"), icon: Package, exact: false },
    { href: "/dashboard/offers/new", label: t("nav.newOffer"), icon: PlusCircle, exact: true },
    { href: "/dashboard/page-settings", label: t("nav.design"), icon: Palette, exact: true },
    { href: "/dashboard/account", label: t("nav.account"), icon: UserCog, exact: true },
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || (pathname.startsWith(href + "/") && pathname !== "/dashboard/offers/new");

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-[#07090D] text-white flex">
      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed lg:sticky top-0 start-0 z-50 h-screen w-72 shrink-0 border-e border-white/[0.06] bg-[#0A0D13] flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full lg:translate-x-0!"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-600">
              <Sparkles className="h-4.5 w-4.5 text-black" />
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight">{SITE_NAME}</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden rounded-lg p-2 text-white/60 hover:bg-white/5 cursor-pointer" aria-label="close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-4 mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-wider text-white/40">{t("nav.yourPage")}</p>
          <p className="mt-1 truncate font-semibold">{page.title}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${page.isPublished ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className="text-white/50">{page.isPublished ? t("nav.live") : t("nav.hidden")}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <a
              href={`/${page.slug}`}
              target="_blank"
              rel="noopener"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-black hover:bg-amber-300"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("nav.view")}
            </a>
            <CopyLink path={`/${page.slug}`} compact />
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                isActive(item.href, item.exact)
                  ? "bg-amber-400/10 text-amber-300"
                  : "text-white/60 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 hover:bg-white/[0.04] hover:text-white">
              <ShieldCheck className="h-[18px] w-[18px]" />
              {t("nav.admin")}
            </Link>
          )}
        </nav>

        <div className="border-t border-white/[0.06] p-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-white/40">{user.email}</p>
          </div>
          <button
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/10 cursor-pointer"
          >
            <LogOut className="h-[18px] w-[18px]" />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-[#07090D]/85 px-4 py-3 backdrop-blur sm:px-8">
          <button onClick={() => setOpen(true)} className="lg:hidden rounded-lg p-2 text-white/70 hover:bg-white/5 cursor-pointer" aria-label="menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 🔁 التبديل إلى لوحة الأدمن — ظاهر دائماً على الكمبيوتر والهاتف (للأدمن فقط) */}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-200 hover:bg-sky-400/20 sm:px-4 sm:text-sm"
                title={t("nav.admin")}
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden min-[400px]:inline">{t("nav.admin")}</span>
              </Link>
            )}
            <LanguageSwitcher variant="dark" />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
