"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  ChevronDown,
  Heart,
  Package,
  LayoutDashboard,
  Store,
  LogOut,
  Settings,
} from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

// نصوص الشريط الفرعي للفئات — سيُعاد تصميم هذا القسم بالكامل في مرحلة الصفحة الرئيسية (المرحلة 2)
const subBarText: Record<"ar" | "fr" | "en", Record<string, string>> = {
  ar: {
    dailyDeals: "العروض اليومية",
    energySupplements: "مكملات الطاقة",
    healthCare: "العناية بالصحة",
    bestsellers: "الأكثر مبيعاً",
    newArrivals: "وصل حديثاً",
    healthTips: "نصائح صحية",
    discount: "خصم حتى 50%",
  },
  fr: {
    dailyDeals: "Offres quotidiennes",
    energySupplements: "Compléments énergétiques",
    healthCare: "Soins de santé",
    bestsellers: "Meilleures ventes",
    newArrivals: "Nouveautés",
    healthTips: "Conseils santé",
    discount: "Jusqu'à 50% de réduction",
  },
  en: {
    dailyDeals: "Daily Deals",
    energySupplements: "Energy Supplements",
    healthCare: "Health Care",
    bestsellers: "Best Sellers",
    newArrivals: "New Arrivals",
    healthTips: "Health Tips",
    discount: "Up to 50% Off",
  },
};

export default function MegaNavbar() {
  const { data: session } = useSession();
  const locale = useLocale() as "ar" | "fr" | "en";
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const st = subBarText[locale];

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- مزامنة عداد السلة مع حالة الجلسة
      setCartCount(0);
      return;
    }
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCartCount(d.data.count || 0); })
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const role = session?.user?.role;
  const displayName = session?.user?.firstName || session?.user?.email?.split("@")[0];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-xl">
      <div className="w-full">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-3 lg:gap-6">
            {/* الشعار والقائمة */}
            <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 group hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300">
                  <span className="text-white font-black text-xl lg:text-2xl">M</span>
                </div>
                <span className="hidden sm:block text-xl lg:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-orange-400 group-hover:to-orange-300 transition-all duration-300">
                  {tc("siteName")}
                </span>
              </Link>

              <button className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm font-bold hover:bg-slate-800 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer">
                <Menu className="w-5 h-5 text-orange-400" />
                <span className="hover:text-orange-400 transition-colors">{t("categories")}</span>
              </button>
            </div>

            {/* شريط البحث المركزي */}
            <div className="flex-1 max-w-3xl hidden md:flex">
              <div className="flex w-full rounded-lg overflow-hidden shadow-lg border-2 border-transparent focus-within:border-orange-500 focus-within:shadow-orange-500/30 transition-all duration-300 bg-white">
                <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 lg:px-4 text-xs font-bold flex items-center gap-1 transition-all duration-200 border-e border-slate-300 cursor-pointer">
                  {t("categories")}
                  <ChevronDown className="w-3 h-3" />
                </button>
                <input
                  type="text"
                  placeholder={tc("search")}
                  className="flex-1 px-4 py-2.5 text-slate-900 outline-none bg-white placeholder-slate-400 text-sm lg:text-base"
                />
                <button className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 px-4 lg:px-6 flex items-center justify-center transition-all duration-200 cursor-pointer">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* الحسابات واللغة والسلة */}
            <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 flex-shrink-0">
              <LanguageSwitcher />

              {/* منطقة المصادقة */}
              {session ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {displayName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden lg:block text-sm font-semibold max-w-[100px] truncate">{displayName}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform hidden lg:block ${menuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {menuOpen && (
                    <div className="absolute end-0 mt-2 w-56 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 overflow-hidden">
                      <Link href="/account/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                        <User className="w-4 h-4 text-slate-400" /> {t("account")}
                      </Link>
                      <Link href="/account/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                        <Package className="w-4 h-4 text-slate-400" /> {t("myOrders")}
                      </Link>
                      <Link href="/account/wishlist" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                        <Heart className="w-4 h-4 text-slate-400" /> {t("wishlist")}
                      </Link>
                      {(role === "SELLER") && (
                        <Link href="/vendor/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                          <Store className="w-4 h-4 text-orange-500" /> {t("vendorDashboard")}
                        </Link>
                      )}
                      {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                        <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                          <LayoutDashboard className="w-4 h-4 text-orange-500" /> {t("adminDashboard")}
                        </Link>
                      )}
                      <Link href="/account/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                        <Settings className="w-4 h-4 text-slate-400" /> {t("settings")}
                      </Link>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> {t("logout")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-semibold border border-slate-600 hover:bg-slate-800 hover:border-slate-500 transition-all duration-200 cursor-pointer"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-orange-500/40 transition-all duration-200 cursor-pointer"
                  >
                    {t("register")}
                  </Link>
                </div>
              )}

              {/* السلة */}
              <Link href="/cart" className="relative flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded-lg transition-all duration-200 group cursor-pointer">
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 lg:w-7 lg:h-7 text-slate-300 group-hover:text-orange-400 transition-all duration-200 group-hover:scale-110" />
                  <span className="absolute -top-2 -end-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                </div>
                <span className="hidden lg:block font-bold text-sm group-hover:text-orange-400 transition-colors">{t("cart")}</span>
              </Link>
            </div>
          </div>

          {/* شريط البحث للموبايل */}
          <div className="md:hidden pb-4">
            <div className="flex w-full rounded-lg overflow-hidden shadow-lg border-2 border-transparent focus-within:border-orange-500 transition-all duration-300 bg-white">
              <input
                type="text"
                placeholder={tc("search")}
                className="flex-1 px-4 py-3 text-slate-900 outline-none bg-white placeholder-slate-400 text-sm"
              />
              <button className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 px-5 flex items-center justify-center transition-all duration-200 cursor-pointer">
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* شريط الفئات الفرعي */}
      <div className="bg-slate-800/90 backdrop-blur-sm text-sm hidden md:block border-t border-slate-700">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-8 h-11 text-slate-300 overflow-x-auto no-scrollbar">
            <Link href="/marketplace" className="flex items-center gap-1.5 hover:text-white hover:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer">
              {st.dailyDeals}
            </Link>
            <Link href="/marketplace?cat=energy" className="hover:text-orange-400 hover:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer">
              {st.energySupplements}
            </Link>
            <Link href="/marketplace?cat=health" className="hover:text-emerald-400 hover:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer">
              {st.healthCare}
            </Link>
            <Link href="/marketplace?cat=bestsellers" className="hover:text-purple-400 hover:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer">
              {st.bestsellers}
            </Link>
            <Link href="/marketplace?cat=new" className="hover:text-pink-400 hover:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer">
              {st.newArrivals}
            </Link>
            <Link href="/blog" className="hover:text-cyan-400 hover:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer">
              {st.healthTips}
            </Link>
            <Link href="/vendor/register" className="hover:text-yellow-400 hover:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold">
              {t("becomeSeller")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
