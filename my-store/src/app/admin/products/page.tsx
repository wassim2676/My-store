"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, Plus, MoreHorizontal, Package, Edit, Trash2, Eye, 
  Filter, X, Download, RefreshCw, AlertCircle, Loader2,
  ChevronDown, ChevronUp, CheckCircle, Clock
} from "lucide-react";
import Image from "next/image";

// ==================== 📦 تعريف الأنواع ====================
interface Product {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  price: number;
  compareAt?: number | null;
  stock: number;
  sku?: string | null;
  barcode?: string | null;
  images: string[];
  categories: string[];
  tags: string[];
  brand?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  rating?: number | null;
  reviewCount?: number | null;
  createdAt: string;
  updatedAt: string;
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
  category: string;
  status: "active" | "inactive" | "all";
  inStock: "true" | "false" | "all";
  minPrice: string;
  maxPrice: string;
  featured: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

// ==================== 🎨 ثوابت الواجهة ====================
const CATEGORIES = ["All", "Supplements", "Wellness", "Energy", "Beauty", "Other"];

const STATUS_OPTIONS: { value: "all" | "active" | "inactive"; label: string; color: string }[] = [
  { value: "all", label: "All Status", color: "bg-gray-100 text-gray-700" },
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "inactive", label: "Inactive", color: "bg-red-100 text-red-700" },
];

const STOCK_OPTIONS: { value: "all" | "true" | "false"; label: string; color: string }[] = [
  { value: "all", label: "All Stock", color: "bg-gray-100 text-gray-700" },
  { value: "true", label: "In Stock", color: "bg-green-100 text-green-700" },
  { value: "false", label: "Out of Stock", color: "bg-red-100 text-red-700" },
];

// ==================== 🎨 مكون شارة الحالة ====================
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      active 
        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }`}>
      {active ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ==================== 🎨 مكون مؤشر المخزون ====================
function StockIndicator({ stock }: { stock: number }) {
  if (stock > 10) {
    return <span className="font-medium text-green-600 dark:text-green-400">{stock} units</span>;
  } else if (stock > 0) {
    return <span className="font-medium text-yellow-600 dark:text-yellow-400">{stock} units (Low)</span>;
  } else {
    return <span className="font-medium text-red-600 dark:text-red-400">Out of stock</span>;
  }
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
  onReset,
  categories 
}: { 
  filters: Filters; 
  onFilterChange: (key: keyof Filters, value: string | boolean) => void;
  onReset: () => void;
  categories: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasActiveFilters = useMemo(() => {
    return filters.category !== "All" || 
           filters.status !== "all" || 
           filters.inStock !== "all" ||
           filters.minPrice || 
           filters.maxPrice ||
           filters.featured;
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
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => onFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
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
            
            {/* Stock */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Stock</label>
              <select
                value={filters.inStock}
                onChange={(e) => onFilterChange("inStock", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
              >
                {STOCK_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            {/* Price Range */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Min Price (MAD)</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => onFilterChange("minPrice", e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-text"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max Price (MAD)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                placeholder="10000"
                min="0"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-text"
              />
            </div>
            
            {/* Featured Toggle */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="featured"
                checked={filters.featured}
                onChange={(e) => onFilterChange("featured", e.target.checked)}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                Featured products only
              </label>
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

// ==================== 🏠 المكون الرئيسي ====================
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false
  });
  
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "All",
    status: "all",
    inStock: "all",
    minPrice: "",
    maxPrice: "",
    featured: false,
  });

  // 🔹 تنسيق العملة
  const formatCurrency = useCallback((amount: number | null | undefined) => {
    if (amount == null) return "0 MAD";
    return new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency: "MAD", 
      minimumFractionDigits: 0 
    }).format(amount);
  }, []);

  // 🔹 بناء معلمات البحث
  const buildQueryParams = useCallback((page: number) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", "20");
    
    if (filters.search.trim()) params.append("search", filters.search.trim());
    if (filters.category !== "All") params.append("category", filters.category.toLowerCase());
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.inStock !== "all") params.append("inStock", filters.inStock);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.featured) params.append("featured", "true");
    
    return params.toString();
  }, [filters]);

  // 🔹 جلب المنتجات من API
  const fetchProducts = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = buildQueryParams(page);
      const response = await fetch(`/api/admin/products?${queryParams}`, {
        cache: "no-store",
        headers: { "Accept": "application/json" },
      });
      
      const result: ApiResponse<{ products: Product[]; pagination: Pagination }> = await response.json();
      
      if (response.ok && result.success) {
        setProducts(result.data?.products || []);
        setPagination(result.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false });
      } else if (result.error && response.status !== 404) {
        setError(result.error);
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      setError("Connection issue. Please check your internet.");
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // 🔹 تحميل البيانات الأولية
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // 🔹 تحديث فلتر
  const handleFilterChange = useCallback((key: keyof Filters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // 🔹 إعادة تعيين الفلاتر
  const handleResetFilters = useCallback(() => {
    setFilters({
      search: "",
      category: "All",
      status: "all",
      inStock: "all",
      minPrice: "",
      maxPrice: "",
      featured: false,
    });
    fetchProducts(1);
  }, [fetchProducts]);

  // 🔹 تغيير الصفحة
  const handlePageChange = useCallback((page: number) => {
    fetchProducts(page);
  }, [fetchProducts]);

  // 🔹 تصدير CSV
  const handleExportCSV = useCallback(() => {
    const headers = ["ID", "Name", "SKU", "Price", "Stock", "Status", "Category", "Created"];
    const rows = products.map(p => [
      p.id,
      p.name,
      p.sku || "",
      p.price.toString(),
      p.stock.toString(),
      p.isActive ? "Active" : "Inactive",
      p.categories.join(", "),
      new Date(p.createdAt).toLocaleDateString(),
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [products]);

  // 🔹 حالة التحميل
  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {["Product", "SKU", "Price", "Stock", "Status", "Actions"].map((h, i) => (
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
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </td>
                    {[1, 2, 3, 4].map((j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </td>
                    ))}
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage inventory, pricing, and listings • {pagination.total} products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportCSV}
            disabled={products.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by name, SKU, barcode, or description..." 
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchProducts(1)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all cursor-text" 
        />
      </div>

      {/* Filter Panel */}
      <FilterPanel 
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        categories={CATEGORIES}
      />

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={() => fetchProducts(pagination.page)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {filters.search || filters.category !== "All" ? "No products found" : "No products yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              {filters.search || filters.category !== "All" 
                ? "Try adjusting your filters to find what you're looking for." 
                : "Add your first product to start selling."}
            </p>
            {!filters.search && filters.category === "All" && (
              <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors cursor-pointer">
                <Plus className="w-4 h-4" /> Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((product) => (
                  <tr 
                    key={product.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 relative">
                          {product.images[0] ? (
                            <Image 
                              src={product.images[0]} 
                              alt={product.name} 
                              fill 
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                            {product.name}
                          </span>
                          {product.shortDesc && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                              {product.shortDesc}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        {product.sku || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(product.price)}
                      </div>
                      {product.compareAt && product.compareAt > product.price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatCurrency(product.compareAt)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StockIndicator stock={product.stock} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.categories.slice(0, 2).map((cat, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                            {cat}
                          </span>
                        ))}
                        {product.categories.length > 2 && (
                          <span className="text-xs text-gray-400">+{product.categories.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge active={product.isActive} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          className="p-2 text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100" 
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100" 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer" 
                          title="More actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
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
    </div>
  );
}