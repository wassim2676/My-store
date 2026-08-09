"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard, ShoppingCart, Users, Package,
  Menu, X, LogOut, Bell, Store, Newspaper
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations("admin");

  const navItems = [
    { href: "/admin/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/manual-orders", label: t("manualOrders"), icon: ShoppingCart },
    { href: "/admin/users", label: t("users"), icon: Users },
    { href: "/admin/products", label: t("products"), icon: Package },
    { href: "/admin/vendors", label: t("vendors"), icon: Store },
    { href: "/admin/blog", label: t("blog"), icon: Newspaper },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 start-0 z-50 h-screen w-64 bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">{t("panelTitle")}</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 start-0 end-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            {t("signOut")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 sm:gap-4 ms-auto">
              <LanguageSwitcher variant="compact" />
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 ps-4 border-s border-gray-200 dark:border-gray-800">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-medium text-sm cursor-pointer">
                  {session?.user?.firstName?.[0] || "A"}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {session?.user?.firstName || "Admin"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
