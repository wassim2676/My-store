"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Save, Loader2, AlertCircle } from "lucide-react";
import BrandLogo from "@/components/shop/BrandLogo";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoSvg: string | null;
  logoUrl: string | null;
  accentColor: string;
  buyLabel: string | null;
  isActive: boolean;
  _count?: { products: number };
}

const EMPTY_FORM = {
  name: "",
  logoSvg: "",
  logoUrl: "",
  accentColor: "#1D4ED8",
  buyLabel: "",
  isActive: true,
};

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/brands");
      const json = await res.json();
      if (json.success) setBrands(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- جلب بيانات أولي معتاد، لا حلقة تحديثات
    fetchBrands();
  }, [fetchBrands]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditingId(b.id);
    setForm({
      name: b.name,
      logoSvg: b.logoSvg || "",
      logoUrl: b.logoUrl || "",
      accentColor: b.accentColor,
      buyLabel: b.buyLabel || "",
      isActive: b.isActive,
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("اسم العلامة التجارية مطلوب");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        logoSvg: form.logoSvg.trim() || null,
        logoUrl: form.logoUrl.trim() || null,
        accentColor: form.accentColor,
        buyLabel: form.buyLabel.trim() || null,
        isActive: form.isActive,
      };
      const res = await fetch(editingId ? `/api/admin/brands/${editingId}` : "/api/admin/brands", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "فشلت العملية");
        return;
      }
      setModalOpen(false);
      fetchBrands();
    } catch {
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: Brand) => {
    if (!confirm(`هل تريد حذف العلامة التجارية "${b.name}"؟`)) return;
    const res = await fetch(`/api/admin/brands/${b.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      alert(json.error || "فشل الحذف");
      return;
    }
    fetchBrands();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">العلامات التجارية</h1>
          <p className="text-sm text-gray-500 mt-1">أضف شعار SVG الخاص بكل متجر (Walmart, Target, Amazon...) واستخدمه في منتجات الأفلييت.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" /> إضافة علامة تجارية
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20 text-gray-400">لا توجد علامات تجارية بعد. أضف أول علامة تجارية.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((b) => (
            <div key={b.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${b.accentColor}1A` }}
                  >
                    <BrandLogo brand={b} size={28} />
                  </span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white leading-tight">{b.name}</p>
                    <p className="text-xs text-gray-400">{b._count?.products ?? 0} منتج</p>
                  </div>
                </div>
                {!b.isActive && (
                  <span className="text-[11px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-md">معطّلة</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(b)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-sky-600 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 rounded-lg py-2 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> تعديل
                </button>
                <button
                  onClick={() => handleDelete(b)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 rounded-lg py-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                {editingId ? "تعديل العلامة التجارية" : "علامة تجارية جديدة"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm font-semibold rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">اسم العلامة التجارية *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="مثال: Walmart"
                  className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  كود شعار SVG (الصق كود الشعار كاملاً)
                </label>
                <textarea
                  value={form.logoSvg}
                  onChange={(e) => setForm((f) => ({ ...f, logoSvg: e.target.value }))}
                  placeholder="<svg ...>...</svg>"
                  rows={4}
                  dir="ltr"
                  className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-xs font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">إن لم تضع شعار SVG، سيظهر حرف أول اسم العلامة التجارية كشارة بديلة.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  أو رابط صورة الشعار (اختياري بدل SVG)
                </label>
                <input
                  value={form.logoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                  placeholder="/brands/walmart.svg"
                  dir="ltr"
                  className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">لون العلامة التجارية</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/.test(form.accentColor) ? form.accentColor : "#1D4ED8"}
                      onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))}
                      className="w-11 h-10 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer"
                    />
                    <input
                      value={form.accentColor}
                      onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))}
                      dir="ltr"
                      className="flex-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer select-none pb-2.5">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">مفعّلة وظاهرة للزوار</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  نص زر الشراء المخصص (اختياري)
                </label>
                <input
                  value={form.buyLabel}
                  onChange={(e) => setForm((f) => ({ ...f, buyLabel: e.target.value }))}
                  placeholder={`مثال: اذهب للشراء من ${form.name || "Walmart"}`}
                  className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              {/* معاينة مباشرة */}
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-4 flex items-center gap-3">
                <span
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${/^#[0-9A-Fa-f]{3,8}$/.test(form.accentColor) ? form.accentColor : "#1D4ED8"}1A` }}
                >
                  <BrandLogo
                    brand={{
                      name: form.name || "علامة تجارية",
                      logoSvg: form.logoSvg,
                      logoUrl: form.logoUrl,
                      accentColor: form.accentColor,
                    }}
                    size={30}
                  />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">معاينة الشعار</p>
                  <p className="text-xs text-gray-400">هكذا سيظهر في بطاقات المنتجات وزر الشراء</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-5 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl cursor-pointer transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                حفظ
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-3 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
