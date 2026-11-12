"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  ExternalLink, LayoutDashboard, LayoutGrid, LogOut, Menu, Newspaper, Package, ShieldCheck, ShoppingCart, Store, Tags, Users, X,
} from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { SITE_NAME } from "@/lib/site";

// ==================== 🛡️ غلاف لوحة الأدمن (نفس هوية المنصة الداكنة) ====================
// الصنف "dark" يفعّل متغيرات dark: في صفحات الأدمن القديمة (المستخدمون، المدونة، الطلبات اليدوية...)
export default function AdminShell({ user, children }: { user: { name: string; email: string }; children: React.ReactNode }) {
  const t = useTranslations("adm.nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const groups = [
    {
      items: [
        { href: "/admin/dashboard", label: t("overview"), icon: LayoutDashboard },
        { href: "/admin/marketers", label: t("marketers"), icon: Store },
        { href: "/admin/offers", label: t("offers"), icon: Package },
        { href: "/admin/brands", label: t("stores"), icon: Tags },
        { href: "/admin/users", label: t("users"), icon: Users },
      ],
    },
    {
      title: t("content"),
      items: [
        { href: "/admin/blog", label: t("blog"), icon: Newspaper },
        { href: "/admin/manual-orders", label: t("orders"), icon: ShoppingCart },
      ],
    },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="dark flex min-h-screen bg-[#07090D] text-white">
      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed top-0 start-0 z-50 flex h-screen w-72 shrink-0 flex-col border-e border-white/[0.06] bg-[#0A0D13] transition-transform duration-300 lg:sticky ${
          open ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full lg:translate-x-0!"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-300 to-indigo-600">
              <ShieldCheck className="h-4.5 w-4.5 text-white" />
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-lg font-semibold tracking-tight">{SITE_NAME}</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/80">{t("panel")}</span>
            </span>
          </Link>
          <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-white/60 hover:bg-white/5 lg:hidden cursor-pointer" aria-label="close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto p-4">
          {groups.map((g, i) => (
            <div key={i} className="space-y-1">
              {g.title && <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">{g.title}</p>}
              {g.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive(item.href) ? "bg-sky-400/10 text-sky-300" : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] p-4">
          <Link
            href="/dashboard"
            className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-400/[0.12]"
          >
            <LayoutGrid className="h-4 w-4" />
            {t("toMarketer")}
          </Link>
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
            {t("logout")}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-[#07090D]/85 px-4 py-3 backdrop-blur sm:px-8">
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-white/70 hover:bg-white/5 lg:hidden cursor-pointer" aria-label="menu">
              <Menu className="h-5 w-5" />
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-400/[0.08] px-3 py-1 text-xs font-semibold text-sky-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("panel")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 🔁 التبديل إلى لوحة المسوّق — ظاهر دائماً على الكمبيوتر والهاتف */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-300 sm:px-4 sm:text-sm"
              title={t("toMarketer")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden min-[400px]:inline">{t("toMarketer")}</span>
            </Link>
            <a href="/" target="_blank" rel="noopener" className="hidden items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/[0.05] md:inline-flex">
              <ExternalLink className="h-4 w-4" />
              {t("viewSite")}
            </a>
            <LanguageSwitcher variant="dark" />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
