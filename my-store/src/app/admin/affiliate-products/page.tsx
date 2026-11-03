"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2, Search, ExternalLink, Eye, MousePointerClick } from "lucide-react";
import BrandLogo from "@/components/shop/BrandLogo";

interface Brand {
  id: string;
  name: string;
  accentColor: string;
  logoSvg: string | null;
  logoUrl: string | null;
}

interface AffiliateProduct {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  price: string | number | null;
  currency: string;
  views: number;
  clicks: number;
  isFeatured: boolean;
  brand: Brand;
}

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "منشور",
  DRAFT: "مسودة",
  ARCHIVED: "مؤرشف",
};

const STATUS_COLOR: Record<string, string> = {
  PUBLISHED: "bg-green-50 text-green-700",
  DRAFT: "bg-amber-50 text-amber-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

export default function AdminAffiliateProductsPage() {
  const [items, setItems] = useState<AffiliateProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search.trim()) params.set("search", search.trim());
      if (status !== "all") params.set("status", status);
      const res = await fetch(`/api/admin/affiliate-products?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data.items);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- جلب بيانات أولي معتاد، لا حلقة تحديثات
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (p: AffiliateProduct) => {
    if (!confirm(`هل تريد حذف المنتج "${p.title}"؟`)) return;
    const res = await fetch(`/api/admin/affiliate-products/${p.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      alert(json.error || "فشل الحذف");
      return;
    }
    fetchItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">منتجات الأفلييت</h1>
          <p className="text-sm text-gray-500 mt-1">{total} منتج — يُحوَّل الزائر منها مباشرة لرابط الشراء عند التاجر.</p>
        </div>
        <Link
          href="/admin/affiliate-products/new"
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" /> منتج جديد
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="بحث بالعنوان أو المراجعة..."
            className="w-full ps-9 pe-3 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-xl px-3 py-2.5 text-sm cursor-pointer focus:ring-2 focus:ring-sky-500 outline-none"
        >
          <option value="all">كل الحالات</option>
          <option value="PUBLISHED">منشور</option>
          <option value="DRAFT">مسودة</option>
          <option value="ARCHIVED">مؤرشف</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">لا توجد منتجات بعد.</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs font-bold">
                <tr>
                  <td className="px-4 py-3">المنتج</td>
                  <td className="px-4 py-3">العلامة التجارية</td>
                  <td className="px-4 py-3">الصنف</td>
                  <td className="px-4 py-3">الحالة</td>
                  <td className="px-4 py-3">الأداء</td>
                  <td className="px-4 py-3">إجراءات</td>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <Link href={`/deals/${p.slug}`} target="_blank" className="font-bold text-gray-900 dark:text-white hover:underline flex items-center gap-1.5">
                        {p.title}
                        {p.isFeatured && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-md font-bold">مميز</span>}
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </Link>
                      {p.price != null && (
                        <span className="text-xs text-gray-400">
                          {Number(p.price).toFixed(2)} {p.currency}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
                        <BrandLogo brand={p.brand} size={18} /> {p.brand.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.category}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${STATUS_COLOR[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {p.views}</span>
                        <span className="flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" /> {p.clicks}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/affiliate-products/${p.id}`}
                          className="p-2 text-sky-600 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 rounded-lg cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-9 h-9 rounded-lg text-sm font-bold cursor-pointer ${
                n === page ? "bg-sky-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
