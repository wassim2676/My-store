"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, User, ShoppingBag, MapPin, Settings, LogOut, Heart, Menu, X 
} from "lucide-react";
import { useState, useEffect } from "react";

// ==================== 🔤 الترجمات الشاملة ====================
type Language = "ar" | "fr" | "en";

const translations = {
  ar: {
    // Header
    title: "حسابي",
    emailLabel: "البريد الإلكتروني",
    
    // Navigation
    nav: {
      dashboard: "لوحة التحكم",
      profile: "الملف الشخصي",
      orders: "طلباتي",
      wishlist: "الأمنيات",
      addresses: "العناوين",
      settings: "الإعدادات",
    },
    
    // Actions
    logout: "تسجيل الخروج",
    toggleMenu: "تبديل القائمة",
    
    // Language
    lang: {
      ar: "العربية",
      fr: "Français",
      en: "English",
      switcher: "تغيير اللغة",
    },
    
    // Accessibility
    aria: {
      sidebar: "القائمة الجانبية",
      mainContent: "المحتوى الرئيسي",
      mobileNav: "قائمة الجوال",
      logo: "الذهاب للرئيسية",
    },
  },
  fr: {
    // Header
    title: "Mon Compte",
    emailLabel: "Email",
    
    // Navigation
    nav: {
      dashboard: "Tableau de bord",
      profile: "Profil",
      orders: "Mes commandes",
      wishlist: "Favoris",
      addresses: "Adresses",
      settings: "Paramètres",
    },
    
    // Actions
    logout: "Se déconnecter",
    toggleMenu: "Basculer le menu",
    
    // Language
    lang: {
      ar: "العربية",
      fr: "Français",
      en: "English",
      switcher: "Changer de langue",
    },
    
    // Accessibility
    aria: {
      sidebar: "Menu latéral",
      mainContent: "Contenu principal",
      mobileNav: "Navigation mobile",
      logo: "Aller à l'accueil",
    },
  },
  en: {
    // Header
    title: "My Account",
    emailLabel: "Email",
    
    // Navigation
    nav: {
      dashboard: "Dashboard",
      profile: "Profile",
      orders: "My Orders",
      wishlist: "Wishlist",
      addresses: "Addresses",
      settings: "Settings",
    },
    
    // Actions
    logout: "Sign Out",
    toggleMenu: "Toggle menu",
    
    // Language
    lang: {
      ar: "العربية",
      fr: "Français",
      en: "English",
      switcher: "Change language",
    },
    
    // Accessibility
    aria: {
      sidebar: "Sidebar navigation",
      mainContent: "Main content",
      mobileNav: "Mobile navigation",
      logo: "Go to homepage",
    },
  },
};

// ==================== 🧭 عناصر القائمة ====================
const navItems = [
  { href: "/account/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "/account/profile", icon: User, key: "profile" },
  { href: "/account/orders", icon: ShoppingBag, key: "orders" },
  { href: "/account/wishlist", icon: Heart, key: "wishlist" },
  { href: "/account/addresses", icon: MapPin, key: "addresses" },
  { href: "/account/settings", icon: Settings, key: "settings" },
];

// ... باقي الكود كما هو ...

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === "undefined") return "ar";
    const savedLang = window.localStorage.getItem("lang") as Language;
    return savedLang && ["ar", "fr", "en"].includes(savedLang) ? savedLang : "ar";
  });

  const t = translations[lang];

  // 🔹 مزامنة اتجاه الصفحة مع اللغة المحفوظة (بدون استدعاء setState هنا، القيمة الأولية جاهزة أعلاه)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- ضبط اتجاه الصفحة مطلوب هنا فعلياً عند تغيّر اللغة
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    // eslint-disable-next-line react-hooks/immutability -- ضبط اتجاه الصفحة مطلوب هنا فعلياً عند تغيّر اللغة
    document.documentElement.lang = lang;
  }, [lang]);

  // 🔹 تغيير اللغة مع تحديث الاتجاه
  const changeLang = (newLang: Language) => {
    setLang(newLang);
    window.localStorage.setItem("lang", newLang);
  };

  // ✅ التصحيح: مبدل اللغة في الجهة المعاكس للـ Sidebar
  const isRTL = lang === "ar";
  const langSwitcherPosition = isRTL ? "left-4" : "right-4";

  // ... باقي الكود كما هو ...

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-gray-950 flex flex-col lg:flex-row">
      
      {/* 🌐 Language Switcher (Desktop) - يتحول حسب اللغة */}
      <div className={`hidden lg:flex absolute top-4 ${langSwitcherPosition} gap-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-lg p-1 shadow-sm z-50`}>
        {(["ar", "fr", "en"] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => changeLang(l)}
            title={t.lang[l as keyof typeof t.lang]}
            aria-label={`${t.lang.switcher}: ${t.lang[l as keyof typeof t.lang]}`}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              lang === l
                ? "bg-sky-500 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 📱 Language Switcher (Mobile) - يتحول حسب اللغة */}
      <div className={`lg:hidden absolute top-4 ${langSwitcherPosition} z-50`}>
        <select
          value={lang}
          onChange={(e) => changeLang(e.target.value as Language)}
          aria-label={t.lang.switcher}
          className="px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="ar">🇸🇦 AR</option>
          <option value="fr">🇫🇷 FR</option>
          <option value="en">🇬🇧 EN</option>
        </select>
      </div>

      {/* 🖥️ Desktop Sidebar */}
      <aside 
        className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0"
        aria-label={t.aria.sidebar}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Link 
            href="/" 
            className="flex items-center gap-3 cursor-pointer group"
            aria-label={t.aria.logo}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform cursor-pointer">
              <span className="text-white font-bold">M</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{t.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]" title={session?.user?.email || ""}>
                {session?.user?.email}
              </p>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1" role="navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  isActive
                    ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>{t.nav[item.key as keyof typeof t.nav]}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={async () => {
              // ✅ إصلاح تسجيل الخروج: إعادة تحميل كاملة تضمن مسح الجلسة فعلياً
              await signOut({ redirect: false });
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={t.logout}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* 📱 Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 cursor-pointer group" aria-label={t.aria.logo}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform cursor-pointer">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">{t.title}</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
          aria-label={t.toggleMenu}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* 📱 Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 space-y-1 animate-in slide-in-from-top" role="navigation" aria-label={t.aria.mobileNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  isActive
                    ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>{t.nav[item.key as keyof typeof t.nav]}</span>
              </Link>
            );
          })}
          <button
            onClick={async () => {
              setMobileMenuOpen(false);
              // ✅ إصلاح تسجيل الخروج: إعادة تحميل كاملة تضمن مسح الجلسة فعلياً
              await signOut({ redirect: false });
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 mt-2"
            aria-label={t.logout}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span>{t.logout}</span>
          </button>
        </div>
      )}

      {/* 📱 Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2 flex justify-around items-center z-50 safe-area-bottom" aria-label={t.aria.mobileNav}>
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const navLabel = t.nav[item.key as keyof typeof t.nav];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                isActive
                  ? "text-sky-600 dark:text-sky-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              aria-label={navLabel}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[10px] font-medium">
                {navLabel.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 📄 Main Content */}
      <main 
        className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-y-auto"
        aria-label={t.aria.mainContent}
      >
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}