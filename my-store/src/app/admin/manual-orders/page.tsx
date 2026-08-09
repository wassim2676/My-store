"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  ChevronDown, ChevronUp, Phone, Mail, MapPin, Package, 
  Download, Search, AlertCircle, RefreshCw, Loader2, Filter, X,
  Calendar, CheckCircle, Clock, AlertTriangle, User, CreditCard,
  Edit, Trash2, ArrowLeft, Layers, DollarSign, TrendingUp
} from "lucide-react";

// ==================== 📦 تعريف الأنواع ====================
type CallStatus = "NOT_CALLED" | "CALLED_SUCCESS" | "CALL_FAILED" | "CALL_LATER";
type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" | "RETURNED";
type PaymentMethod = "COD" | "STRIPE";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
type ToastType = "success" | "error" | "info";

interface ManualOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  phone: string;
  email?: string | null;
  country: string;
  city: string;
  address: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  callStatus: CallStatus;
  customerNote?: string | null;
  adminNotes?: string | null;
  sourcePage?: string | null;
  createdAt: string;
  updatedAt: string;
  calledAt?: string | null;
  cancelledAt?: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Filters {
  status: OrderStatus | "all";
  callStatus: CallStatus | "all";
  paymentStatus: PaymentStatus | "all";
  search: string;
  dateFrom: string;
  dateTo: string;
  city: string;
  country: string;
  productType: string;
  minTotal: string;
  maxTotal: string;
}

// ==================== 🎨 ثوابت الواجهة ====================
const CALL_STATUS_OPTIONS: { value: CallStatus | "all"; label: string; color: string; icon: any }[] = [
  { value: "all", label: "All Calls", color: "bg-gray-100 text-gray-700", icon: null },
  { value: "NOT_CALLED", label: "Not Called", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: Clock },
  { value: "CALLED_SUCCESS", label: "Called ✓", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  { value: "CALL_FAILED", label: "Failed ✗", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: X },
  { value: "CALL_LATER", label: "Call Later ⏰", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
];

const ORDER_STATUS_OPTIONS: { value: OrderStatus | "all"; label: string; color: string; icon: any }[] = [
  { value: "all", label: "All Orders", color: "bg-gray-100 text-gray-700", icon: null },
  { value: "PENDING", label: "Pending", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  { value: "CONFIRMED", label: "Confirmed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle },
  { value: "PROCESSING", label: "Processing", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", icon: Package },
  { value: "SHIPPED", label: "Shipped", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400", icon: Package },
  { value: "DELIVERED", label: "Delivered", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: X },
  { value: "REFUNDED", label: "Refunded", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: AlertTriangle },
  { value: "RETURNED", label: "Returned", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: AlertTriangle },
];

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus | "all"; label: string; color: string; icon: any }[] = [
  { value: "all", label: "All Payments", color: "bg-gray-100 text-gray-700", icon: null },
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  { value: "PAID", label: "Paid ✓", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  { value: "FAILED", label: "Failed ✗", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: X },
  { value: "REFUNDED", label: "Refunded", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: AlertTriangle },
];

const CITIES = ["All", "Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir", "Other"];
const COUNTRIES = ["All", "Morocco", "Algeria", "Tunisia", "Saudi Arabia", "UAE", "Other"];
const PRODUCT_TYPES = ["All", "Vijara Plus - 1 Box", "Vijara Plus - 2 Boxes", "Vijara Plus - 3 Boxes", "Other"];

// ==================== 🎨 مكون Toast ====================
function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: "bg-emerald-500", border: "border-emerald-600", icon: CheckCircle },
    error: { bg: "bg-red-500", border: "border-red-600", icon: AlertCircle },
    info: { bg: "bg-blue-500", border: "border-blue-600", icon: AlertCircle },
  };

  const { bg, border, icon: Icon } = config[type];

  return (
    <div className={`fixed top-4 end-4 z-[100] ${bg} ${border} border text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top fade-in duration-300 max-w-sm`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ==================== 🎨 مكون شارة الحالة ====================
function StatusBadge({ status, type }: { status: string; type: "order" | "call" | "payment" }) {
  const options = type === "order" ? ORDER_STATUS_OPTIONS : type === "call" ? CALL_STATUS_OPTIONS : PAYMENT_STATUS_OPTIONS;
  const option = options.find(o => o.value === status) || options[0];
  const Icon = option.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${option.color} dark:bg-opacity-30`}>
      {Icon && <Icon className="w-3 h-3" />}
      {option.label}
    </span>
  );
}

// ==================== 🎨 مكون الترقيم الاحترافي ====================
function Pagination({ pagination, onPageChange }: { pagination: Pagination; onPageChange: (page: number) => void }) {
  const { page, totalPages, hasPrev, hasNext } = pagination;
  
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Page <span className="font-medium text-gray-900 dark:text-white">{page}</span> of{" "}
        <span className="font-medium text-gray-900 dark:text-white">{totalPages}</span>
      </p>
      
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={!hasPrev} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
          « First
        </button>
        <button onClick={() => onPageChange(page - 1)} disabled={!hasPrev} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
          ‹ Prev
        </button>
        {getPageNumbers().map((num, idx) => (
          num === "..." ? (
            <span key={`dots-${idx}`} className="px-3 py-2 text-gray-400">...</span>
          ) : (
            <button key={num} onClick={() => onPageChange(num as number)} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${page === num ? "bg-sky-600 text-white" : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
              {num}
            </button>
          )
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={!hasNext} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
          Next ›
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={!hasNext} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
          Last »
        </button>
      </div>
    </div>
  );
}

// ==================== 🎨 مكون لوحة الفلاتر ====================
function FilterPanel({ filters, onFilterChange, onReset, cities, countries, productTypes }: { 
  filters: Filters; 
  onFilterChange: (key: keyof Filters, value: string) => void;
  onReset: () => void;
  cities: string[];
  countries: string[];
  productTypes: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasActiveFilters = useMemo(() => {
    return filters.status !== "all" || filters.callStatus !== "all" || filters.paymentStatus !== "all" ||
           filters.dateFrom || filters.dateTo || filters.city !== "All" || filters.country !== "All" ||
           filters.productType !== "All" || filters.minTotal || filters.maxTotal;
  }, [filters]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 rounded-full">Active</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Order Status</label>
              <select value={filters.status} onChange={(e) => onFilterChange("status", e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer">
                {ORDER_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Call Status</label>
              <select value={filters.callStatus} onChange={(e) => onFilterChange("callStatus", e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer">
                {CALL_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Status</label>
              <select value={filters.paymentStatus} onChange={(e) => onFilterChange("paymentStatus", e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer">
                {PAYMENT_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">City</label>
              <select value={filters.city} onChange={(e) => onFilterChange("city", e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer">
                {cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Country</label>
              <select value={filters.country} onChange={(e) => onFilterChange("country", e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer">
                {countries.map(country => <option key={country} value={country}>{country}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Product Type</label>
              <select value={filters.productType} onChange={(e) => onFilterChange("productType", e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer">
                {productTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date From</label>
              <input type="date" value={filters.dateFrom} onChange={(e) => onFilterChange("dateFrom", e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-text" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date To</label>
              <input type="date" value={filters.dateTo} onChange={(e) => onFilterChange("dateTo", e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-text" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Min Total (MAD)</label>
              <input type="number" value={filters.minTotal} onChange={(e) => onFilterChange("minTotal", e.target.value)} placeholder="0" min="0" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-text" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max Total (MAD)</label>
              <input type="number" value={filters.maxTotal} onChange={(e) => onFilterChange("maxTotal", e.target.value)} placeholder="10000" min="0" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-text" />
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button onClick={onReset} disabled={!hasActiveFilters} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              Reset Filters
            </button>
            <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 🏠 المكون الرئيسي ====================
export default function ManualOrdersPage() {
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // التحكم في عرض المصادر أو الطلبات التفصيلية
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  
  // أنظمة المودال للتعديل والحذف
  const [editingOrder, setEditingOrder] = useState<ManualOrder | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const [filters, setFilters] = useState<Filters>({
    status: "all", callStatus: "all", paymentStatus: "all", search: "",
    dateFrom: "", dateTo: "", city: "All", country: "All", productType: "All", minTotal: "", maxTotal: ""
  });

  const toggleExpand = (id: string) => setExpandedId(prevId => (prevId === id ? null : id));

  const formatCurrency = useCallback((amount: number | string | null | undefined) => {
    if (amount == null) return "0 MAD";
    const num = typeof amount === "number" ? amount : parseFloat(String(amount));
    if (isNaN(num)) return "0 MAD";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "MAD", minimumFractionDigits: 0 }).format(num);
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
      });
    } catch { return dateStr; }
  }, []);

  // جلب البيانات بالكامل (limit كبير للفلترة المحلية حسب المصدر)
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/manual-orders?limit=1000", {
        cache: "no-store",
        headers: { "Accept": "application/json" },
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setOrders(result.data.orders || []);
      } else if (result.error && response.status !== 404) {
        setError(result.error);
      }
    } catch (err) {
      setError("Connection issue. Please check your internet.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ==================== ✅ الحساب الصحيح للإيرادات ====================
  const sourceGroups = useMemo(() => {
    const groups: Record<string, { 
      count: number; 
      totalSales: number; 
      pendingOrders: number; 
      lastOrderDate: string;
      successRate: number;
    }> = {};
    
    orders.forEach(order => {
      const source = order.sourcePage || "Direct / Unknown";
      if (!groups[source]) {
        groups[source] = { 
          count: 0, 
          totalSales: 0, 
          pendingOrders: 0, 
          lastOrderDate: order.createdAt, 
          successRate: 0 
        };
      }
      groups[source].count += 1;
      
      // ✅ التصحيح: تحويل totalPrice إلى رقم قبل الجمع
      const orderTotal = typeof order.totalPrice === 'number' 
        ? order.totalPrice 
        : parseFloat(String(order.totalPrice).replace(/,/g, '')) || 0;
      
      groups[source].totalSales += orderTotal;
      
      if (order.status === "PENDING") {
        groups[source].pendingOrders += 1;
      }
      if (new Date(order.createdAt) > new Date(groups[source].lastOrderDate)) {
        groups[source].lastOrderDate = order.createdAt;
      }
    });

    // حساب نسبة النجاح
    Object.keys(groups).forEach(source => {
      const deliveredCount = orders.filter(
        o => (o.sourcePage || "Direct / Unknown") === source && o.status === "DELIVERED"
      ).length;
      groups[source].successRate = Math.round((deliveredCount / groups[source].count) * 100);
    });

    return groups;
  }, [orders]);

  // فلترة الطلبات بناء على المصدر المختار والفلاتر الأخرى
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (selectedSource && (order.sourcePage || "Direct / Unknown") !== selectedSource) return false;
      if (filters.status !== "all" && order.status !== filters.status) return false;
      if (filters.callStatus !== "all" && order.callStatus !== filters.callStatus) return false;
      if (filters.paymentStatus !== "all" && order.paymentStatus !== filters.paymentStatus) return false;
      if (filters.city !== "All" && order.city !== filters.city) return false;
      if (filters.country !== "All" && order.country !== filters.country) return false;
      if (filters.productType !== "All" && order.productType !== filters.productType) return false;
      
      if (filters.search.trim()) {
        const s = filters.search.toLowerCase();
        return order.customerName.toLowerCase().includes(s) || 
               order.phone.includes(s) || 
               (order.email && order.email.toLowerCase().includes(s)) ||
               order.orderNumber.toString().includes(s);
      }
      return true;
    });
  }, [orders, selectedSource, filters]);

  // تحديث سريع وحي للحالات عبر الـ API
  const updateStatus = async (id: string, type: "call" | "order" | "payment", value: string) => {
    setUpdatingId(id);
    try {
      const field = type === "call" ? "callStatus" : type === "payment" ? "paymentStatus" : "status";
      const response = await fetch(`/api/manual-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      
      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: value as any } : o));
        setToast({ message: "✅ تم تحديث الحالة بنجاح", type: "success" });
      } else {
        const res = await response.json();
        setToast({ message: res.error || "فشل التحديث", type: "error" });
      }
    } catch (err) {
      setToast({ message: "خطأ أثناء تحديث الحالة", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  // تعديل الطلب بالكامل
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      setUpdatingId(editingOrder.id);
      const response = await fetch(`/api/manual-orders/${editingOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingOrder),
      });

      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === editingOrder.id ? editingOrder : o));
        setEditingOrder(null);
        setToast({ message: "✅ تم حفظ التعديلات بنجاح", type: "success" });
      } else {
        setToast({ message: "فشل في حفظ التعديلات", type: "error" });
      }
    } catch (err) {
      setToast({ message: "حدث خطأ أثناء تعديل البيانات", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  // حذف الطلب
  const handleDeleteOrder = async (id: string) => {
    try {
      setUpdatingId(id);
      const response = await fetch(`/api/manual-orders/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOrders(prev => prev.filter(o => o.id !== id));
        setDeletingId(null);
        setToast({ message: "✅ تم حذف الطلب بنجاح", type: "success" });
      } else {
        setToast({ message: "فشل في حذف الطلب", type: "error" });
      }
    } catch (err) {
      setToast({ message: "حدث خطأ أثناء الحذف", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCSV = useCallback(() => {
    const headers = ["Order #", "Customer", "Phone", "Email", "City", "Country", "Product", "Qty", "Total", "Source", "Order Status", "Call Status"];
    const rows = filteredOrders.map(o => [
      `#${o.orderNumber}`, o.customerName, o.phone, o.email || "", o.city, o.country, o.productType, o.quantity.toString(), formatCurrency(o.totalPrice), o.sourcePage || "Direct", o.status, o.callStatus
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${selectedSource || "all"}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setToast({ message: "✅ تم تصدير الملف بنجاح", type: "success" });
  }, [filteredOrders, formatCurrency, selectedSource]);

  // عرض اسم المصدر بشكل جميل
  const getSourceDisplayName = (source: string) => {
    const names: Record<string, string> = {
      "/product/vijara-plus": "Vijara Plus Product Page",
      "/": "Homepage",
      "/blog": "Blog Page",
      "/marketplace": "Marketplace",
      "Direct / Unknown": "Direct / Unknown",
    };
    return names[source] || source;
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      "/product/vijara-plus": "💊",
      "/": "",
      "/blog": "📝",
      "/marketplace": "🛒",
      "Direct / Unknown": "🔗",
    };
    return icons[source] || "📦";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manual Orders</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage customer requests • {orders.length} total orders • {Object.keys(sourceGroups).length} sources
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedSource && (
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
          <button
            onClick={() => fetchOrders()}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* ==================== 📊 عرض كروت المصادر (الصفحة الأولى) ==================== */}
      {!selectedSource ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">اختر مصدر الطلبات:</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{Object.keys(sourceGroups).length} مصدر متاح</span>
          </div>
          
          {Object.keys(sourceGroups).length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">لا توجد طلبات بعد</h3>
              <p className="text-gray-500 dark:text-gray-400">ستظهر المصادر هنا بعد استلام أول طلب من الموقع.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(sourceGroups)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([sourceName, data]) => (
                <div 
                  key={sourceName}
                  onClick={() => setSelectedSource(sourceName)}
                  className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-sky-300 dark:hover:border-sky-700 transition-all cursor-pointer group relative overflow-hidden"
                >
                  {/* شريط علوي متحرك */}
                  <div className="absolute top-0 start-0 h-1 w-full bg-gradient-to-r from-sky-500 to-blue-600 group-hover:h-1.5 transition-all"></div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{getSourceIcon(sourceName)}</div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {getSourceDisplayName(sourceName)}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{data.count} {data.count === 1 ? "order" : "orders"}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 px-2.5 py-1 rounded-full">
                      Source Card
                    </span>
                  </div>

                  {/* إحصائيات المصدر */}
                  <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <DollarSign className="w-3.5 h-3.5" />
                        Revenue
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {formatCurrency(data.totalSales)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                      </div>
                      <p className="font-bold text-orange-600 dark:text-orange-400 text-sm">
                        {data.pendingOrders}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Success
                      </div>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {data.successRate}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        Last Order
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-xs">
                        {formatDate(data.lastOrderDate)}
                      </p>
                    </div>
                  </div>

                  {/* زر عرض الطلبات */}
                  <button className="w-full mt-4 py-2.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-lg font-medium hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors text-sm group-hover:bg-sky-600 group-hover:text-white">
                    View Orders →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // ====================  عرض الطلبات بعد اختيار المصدر ====================
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* زر العودة الذكي */}
          <button 
            onClick={() => {
              setSelectedSource(null);
              setFilters({
                status: "all", callStatus: "all", paymentStatus: "all", search: "",
                dateFrom: "", dateTo: "", city: "All", country: "All", productType: "All", minTotal: "", maxTotal: ""
              });
            }}
            className="inline-flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> العودة لكروت المصادر الرئيسية
          </button>

          {/* شريط معلومات المصدر الحالي */}
          <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-900 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getSourceIcon(selectedSource)}</span>
              <div>
                <span className="font-semibold text-sky-900 dark:text-sky-300 block">
                  {getSourceDisplayName(selectedSource)}
                </span>
                <span className="text-xs text-sky-700 dark:text-sky-400">
                  {sourceGroups[selectedSource]?.count || 0} طلب • {formatCurrency(sourceGroups[selectedSource]?.totalSales || 0)}
                </span>
              </div>
            </div>
            <span className="text-xs bg-sky-600 text-white px-3 py-1 rounded-full font-medium">
              {filteredOrders.length} طلب مفلتر
            </span>
          </div>

          {/* محرك البحث */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, phone, email, or order #..." 
              value={filters.search}
              onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && setFilters(p => ({ ...p }))}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all cursor-text" 
            />
          </div>

          {/* لوحة الفلاتر */}
          <FilterPanel 
            filters={filters}
            onFilterChange={(key, value) => setFilters(p => ({ ...p, [key]: value }))}
            onReset={() => setFilters({
              status: "all", callStatus: "all", paymentStatus: "all", search: "",
              dateFrom: "", dateTo: "", city: "All", country: "All", productType: "All", minTotal: "", maxTotal: ""
            })}
            cities={CITIES}
            countries={COUNTRIES}
            productTypes={PRODUCT_TYPES}
          />

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
              <button onClick={() => fetchOrders()} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer">
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          )}

          {/* قائمة الطلبات */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No orders found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters to find what you're looking for.</p>
              </div>
            ) : (
              filteredOrders.map((order, index) => (
                <div key={order.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  {/* Collapsible Header */}
                  <div 
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" 
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-sm">
                        {index + 1}
                      </div>
                      
                      <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 flex-shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 dark:text-white">#{order.orderNumber}</span>
                          <StatusBadge status={order.status} type="order" />
                          <StatusBadge status={order.callStatus} type="call" />
                          <StatusBadge status={order.paymentStatus} type="payment" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {order.customerName} • {order.city}{order.country && `, ${order.country}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:ml-auto">
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(order.totalPrice)}</p>
                        <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <button 
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                        aria-label={expandedId === order.id ? "Collapse" : "Expand details"}
                      >
                        {expandedId === order.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === order.id && (
                    <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                      <div className="grid md:grid-cols-2 gap-6">
                        
                        {/* Customer Details */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <User className="w-4 h-4" /> Customer Details
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                              <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" /> 
                              {order.email ? (
                                <a href={`mailto:${order.email}`} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer break-all">
                                  {order.email}
                                </a>
                              ) : (
                                <span className="text-gray-400 italic">Not provided</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                              <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" /> 
                              <a href={`tel:${order.phone}`} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer">
                                {order.phone}
                              </a>
                            </div>
                            <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" /> 
                              <span className="break-words">{order.address}, {order.city}, {order.country}</span>
                            </div>
                          </div>
                          
                          {/* Product Details */}
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Package className="w-4 h-4" /> Product Details
                            </h5>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Product Type</p>
                                <p className="font-medium text-gray-900 dark:text-white">{order.productType}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Quantity</p>
                                <p className="font-medium text-gray-900 dark:text-white">{order.quantity}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Unit Price</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(order.unitPrice)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Total Price</p>
                                <p className="font-bold text-sky-600 dark:text-sky-400">{formatCurrency(order.totalPrice)}</p>
                              </div>
                            </div>
                          </div>
                          
                          {order.customerNote && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
                              <p className="text-yellow-800 dark:text-yellow-200">
                                <span className="font-medium">📝 Customer Note:</span> {order.customerNote}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Status Controls */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                              <Package className="w-3 h-3" /> Order Status
                            </label>
                            <select 
                              value={order.status} 
                              onChange={(e) => updateStatus(order.id, "order", e.target.value)}
                              disabled={updatingId === order.id}
                              className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {ORDER_STATUS_OPTIONS.filter(o => o.value !== "all").map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> Call Status
                            </label>
                            <select 
                              value={order.callStatus} 
                              onChange={(e) => updateStatus(order.id, "call", e.target.value)}
                              disabled={updatingId === order.id}
                              className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {CALL_STATUS_OPTIONS.filter(o => o.value !== "all").map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" /> Payment Status
                            </label>
                            <select 
                              value={order.paymentStatus} 
                              onChange={(e) => updateStatus(order.id, "payment", e.target.value)}
                              disabled={updatingId === order.id}
                              className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {PAYMENT_STATUS_OPTIONS.filter(o => o.value !== "all").map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              {order.paymentMethod === "COD" ? "💵" : "💳"} {order.paymentMethod}
                            </p>
                          </div>
                          
                          {order.adminNotes && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                              <p className="text-blue-800 dark:text-blue-200">
                                <span className="font-medium">🔧 Admin Notes:</span> {order.adminNotes}
                              </p>
                            </div>
                          )}
                          
                          {order.sourcePage && (
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm">
                              <p className="text-purple-800 dark:text-purple-200">
                                <span className="font-medium">📍 Source:</span> {order.sourcePage}
                              </p>
                            </div>
                          )}

                          {/* أزرار التعديل والحذف */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => setEditingOrder(order)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors cursor-pointer text-sm font-medium"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Order
                            </button>
                            <button
                              onClick={() => setDeletingId(order.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                          
                          {updatingId === order.id && (
                            <div className="flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving changes...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================== 🛠️ مودال تعديل الطلب ==================== */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto shadow-xl p-6 relative">
            <button 
              onClick={() => setEditingOrder(null)}
              className="absolute top-4 end-4 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-800">
              Edit Order #{editingOrder.orderNumber}
            </h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Customer Name *</label>
                  <input 
                    type="text" required
                    value={editingOrder.customerName}
                    onChange={e => setEditingOrder({...editingOrder, customerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Phone *</label>
                  <input 
                    type="text" required
                    value={editingOrder.phone}
                    onChange={e => setEditingOrder({...editingOrder, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Email</label>
                  <input 
                    type="email"
                    value={editingOrder.email || ""}
                    onChange={e => setEditingOrder({...editingOrder, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Country *</label>
                  <input 
                    type="text" required
                    value={editingOrder.country}
                    onChange={e => setEditingOrder({...editingOrder, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">City *</label>
                  <input 
                    type="text" required
                    value={editingOrder.city}
                    onChange={e => setEditingOrder({...editingOrder, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Source Page</label>
                  <input 
                    type="text"
                    value={editingOrder.sourcePage || ""}
                    onChange={e => setEditingOrder({...editingOrder, sourcePage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Address *</label>
                  <input 
                    type="text" required
                    value={editingOrder.address}
                    onChange={e => setEditingOrder({...editingOrder, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Product Type *</label>
                  <input 
                    type="text" required
                    value={editingOrder.productType}
                    onChange={e => setEditingOrder({...editingOrder, productType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Quantity *</label>
                    <input 
                      type="number" required min="1"
                      value={editingOrder.quantity}
                      onChange={e => {
                        const qty = parseInt(e.target.value) || 0;
                        setEditingOrder({...editingOrder, quantity: qty, totalPrice: qty * editingOrder.unitPrice});
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Unit Price *</label>
                    <input 
                      type="number" required step="0.01"
                      value={editingOrder.unitPrice}
                      onChange={e => {
                        const price = parseFloat(e.target.value) || 0;
                        setEditingOrder({...editingOrder, unitPrice: price, totalPrice: editingOrder.quantity * price});
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Admin Notes</label>
                  <textarea
                    value={editingOrder.adminNotes || ""}
                    onChange={e => setEditingOrder({...editingOrder, adminNotes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Total (Auto-calculated)</label>
                  <div className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg font-bold text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700">
                    {formatCurrency(editingOrder.totalPrice)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button 
                  type="button" onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={updatingId === editingOrder.id}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingId === editingOrder.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 🗑️ نافذة تأكيد الحذف ==================== */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h4 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Delete this order?</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This action is permanent and cannot be undone.</p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteOrder(deletingId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Yes, Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}