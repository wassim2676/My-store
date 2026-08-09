"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, Filter, MoreHorizontal, Shield, User, Ban, CheckCircle,
  X, Edit, Trash2, RefreshCw, AlertCircle, Loader2, ChevronDown,
  Calendar, Mail, Phone, MapPin, Eye, Download
} from "lucide-react";

// ==================== 📦 تعريف الأنواع ====================
interface UserData {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    orders?: number;
  };
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
  search: string;
  role: "all" | "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "all" | "active" | "inactive";
  dateFrom: string;
  dateTo: string;
  hasOrders: "all" | "true" | "false";
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

// ==================== 🎨 ثوابت الواجهة ====================
const ROLE_OPTIONS: { value: "all" | "USER" | "ADMIN" | "SUPER_ADMIN"; label: string; color: string; icon: any }[] = [
  { value: "all", label: "All Roles", color: "bg-gray-100 text-gray-700", icon: null },
  { value: "USER", label: "Customer", color: "bg-blue-100 text-blue-700", icon: User },
  { value: "ADMIN", label: "Admin", color: "bg-purple-100 text-purple-700", icon: Shield },
  { value: "SUPER_ADMIN", label: "Super Admin", color: "bg-red-100 text-red-700", icon: Shield },
];

const STATUS_OPTIONS: { value: "all" | "active" | "inactive"; label: string; color: string; icon: any }[] = [
  { value: "all", label: "All Status", color: "bg-gray-100 text-gray-700", icon: null },
  { value: "active", label: "Active", color: "bg-green-100 text-green-700", icon: CheckCircle },
  { value: "inactive", label: "Inactive", color: "bg-red-100 text-red-700", icon: Ban },
];

// ==================== 🎨 مكون شارة الدور ====================
function RoleBadge({ role }: { role: string }) {
  const option = ROLE_OPTIONS.find(o => o.value === role) || ROLE_OPTIONS[1];
  const Icon = option.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${option.color} dark:bg-opacity-30`}>
      {Icon && <Icon className="w-3 h-3" />}
      {option.label}
    </span>
  );
}

// ==================== 🎨 مكون شارة الحالة ====================
function StatusBadge({ active, onToggle, disabled }: { active: boolean; onToggle?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
        active 
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50" 
          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      title={active ? "Click to deactivate" : "Click to activate"}
    >
      {active ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
      {active ? "Active" : "Inactive"}
    </button>
  );
}

// ==================== 🎨 مكون الترقيم الاحترافي ====================
function Pagination({ 
  pagination, 
  onPageChange 
}: { 
  pagination: Pagination; 
  onPageChange: (page: number) => void;
}) {
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
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrev}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          « First
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          ‹ Prev
        </button>
        {getPageNumbers().map((num, idx) => (
          num === "..." ? (
            <span key={`dots-${idx}`} className="px-3 py-2 text-gray-400">...</span>
          ) : (
            <button
              key={num}
              onClick={() => onPageChange(num as number)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                page === num
                  ? "bg-sky-600 text-white"
                  : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {num}
            </button>
          )
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Next ›
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Last »
        </button>
      </div>
    </div>
  );
}

// ==================== 🎨 مكون لوحة الفلاتر ====================
function FilterPanel({ 
  filters, 
  onFilterChange, 
  onReset 
}: { 
  filters: Filters; 
  onFilterChange: (key: keyof Filters, value: string) => void;
  onReset: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasActiveFilters = useMemo(() => {
    return filters.role !== "all" || 
           filters.status !== "all" || 
           filters.dateFrom || 
           filters.dateTo ||
           filters.hasOrders !== "all";
  }, [filters]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 rounded-full">
              Active
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
              <select
                value={filters.role}
                onChange={(e) => onFilterChange("role", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
              >
                {ROLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => onFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            {/* Has Orders */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Has Orders</label>
              <select
                value={filters.hasOrders}
                onChange={(e) => onFilterChange("hasOrders", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
              >
                <option value="all">All</option>
                <option value="true">With Orders</option>
                <option value="false">No Orders</option>
              </select>
            </div>
            
            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Joined From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFilterChange("dateFrom", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-text"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Joined To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFilterChange("dateTo", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-text"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={onReset}
              disabled={!hasActiveFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 🎨 مكون قائمة الإجراءات ====================
function UserActions({ 
  user, 
  onEdit, 
  onToggleStatus, 
  onDelete 
}: { 
  user: UserData; 
  onEdit: (user: UserData) => void;
  onToggleStatus: (user: UserData) => void;
  onDelete: (user: UserData) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const isCurrentUser = false; // يمكن تحديده من الجلسة
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
        title="More actions"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 py-1">
            <button
              onClick={() => { onEdit(user); setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => { onToggleStatus(user); setIsOpen(false); }}
              disabled={isCurrentUser}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm cursor-pointer ${
                user.isActive 
                  ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                  : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              } ${isCurrentUser ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              {user.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => { onDelete(user); setIsOpen(false); }}
              disabled={isAdmin || isCurrentUser}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer ${
                (isAdmin || isCurrentUser) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== 🎨 مكون تأكيد الحذف ====================
function DeleteConfirmModal({ 
  user, 
  onConfirm, 
  onCancel 
}: { 
  user: UserData | null; 
  onConfirm: () => void; 
  onCancel: () => void;
}) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete User</h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{user.firstName} {user.lastName}</strong>? 
          {user._count?.orders && user._count.orders > 0 && (
            <span className="block mt-2 text-red-600 dark:text-red-400">
              ⚠️ This user has {user._count.orders} order(s). Deletion may affect order history.
            </span>
          )}
        </p>
        
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 🏠 المكون الرئيسي ====================
export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false
  });
  
  const [filters, setFilters] = useState<Filters>({
    search: "",
    role: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
    hasOrders: "all",
  });
  
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  // 🔹 تنسيق التاريخ
  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      });
    } catch {
      return dateStr;
    }
  }, []);

  // 🔹 استخراج اسم المستخدم الكامل
  const getFullName = useCallback((user: UserData) => {
    const first = user.firstName || "";
    const last = user.lastName || "";
    const name = `${first} ${last}`.trim();
    return name || user.email.split("@")[0] || "Unknown";
  }, []);

  // 🔹 بناء معلمات البحث
  const buildQueryParams = useCallback((page: number) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", "20");
    
    if (filters.search.trim()) params.append("search", filters.search.trim());
    if (filters.role !== "all") params.append("role", filters.role);
    if (filters.status !== "all") params.append("isActive", filters.status === "active" ? "true" : "false");
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    if (filters.hasOrders !== "all") {
      params.append("hasOrders", filters.hasOrders);
    }
    
    return params.toString();
  }, [filters]);

  // 🔹 جلب المستخدمين من API
  const fetchUsers = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = buildQueryParams(page);
      const response = await fetch(`/api/admin/users?${queryParams}`, {
        cache: "no-store",
        headers: { "Accept": "application/json" },
      });
      
      const result: ApiResponse<{ users: UserData[]; pagination: Pagination }> = await response.json();
      
      if (response.ok && result.success) {
        setUsers(result.data?.users || []);
        setPagination(result.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false });
      } else if (result.error && response.status !== 404) {
        setError(result.error);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Connection issue. Please check your internet.");
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // 🔹 تحميل البيانات الأولية
  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // 🔹 تحديث فلتر
  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // 🔹 إعادة تعيين الفلاتر
  const handleResetFilters = useCallback(() => {
    setFilters({
      search: "",
      role: "all",
      status: "all",
      dateFrom: "",
      dateTo: "",
      hasOrders: "all",
    });
    fetchUsers(1);
  }, [fetchUsers]);

  // 🔹 تغيير الصفحة
  const handlePageChange = useCallback((page: number) => {
    fetchUsers(page);
  }, [fetchUsers]);

  // 🔹 تبديل حالة المستخدم (حظر/إلغاء حظر)
  const handleToggleStatus = async (user: UserData) => {
    setUpdatingId(user.id);
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      
      if (response.ok) {
        // تحديث محلي فوري
        setUsers(prev => prev.map(u => 
          u.id === user.id ? { ...u, isActive: !u.isActive } : u
        ));
      } else {
        const result = await response.json();
        setError(result.error || "Failed to update user status");
        fetchUsers(pagination.page);
      }
    } catch (err) {
      console.error("Toggle status error:", err);
      setError("Failed to update user");
      fetchUsers(pagination.page);
    } finally {
      setUpdatingId(null);
    }
  };

  // 🔹 حذف مستخدم
  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    
    try {
      const response = await fetch(`/api/admin/users/${deleteUser.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
        setDeleteUser(null);
      } else {
        const result = await response.json();
        setError(result.error || "Failed to delete user");
        fetchUsers(pagination.page);
      }
    } catch (err) {
      console.error("Delete user error:", err);
      setError("Failed to delete user");
      fetchUsers(pagination.page);
    }
  };

  // 🔹 تصدير CSV
  const handleExportCSV = useCallback(() => {
    const headers = ["ID", "Name", "Email", "Phone", "Role", "Status", "Orders", "Joined"];
    const rows = users.map(u => [
      u.id,
      getFullName(u),
      u.email,
      u.phone || "",
      u.role,
      u.isActive ? "Active" : "Inactive",
      u._count?.orders?.toString() || "0",
      new Date(u.createdAt).toLocaleDateString(),
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [users, getFullName]);

  // 🔹 حالة التحميل
  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {["User", "Role", "Status", "Joined", "Actions"].map((h, i) => (
                    <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </td>
                    {[1, 2, 3].map((j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View and manage registered users • {pagination.total} total
          </p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={users.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by name, email, or phone..." 
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchUsers(1)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all cursor-text" 
        />
      </div>

      {/* Filter Panel */}
      <FilterPanel 
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={() => fetchUsers(pagination.page)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {filters.search || filters.role !== "all" ? "No users found" : "No users yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              {filters.search || filters.role !== "all" 
                ? "Try adjusting your filters to find what you're looking for." 
                : "Users will appear here after they register."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 hidden md:table-cell">Orders</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {getFullName(user)}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge 
                        active={user.isActive} 
                        onToggle={() => handleToggleStatus(user)}
                        disabled={updatingId === user.id}
                      />
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {user._count?.orders || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <UserActions
                        user={user}
                        onEdit={setEditingUser}
                        onToggleStatus={handleToggleStatus}
                        onDelete={setDeleteUser}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination 
          pagination={pagination} 
          onPageChange={handlePageChange} 
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        user={deleteUser}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteUser(null)}
      />

      {/* Loading Overlay for Updates */}
      {updatingId && (
        <div className="fixed inset-0 bg-black/10 dark:bg-black/30 flex items-center justify-center z-50 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
            <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
}