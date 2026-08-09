"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Eye, Repeat, Truck, Clock, AlertCircle, RefreshCw, ChevronDown } from "lucide-react";

// ==================== 📦 تعريف الأنواع محلياً ====================
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  total: number | string;
  createdAt: string;
  items: OrderItem[];
  trackingNumber?: string | null;
}

type OrderStatus = 
  | "PENDING" | "CONFIRMED" | "PROCESSING" 
  | "SHIPPED" | "DELIVERED" | "CANCELLED" 
  | "REFUNDED" | "RETURNED";

// ==================== 🔤 الترجمات الشاملة ====================
type Language = "ar" | "fr" | "en";

const translations: Record<Language, any> = {
  ar: {
    title: "طلباتي",
    subtitle: "تتبع حالة طلباتك وسجل المشتريات",
    filters: {
      all: "الكل",
      PENDING: "في الانتظار",
      CONFIRMED: "تم التأكيد",
      PROCESSING: "قيد المعالجة",
      SHIPPED: "تم الشحن",
      DELIVERED: "تم التوصيل",
      CANCELLED: "ملغي",
      REFUNDED: "تم الاسترداد",
      RETURNED: "تم الإرجاع",
    },
    orderPrefix: "طلب",
    items: "منتج",
    itemsPlural: "منتجات",
    actions: {
      details: "التفاصيل",
      reorder: "إعادة شراء",
      track: "تتبع الشحنة",
    },
    empty: "لا توجد طلبات في هذه الفئة",
    emptyAll: "لم تقم بأي طلبات بعد",
    startShopping: "ابدأ التسوق الآن",
    loading: "جاري تحميل الطلبات...",
    error: {
      load: "فشل جلب الطلبات",
      retry: "إعادة المحاولة",
    },
  },
  fr: {
    title: "Mes Commandes",
    subtitle: "Suivez l'état de vos commandes et l'historique des achats",
    filters: {
      all: "Toutes",
      PENDING: "En attente",
      CONFIRMED: "Confirmée",
      PROCESSING: "En traitement",
      SHIPPED: "Expédiée",
      DELIVERED: "Livré",
      CANCELLED: "Annulée",
      REFUNDED: "Remboursée",
      RETURNED: "Retournée",
    },
    orderPrefix: "Commande",
    items: "article",
    itemsPlural: "articles",
    actions: {
      details: "Détails",
      reorder: "Racheter",
      track: "Suivre le colis",
    },
    empty: "Aucune commande dans cette catégorie",
    emptyAll: "Vous n'avez pas encore passé de commandes",
    startShopping: "Commencer à acheter",
    loading: "Chargement des commandes...",
    error: {
      load: "Échec du chargement des commandes",
      retry: "Réessayer",
    },
  },
  en: {
    title: "My Orders",
    subtitle: "Track your orders and purchase history",
    filters: {
      all: "All",
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      PROCESSING: "Processing",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
      REFUNDED: "Refunded",
      RETURNED: "Returned",
    },
    orderPrefix: "Order",
    items: "item",
    itemsPlural: "items",
    actions: {
      details: "Details",
      reorder: "Reorder",
      track: "Track Package",
    },
    empty: "No orders in this category",
    emptyAll: "You haven't placed any orders yet",
    startShopping: "Start Shopping",
    loading: "Loading orders...",
    error: {
      load: "Failed to load orders",
      retry: "Retry",
    },
  },
};

// ==================== 🎨 مكون شارة الحالة ====================
function StatusBadge({ status, t }: { status: string; t: any }) {
  const config: Record<string, string> = {
    DELIVERED: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    SHIPPED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    PROCESSING: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
    CONFIRMED: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    PENDING: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    CANCELLED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    REFUNDED: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    RETURNED: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${config[status] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"}`}>
      {status === "SHIPPED" || status === "DELIVERED" ? <Truck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {t.filters[status] || status}
    </span>
  );
}

// ==================== 🎨 مكون بطاقة الطلب ====================
function OrderCard({ order, t, lang }: { order: Order; t: any; lang: Language }) {
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "number" ? amount : parseFloat(amount);
    return new Intl.NumberFormat(lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-US", {
      style: "currency", currency: "MAD", minimumFractionDigits: 0
    }).format(isNaN(num) ? 0 : num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  const itemCount = order.items?.length || 0;
  const itemLabel = itemCount === 1 ? t.items : t.itemsPlural;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 flex-shrink-0 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/50 transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {t.orderPrefix} #{order.orderNumber}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatDate(order.createdAt)} • {itemCount} {itemLabel}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:items-end gap-2">
          <StatusBadge status={order.status} t={t} />
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors cursor-pointer">
          <Eye className="w-3.5 h-3.5" />
          {t.actions.details}
        </button>
        
        {(order.status === "SHIPPED" || order.status === "DELIVERED") && order.trackingNumber && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer">
            <Truck className="w-3.5 h-3.5" />
            {t.actions.track}
          </button>
        )}
        
        {order.status === "DELIVERED" && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
            <Repeat className="w-3.5 h-3.5" />
            {t.actions.reorder}
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== 🏠 المكون الرئيسي ====================
export default function OrdersPage() {
  const [lang, setLang] = useState<Language>("ar");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Language;
    if (savedLang && ["ar", "fr", "en"].includes(savedLang)) {
      setLang(savedLang);
    }
  }, []);

  // 🔹 جلب الطلبات
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/orders");
      const result = await response.json();
      
      if (response.ok && result.success && Array.isArray(result.data?.orders)) {
        setOrders(result.data.orders);
      } else {
        setError(result.error || t.error.load);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(t.error.load);
    } finally {
      setLoading(false);
    }
  }, [t.error.load]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 🔹 فلترة الطلبات
  useEffect(() => {
    if (filter === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === filter));
    }
  }, [filter, orders]);

  // 🔹 قائمة الفلاتر المتاحة
  const availableFilters = ["all", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  // 🔹 حالة التحميل (Skeleton)
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="hidden sm:flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
        {availableFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              filter === f
                ? "bg-sky-500 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {t.filters[f]}
            {f !== "all" && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === f ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"
              }`}>
                {orders.filter(o => o.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            {t.error.retry}
          </button>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {filter === "all" ? t.emptyAll : t.empty}
          </h3>
          {filter === "all" && (
            <a href="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium hover:from-sky-600 hover:to-blue-700 transition-all cursor-pointer mt-2">
              {t.startShopping}
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} t={t} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}