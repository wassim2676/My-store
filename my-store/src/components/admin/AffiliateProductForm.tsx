"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, AlertCircle, Plus, X, ArrowRight } from "lucide-react";
import BrandLogo from "@/components/shop/BrandLogo";

interface Brand {
  id: string;
  name: string;
  accentColor: string;
  logoSvg: string | null;
  logoUrl: string | null;
  isActive: boolean;
}

export interface AffiliateProductFormValues {
  title: string;
  shortReview: string;
  description: string;
  images: string[];
  price: string;
  compareAt: string;
  currency: string;
  category: string;
  tags: string[];
  affiliateUrl: string;
  rating: string;
  reviewCount: string;
  isFeatured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  brandId: string;
}

const EMPTY_VALUES: AffiliateProductFormValues = {
  title: "",
  shortReview: "",
  description: "",
  images: [],
  price: "",
  compareAt: "",
  currency: "MAD",
  category: "",
  tags: [],
  affiliateUrl: "",
  rating: "",
  reviewCount: "",
  isFeatured: false,
  status: "PUBLISHED",
  brandId: "",
};

export default function AffiliateProductForm({
  productId,
  initialValues,
}: {
  productId?: string;
  initialValues?: Partial<AffiliateProductFormValues>;
}) {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<AffiliateProductFormValues>({ ...EMPTY_VALUES, ...initialValues });
  const [imageInput, setImageInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setBrands(json.data);
      });
  }, []);

  const addImage = () => {
    const v = imageInput.trim();
    if (!v) return;
    setForm((f) => ({ ...f, images: [...f.images, v] }));
    setImageInput("");
  };

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    setForm((f) => ({ ...f, tags: [...f.tags, v] }));
    setTagInput("");
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.title.trim()) return setError("عنوان المنتج مطلوب");
    if (!form.shortReview.trim()) return setError("المراجعة المختصرة مطلوبة");
    if (!form.category.trim()) return setError("الصنف مطلوب");
    if (!form.brandId) return setError("يجب اختيار العلامة التجارية");
    if (!form.affiliateUrl.trim()) return setError("رابط الأفلييت مطلوب");
    try {
      const u = new URL(form.affiliateUrl.trim());
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
    } catch {
      return setError("رابط الأفلييت غير صحيح — يجب أن يبدأ بـ https://");
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        shortReview: form.shortReview.trim(),
        description: form.description.trim() || null,
        images: form.images,
        price: form.price ? Number(form.price) : null,
        compareAt: form.compareAt ? Number(form.compareAt) : null,
        currency: form.currency.trim() || "MAD",
        category: form.category.trim(),
        tags: form.tags,
        affiliateUrl: form.affiliateUrl.trim(),
        rating: form.rating ? Number(form.rating) : 0,
        reviewCount: form.reviewCount ? Number(form.reviewCount) : 0,
        isFeatured: form.isFeatured,
        status: form.status,
        brandId: form.brandId,
      };

      const res = await fetch(productId ? `/api/admin/affiliate-products/${productId}` : "/api/admin/affiliate-products", {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "فشلت العملية");
        return;
      }
      router.push("/admin/affiliate-products");
    } catch {
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const selectedBrand = brands.find((b) => b.id === form.brandId);

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.push("/admin/affiliate-products")}
        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-4 cursor-pointer"
      >
        <ArrowRight className="w-4 h-4" /> رجوع للقائمة
      </button>

      <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-6">
        {productId ? "تعديل منتج أفلييت" : "منتج أفلييت جديد"}
      </h1>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm font-semibold rounded-lg p-3 mb-5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 space-y-5">
        {/* العلامة التجارية */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">العلامة التجارية *</label>
          {brands.length === 0 ? (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              لا توجد علامات تجارية بعد. أضف علامة تجارية أولاً من صفحة{" "}
              <a href="/admin/brands" className="underline font-bold">العلامات التجارية</a>.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {brands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, brandId: b.id }))}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition-colors cursor-pointer ${
                    form.brandId === b.id ? "border-transparent text-white" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                  style={form.brandId === b.id ? { backgroundColor: b.accentColor } : undefined}
                >
                  <BrandLogo brand={b} size={18} />
                  {b.name}
                  {!b.isActive && <span className="text-[10px] opacity-70">(معطّلة)</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">عنوان المنتج *</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            مراجعة مختصرة * <span className="text-gray-400 font-normal">(تظهر في صفحة تصفح المنتج)</span>
          </label>
          <textarea
            value={form.shortReview}
            onChange={(e) => setForm((f) => ({ ...f, shortReview: e.target.value }))}
            rows={3}
            maxLength={600}
            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">{form.shortReview.length}/600</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">وصف تفصيلي (اختياري)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            رابط الأفلييت * <span className="text-gray-400 font-normal">(رابط المنتج الحقيقي عند التاجر)</span>
          </label>
          <input
            value={form.affiliateUrl}
            onChange={(e) => setForm((f) => ({ ...f, affiliateUrl: e.target.value }))}
            placeholder="https://www.walmart.com/ip/..."
            dir="ltr"
            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">الصنف *</label>
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="إلكترونيات، تجميل..."
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">السعر (اختياري)</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">السعر قبل الخصم</label>
            <input
              type="number"
              step="0.01"
              value={form.compareAt}
              onChange={(e) => setForm((f) => ({ ...f, compareAt: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">العملة</label>
            <input
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">التقييم (0-5)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              max={5}
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">عدد التقييمات</label>
            <input
              type="number"
              min={0}
              value={form.reviewCount}
              onChange={(e) => setForm((f) => ({ ...f, reviewCount: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        {/* الصور */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">صور المنتج (روابط)</label>
          <div className="flex gap-2 mb-2">
            <input
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
              placeholder="/uploads/product.jpg أو رابط كامل"
              dir="ltr"
              className="flex-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <button onClick={addImage} type="button" className="px-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 cursor-pointer">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.images.map((img, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg px-2.5 py-1.5 text-xs">
                  {img}
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                    className="cursor-pointer text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* الوسوم */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">وسوم (اختياري)</label>
          <div className="flex gap-2 mb-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <button onClick={addTag} type="button" className="px-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 cursor-pointer">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg px-2.5 py-1.5 text-xs">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((_, idx) => idx !== i) }))}
                    className="cursor-pointer text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">الحالة</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AffiliateProductFormValues["status"] }))}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
            >
              <option value="PUBLISHED">منشور (ظاهر للزوار)</option>
              <option value="DRAFT">مسودة (مخفي)</option>
              <option value="ARCHIVED">مؤرشف (مخفي)</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer select-none pb-2.5">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">منتج مميز (يظهر أولاً)</span>
            </label>
          </div>
        </div>

        {/* معاينة زر الشراء */}
        {selectedBrand && form.title && (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-4">
            <p className="text-xs font-bold text-gray-400 mb-2.5">معاينة زر الشراء في صفحة المنتج</p>
            <div
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-white text-sm"
              style={{ backgroundColor: selectedBrand.accentColor }}
            >
              <BrandLogo brand={selectedBrand} size={18} />
              الانتقال للشراء من {selectedBrand.name}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl cursor-pointer transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {productId ? "حفظ التعديلات" : "إنشاء المنتج"}
        </button>
        <button
          onClick={() => router.push("/admin/affiliate-products")}
          className="px-6 py-3 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
