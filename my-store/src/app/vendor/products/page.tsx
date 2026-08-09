"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Package } from "lucide-react";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";
import VendorSidebar from "@/components/vendor/VendorSidebar";

interface VendorProduct {
  id: string;
  name: string;
  price: number;
  compareAt: number | null;
  stock: number;
  images: string[];
  isActive: boolean;
}

const emptyForm = {
  name: "", description: "", shortDesc: "", price: "", compareAt: "", stock: "0",
  images: "", categories: "",
};

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/products");
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- تحميل أولي عند فتح الصفحة
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        shortDesc: form.shortDesc || undefined,
        price: Number(form.price),
        compareAt: form.compareAt ? Number(form.compareAt) : null,
        stock: Number(form.stock),
        images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
        categories: form.categories.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        return;
      }

      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (e) {
      console.error(e);
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("هل تريد تعطيل هذا المنتج؟")) return;
    await fetch(`/api/vendor/products/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          <VendorSidebar />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">منتجاتي</h1>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? "إغلاق" : "إضافة منتج"}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 space-y-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">{error}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required placeholder="اسم المنتج" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input placeholder="وصف مختصر" value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input required type="number" step="0.01" placeholder="السعر (درهم)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input type="number" step="0.01" placeholder="السعر قبل الخصم (اختياري)" value={form.compareAt} onChange={(e) => setForm({ ...form, compareAt: e.target.value })} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input required type="number" placeholder="الكمية بالمخزون" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input placeholder="الفئات (مفصولة بفاصلة)" value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>

                <textarea placeholder="الوصف الكامل" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />

                <div>
                  <input required placeholder="روابط الصور (مفصولة بفاصلة) — https://..." value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <p className="text-xs text-slate-400 mt-1">مؤقتاً: ألصق روابط صور مباشرة. رفع الصور من الجهاز سيُضاف لاحقاً.</p>
                </div>

                <button type="submit" disabled={saving} className="bg-slate-900 hover:bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
                  {saving ? "جاري الحفظ..." : "حفظ المنتج"}
                </button>
              </form>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                <Package className="w-10 h-10" />
                <p className="text-sm font-medium">لا توجد منتجات بعد</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                      {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="56px" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.price.toFixed(2)} درهم · مخزون: {p.stock}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {p.isActive ? "نشط" : "معطّل"}
                    </span>
                    <button onClick={() => handleDeactivate(p.id)} className="text-red-500 hover:text-red-600 p-1.5 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <MegaFooter />
    </div>
  );
}
