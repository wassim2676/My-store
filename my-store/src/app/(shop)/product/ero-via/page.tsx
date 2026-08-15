"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { BannerImage } from "@/components/shop/EroviaBanners";
import {
  ShoppingCart, Star, Truck, ShieldCheck, RotateCcw, CheckCircle2,
  User, Phone, MapPin, Home, X, Loader2, AlertCircle, Info,
} from "lucide-react";

// ==================== 🏷️ معرّف مصدر الصفحة ====================
const SOURCE_PAGE = "/product/ero-via";

// ==================== 💰 الباقات — أسعار محدّثة + صور مخصصة ====================
interface PackageOption {
  id: number;
  name: string;
  boxes: number;
  price: number;
  originalPrice: number;
  promo: boolean;
  image: string;
}

const packages: PackageOption[] = [
  { 
    id: 1, 
    name: "Erovia — علبة واحدة", 
    boxes: 1, 
    price: 350, 
    originalPrice: 350, 
    promo: false,
    image: "/products/erovia1.png"
  },
  { 
    id: 2, 
    name: "Erovia (× 2 علب)", 
    boxes: 2, 
    price: 600, 
    originalPrice: 700, 
    promo: true,
    image: "/products/erovia2.png"
  },
  { 
    id: 3, 
    name: "Erovia (× 3 علب)", 
    boxes: 3, 
    price: 800, 
    originalPrice: 1050, 
    promo: true,
    image: "/products/erovia3.png"
  },
];

interface OrderFormData {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  packageId: number | null;
}

// ==================== ⭐ آراء العملاء ====================
const testimonials = [
  { name: "يوسف.ب", city: "الدار البيضاء", rating: 5, text: "توصيل سريع فعلاً وسرّي تماماً، والمنتج أصلي 100%. مقتنع بالجودة من أول علبة." },
  { name: "كريم.م", city: "مراكش", rating: 5, text: "كنت متردداً في البداية، لكن التجربة تجاوزت توقعاتي. سأطلب الباقة الكبيرة المرة القادمة." },
  { name: "سفيان.ر", city: "طنجة", rating: 5, text: "الدفع عند الاستلام أراحني كثيراً، وخدمة العملاء متجاوبة وسريعة في الرد." },
  { name: "عادل.و", city: "فاس", rating: 5, text: "منتج طبيعي فعلاً، لاحظت الفرق خلال أسبوع من الاستخدام المنتظم. أنصح به بثقة." },
  { name: "أمين.ح", city: "أكادير", rating: 5, text: "التغليف احترافي ولا يحمل أي إشارة للمنتج، خصوصية تامة من الطلب حتى الاستلام." },
  { name: "محمد.ص", city: "الرباط", rating: 5, text: "جربت باقة الثلاث علب مباشرة بعد التوصية، ولم أندم — قيمة ممتازة للسعر." },
];

// ==================== 🔔 Toast بسيط ====================
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[90] ${
        type === "success" ? "bg-[#0A0A0A]" : "bg-[#FE2C55]"
      } text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3`}
    >
      {type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <p className="text-sm font-medium flex-1 leading-relaxed">{message}</p>
      <button onClick={onClose} className="text-white/80 hover:text-white cursor-pointer" aria-label="إغلاق">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ==================== ⭐ نجوم التقييم ====================
function Stars({ count = 5, size = "w-4 h-4" }: { count?: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`${size} ${i < count ? "text-[#FE2C55] fill-[#FE2C55]" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

// ==================== 🧭 هيدر مبسّط ====================
function SimpleHeader({ onOrderClick }: { onOrderClick: () => void }) {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A] text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        <span className="text-xl font-black tracking-tight">
          Erovia <span className="text-[#FE2C55]">.</span>
        </span>
        <button
          onClick={onOrderClick}
          className="flex items-center gap-2 bg-white text-[#0A0A0A] hover:bg-[#FE2C55] hover:text-white px-4 sm:px-5 py-2.5 rounded-lg text-sm font-black transition-colors cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          Commander! اطلب الآن
        </button>
      </div>
    </header>
  );
}

// ==================== 🏠 المكوّن الرئيسي ====================
export default function EroViaProductPage() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    fullName: "",
    phone: "",
    city: "",
    address: "",
    packageId: 2,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === formData.packageId) || null,
    [formData.packageId]
  );

  const scrollToOrder = () => {
    document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.fullName.trim()) e.fullName = "الاسم الكامل مطلوب";
    if (!formData.phone.trim()) e.phone = "رقم الهاتف مطلوب";
    else if (!/^[\d\s+-]{8,15}$/.test(formData.phone)) e.phone = "رقم الهاتف غير صالح";
    if (!formData.city.trim()) e.city = "المدينة مطلوبة";
    if (!formData.address.trim()) e.address = "العنوان مطلوب لتوصيل طلبك";
    if (!formData.packageId) e.packageId = "الرجاء اختيار باقة";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setToast({ message: "يرجى تعبئة الحقول المطلوبة", type: "error" });
      return;
    }
    setShowConfirm(true);
  };

  const confirmOrder = async () => {
    if (!selectedPackage) return;
    setShowConfirm(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/manual-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: "",
          country: "المغرب",
          city: formData.city,
          address: formData.address,
          productType: selectedPackage.name,
          quantity: selectedPackage.boxes,
          unitPrice: selectedPackage.price,
          paymentMethod: "COD",
          sourcePage: SOURCE_PAGE,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ message: "🎉 تم استلام طلبك! سنتصل بك قريباً لتأكيد التوصيل.", type: "success" });
        setFormData({ fullName: "", phone: "", city: "", address: "", packageId: 2 });
      } else {
        setToast({ message: data.error || "حدث خطأ، حاول مجدداً", type: "error" });
      }
    } catch {
      setToast({ message: "تعذر الاتصال بالخادم", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    "w-full ps-11 pe-4 py-3.5 rounded-xl text-sm border outline-none transition-all bg-white placeholder:text-gray-400";
  const inputOk = "border-gray-200 focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A]/10";
  const inputErr = "border-[#FE2C55] bg-[#FE2C55]/5 focus:ring-2 focus:ring-[#FE2C55]/15";

  return (
    <div className="min-h-screen bg-white font-sans antialiased" dir="rtl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <SimpleHeader onOrderClick={scrollToOrder} />

      {/* ==================== 🖼️ الهيرو ==================== */}
      <section className="relative">
        <BannerImage src="/products/ero-via-banner-hero.png" alt="Erovia — استعد طاقتك وثقتك اليومية" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Stars count={5} />
            <span className="text-sm text-gray-500 font-semibold">(+2,300 تقييم)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0A0A0A] leading-tight mb-3">Erovia</h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            تركيبة طبيعية 100% مصمّمة لدعم طاقتك وثقتك وحيويتك اليومية.
          </p>
          <button
            onClick={scrollToOrder}
            className="mt-6 inline-flex items-center gap-2.5 bg-[#0A0A0A] hover:bg-[#FE2C55] text-white font-black px-8 py-4 rounded-xl transition-colors cursor-pointer text-base shadow-xl"
          >
            <ShoppingCart className="w-5 h-5" />
            Commander maintenant! اطلب الآن
          </button>
        </div>
      </section>

      {/* ==================== 🧾 سيكشن الطلب ==================== */}
      <section id="order-form" className="bg-[#FAFAFA] py-10 sm:py-14 px-4 sm:px-6 scroll-mt-16">
        <div className="max-w-xl mx-auto">
          <h2 className="text-center text-xl sm:text-2xl font-black text-[#0A0A0A] mb-6">إملأ الاستمارة للطلب</h2>

          {/* اختيار الباقة */}
          <div className="space-y-3 mb-5">
            {packages.map((pkg) => {
              const selected = formData.packageId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setFormData((f) => ({ ...f, packageId: pkg.id }))}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all cursor-pointer text-right ${
                    selected ? "border-[#0A0A0A] bg-[#FE2C55]/[0.06]" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                    <Image 
                      src={pkg.image} 
                      alt={pkg.name} 
                      fill 
                      sizes="(max-width: 640px) 56px, 64px" 
                      className="object-contain p-1" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0A0A0A] text-sm sm:text-base">{pkg.name}</p>
                    {pkg.promo && (
                      <span className="inline-block mt-1 text-[10px] font-black text-white bg-[#FE2C55] px-2 py-0.5 rounded-md">PROMO</span>
                    )}
                  </div>
                  <div className="text-left flex-shrink-0">
                    {pkg.promo && <p className="text-xs text-gray-400 line-through">{pkg.originalPrice}.00 dh</p>}
                    <p className="font-black text-[#0A0A0A] text-base sm:text-lg">{pkg.price}.00 dh</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected ? "border-[#0A0A0A] bg-[#0A0A0A]" : "border-gray-300"}`}>
                    {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* نموذج البيانات */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <User className="absolute top-1/2 -translate-y-1/2 start-4 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="الاسم الكامل / Nom Complet"
                className={`${inputBase} ${errors.fullName ? inputErr : inputOk}`}
              />
              {errors.fullName && <p className="text-[#FE2C55] text-xs mt-1 font-semibold">{errors.fullName}</p>}
            </div>

            <div className="relative">
              <Phone className="absolute top-1/2 -translate-y-1/2 start-4 w-4.5 h-4.5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^\d\s+-]/g, "") })}
                placeholder="رقم الهاتف / Numéro"
                className={`${inputBase} ${errors.phone ? inputErr : inputOk}`}
              />
              {errors.phone && <p className="text-[#FE2C55] text-xs mt-1 font-semibold">{errors.phone}</p>}
            </div>

            <div className="relative">
              <MapPin className="absolute top-1/2 -translate-y-1/2 start-4 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="المدينة / Ville"
                className={`${inputBase} ${errors.city ? inputErr : inputOk}`}
              />
              {errors.city && <p className="text-[#FE2C55] text-xs mt-1 font-semibold">{errors.city}</p>}
            </div>

            <div className="relative">
              <Home className="absolute top-1/2 -translate-y-1/2 start-4 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="العنوان بالتفصيل / Adresse"
                className={`${inputBase} ${errors.address ? inputErr : inputOk}`}
              />
              {errors.address && <p className="text-[#FE2C55] text-xs mt-1 font-semibold">{errors.address}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#0A0A0A] hover:bg-[#FE2C55] text-white font-black text-base rounded-xl transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2.5 mt-5"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
              {submitting ? "جاري الإرسال..." : "commander! اطلب الآن"}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-2">
              <ShieldCheck className="w-3.5 h-3.5" /> بياناتك محمية · الدفع عند الاستلام فقط
            </p>
          </form>
        </div>
      </section>

      {/* ==================== 🌿 بانر المكونات ==================== */}
      <BannerImage src="/products/ero-via-banner-ingredients.png" alt="Erovia — قائمة المكونات الكاملة" background="bg-white" />

      {/* ==================== 🖤 بانر الثقة ==================== */}
      <BannerImage src="/products/ero-via-banner-trust.png" alt="Erovia — دواعي الثقة" background="bg-[#0A0A0A]" />

      {/* ==================== ⭐ آراء العملاء ==================== */}
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-lg mx-auto mb-10">
            <span className="inline-block text-xs font-black text-[#FE2C55] bg-[#FE2C55]/10 px-3 py-1.5 rounded-full mb-3">
              آراء حقيقية من عملائنا
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A0A0A] mb-2">ماذا يقول عملاؤنا عن Erovia؟</h2>
            <div className="flex items-center justify-center gap-2">
              <Stars count={5} />
              <span className="text-sm font-bold text-gray-600">4.9/5 من +2,300 عميل</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-[#FAFAFA] rounded-2xl p-5 border border-gray-100 hover:border-[#FE2C55]/30 hover:shadow-lg transition-all">
                <Stars count={t.rating} size="w-3.5 h-3.5" />
                <p className="text-sm text-[#0A0A0A] leading-relaxed mt-3 mb-4">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0A0A0A]">{t.name}</p>
                    <p className="text-[11px] text-gray-400">{t.city} · مشترٍ موثّق</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 🖤 دعوة أخيرة للطلب ==================== */}
      <section className="bg-[#0A0A0A] py-12 sm:py-16 px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">لا تفوّت عرضك اليوم</h2>
        <p className="text-gray-400 text-sm sm:text-base mb-6">كميات محدودة — الدفع عند الاستلام في جميع المدن</p>
        <button
          onClick={scrollToOrder}
          className="inline-flex items-center gap-2.5 bg-[#FE2C55] hover:bg-white hover:text-[#0A0A0A] text-white font-black px-8 py-4 rounded-xl transition-colors cursor-pointer text-base"
        >
          <ShoppingCart className="w-5 h-5" />
          Commander maintenant! اطلب الآن
        </button>
      </section>

      {/* ==================== 🦶 فوتر ==================== */}
      <footer className="bg-white border-t border-gray-100 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-gray-500 font-semibold">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#0A0A0A]" /> دفع آمن 100%</span>
          <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#0A0A0A]" /> توصيل سريع لجميع المدن</span>
          <span className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4 text-[#0A0A0A]" /> إرجاع خلال 14 يوماً</span>
          <span className="flex items-center gap-1.5"><Info className="w-4 h-4 text-[#0A0A0A]" /> الدفع عند الاستلام فقط</span>
        </div>
        <p className="text-center text-[11px] text-gray-300 mt-5">© {new Date().getFullYear()} Erovia</p>
      </footer>

      {/* ==================== 🔴 زر الطلب العائم ==================== */}
      <button
        onClick={scrollToOrder}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-auto z-[60] flex items-center justify-center gap-2.5 bg-[#0A0A0A] hover:bg-[#FE2C55] text-white font-black px-6 py-4 rounded-xl shadow-2xl transition-colors cursor-pointer text-sm sm:text-base"
      >
        <ShoppingCart className="w-5 h-5" />
        Commander! اطلب الآن
      </button>

      {/* ==================== نافذة تأكيد الطلب ==================== */}
      {showConfirm && selectedPackage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-black text-base text-[#0A0A0A]">تأكيد الطلب</h3>
              <button onClick={() => setShowConfirm(false)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer" aria-label="إغلاق">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-4 space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-500">الاسم:</span><span className="font-bold">{formData.fullName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">الهاتف:</span><span className="font-bold" dir="ltr">{formData.phone}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">المدينة:</span><span className="font-bold">{formData.city}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2"><span className="text-gray-500 font-bold">الباقة:</span><span className="font-black text-[#FE2C55]">{selectedPackage.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-bold">الإجمالي:</span><span className="font-black text-base">{selectedPackage.price}.00 dh</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={confirmOrder} className="flex-1 py-3 bg-[#0A0A0A] hover:bg-[#FE2C55] text-white rounded-xl text-sm font-black transition-colors cursor-pointer">
                نعم، أكّد الطلب
              </button>
              <button onClick={() => setShowConfirm(false)} className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-[#0A0A0A] rounded-xl text-sm font-bold transition-colors cursor-pointer">
                تعديل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}