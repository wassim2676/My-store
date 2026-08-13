"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart, CheckCircle, Truck, Shield, Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, Loader2, X, MessageCircle, Menu, Search, BadgeCheck, Globe2,
  ThumbsUp, MessageSquare, Share2, MoreHorizontal, RotateCcw, Zap, Headphones, Info, HelpCircle,
  Flame, Package, Sparkles, Leaf, Heart, Award, TrendingUp, Send, Check, CornerDownLeft, RefreshCw, Pencil,
} from "lucide-react";

// ==================== 🎨 الهوية البصرية — Facebook SaaS ====================
// خلفية الصفحة رمادية #F0F2F5 وكل المحتوى داخل إطارات بيضاء مثل فيسبوك تماماً
// #1877F2 أساسي / #166FE5 تحويم / #E4E6EB حدود / #65676B نصوص ثانوية / #050505 نصوص أساسية

type ToastType = "success" | "error" | "info";

interface PackageOption {
  id: number;
  name: string;
  boxes: number;
  duration: string;
  price: number;
  originalPrice: number;
  save: number;
  popular: boolean;
  features: string[];
}

interface OrderFormData {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  quantity: number | "";
  packageId: number | null;
}

// ==================== 💰 الباقات ====================
const packages: PackageOption[] = [
  {
    id: 1, name: "باقة تجريبية", boxes: 1, duration: "شهر واحد",
    price: 500, originalPrice: 600, save: 100, popular: false,
    features: ["عبوة واحدة من المنتج", "توصيل لجميع المدن", "الدفع عند الاستلام"],
  },
  {
    id: 2, name: "باقة التوفير", boxes: 2, duration: "شهران",
    price: 900, originalPrice: 1200, save: 300, popular: true,
    features: ["عبوتان من المنتج", "قيمة أفضل للكمية", "توصيل سريع مجاني", "الدفع عند الاستلام"],
  },
  {
    id: 3, name: "باقة القوة", boxes: 3, duration: "3 أشهر",
    price: 1200, originalPrice: 1800, save: 600, popular: false,
    features: ["3 عبوات من المنتج", "أعلى قيمة للكمية", "توصيل سريع مجاني", "الدفع عند الاستلام"],
  },
];

// ==================== 📸 صور المنتج ====================
// ✅ يمكن استبدال الروابط بصور محلية من /public مثل: "/images/vijara-1.jpg"
const productImages = [
  { url: "https://images.unsplash.com/photo-1584308972272-9cf4b93c8c65?w=900&h=700&fit=crop", alt: "فيجارا بلس - المظهر الطبيعي الموثوق" },
  { url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=900&h=700&fit=crop", alt: "مكونات طبيعية نقية لفيجارا بلس" },
  { url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=700&fit=crop", alt: "فوائد مثبتة علمياً لفيجارا بلس" },
  { url: "https://images.unsplash.com/photo-1550596334-7bb40a71b6bc?w=900&h=700&fit=crop", alt: "علب فيجارا بلس الفاخرة والأصلية" },
];

// ==================== 🌿 المكونات الفعّالة (سيكشن جديد تحت الهيرو) ====================
const ingredients = [
  {
    icon: Leaf,
    title: "الجينسنغ الأحمر الكوري الأقصى",
    desc: "مستخلص نقي بتركيز عالٍ يعزز مستويات الطاقة الخلوية، يرفع القدرة البدنية على التحمل، ويقوّي جدران الأوعية الدموية بشكل طبيعي ومثبت علمياً.",
    stat: "+40% طاقة مستدامة",
  },
  {
    icon: Zap,
    title: "مستخلص Horny Goat Weed الطبيعي",
    desc: "محفز حيوي فوري يعمل على تحسين كفاءة ومعدل ضخ الدورة الدموية الطرفية، مما يعزز من قوة وسرعة الاستجابة الجسدية دون أي إجهاد للقلب.",
    stat: "+35% تدفق دموي للشرايين",
  },
  {
    icon: Heart,
    title: "عشبة Tribulus Terrestris النقية",
    desc: "تعمل بذكاء على دعم وتحفيز إنتاج التستوستيرون الطبيعي الحر بالجسم، مما يرفع الكفاءة العضلية الكلية ويزيد مستويات الأداء اليومي.",
    stat: "+25% هرمون ذكورة حر",
  },
  {
    icon: Award,
    title: "جذور الماكا البيروفية العضوية",
    desc: "الذهب الأسود النادر من مرتفعات الأنديز، يعزز التوازن الهرموني، ويرفع مستويات الخصوبة الذكورية بشكل جذري، ويقضي على الإجهاد الذهني والبدني المفرط.",
    stat: "+30% خصوبة حيوية وثبات",
  },
];

// ==================== ❓ الأسئلة الشائعة ====================
const faqs = [
  { question: "ما هو فيجارا بلس وكيف يعمل؟", answer: "منتج طبيعي 100% مستخلص من أعشاب نادرة، يعزز الطاقة والحيوية بشكل طبيعي وآمن." },
  { question: "كم من الوقت يستغرق ظهور النتائج؟", answer: "معظم العملاء يلاحظون تحسناً خلال الأسبوع الأول من الاستخدام المنتظم." },
  { question: "هل يمكنني الدفع عند الاستلام؟", answer: "نعم، نقبل الدفع عند الاستلام (COD) في كل المدن التي نخدمها." },
  { question: "ما هي سياسة الاسترداد؟", answer: "ضمان استرداد الأموال لمدة 14 يوماً إذا لم تكن راضياً عن المنتج لأي سبب." },
];

// ==================== 🧱 ستايلات موحّدة ====================
const inputBase =
  "w-full px-4 py-3.5 rounded-lg text-base border outline-none transition-all bg-white placeholder:text-[#8A8D91]";
const inputOk =
  "border-[#CED0D4] focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/15";
const inputErr =
  "border-[#E41E3F] bg-red-50 focus:border-[#E41E3F] focus:ring-2 focus:ring-[#E41E3F]/10";

// ==================== ⭐ نجوم التقييم ====================
function Stars({ rating = 4.9, size = "w-4 h-4" }: { rating?: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr" aria-label={`تقييم ${rating} من 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1);
        return (
          <span key={i} className="relative inline-block">
            <Star className={`${size} text-[#CED0D4]`} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${size} text-[#F5B51B]`} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

// ==================== 🔔 Toast ====================
function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: "bg-[#42B72A]", icon: CheckCircle },
    error: { bg: "bg-[#E41E3F]", icon: AlertCircle },
    info: { bg: "bg-[#1877F2]", icon: Info },
  }[type];
  const Icon = config.icon;

  return (
    <div className={`fixed top-4 left-4 z-[80] ${config.bg} text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-normal flex-1 leading-relaxed">{message}</p>
      <button onClick={onClose} className="text-white/90 hover:text-white transition-colors cursor-pointer" aria-label="إغلاق">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ==================== 🧭 الهيدر — شعار + تتبع القسم النشط ====================
function TopHeader({ onScrollTo }: { onScrollTo: (id: string, instant?: boolean) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("home");

  const navLinks = [
    { id: "home", label: "الرئيسية" },
    { id: "ingredients", label: "المكونات" },
    { id: "why", label: "لماذا نحن" },
    { id: "packages", label: "الباقات" },
    { id: "order-form", label: "الطلب" },
    { id: "faqs", label: "الأسئلة الشائعة" },
  ];

  // ✅ Scroll-Spy: الكلمة النشطة تتغير تلقائياً أثناء التمرير
  useEffect(() => {
    const onScroll = () => {
      const pos = window.scrollY + 140;
      let current = "home";
      for (const link of navLinks) {
        const el = document.getElementById(link.id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= pos) current = link.id;
      }
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 60) {
        current = navLinks[navLinks.length - 1].id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (id: string) => {
    setActive(id);
    setMobileOpen(false);
    onScrollTo(id);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E4E6EB] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 sm:h-[70px] gap-3">
          {/* ✅ شعار المنتج — يظهر في الهاتف والكمبيوتر */}
          <button onClick={() => go("home")} className="flex items-center gap-2.5 cursor-pointer flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#1877F2] to-[#0E5FCB] flex items-center justify-center shadow-md shadow-[#1877F2]/25">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="font-semibold text-base sm:text-lg text-[#050505] leading-none tracking-tight">فيجارا بلس</p>
              <p className="text-[11px] text-[#65676B] font-semibold mt-1">متجر رسمي · أصلي 100%</p>
            </div>
          </button>

          {/* روابط التنقل — وسط، بكلمات أوضح وحجم أكبر */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className={`text-[15px] font-semibold pb-1.5 border-b-2 transition-colors cursor-pointer ${
                  active === link.id
                    ? "text-[#1877F2] border-[#1877F2]"
                    : "text-[#65676B] border-transparent hover:text-[#050505]"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* البحث + CTA + قائمة الموبايل */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-2 bg-[#F0F2F5] rounded-full pr-4 pl-1.5 py-1.5 w-64 lg:w-80">
              <input
                type="text"
                placeholder="بحث في فيجارا بلس"
                className="flex-1 bg-transparent outline-none text-sm text-[#050505] placeholder-[#65676B] min-w-0"
                readOnly
              />
              <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">ف</span>
              </div>
            </div>
            <button
              onClick={() => go("order-form")}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              اطلب الآن
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="w-10 h-10 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-[#050505] transition-colors cursor-pointer lg:hidden"
              aria-label="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* قائمة الموبايل */}
        {mobileOpen && (
          <nav className="lg:hidden flex flex-col gap-1 pb-4 border-t border-[#E4E6EB] pt-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className={`text-right px-3 py-3 rounded-lg text-[15px] font-semibold transition-colors cursor-pointer ${
                  active === link.id ? "bg-[#E7F3FF] text-[#1877F2]" : "text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#1877F2]"
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => go("order-form")}
              className="mt-2 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              اطلب الآن
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

// ==================== 🖼️ معرض الصور — صور مندمجة لا تملأ الإطار ====================
function PostGallery({ images, activeIndex, onChange }: {
  images: { url: string; alt: string }[];
  activeIndex: number;
  onChange: (i: number) => void;
}) {
  const prevIdx = (activeIndex - 1 + images.length) % images.length;
  const nextIdx = (activeIndex + 1) % images.length;

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-[#F7F8FA] overflow-hidden select-none">
      {/* معاينة جانبية (يمين) — بطاقة مندمجة بحواف ناعمة */}
      <div className="hidden sm:block absolute top-[14%] bottom-[16%] right-0 w-[17%] rounded-xl overflow-hidden opacity-70 shadow-lg">
        <Image src={images[prevIdx].url} alt="" fill sizes="17vw" className="object-cover" loading="lazy" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-l from-white/30 via-white/55 to-white/80" />
      </div>
      {/* معاينة جانبية (يسار) */}
      <div className="hidden sm:block absolute top-[14%] bottom-[16%] left-0 w-[17%] rounded-xl overflow-hidden opacity-70 shadow-lg">
        <Image src={images[nextIdx].url} alt="" fill sizes="17vw" className="object-cover" loading="lazy" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/55 to-white/80" />
      </div>

      {/* الصورة الرئيسية — لا تملأ الإطار: هوامش تنفس + حواف دائرية مندمجة */}
      <div
        key={activeIndex}
        className="absolute top-[5%] bottom-[9%] right-[5%] left-[5%] sm:top-[8%] sm:bottom-[13%] sm:right-[13%] sm:left-[13%] rounded-xl overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.14)] ring-1 ring-black/5"
        style={{ animation: "galleryZoom 0.45s ease" }}
      >
        <Image
          src={images[activeIndex].url}
          alt={images[activeIndex].alt}
          fill
          sizes="(max-width: 640px) 90vw, 70vw"
          className="object-cover"
          priority={activeIndex === 0}
          loading={activeIndex === 0 ? "eager" : "lazy"}
          unoptimized
        />
        {/* دمج الحواف مع الخلفية */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(255,255,255,0.12)]" />
        {/* شارة طبيعي 100% */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-[#1877F2] shadow-md flex items-center gap-1">
          <BadgeCheck className="w-3.5 h-3.5" />
          طبيعي 100%
        </div>
        {/* عدّاد الصور */}
        <div className="absolute top-3 left-3 bg-[#050505]/60 backdrop-blur-sm text-white rounded-full px-3 py-1 text-xs font-semibold">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* أزرار التنقل */}
      <button
        onClick={() => onChange(prevIdx)}
        className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 z-10 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-lg flex items-center justify-center text-[#050505] transition-all hover:scale-105 cursor-pointer"
        aria-label="السابق"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <button
        onClick={() => onChange(nextIdx)}
        className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 z-10 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-lg flex items-center justify-center text-[#050505] transition-all hover:scale-105 cursor-pointer"
        aria-label="التالي"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* نقاط التنقل */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            aria-label={`صورة ${i + 1}`}
            className={`h-2 rounded-full transition-all cursor-pointer ${i === activeIndex ? "w-7 bg-[#1877F2]" : "w-2 bg-[#CED0D4] hover:bg-[#8A8D91]"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ==================== 👀 عداد الزوار + العرض المحدود ====================
function LiveOfferCard() {
  const [visitorCount, setVisitorCount] = useState(12100);
  const [remaining, setRemaining] = useState(30 * 60);

  useEffect(() => {
    // عداد واجهة ديناميكي للاستخدام التسويقي؛ القيمة تتغير بسلاسة داخل نطاق العرض.
    const visitorTimer = window.setInterval(() => {
      setVisitorCount((current) => {
        const delta = Math.floor(Math.random() * 1201) - 600;
        return Math.min(30000, Math.max(5000, current + delta));
      });
    }, 7000);

    const storageKey = "vigara_offer_end_at";
    const now = Date.now();
    let endAt = Number(window.localStorage.getItem(storageKey));
    if (!endAt || endAt <= now) {
      endAt = now + 30 * 60 * 1000;
      window.localStorage.setItem(storageKey, String(endAt));
    }

    const tick = () => {
      let seconds = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      if (seconds <= 0) {
        endAt = Date.now() + 30 * 60 * 1000;
        window.localStorage.setItem(storageKey, String(endAt));
        seconds = 30 * 60;
      }
      setRemaining(seconds);
    };
    tick();
    const countdownTimer = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(visitorTimer);
      window.clearInterval(countdownTimer);
    };
  }, []);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  const displayVisitors = `${(visitorCount / 1000).toFixed(1)}K`;

  return (
    <div className="bg-white rounded-xl border border-[#E4E6EB] shadow-sm p-4 lg:min-h-[128px] flex flex-col justify-center">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#42B72A] opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#42B72A]" />
            </span>
            <p className="text-sm font-bold text-[#050505] tabular-nums transition-all duration-700">{displayVisitors} زائر</p>
          </div>
          <p className="text-xs text-[#65676B] mt-1">يشاهدون هذا العرض الآن</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E4E6EB] flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#050505]">🔥 العرض الحالي لفترة محدودة</p>
          <p className="text-[11px] text-[#65676B] mt-0.5">احجز باقتك قبل انتهاء المؤقت</p>
        </div>
        <div dir="ltr" className="text-base font-bold tracking-wide text-[#1877F2] bg-[#E7F3FF] px-3 py-1.5 rounded-lg tabular-nums">
          {minutes}:{seconds}
        </div>
      </div>
    </div>
  );
}

// ==================== ❓ قسم الأسئلة الشائعة ====================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faqs" className="py-3 sm:py-4 px-3 sm:px-4 lg:px-6 scroll-mt-20">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-xl border border-[#E4E6EB] shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-[#E4E6EB]">
          <h2 className="text-xl sm:text-2xl font-bold leading-tight text-[#050505] tracking-tight">الأسئلة الشائعة</h2>
          <p className="text-[#65676B] text-sm font-normal mt-0.5">إجابات سريعة قبل إتمام طلبك</p>
        </div>
        <div className="p-3 sm:p-4 space-y-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-[#F0F2F5] rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-right cursor-pointer hover:bg-[#E4E6EB] transition-colors"
              >
                <span className="flex items-center gap-3 font-semibold text-[#050505] text-sm sm:text-base">
                  <HelpCircle className="w-5 h-5 text-[#1877F2] flex-shrink-0" />
                  {faq.question}
                </span>
                <ChevronDown className={`w-5 h-5 text-[#65676B] transition-transform flex-shrink-0 ${openIndex === idx ? "rotate-180" : ""}`} />
              </button>
              {openIndex === idx && (
                <p className="px-4 pb-4 text-sm text-[#65676B] leading-relaxed pr-12 bg-white">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== 🦶 الفوتر ====================
function SiteFooter() {
  return (
    <footer className="bg-white border-t border-[#E4E6EB] py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[#65676B] font-normal text-center sm:text-right">
          © {new Date().getFullYear()} فيجارا بلس — تجربة شراء بسيطة وواضحة
        </p>
        <div className="flex flex-wrap justify-center gap-5 text-sm text-[#65676B] font-normal">
          <Link href="/privacy" className="hover:text-[#1877F2] transition-colors">سياسة الخصوصية</Link>
          <Link href="/terms" className="hover:text-[#1877F2] transition-colors">شروط الاستخدام</Link>
          <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> دفع آمن</span>
          <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> شحن سريع</span>
        </div>
      </div>
    </footer>
  );
}

// ==================== 📱 زر واتساب العائم ====================
function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/2126XXXXXXXX"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-4 z-[60] w-14 h-14 rounded-full bg-[#25D366] shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform"
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
    </a>
  );
}

function UsersIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

// ==================== 🏷️ معرّف الصفحة (يُستخدم في نظام الإعجابات والتعليقات الحقيقي) ====================
const PAGE_SLUG = "vijara-plus";

interface CommentNode {
  id: string;
  parentId: string | null;
  name: string;
  message: string;
  likes: number;
  createdAt: string;
  replies: CommentNode[];
}

// ==================== 🔢 تنسيق الأرقام بصيغة مختصرة (K) ====================
function formatK(n: number): string {
  if (n >= 1000) {
    const val = n / 1000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`;
  }
  return String(n);
}

// ==================== 🎭 مولّد أسماء مستعارة افتراضية (يمكن للزائر تعديلها لاحقاً) ====================
const DEFAULT_NAME_POOL = [
  "زائر مهتم", "عميل جديد", "متابع فيجارا", "زائر الصفحة", "مهتم بالعرض",
  "عميل محتمل", "زائر فضولي", "متابع مهتم", "مستخدم جديد", "زائر اليوم",
];
function getOrCreateDisplayName(): string {
  if (typeof window === "undefined") return DEFAULT_NAME_POOL[0];
  const stored = window.localStorage.getItem("comment_display_name");
  if (stored) return stored;
  const random = DEFAULT_NAME_POOL[Math.floor(Math.random() * DEFAULT_NAME_POOL.length)];
  const suffix = Math.floor(100 + Math.random() * 900);
  const generated = `${random} ${suffix}`;
  window.localStorage.setItem("comment_display_name", generated);
  return generated;
}

// بناء شجرة الردود (مستويين: تعليقات رئيسية + ردودها) من قائمة مسطّحة قادمة من الـ API
function buildCommentTree(flat: { id: string; parentId: string | null; name: string; message: string; likes: number; createdAt: string }[]): CommentNode[] {
  const roots: CommentNode[] = [];
  const map = new Map<string, CommentNode>();
  flat.forEach((c) => map.set(c.id, { ...c, replies: [] }));
  flat.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });
  // الأحدث أولاً للتعليقات الرئيسية، الأقدم أولاً للردود (كنقاش طبيعي)
  roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  roots.forEach((r) => r.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
  return roots;
}

// ==================== 🏠 المكوّن الرئيسي ====================
export default function VijaraPlusFbExactPage() {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    fullName: "", phone: "", city: "", address: "", quantity: "", packageId: null,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [mobileQuantityMode, setMobileQuantityMode] = useState<"preset" | "custom">("preset");
  const [offerClaims, setOfferClaims] = useState(2500);
  const orderFormRef = useRef<HTMLDivElement>(null);

  // ==================== 👍 حالة إعجاب المنشور نفسه ====================
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  // ==================== 💬 حالة التعليقات والردود (شجرية) ====================
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [displayName, setDisplayName] = useState(""); // الاسم المستعار الحالي (قابل للتعديل)
  const [editingName, setEditingName] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // معرّف التعليق الجاري الرد عليه
  const [replyMessage, setReplyMessage] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());

  // ==================== 🔗 حالة المشاركة ====================
  const [shareCopied, setShareCopied] = useState(false);

  // جلب الإعجابات والتعليقات الحقيقية + الاسم المستعار عند فتح الصفحة
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- قراءة/توليد الاسم المستعار المحفوظ محلياً لهذا الزائر
    setDisplayName(getOrCreateDisplayName());

    const likedBefore = window.localStorage.getItem(`liked_${PAGE_SLUG}`) === "true";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- قراءة حالة الإعجاب المحفوظة محلياً لهذا الزائر
    setIsLiked(likedBefore);

    const likedComments = window.localStorage.getItem("liked_comments");
    if (likedComments) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- استرجاع قائمة التعليقات المُعجب بها من قبل
        setLikedCommentIds(new Set(JSON.parse(likedComments)));
      } catch {
        // تجاهل بيانات تالفة بصمت
      }
    }

    fetch(`/api/likes?slug=${PAGE_SLUG}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setLikesCount(d.data.likes); })
      .catch(() => {});

    fetch(`/api/comments?slug=${PAGE_SLUG}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setComments(buildCommentTree(d.data)); })
      .catch(() => {})
      .finally(() => setCommentsLoading(false));
  }, []);

  // تبديل إعجاب المنشور (بدون تسجيل دخول — تماماً كمنشور فيسبوك عام)
  const handleToggleLike = async () => {
    if (likeBusy) return;
    setLikeBusy(true);
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: PAGE_SLUG, action: nextLiked ? "like" : "unlike" }),
      });
      const data = await res.json();
      if (data.success) {
        setLikesCount(data.data.likes);
        window.localStorage.setItem(`liked_${PAGE_SLUG}`, String(nextLiked));
      }
    } catch {
      setIsLiked(!nextLiked);
      setLikesCount((prev) => Math.max(0, prev - (nextLiked ? 1 : -1)));
    } finally {
      setLikeBusy(false);
    }
  };

  // تبديل إعجاب تعليق أو رد محدد (بنفس منطق إعجاب المنشور، لكن لكل تعليق على حدة)
  const handleToggleCommentLike = async (commentId: string) => {
    const alreadyLiked = likedCommentIds.has(commentId);
    const nextLiked = !alreadyLiked;

    // تحديث تفاؤلي فوري (شجرة متداخلة: نبحث في التعليقات الرئيسية وردودها معاً)
    const applyDelta = (nodes: CommentNode[]): CommentNode[] =>
      nodes.map((n) => ({
        ...n,
        likes: n.id === commentId ? Math.max(0, n.likes + (nextLiked ? 1 : -1)) : n.likes,
        replies: applyDelta(n.replies),
      }));
    setComments((prev) => applyDelta(prev));

    setLikedCommentIds((prev) => {
      const next = new Set(prev);
      if (nextLiked) next.add(commentId); else next.delete(commentId);
      window.localStorage.setItem("liked_comments", JSON.stringify(Array.from(next)));
      return next;
    });

    try {
      await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextLiked ? "like" : "unlike" }),
      });
    } catch {
      // فشل الشبكة: نترك التحديث التفاؤلي كما هو (تجربة مستخدم أفضل من التراجع المفاجئ)
    }
  };

  // إضافة تعليق رئيسي جديد
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !commentMessage.trim()) {
      setToast({ message: "الرجاء كتابة تعليق أولاً", type: "error" });
      return;
    }
    setSubmittingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: PAGE_SLUG, name: displayName.trim(), message: commentMessage.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setComments((prev) => [{ ...data.data, replies: [] }, ...prev]);
        setCommentMessage("");
      } else {
        setToast({ message: data.error || "تعذر نشر التعليق", type: "error" });
      }
    } catch {
      setToast({ message: "خطأ في الاتصال بالخادم", type: "error" });
    } finally {
      setSubmittingComment(false);
    }
  };

  // إضافة رد على تعليق رئيسي
  const handleAddReply = async (parentId: string) => {
    if (!displayName.trim() || !replyMessage.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: PAGE_SLUG, parentId, name: displayName.trim(), message: replyMessage.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setComments((prev) =>
          prev.map((c) => (c.id === parentId ? { ...c, replies: [...c.replies, { ...data.data, replies: [] }] } : c))
        );
        setReplyMessage("");
        setReplyingTo(null);
      } else {
        setToast({ message: data.error || "تعذر نشر الرد", type: "error" });
      }
    } catch {
      setToast({ message: "خطأ في الاتصال بالخادم", type: "error" });
    } finally {
      setSubmittingReply(false);
    }
  };

  // حفظ الاسم المستعار الجديد عند تعديله يدوياً
  const handleSaveDisplayName = (value: string) => {
    const trimmed = value.trim() || getOrCreateDisplayName();
    setDisplayName(trimmed);
    window.localStorage.setItem("comment_display_name", trimmed);
    setEditingName(false);
  };

  // مشاركة رابط الصفحة (Web Share API على الموبايل، نسخ الرابط كبديل على الحاسوب)
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = "فيجارا بلس";
    const shareText = "فيجارا بلس — تركيبة طبيعية مختارة للاستخدام اليومي. اكتشف العرض الآن:";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } catch {
        // المستخدم أغلق نافذة المشاركة — لا حاجة لأي إجراء
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setToast({ message: "تم نسخ رابط الصفحة! يمكنك لصقه في أي مكان للمشاركة", type: "success" });
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      setToast({ message: "تعذر نسخ الرابط، انسخه يدوياً من شريط العنوان", type: "info" });
    }
  };

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === formData.packageId) || null,
    [formData.packageId]
  );

  useEffect(() => {
    const key = "vigara_offer_claims";
    const stored = Number(window.localStorage.getItem(key));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- قراءة القيمة المحفوظة محلياً عند فتح الصفحة
    if (Number.isFinite(stored) && stored >= 2500) setOfferClaims(Math.floor(stored));
  }, []);

  const totalPrice = selectedPackage
    ? selectedPackage.price * (formData.quantity === "" ? 1 : formData.quantity)
    : 0;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const choosePackage = (id: number) => {
    setFormData((f) => ({ ...f, packageId: id }));
    scrollTo("order-form");
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = "الاسم الكامل مطلوب";
    if (!formData.phone.trim()) errors.phone = "رقم الهاتف مطلوب";
    else if (!/^[\d\s-]{6,15}$/.test(formData.phone)) errors.phone = "صيغة رقم الهاتف غير صالحة";
    if (!formData.city.trim()) errors.city = "الرجاء تحديد المدينة";
    if (formData.quantity === "" || formData.quantity < 1) errors.quantity = "الرجاء تحديد الكمية";
    if (!formData.address.trim()) errors.address = "العنوان الدقيق مطلوب";
    if (!formData.packageId) errors.packageId = "الرجاء اختيار باقة أولاً من قسم الباقات";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePreSubmitCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setToast({ message: "يرجى مراجعة الحقول الملونة بالأحمر", type: "error" });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalConfirmAndSubmit = async () => {
    if (!selectedPackage) return;
    setShowConfirmModal(false);
    setSubmitting(true);
    try {
      const orderData = {
        customerName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: "",
        country: "المغرب",
        city: formData.city,
        address: formData.address,
        productType: selectedPackage.name,
        quantity: Number(formData.quantity),
        unitPrice: selectedPackage.price,
        paymentMethod: "COD",
        sourcePage: "/product/vijara-plus",
      };
      const response = await fetch("/api/manual-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setOfferClaims((current) => {
          const next = Math.max(2500, current + 1);
          window.localStorage.setItem("vigara_offer_claims", String(next));
          return next;
        });
        setToast({ message: "🎉 تم استلام طلبك بنجاح! سنتواصل معك قريباً لتأكيد التسليم.", type: "success" });
        setFormData({ fullName: "", phone: "", city: "", address: "", quantity: "", packageId: null });
        setMobileQuantityMode("preset");
      } else {
        setToast({ message: result.error || "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى", type: "error" });
      }
    } catch {
      setToast({ message: "خطأ في الاتصال بالخادم، يرجى تكرار المحاولة", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const whyUs = [
    { icon: Headphones, title: "دعم العملاء", desc: "مساعدة قبل وبعد إتمام الطلب، على مدار الساعة." },
    { icon: Truck, title: "توصيل سريع", desc: "متابعة الطلب خطوة بخطوة حتى التسليم." },
    { icon: CheckCircle, title: "دفع عند الاستلام", desc: "لا تدفع شيئاً مسبقاً — الدفع عند وصول طلبك." },
    { icon: Zap, title: "تجربة بسيطة", desc: "معلومات المنتج والطلب في مكان واحد واضح." },
  ];

  const stats = [
    { value: "24/7", label: "دعم العملاء", stars: false },
    { value: "98%", label: "تجربة موصى بها", stars: false },
    { value: "4.9/5", label: "تقييم العملاء", stars: true },
    { value: "+30K", label: "عميل سعيد", stars: false },
  ];

  return (
    // ✅ خلفية الصفحة رمادية مثل فيسبوك — وكل المحتوى داخل إطارات بيضاء
    <div className="vigara-fb-page min-h-screen bg-[#F0F2F5] text-[#050505] font-sans antialiased" dir="rtl">
      <style>{`
        :root {
          --fb-font: Arial, Tahoma, "Segoe UI", sans-serif;
        }
        @keyframes galleryZoom {
          from { opacity: 0; transform: scale(1.03); }
          to { opacity: 1; transform: scale(1); }
        }
        .vigara-fb-page,
        .vigara-fb-page button,
        .vigara-fb-page input,
        .vigara-fb-page textarea,
        .vigara-fb-page select {
          font-family: var(--fb-font);
        }
        .vigara-fb-page {
          letter-spacing: 0;
          line-height: 1.45;
        }
        .vigara-fb-page h1,
        .vigara-fb-page h2,
        .vigara-fb-page h3 {
          letter-spacing: 0;
          line-height: 1.35;
        }
        .vigara-fb-page .font-semibold {
          font-weight: 600;
        }
        .vigara-fb-page .font-normal {
          font-weight: 400;
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <TopHeader onScrollTo={scrollTo} />

      <main id="home" className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-0 py-3 sm:py-4">
        {/* ==================== الهيرو: المنشور + الشريط الجانبي ==================== */}
        <div className="w-full grid lg:grid-cols-[minmax(0,1fr)_360px] gap-3 sm:gap-4 items-stretch">
          {/* ===== بطاقة منشور المنتج ===== */}
          <div className="order-1 bg-white rounded-xl border border-[#E4E6EB] shadow-sm overflow-hidden">
            {/* رأس المنشور */}
            <div className="flex items-start justify-between px-5 pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0E5FCB] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#1877F2]/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-base text-[#050505] flex items-center gap-1.5">
                    فيجارا بلس
                    <BadgeCheck className="w-4 h-4 text-[#1877F2] fill-[#1877F2]/15" />
                  </p>
                  <p className="text-xs text-[#65676B] font-normal flex items-center gap-1 mt-0.5">
                    منشور الآن · <Globe2 className="w-3.5 h-3.5" />
                  </p>
                </div>
              </div>
              <button className="w-9 h-9 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center text-[#65676B] transition-colors cursor-pointer" aria-label="خيارات">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* نص المنشور */}
            <p className="px-5 pb-4 text-[15px] text-[#050505] leading-relaxed">
              <span className="font-semibold">فيجارا بلس</span> — تركيبة مختارة للاستخدام اليومي. اكتشف المنتج والباقات المتاحة واختر الأنسب لك.
            </p>

            {/* المعرض */}
            <PostGallery images={productImages} activeIndex={activeImageIndex} onChange={setActiveImageIndex} />

            {/* تفاصيل المنشور — عنوان أوضح وأفخم */}
            <div className="p-5 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold leading-tight text-[#050505]">فيجارا بلس</h1>
              <p className="text-sm text-[#65676B] font-normal mt-1">منتج يومي · الدفع عند الاستلام · توصيل سريع</p>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold text-[#050505]">{packages[0].price} درهم</span>
                <span className="text-base text-[#8A8D91] line-through font-normal">{packages[0].originalPrice} درهم</span>
                <span className="text-xs font-semibold text-[#1877F2] bg-[#E7F3FF] border border-[#1877F2]/20 px-2.5 py-1.5 rounded-lg">
                  عرض محدود
                </span>
              </div>
              <button
                onClick={() => choosePackage(packages[0].id)}
                className="w-full mt-5 py-3.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold text-base rounded-xl transition-colors cursor-pointer"
              >
                اطلب الآن
              </button>

              {/* شريط التفاعل + نجوم التقييم */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#E4E6EB] text-sm text-[#65676B] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
                    <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
                  </span>
                  <span className="tabular-nums">{formatK(likesCount)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Stars rating={4.9} size="w-4 h-4" />
                  4.9/5
                </span>
              </div>
              <div className="grid grid-cols-3 border-t border-[#E4E6EB] mt-1 pt-1">
                <button
                  onClick={handleToggleLike}
                  disabled={likeBusy}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-[#F0F2F5] font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60 ${
                    isLiked ? "text-[#1877F2]" : "text-[#65676B]"
                  }`}
                >
                  <ThumbsUp className={`w-5 h-5 ${isLiked ? "fill-[#1877F2]" : ""}`} /> أعجبني
                </button>
                <button
                  onClick={() => { setShowComments((v) => !v); if (!showComments) scrollTo("post-comments"); }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-[#F0F2F5] text-[#65676B] font-semibold text-sm transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" /> تعليق {comments.length > 0 && `(${comments.length})`}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-[#F0F2F5] text-[#65676B] font-semibold text-sm transition-colors cursor-pointer"
                >
                  {shareCopied ? <Check className="w-5 h-5 text-[#42B72A]" /> : <Share2 className="w-5 h-5" />}
                  {shareCopied ? "تم النسخ" : "مشاركة"}
                </button>
              </div>

              {/* ==================== 💬 لوحة التعليقات والردود الحقيقية (بأسلوب فيسبوك) ==================== */}
              {showComments && (
                <div id="post-comments" className="mt-3 pt-4 border-t border-[#E4E6EB] scroll-mt-24">
                  {/* الاسم المستعار الحالي + إمكانية تعديله */}
                  <div className="flex items-center gap-2 mb-3 text-xs text-[#65676B]">
                    <div className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {(displayName || "؟").trim().charAt(0).toUpperCase()}
                    </div>
                    {editingName ? (
                      <form
                        onSubmit={(e) => { e.preventDefault(); handleSaveDisplayName((e.target as HTMLFormElement).nameInput.value); }}
                        className="flex items-center gap-1.5 flex-1"
                      >
                        <input
                          name="nameInput"
                          defaultValue={displayName}
                          autoFocus
                          maxLength={60}
                          className="flex-1 px-2.5 py-1.5 rounded-lg text-xs border border-[#1877F2] outline-none bg-white"
                          placeholder="اكتب اسمك الحقيقي إن أردت"
                        />
                        <button type="submit" className="text-[#1877F2] hover:text-[#166FE5] cursor-pointer" aria-label="حفظ الاسم">
                          <Check className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <span>
                          تُعلّق باسم <b className="text-[#050505]">{displayName}</b>
                        </span>
                        <button
                          onClick={() => setEditingName(true)}
                          className="flex items-center gap-1 text-[#1877F2] hover:underline cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" /> تعديل
                        </button>
                        <button
                          onClick={() => {
                            window.localStorage.removeItem("comment_display_name");
                            setDisplayName(getOrCreateDisplayName());
                          }}
                          className="flex items-center gap-1 text-[#65676B] hover:text-[#1877F2] cursor-pointer"
                          title="توليد اسم مستعار جديد"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* نموذج إضافة تعليق رئيسي */}
                  <form onSubmit={handleAddComment} className="flex gap-2 mb-5">
                    <input
                      type="text"
                      value={commentMessage}
                      onChange={(e) => setCommentMessage(e.target.value)}
                      placeholder="اكتب تعليقاً..."
                      maxLength={500}
                      className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg text-sm border border-[#CED0D4] outline-none focus:border-[#1877F2] bg-[#F0F2F5] focus:bg-white transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="w-10 h-10 flex-shrink-0 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center transition-colors disabled:opacity-60 cursor-pointer"
                      aria-label="نشر التعليق"
                    >
                      {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>

                  {/* قائمة التعليقات والردود */}
                  {commentsLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-[#1877F2]" />
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-center text-sm text-[#65676B] py-4">كن أول من يعلّق على هذا المنشور!</p>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                      {comments.map((c) => (
                        <div key={c.id}>
                          {/* التعليق الرئيسي */}
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                              {c.name.trim().charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="bg-[#F0F2F5] rounded-2xl px-3.5 py-2.5">
                                <p className="text-xs font-bold text-[#050505]">{c.name}</p>
                                <p className="text-sm text-[#050505] leading-relaxed break-words">{c.message}</p>
                              </div>
                              <div className="flex items-center gap-3 mt-1 px-2 text-[11px] font-bold text-[#65676B]">
                                <button
                                  onClick={() => handleToggleCommentLike(c.id)}
                                  className={`hover:underline cursor-pointer flex items-center gap-1 ${likedCommentIds.has(c.id) ? "text-[#1877F2]" : ""}`}
                                >
                                  إعجاب {c.likes > 0 && `(${c.likes})`}
                                </button>
                                <button
                                  onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                                  className="hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <CornerDownLeft className="w-3 h-3" /> رد
                                </button>
                              </div>

                              {/* نموذج الرد */}
                              {replyingTo === c.id && (
                                <form
                                  onSubmit={(e) => { e.preventDefault(); handleAddReply(c.id); }}
                                  className="flex gap-2 mt-2"
                                >
                                  <input
                                    type="text"
                                    autoFocus
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder={`الرد على ${c.name}...`}
                                    maxLength={500}
                                    className="flex-1 min-w-0 px-3 py-2 rounded-lg text-xs border border-[#CED0D4] outline-none focus:border-[#1877F2] bg-white"
                                  />
                                  <button
                                    type="submit"
                                    disabled={submittingReply}
                                    className="w-8 h-8 flex-shrink-0 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center transition-colors disabled:opacity-60 cursor-pointer"
                                    aria-label="نشر الرد"
                                  >
                                    {submittingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                  </button>
                                </form>
                              )}

                              {/* الردود المتداخلة */}
                              {c.replies.length > 0 && (
                                <div className="mt-2.5 space-y-2.5 border-r-2 border-[#E4E6EB] pr-3">
                                  {c.replies.map((r) => (
                                    <div key={r.id} className="flex items-start gap-2">
                                      <div className="w-6 h-6 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                                        {r.name.trim().charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="bg-[#F0F2F5] rounded-2xl px-3 py-2">
                                          <p className="text-[11px] font-bold text-[#050505]">{r.name}</p>
                                          <p className="text-xs text-[#050505] leading-relaxed break-words">{r.message}</p>
                                        </div>
                                        <button
                                          onClick={() => handleToggleCommentLike(r.id)}
                                          className={`text-[10px] font-bold mt-1 px-2 hover:underline cursor-pointer ${likedCommentIds.has(r.id) ? "text-[#1877F2]" : "text-[#65676B]"}`}
                                        >
                                          إعجاب {r.likes > 0 && `(${r.likes})`}
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ===== الشريط الجانبي ===== */}
          <aside className="order-2 flex flex-col gap-3 scroll-mt-24 h-full">
            {/* اختيار سريع للباقة */}
            <div className="bg-white rounded-xl border border-[#E4E6EB] shadow-sm p-5 lg:min-h-[320px] flex-[1.15] flex flex-col">
              <h2 className="font-bold text-xl sm:text-2xl leading-tight text-[#050505] mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#1877F2]" />
                اختر الباقة
              </h2>
              <div className="space-y-3 flex-1">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => choosePackage(pkg.id)}
                    className={`w-full flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer text-right min-h-[92px] ${
                      formData.packageId === pkg.id
                        ? "border-[#1877F2] bg-[#E7F3FF] ring-2 ring-[#1877F2]/15"
                        : "border-[#E4E6EB] bg-white hover:border-[#1877F2]/40"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#050505] flex items-center gap-2">
                        {pkg.name}
                        {pkg.popular && (
                          <span className="text-[10px] font-semibold text-white bg-[#1877F2] px-2 py-0.5 rounded-full">الأكثر طلباً</span>
                        )}
                      </p>
                      <p className="text-xs text-[#65676B] font-normal mt-1">{pkg.boxes} عبوة · {pkg.duration}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-[#1877F2]">{pkg.price} د</span>
                      {formData.packageId === pkg.id && <CheckCircle className="w-5 h-5 text-[#1877F2]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* زوار العرض + عداد العرض */}
            <LiveOfferCard />

            {/* معلومات مهمة */}
            <div className="bg-white rounded-xl border border-[#E4E6EB] shadow-sm p-5 lg:min-h-[250px] flex-1 flex flex-col">
              <h2 className="font-bold text-xl sm:text-2xl leading-tight text-[#050505] mb-4">معلومات مهمة</h2>
              <div className="space-y-3.5 flex-1">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#050505]">الدفع عند الاستلام</p>
                    <p className="text-xs text-[#65676B] font-normal mt-0.5">لا تدفع مسبقاً</p>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#050505]">توصيل سريع</p>
                    <p className="text-xs text-[#65676B] font-normal mt-0.5">حسب المدينة</p>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#050505]">ضمان الاسترداد</p>
                    <p className="text-xs text-[#65676B] font-normal mt-0.5">14 يوماً لاسترداد أموالك</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ملاحظة الخصوصية */}
            <div className="bg-white border border-[#E4E6EB] rounded-xl p-4 flex items-start gap-2.5">
              <span className="text-base flex-shrink-0">🔒</span>
              <p className="text-xs text-[#65676B] leading-relaxed font-normal">
                بياناتك تُستخدم فقط لمعالجة طلبك والتواصل معك لتأكيد التسليم.
              </p>
            </div>
          </aside>
        </div>

        {/* ==================== 🆕 سيكشن المكونات — تحت الهيرو مباشرة ==================== */}
        <section id="ingredients" className="mt-2 sm:mt-3 scroll-mt-24">
          <div className="w-full max-w-7xl mx-auto bg-white rounded-xl border border-[#E4E6EB] shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-[#E4E6EB]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#1877F2]">العلم يلتقي بالطبيعة</span>
                  <h2 className="text-xl sm:text-2xl font-bold leading-tight text-[#050505] mt-1">لماذا يعتبر فيجارا بلس الخيار الأول؟</h2>
                  <p className="text-[#65676B] text-sm leading-relaxed font-normal mt-1.5">على عكس المنتجات التجارية الكيميائية، يعتمد فيجارا بلس على تغذية الخلايا والأنشطة العضوية لتأمين تدفق دموي مستدام.</p>
                </div>
              </div>
            </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2.5 p-2.5 sm:p-3">
            {ingredients.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E4E6EB] shadow-sm p-4 sm:p-5 flex flex-col hover:shadow-lg hover:border-[#1877F2]/30 transition-all">
                <div className="w-11 h-11 rounded-xl bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center mb-3">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#050505] mb-1.5 leading-snug">{item.title}</h3>
                <p className="text-sm text-[#65676B] leading-relaxed mb-4 flex-1">{item.desc}</p>
                <span className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-[#42B72A] bg-[#42B72A]/10 border border-[#42B72A]/25 px-3 py-1.5 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {item.stat}
                </span>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* ==================== لماذا يختار العملاء فيجارا بلس؟ ==================== */}
        <section id="why" className="mt-2 sm:mt-3 scroll-mt-24">
          <div className="w-full max-w-7xl mx-auto bg-white rounded-xl border border-[#E4E6EB] shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-[#E4E6EB]">
              <h2 className="text-xl sm:text-2xl font-bold leading-tight text-[#050505]">لماذا يختار العملاء فيجارا بلس؟</h2>
              <p className="text-[#65676B] text-sm font-normal mt-0.5">معلومات واضحة ومباشرة، وكل ما تحتاج معرفته في مكان واحد.</p>
            </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-2.5 sm:p-3">
            {whyUs.map((item, i) => (
              <div key={i} className="bg-white border border-[#E4E6EB] rounded-xl p-4 sm:p-5 text-center shadow-sm hover:border-[#1877F2]/40 hover:shadow-lg transition-all">
                <div className="w-11 h-11 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center mx-auto mb-2.5">
                  <item.icon className="w-6 h-6" />
                </div>
                <p className="font-bold text-base text-[#050505] mb-1">{item.title}</p>
                <p className="text-sm text-[#65676B] leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* ==================== شريط الإحصائيات + نجوم التقييم ==================== */}
        <section className="mt-2 sm:mt-3">
          <div className="w-full max-w-7xl mx-auto bg-white rounded-xl border border-[#E4E6EB] shadow-sm px-4 py-4 sm:px-5 sm:py-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-[#050505]">{s.value}</p>
                  {s.stars && (
                    <div className="flex justify-center mt-2">
                      <Stars rating={4.9} size="w-5 h-5" />
                    </div>
                  )}
                  <p className="text-sm text-[#65676B] font-normal mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== سيكشن الباقات — ارتفاع وصورة أفضل ==================== */}
        <section id="packages" className="mt-6 sm:mt-8 scroll-mt-24">
          <div className="w-full max-w-7xl mx-auto bg-white rounded-xl border border-[#E4E6EB] shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-[#E4E6EB]">
              <h2 className="text-2xl sm:text-[26px] font-bold leading-tight text-[#050505]">اختر الباقة المناسبة لك</h2>
              <p className="text-[#65676B] text-sm font-normal mt-0.5">كلما زادت الكمية، حصلت على قيمة أفضل.</p>
            </div>

          <div className="grid md:grid-cols-3 gap-3 p-3 sm:p-4 items-stretch">
            {packages.map((pkg) => {
              const selected = formData.packageId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  className={`relative bg-white rounded-xl border p-6 flex flex-col transition-all ${
                    selected
                      ? "border-[#1877F2] ring-2 ring-[#1877F2]/20 shadow-lg"
                      : pkg.popular
                      ? "border-[#1877F2]/50 shadow-md"
                      : "border-[#E4E6EB] shadow-sm hover:shadow-lg hover:border-[#1877F2]/30"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3.5 right-1/2 translate-x-1/2 flex items-center gap-1.5 bg-[#1877F2] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md">
                      <Flame className="w-3.5 h-3.5" />
                      الأكثر طلباً
                    </span>
                  )}

                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#050505]">{pkg.name}</h3>
                    <span className="text-xs font-semibold text-[#65676B]">{pkg.duration}</span>
                  </div>

                  {/* ✅ صورة أطول عمودياً، مندمجة بدون حواف حادة */}
                  <div className="relative h-52 sm:h-56 rounded-xl bg-gradient-to-b from-[#F7F8FA] to-white border border-[#E4E6EB]/70 overflow-hidden mb-4 flex items-center justify-center p-5">
                    <Image
                      src={productImages[3].url}
                      alt={pkg.name}
                      fill
                      sizes="(max-width: 768px) 90vw, 30vw"
                      className="object-contain rounded-lg drop-shadow-xl p-5"
                      loading="lazy"
                      unoptimized
                    />
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />
                  </div>

                  <div className="flex items-center gap-3 flex-wrap mb-4">
                    <span className="text-2xl sm:text-3xl font-bold text-[#050505]">{pkg.price} درهم</span>
                    <span className="text-sm text-[#8A8D91] line-through font-normal">{pkg.originalPrice}</span>
                    <span className="text-xs font-semibold text-[#42B72A] bg-[#42B72A]/10 border border-[#42B72A]/20 px-2.5 py-1 rounded-lg">
                      وفر {pkg.save} درهم
                    </span>
                  </div>

                  <ul className="space-y-2.5 mb-5">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-[#65676B] font-normal">
                        <CheckCircle className="w-5 h-5 text-[#42B72A] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => choosePackage(pkg.id)}
                    className={`mt-auto w-full py-3.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                      selected
                        ? "bg-[#F0F2F5] text-[#1877F2] border border-[#1877F2]/30"
                        : "bg-[#1877F2] hover:bg-[#166FE5] text-white"
                    }`}
                  >
                    {selected ? "✓ تم اختيار هذه الباقة" : `اختر هذه الباقة — ${pkg.price} درهم`}
                  </button>
                </div>
              );
            })}
          </div>
          </div>
        </section>

        {/* ==================== نموذج إتمام الطلب ==================== */}
        <section id="order-form" ref={orderFormRef} className="mt-6 sm:mt-8 scroll-mt-24">
          <div className="w-full max-w-7xl mx-auto bg-white rounded-xl border border-[#E4E6EB] shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-[#E4E6EB] flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold leading-tight text-[#050505]">أكمل طلبك</h2>
                <p className="text-[#65676B] text-sm font-normal mt-0.5">أدخل معلومات التوصيل وسنتواصل معك لتأكيد الطلب.</p>
              </div>
              <div className="flex items-center gap-2 bg-[#E7F3FF] border border-[#1877F2]/20 rounded-lg px-2.5 sm:px-3 py-2 flex-shrink-0">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#1877F2] flex items-center justify-center">
                  <UsersIcon />
                </span>
                <div className="text-right">
                  <p className="text-[11px] sm:text-xs font-bold text-[#1877F2]">{offerClaims === 2500 ? "2.5K" : offerClaims < 10000 ? offerClaims.toLocaleString("en-US") : `${(offerClaims / 1000).toFixed(1)}K+`}</p>
                  <p className="text-[10px] sm:text-[11px] text-[#65676B]">حصلوا على هذا العرض</p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handlePreSubmitCheck}
              className="p-4 sm:p-5 lg:p-6"
              dir="rtl"
            >
              <div className="grid lg:grid-cols-[1fr_330px] gap-5">
                {/* الحقول */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label dir="rtl" className="block text-right text-sm font-semibold text-[#050505] mb-2">الاسم الكامل <span className="text-[#E41E3F] font-bold">*</span></label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={`${inputBase} ${formErrors.fullName ? inputErr : inputOk}`}
                        placeholder="مثال: محمد العلوي"
                      />
                      {formErrors.fullName && <p className="text-[#E41E3F] text-xs mt-1.5 font-semibold">{formErrors.fullName}</p>}
                    </div>
                    <div>
                      <label dir="rtl" className="block text-right text-sm font-semibold text-[#050505] mb-2">رقم الهاتف <span className="text-[#E41E3F] font-bold">*</span></label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^\d\s-]/g, "") })}
                        className={`${inputBase} text-left font-mono ${formErrors.phone ? inputErr : inputOk}`}
                        placeholder="06 00 00 00 00"
                        dir="ltr"
                      />
                      {formErrors.phone && <p className="text-[#E41E3F] text-xs mt-1.5 font-semibold text-right">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label dir="rtl" className="block text-right text-sm font-semibold text-[#050505] mb-2">الكمية <span className="text-[#DC2626] font-bold">*</span></label>

                      {/* الحاسوب: إدخال مباشر بدون إظهار 1 افتراضياً */}
                      <div className="hidden sm:block">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          inputMode="numeric"
                          value={formData.quantity}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {
                              setFormData({ ...formData, quantity: "" });
                              return;
                            }
                            const value = Number(raw);
                            setFormData({
                              ...formData,
                              quantity: Number.isFinite(value) && value >= 1 ? Math.floor(value) : "",
                            });
                          }}
                          className={`${inputBase} ${formErrors.quantity ? inputErr : inputOk} text-right`}
                          placeholder="اكتب الكمية التي تريدها"
                          aria-label="الكمية"
                        />
                      </div>

                      {/* الهاتف: اختيارات جاهزة + خيار لكتابة أي رقم */}
                      <div className="sm:hidden space-y-2">
                        <select
                          value={mobileQuantityMode === "custom" ? "custom" : (formData.quantity === "" ? "" : String(formData.quantity))}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "custom") {
                              setMobileQuantityMode("custom");
                              setFormData({ ...formData, quantity: "" });
                            } else if (value === "") {
                              setMobileQuantityMode("preset");
                              setFormData({ ...formData, quantity: "" });
                            } else {
                              setMobileQuantityMode("preset");
                              setFormData({ ...formData, quantity: Number(value) });
                            }
                          }}
                          className={`${inputBase} ${formErrors.quantity ? inputErr : inputOk} text-right bg-white`}
                          aria-label="اختر الكمية"
                        >
                          <option value="">اختر الكمية</option>
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((qty) => (
                            <option key={qty} value={qty}>{qty}</option>
                          ))}
                          <option value="custom">✎ كتابة رقم آخر</option>
                        </select>

                        {mobileQuantityMode === "custom" && (
                          <input
                            type="number"
                            min="1"
                            step="1"
                            inputMode="numeric"
                            value={formData.quantity}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === "") {
                                setFormData({ ...formData, quantity: "" });
                                return;
                              }
                              const value = Number(raw);
                              setFormData({
                                ...formData,
                                quantity: Number.isFinite(value) && value >= 1 ? Math.floor(value) : "",
                              });
                            }}
                            className={`${inputBase} ${formErrors.quantity ? inputErr : inputOk} text-right`}
                            placeholder="اكتب الرقم الذي تريده"
                            aria-label="اكتب كمية مخصصة"
                            autoFocus
                          />
                        )}
                      </div>

                      {formErrors.quantity && <p className="text-[#DC2626] text-xs mt-1.5 font-semibold">{formErrors.quantity}</p>}
                    </div>
                    <div>
                      <label dir="rtl" className="block text-right text-sm font-semibold text-[#050505] mb-2">المدينة <span className="text-[#E41E3F] font-bold">*</span></label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className={`${inputBase} ${formErrors.city ? inputErr : inputOk}`}
                        placeholder="مثال: الرباط"
                      />
                      {formErrors.city && <p className="text-[#E41E3F] text-xs mt-1.5 font-semibold">{formErrors.city}</p>}
                    </div>
                  </div>

                  <div>
                    <label dir="rtl" className="block text-right text-sm font-semibold text-[#050505] mb-2">العنوان بالتفصيل <span className="text-[#E41E3F] font-bold">*</span></label>
                    <textarea
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`${inputBase} resize-none ${formErrors.address ? inputErr : inputOk}`}
                      placeholder="الحي، الشارع، رقم المنزل..."
                    />
                    {formErrors.address && <p className="text-[#E41E3F] text-xs mt-1.5 font-semibold">{formErrors.address}</p>}
                  </div>
                </div>

                {/* ملخص الطلب */}
                <aside className="lg:sticky lg:top-24 h-fit space-y-4">
                  <div className={`rounded-xl border p-5 ${selectedPackage ? "border-[#1877F2]/30 bg-[#E7F3FF]" : "border-[#CED0D4] bg-[#F0F2F5]"}`}>
                    <h3 className="text-base font-semibold text-[#050505] mb-4">ملخص الطلب</h3>
                    {selectedPackage ? (
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between"><span className="text-[#65676B] font-normal">الباقة:</span><span className="font-semibold">{selectedPackage.name}</span></div>
                        <div className="flex justify-between"><span className="text-[#65676B] font-normal">الكمية:</span><span className="font-semibold">× {formData.quantity === "" ? "—" : formData.quantity}</span></div>
                        <div className="flex justify-between"><span className="text-[#65676B] font-normal">سعر الوحدة:</span><span className="font-semibold">{selectedPackage.price} درهم</span></div>
                        <div className="flex justify-between"><span className="text-[#65676B] font-normal">الدفع:</span><span className="font-semibold">عند الاستلام</span></div>
                        <div className="flex justify-between border-t border-[#1877F2]/20 pt-3 mt-3">
                          <span className="font-semibold text-[#050505]">الإجمالي:</span>
                          <span className="text-2xl font-semibold text-[#1877F2]">{totalPrice} درهم</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-sm text-[#65676B] font-normal mb-3">لم يتم اختيار باقة بعد</p>
                        <button
                          type="button"
                          onClick={() => scrollTo("packages")}
                          className="text-sm font-semibold text-[#1877F2] hover:underline cursor-pointer"
                        >
                          ← تصفح الباقات المتاحة
                        </button>
                      </div>
                    )}
                  </div>
                  {formErrors.packageId && <p className="text-[#E41E3F] text-xs font-semibold">{formErrors.packageId}</p>}

                  <div className="bg-[#F0F2F5] rounded-xl p-4 flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0">🔒</span>
                    <p className="text-xs text-[#65676B] leading-relaxed font-normal">بياناتك محمية وتُستخدم فقط لمعالجة طلبك.</p>
                  </div>
                </aside>
              </div>

              {/* زر التأكيد */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-5 py-3.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl text-base font-semibold transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2.5"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                {submitting ? "جاري التأكيد..." : "تأكيد الطلب والدفع عند الاستلام"}
              </button>

              {/* شريط الثقة */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 text-xs text-[#65676B] font-semibold">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#42B72A]" /> دفع عند الاستلام</span>
                <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#1877F2]" /> توصيل سريع</span>
                <span className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4 text-[#1877F2]" /> ضمان 14 يوماً</span>
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-[#42B72A]" /> بيانات محمية</span>
              </div>
            </form>

            <p className="text-center text-xs text-[#65676B] font-normal mt-4">فيجارا بلس - تجربة شراء بسيطة وواضحة</p>
          </div>
        </section>
      </main>

      <FAQSection />
      <SiteFooter />
      <WhatsAppButton />

      {/* ==================== نافذة تأكيد الطلب ==================== */}
      {showConfirmModal && selectedPackage && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050505]/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-5 sm:p-7">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E4E6EB]">
              <h3 className="font-semibold text-lg text-[#050505]">تأكيد الطلب النهائي</h3>
              <button onClick={() => setShowConfirmModal(false)} className="w-9 h-9 rounded-lg bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-[#65676B] transition-colors cursor-pointer" aria-label="إغلاق">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="bg-[#FFF8E7] text-[#8A6D00] text-sm font-semibold p-3.5 rounded-xl border border-[#F5B51B]/30 leading-relaxed">
                تأكد من صحة الاسم ورقم الهاتف ليتمكن مندوب التوصيل من الوصول إليك بسرعة.
              </p>
              <div className="bg-[#F0F2F5] rounded-xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-[#65676B] font-normal">الاسم:</span><span className="font-semibold">{formData.fullName}</span></div>
                <div className="flex justify-between"><span className="text-[#65676B] font-normal">الهاتف:</span><span className="font-semibold font-mono" dir="ltr">{formData.phone}</span></div>
                <div className="flex justify-between"><span className="text-[#65676B] font-normal">العنوان:</span><span className="font-semibold">{formData.city}، {formData.address}</span></div>
                <div className="flex justify-between border-t border-[#E4E6EB] pt-3 mt-3"><span className="text-[#65676B] font-semibold">الباقة:</span><span className="font-semibold text-[#1877F2]">{selectedPackage.name} × {formData.quantity}</span></div>
                <div className="flex justify-between"><span className="text-[#65676B] font-semibold">الإجمالي:</span><span className="font-semibold text-base">{totalPrice} درهم</span></div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleFinalConfirmAndSubmit}
                  className="flex-1 py-3.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  نعم، أكمل واحجز طلبي
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-5 py-3.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  تعديل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}