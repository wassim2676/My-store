"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  ShoppingCart, DollarSign, Users, Package, TrendingUp, TrendingDown, 
  Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, AlertCircle 
} from "lucide-react";
import Link from "next/link";

// ==================== 📦 تعريف الأنواع المتوافقة مع API ====================

interface DashboardStats {
  summary: {
    totalOrders: number;
    revenue: number;
    customers: number;
    products: number;
  };
  orderBreakdown: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  alerts: {
    lowStockProducts: number;
    pendingOrdersCount: number;
  };
  trends: {
    ordersLast30Days: number;
    revenueLast30Days: number;
  };
  meta: {
    period: string;
    generatedAt: string;
    currency: string;
  };
}

interface Order {
  id: string;
  orderNumber: number;
  customerName?: string | null;
  guestEmail?: string | null;
  guestFirstName?: string | null;
  guestLastName?: string | null;
  phone?: string | null;
  total: number | string;
  currency?: string;
  status: string;
  callStatus?: string;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    items?: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

// ==================== 🎨 مكون بطاقة الإحصائيات ====================

function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color,
  loading 
}: { 
  title: string; 
  value: string | number; 
  change?: number; 
  changeType?: "up" | "down"; 
  icon: React.ElementType; 
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            changeType === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}>
            {changeType === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change > 0 ? "+" : ""}{change}%
          </div>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse"></div>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
        </>
      )}
    </div>
  );
}

// ==================== 🎨 مكون شارة الحالة ====================

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
    CONFIRMED: { label: "Confirmed", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
    PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
    SHIPPED: { label: "Shipped", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400", icon: Clock },
    DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
    REFUNDED: { label: "Refunded", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: AlertTriangle },
    RETURNED: { label: "Returned", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", icon: AlertTriangle },
  };

  const { label, color, icon: Icon } = config[status] || { 
    label: status, 
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400", 
    icon: Clock 
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ==================== 🏠 المكون الرئيسي ====================

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 🔹 تنسيق العملة
  const formatCurrency = useCallback((amount: number | string | null | undefined) => {
    if (amount == null) return "0 MAD";
    const num = typeof amount === "number" ? amount : parseFloat(String(amount));
    if (isNaN(num)) return "0 MAD";
    return new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency: "MAD", 
      minimumFractionDigits: 0 
    }).format(num);
  }, []);

  // 🔹 تنسيق التاريخ
  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }, []);

  // 🔹 استخراج اسم العميل
  const getCustomerName = useCallback((order: Order) => {
    if (order.customerName) return order.customerName;
    const name = `${order.guestFirstName || ""} ${order.guestLastName || ""}`.trim();
    if (name) return name;
    if (order.guestEmail) return order.guestEmail;
    return "Guest Customer";
  }, []);

  // 🔹 جلب بيانات لوحة التحكم
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب الإحصائيات
      const statsRes = await fetch("/api/admin/stats", {
        cache: "no-store", // منع الكاش لضمان بيانات حديثة
        headers: { "Accept": "application/json" },
      });

      if (statsRes.ok) {
        const statsData: ApiResponse<DashboardStats> = await statsRes.json();
        if (statsData.success && statsData.data) {
          setStats(statsData.data);
        } else if (statsData.error) {
          // عرض خطأ محدد فقط إذا كان هناك رسالة واضحة
          if (statsData.error !== "Unauthorized") {
            setError(statsData.error);
          }
        }
      } else if (statsRes.status === 401) {
        // لا تعرض خطأ للمستخدم - سيتم توجيهه تلقائياً عبر middleware
        setError("Please log in as admin to view this page");
      } else if (statsRes.status !== 404) {
        // تجاهل 404 (قد يكون المسار غير موجود بعد)
        setError("Unable to load statistics");
      }

      // جلب آخر الطلبات اليدوية
      const ordersRes = await fetch("/api/admin/manual-orders?limit=5&status=all", {
        cache: "no-store",
        headers: { "Accept": "application/json" },
      });

      if (ordersRes.ok) {
        const ordersData: ApiResponse<{ orders: Order[] }> = await ordersRes.json();
        if (ordersData.success && Array.isArray(ordersData.data?.orders)) {
          setRecentOrders(ordersData.data.orders);
        }
      }
      // تجاهل أخطاء الطلبات بصمت - لا نريد إزعاج المستخدم

    } catch (err) {
      // تسجيل الخطأ للتطوير فقط، لا نعرضه للمستخدم
      console.error("Dashboard fetch error:", err);
      // لا نعرض خطأ "network" للمستخدم إلا بعد عدة محاولات
      if (retryCount >= 2) {
        setError("Connection issue. Please check your internet.");
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  // 🔹 جلب البيانات عند التحميل
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 🔹 إعادة المحاولة عند الخطأ (بحد أقصى 3 محاولات)
  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      fetchDashboardData();
    } else {
      setRetryCount(0);
      fetchDashboardData();
    }
  };

  // 🔹 حالة التحميل الأولية
  if (loading && !stats) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <StatCard key={i} title="" value={0} icon={ShoppingCart} color="" loading />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Monitor your store's performance and recent activity.</p>
      </div>

      {/* Error Alert - يظهر فقط عند وجود خطأ حقيقي */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats?.summary?.totalOrders ?? 0}
          change={12.5}
          changeType="up"
          icon={ShoppingCart}
          color="bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
          loading={loading}
        />
        <StatCard
          title="Total Revenue"
          value={stats ? formatCurrency(stats.summary?.revenue) : "..."}
          change={8.2}
          changeType="up"
          icon={DollarSign}
          color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          loading={loading}
        />
        <StatCard
          title="Total Customers"
          value={stats?.summary?.customers ?? 0}
          change={5.1}
          changeType="up"
          icon={Users}
          color="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          loading={loading}
        />
        <StatCard
          title="Active Products"
          value={stats?.summary?.products ?? 0}
          change={-2.4}
          changeType="down"
          icon={Package}
          color="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Manual Orders</h2>
            <Link 
              href="/admin/manual-orders" 
              className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors cursor-pointer"
            >
              View all →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No recent manual orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-lg">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">{getCustomerName(order)}</div>
                        {order.guestEmail && !order.customerName && (
                          <div className="text-xs text-gray-500">{order.guestEmail}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Status Breakdown</h2>
          <div className="space-y-4">
            {[
              { key: "pending", label: "Pending", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
              { key: "confirmed", label: "Confirmed", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
              { key: "processing", label: "Processing", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
              { key: "cancelled", label: "Cancelled", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
            ].map((item) => (
              <div 
                key={item.key} 
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.bg.replace("bg-", "bg-").replace("50", "500").replace("900/20", "500")}`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats?.orderBreakdown?.[item.key as keyof typeof stats.orderBreakdown] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}