"use client";

import { useSession } from "next-auth/react";
import { ShoppingBag, TrendingUp, Clock, Star, RefreshCw, AlertCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ordersAPI, wishlistAPI, type Order, type WishlistItem } from "@/lib/api";

// ==================== 🔤 الترجمات ====================

type Language = "ar" | "fr" | "en";

const translations: Record<Language, any> = {
  ar: {
    welcome: "مرحباً،",
    guest: "ضيف",
    dashboardDesc: "إليك ملخص نشاطك الأخير في المتجر",
    browseProducts: "تصفح المنتجات",
    stats: { totalOrders: "إجمالي الطلبات", pending: "قيد التنفيذ", spent: "المبلغ المنفق", wishlist: "قائمة الأمنيات" },
    recentOrders: "آخر الطلبات",
    viewAll: "عرض الكل",
    noOrders: "ليس لديك طلبات بعد",
    startShopping: "ابدأ التسوق الآن",
    orderPrefix: "طلب",
    products: "منتجات",
    status: {
      PENDING: "في الانتظار", CONFIRMED: "تم التأكيد", PROCESSING: "قيد المعالجة",
      SHIPPED: "تم الشحن", DELIVERED: "تم التوصيل", CANCELLED: "ملغي",
      REFUNDED: "تم الاسترداد", RETURNED: "تم الإرجاع",
    },
    loading: "جاري التحميل...",
    error: "حدث خطأ أثناء جلب البيانات",
    retry: "إعادة المحاولة",
    offline: "تحقق من اتصالك بالإنترنت",
  },
  fr: {
    welcome: "Bonjour,",
    guest: "Invité",
    dashboardDesc: "Voici un résumé de votre activité récente",
    browseProducts: "Parcourir les produits",
    stats: { totalOrders: "Total commandes", pending: "En cours", spent: "Total dépensé", wishlist: "Favoris" },
    recentOrders: "Dernières commandes",
    viewAll: "Voir tout",
    noOrders: "Vous n'avez pas encore de commandes",
    startShopping: "Commencer à acheter",
    orderPrefix: "Commande",
    products: "produits",
    status: {
      PENDING: "En attente", CONFIRMED: "Confirmée", PROCESSING: "En traitement",
      SHIPPED: "Expédiée", DELIVERED: "Livré", CANCELLED: "Annulée",
      REFUNDED: "Remboursée", RETURNED: "Retournée",
    },
    loading: "Chargement...",
    error: "Erreur lors du chargement des données",
    retry: "Réessayer",
    offline: "Vérifiez votre connexion internet",
  },
  en: {
    welcome: "Welcome,",
    guest: "Guest",
    dashboardDesc: "Here's a summary of your recent activity",
    browseProducts: "Browse Products",
    stats: { totalOrders: "Total Orders", pending: "Pending", spent: "Total Spent", wishlist: "Wishlist" },
    recentOrders: "Recent Orders",
    viewAll: "View All",
    noOrders: "You don't have any orders yet",
    startShopping: "Start Shopping",
    orderPrefix: "Order",
    products: "items",
    status: {
      PENDING: "Pending", CONFIRMED: "Confirmed", PROCESSING: "Processing",
      SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled",
      REFUNDED: "Refunded", RETURNED: "Returned",
    },
    loading: "Loading...",
    error: "Error loading data",
    retry: "Retry",
    offline: "Check your internet connection",
  },
};

// ====================  مكونات مساعدة ====================

function StatCard({ label, value, icon: Icon, color, loading }: { label: string; value: string | number; icon: any; color: string; loading?: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: any }) {
  const colors: Record<string, string> = {
    DELIVERED: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    SHIPPED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    PROCESSING: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
    CONFIRMED: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    PENDING: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    CANCELLED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  };
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer ${colors[status] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"}`}>
      {t.status[status as keyof typeof t.status] || status}
    </span>
  );
}

// ====================  المكون الرئيسي ====================

export default function DashboardPage() {
  const { data: session } = useSession();
  const [lang, setLang] = useState<Language>("ar");
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalSpent: 0, wishlistCount: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Language;
    if (savedLang && ["ar", "fr", "en"].includes(savedLang)) {
      setLang(savedLang);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersResult, wishlistResult] = await Promise.all([
        ordersAPI.getOrders(),
        wishlistAPI.getWishlist(),
      ]);

      // ✅ التحقق الصحيح من البيانات
      if (ordersResult.success && ordersResult.data?.orders) {
        const orders = ordersResult.data.orders;
        
        const pending = orders.filter((o) => 
          ["PENDING", "PROCESSING", "CONFIRMED"].includes(o.status)
        );
        
        const totalSpent = orders.reduce((sum, o) => {
          const val = typeof o.total === "number" ? o.total : parseFloat(String(o.total));
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        setStats({
          totalOrders: orders.length,
          pendingOrders: pending.length,
          totalSpent,
          wishlistCount: (wishlistResult.success && wishlistResult.data?.items) 
            ? wishlistResult.data.items.length 
            : 0,
        });
        setRecentOrders(orders.slice(0, 3));
      } else {
        setError(ordersResult.error || t.error);
        setRecentOrders([]);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(t.offline);
    } finally {
      setLoading(false);
    }
  }, [t.error, t.offline]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locales: Record<Language, string> = { ar: "ar-MA", fr: "fr-FR", en: "en-US" };
    return date.toLocaleDateString(locales[lang], { year: "numeric", month: "short", day: "numeric" });
  };

  const formatCurrency = (amount: number) => {
    const locale = lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-US";
    return new Intl.NumberFormat(locale, { style: "currency", currency: "MAD", minimumFractionDigits: 0 }).format(amount);
  };

  const handleRetry = () => fetchData();

  // حالة التحميل
  if (loading && !recentOrders.length) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (<StatCard key={i} label="" value={0} icon={ShoppingBag} color="" loading />))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.welcome} {session?.user?.firstName || session?.user?.lastName || t.guest} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.dashboardDesc}</p>
        </div>
        <Link href="/marketplace" className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium hover:from-sky-600 hover:to-blue-700 transition-all shadow-sm cursor-pointer inline-flex items-center justify-center">
          {t.browseProducts}
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button onClick={handleRetry} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer">
            <RefreshCw className="w-4 h-4" />
            {t.retry}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.stats.totalOrders} value={stats.totalOrders} icon={ShoppingBag} color="text-blue-600 bg-blue-50 dark:bg-blue-900/30" loading={loading} />
        <StatCard label={t.stats.pending} value={stats.pendingOrders} icon={Clock} color="text-orange-600 bg-orange-50 dark:bg-orange-900/30" loading={loading} />
        <StatCard label={t.stats.spent} value={formatCurrency(stats.totalSpent)} icon={TrendingUp} color="text-green-600 bg-green-50 dark:bg-green-900/30" loading={loading} />
        <StatCard label={t.stats.wishlist} value={stats.wishlistCount} icon={Star} color="text-purple-600 bg-purple-50 dark:bg-purple-900/30" loading={loading} />
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.recentOrders}</h2>
          <Link href="/account/orders" className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors cursor-pointer">
            {t.viewAll} →
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{error || t.noOrders}</p>
            {!error && (
              <Link href="/marketplace" className="text-sky-600 dark:text-sky-400 hover:underline mt-2 inline-block cursor-pointer">
                {t.startShopping}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-mono font-bold text-gray-700 dark:text-gray-300 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    #{order.orderNumber}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.orderPrefix} #{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)} • {(order.items?.length || 0)} {t.products}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={order.status} t={t} />
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(typeof order.total === "number" ? order.total : parseFloat(String(order.total)))}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}