"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { fbTrack, generateEventId, getFbBrowserIds } from "@/lib/fbPixel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingCart, CheckCircle, Truck, Shield, Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, Loader2, X, MessageCircle, Menu, Search, BadgeCheck, Globe2,
  ThumbsUp, MessageSquare, Share2, MoreHorizontal, RotateCcw, Zap, Headphones, Info, HelpCircle,
  Flame, Package, Sparkles, Leaf, Heart, Award, TrendingUp, Send, Check, RefreshCw, Pencil, Maximize2, Lock, Phone,
} from "lucide-react";

// ==================== 🔙 حماية زر الرجوع في الهاتف ====================
// عند فتح أي عنصر "شبه منبثق" (صورة مكبّرة، قائمة، تعليقات، سؤال شائع)، نُضيف محطة تاريخ
// وهمية للمتصفح. فإذا ضغط الزائر زر الرجوع بهاتفه أثناء فتحه، يُغلَق العنصر فقط
// ويبقى داخل الموقع — بدل خروجه بالكامل من الصفحة كما كان يحدث سابقاً.
function useBackButtonClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ __overlay: true }, "");
    const handlePopState = () => onClose();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
}

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
  image: string;
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
    price: 350, originalPrice: 600, save: 250, popular: false,
    features: ["علبة واحدة من المنتج", "توصيل لجميع المدن", "الدفع عند الاستلام"],
    image: "/products/packages/pack-1.png",
  },
  {
    id: 2, name: "باقة التوفير", boxes: 2, duration: "شهران",
    price: 600, originalPrice: 700, save: 100, popular: true,
    features: ["علبتان من المنتج", "قيمة أفضل للكمية", "توصيل سريع مجاني", "الدفع عند الاستلام"],
    image: "/products/packages/pack-2.png",
  },
  {
    id: 3, name: "باقة القوة", boxes: 3, duration: "3 أشهر",
    price: 800, originalPrice: 1050, save: 250, popular: false,
    features: ["3 علب من المنتج", "أعلى قيمة للكمية", "توصيل سريع مجاني", "الدفع عند الاستلام"],
    image: "/products/packages/pack-3.png",
  },
];

// ==================== 📸 صور المنتج الحقيقية (من public/products) ====================
const productImages = [
  { url: "/erovia/herobanner1.png", alt: "إيروفيا - المظهر الطبيعي الموثوق" },
  { url: "/erovia/herobanner2.png", alt: "مكونات طبيعية نقية لإيروفيا" },
  { url: "/erovia/herobanner3.png", alt: "علب إيروفيا الفاخرة والأصلية" },
];

// ✅ صور سيكشن الباقات — منفصلة تماماً عن صور الهيرو، لم تتغيّر إطلاقاً
const packageSectionImages = [
  { url: "/products/erovia1.png", alt: "إيروفيا - المظهر الطبيعي الموثوق" },
  { url: "/products/erovia2.png", alt: "مكونات طبيعية نقية لإيروفيا" },
  { url: "/products/erovia3.png", alt: "علب إيروفيا الفاخرة والأصلية" },
];

// ==================== 🖼️ بطاقات سيكشن المعرض (صورة تجريبية موحّدة حالياً) ====================
const galleryCards = [
  { id: 1, desc: "تعبئة أصلية ومحكمة الإغلاق تصلك بنفس الجودة التي تراها هنا.", image: "/erovia/gallery1.png" },
  { id: 2, desc: "تركيبة مختارة بعناية لتناسب الاستخدام اليومي دون أي إزعاج.", image: "/erovia/gallery2.png" },
  { id: 3, desc: "علبة عملية سهلة الحمل، مناسبة لجدولك اليومي أينما كنت.", image: "/erovia/gallery3.png" },
  { id: 4, desc: "نفس المنتج الذي يثق به آلاف العملاء يومياً في كل المدن.", image: "/erovia/gallery4.png" },
];

// ==================== 🌿 المكونات الفعّالة (سيكشن جديد تحت الهيرو) ====================
// 🖼️ صور المكونات — ضعها لاحقاً في public/products/ingredients/ بنفس هذه الأسماء بالضبط
const ingredients = [
  { icon: Leaf, title: "مستخلص الجينسنغ", titleFr: "Extrait de Ginseng", desc: "من أقوى المكونات الطبيعية عالمياً لدعم الطاقة — يعزز الحيوية الخلوية ويرفع القدرة على التحمل بشكل طبيعي ومثبت علمياً.", stat: "+40% طاقة مستدامة", image: "/products/ingredients/ginseng.png" },
  { icon: Award, title: "مستخلص الماكا", titleFr: "Extrait de Maca", desc: "الذهب الأسود النادر من مرتفعات الأنديز — كنز طبيعي حقيقي يعزز التوازن الهرموني ويمنحك حيوية ملحوظة يوماً بعد يوم.", stat: "توازن هرموني طبيعي", image: "/products/ingredients/maca.png" },
  { icon: Zap, title: "مستخلص تونغكات علي", titleFr: "Extrait de Tongkat Ali", desc: "عشبة آسيوية أصيلة ذات سمعة قوية عبر قرون — تدعم الحيوية الذكورية والنشاط البدني اليومي بفعالية ملموسة.", stat: "دعم الحيوية الذكورية", image: "/products/ingredients/tongkat-ali.png" },
  { icon: Shield, title: "غلوكونات الزنك", titleFr: "Gluconate de Zinc", desc: "معدن أساسي لا غنى عنه — يمنح جهاز المناعة دعماً قوياً ويعزز الوظائف الإنجابية بشكل طبيعي وفعّال.", stat: "دعم المناعة والخصوبة", image: "/products/ingredients/zinc.png" },
  { icon: Sparkles, title: "فيتامين ب3", titleFr: "Vitamine B3", desc: "عنصر حيوي يسرّع التمثيل الغذائي الطبيعي للطاقة، ويساهم بفعالية في تقليل الإجهاد والشعور بالتعب اليومي.", stat: "دعم التمثيل الغذائي", image: "/products/ingredients/vitamin-b3.png" },
  { icon: Leaf, title: "حبوب لقاح النخيل", titleFr: "Pollen de Palmier", desc: "كنز غذائي طبيعي غنيّ جداً بالعناصر الحيوية — يمنح الجسم دفعة نشاط وحيوية عامة يشعر بها المستخدم بوضوح.", stat: "غنيّ بالعناصر الحيوية", image: "/products/ingredients/palm-pollen.png" },
  { icon: Heart, title: "غذاء ملكات النحل", titleFr: "Gelée Royale", desc: "من أثمن المنتجات الطبيعية على الإطلاق — تغذية خلوية متكاملة معروفة تاريخياً بدعمها القوي للحيوية والنشاط اليومي.", stat: "تغذية خلوية متكاملة", image: "/products/ingredients/royal-jelly.png" },
  { icon: Sparkles, title: "فيتامين ب10 (PABA)", titleFr: "Vitamine B10 (PABA)", desc: "يدعم صحة الخلايا بعمق ويساهم بفعالية حقيقية في الحفاظ على الوظائف الحيوية الطبيعية للجسم.", stat: "دعم صحة الخلايا", image: "/products/ingredients/vitamin-b10.png" },
  { icon: Zap, title: "سترات المغنيسيوم", titleFr: "Citrate de Magnésium", desc: "عنصر أساسي يمنح الجسم استرخاءً عضلياً وعصبياً حقيقياً، ويقلل الشعور بالتعب بشكل ملحوظ.", stat: "استرخاء عضلي وعصبي", image: "/products/ingredients/magnesium.png" },
  { icon: TrendingUp, title: "تورين", titleFr: "Taurine", desc: "حمض أميني قوي التأثير يدعم تنشيط الدورة الدموية بفعالية، ويمنح الجسم دفعة حقيقية من النشاط البدني.", stat: "تنشيط الدورة الدموية", image: "/products/ingredients/taurine.png" },
  { icon: Heart, title: "إل-أرجينين", titleFr: "L-Arginine", desc: "من أكثر الأحماض الأمينية شهرة عالمياً لدوره القوي في دعم تدفق الدم الصحي داخل الجسم بكفاءة عالية.", stat: "دعم تدفق الدم الصحي", image: "/products/ingredients/l-arginine.png" },
  { icon: Shield, title: "دنج", titleFr: "Propolis", desc: "مادة طبيعية ثمينة من خلية النحل، معروفة عالمياً بخصائصها القوية المضادة للأكسدة وفوائدها الصحية العديدة.", stat: "خصائص مضادة للأكسدة", image: "/products/ingredients/propolis.png" },
  { icon: Leaf, title: "جلسرين", titleFr: "Glycérine", desc: "مكوّن طبيعي عالي الجودة يمنح التركيبة قواماً ناعماً ومثالياً وسهل الامتصاص للاستفادة القصوى.", stat: "قوام طبيعي ناعم", image: "/products/ingredients/glycerin.png" },
  { icon: Award, title: "سوربيتول", titleFr: "Sorbitol", desc: "محلٍّ طبيعي خفيف ومتوازن، يُستخدم بعناية فائقة ضمن التركيبة لضمان مذاق مثالي دون أي إخلال بالجودة.", stat: "محلٍّ طبيعي خفيف", image: "/products/ingredients/sorbitol.png" },
];

// ==================== ❓ الأسئلة الشائعة ====================
const faqs = [
  { question: "ما هو إيروفيا وكيف يعمل؟", answer: "منتج طبيعي 100% مستخلص من أعشاب نادرة، يعزز الطاقة والحيوية بشكل طبيعي وآمن." },
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
  useBackButtonClose(mobileOpen, () => setMobileOpen(false));
  const [active, setActive] = useState("home");

  const navLinks = [
    { id: "home", label: "الرئيسية" },
    { id: "ingredients", label: "المكونات" },
    { id: "gallery", label: "المعرض" },
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
          {/* ✅ الشعار الرسمي الحقيقي — public/erovia/erovialogo.svg */}
          <button onClick={() => go("home")} className="flex items-center cursor-pointer flex-shrink-0">
            <Image
              src="/erovia/erovialogo.svg"
              alt="إيروفيا"
              width={160}
              height={44}
              className="h-9 sm:h-11 w-auto"
              priority
            />
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
                placeholder="بحث في إيروفيا"
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
              aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </div>

      {/* تظليل خفيف خلف القائمة عند فتحها — الضغط عليه يغلق القائمة (بدون ضبابية أو تعتيم مبالغ فيه) */}
      {mobileOpen && (
        <div
          className="fixed top-16 sm:top-[70px] left-0 right-0 bottom-0 bg-black/10 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ✅ قائمة الموبايل — بنفس امتداد النافبار البصري بالكامل (عرض كامل)، وظل يجعلها ملحقة به بانسجام وليست مقصوصة */}
      {mobileOpen && (
        <nav className="relative z-40 lg:hidden bg-white border-t border-[#E4E6EB] shadow-[0_12px_28px_rgba(0,0,0,0.08)]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-3 flex flex-col gap-1">
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
          </div>
        </nav>
      )}
    </header>
  );
}

// ==================== 🖼️ معرض الصور — صور مندمجة لا تملأ الإطار، بدعم كامل للسحب باللمس ====================
function PostGallery({ images, activeIndex, onChange, onExpand }: {
  images: { url: string; alt: string }[];
  activeIndex: number;
  onChange: (i: number) => void;
  onExpand: () => void;
}) {
  const prevIdx = (activeIndex - 1 + images.length) % images.length;
  const nextIdx = (activeIndex + 1) % images.length;

  // ✅ دعم السحب باللمس (سوايب) على الهاتف — بنفس منطق أزرار التنقل تماماً
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    const SWIPE_THRESHOLD = 40;
    if (touchDeltaX.current <= -SWIPE_THRESHOLD) {
      onChange(nextIdx); // سحب لليسار → الصورة التالية
    } else if (touchDeltaX.current >= SWIPE_THRESHOLD) {
      onChange(prevIdx); // سحب لليمين → الصورة السابقة
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <div className="w-full select-none">
      {/* 📱 الهاتف فقط — الصور الثلاث مكدّسة عمودياً بدون أي سكرول، كل صورة قابلة للضغط للتكبير */}
      <div className="sm:hidden flex flex-col gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => { onChange(i); onExpand(); }}
            aria-label={`تكبير ${img.alt}`}
            className="relative w-full aspect-square rounded-xl border border-[#E4E6EB] overflow-hidden bg-white cursor-zoom-in"
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="92vw"
              className="object-cover"
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </button>
        ))}
      </div>

      {/* 🖥️ الحاسوب فقط — صورة رئيسية + شريط مصغّرات تفاعلي */}
      <div className="hidden sm:block">
        <div
          className="relative w-full aspect-[4/3] rounded-xl border border-[#E4E6EB] overflow-hidden bg-white touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div key={activeIndex} onClick={onExpand} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onExpand(); }}
            aria-label="تكبير الصورة"
            className="absolute inset-0 cursor-zoom-in"
            style={{ animation: "galleryZoom 0.45s ease" }}
          >
            <Image
              src={images[activeIndex].url}
              alt={images[activeIndex].alt}
              fill
              sizes="60vw"
              className="object-cover"
              priority={activeIndex === 0}
              loading={activeIndex === 0 ? "eager" : "lazy"}
            />
          </div>

          {/* تلميح إمكانية التكبير */}
          <div className="absolute bottom-3 right-3 bg-white/10 backdrop-blur-sm text-white rounded-full p-1.5 pointer-events-none">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>

          {/* أزرار التنقل */}
          <button
            onClick={(e) => { e.stopPropagation(); onChange(prevIdx); }}
            className="absolute top-1/2 -translate-y-1/2 right-2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="السابق"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onChange(nextIdx); }}
            className="absolute top-1/2 -translate-y-1/2 left-2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="التالي"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* شريط المصغّرات */}
        <div className="flex items-center justify-center gap-2.5 mt-2.5">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onChange(i)}
              aria-label={`عرض ${img.alt}`}
              className={`relative w-20 h-20 rounded-lg overflow-hidden bg-white transition-all cursor-pointer ${
                i === activeIndex ? "border-2 border-[#1877F2]" : "border border-[#E4E6EB] opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 🔍 صندوق عرض الصورة بملء الشاشة (Lightbox) ====================
function ImageLightbox({ images, activeIndex, onChange, onClose }: {
  images: { url: string; alt: string }[];
  activeIndex: number;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const prevIdx = (activeIndex - 1 + images.length) % images.length;
  const nextIdx = (activeIndex + 1) % images.length;

  // إغلاق بمفتاح Esc + التنقل بالأسهم من لوحة المفاتيح
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange(prevIdx);
      if (e.key === "ArrowLeft") onChange(nextIdx);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onChange, prevIdx, nextIdx]);

  // سحب باللمس للتنقل بين الصور، بنفس منطق المعرض الرئيسي
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (touchDeltaX.current <= -40) onChange(nextIdx);
    else if (touchDeltaX.current >= 40) onChange(prevIdx);
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-[#050505]/92 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="عرض الصورة بملء الشاشة"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
        aria-label="إغلاق"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 bg-white/10 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full">
        {activeIndex + 1} / {images.length}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onChange(prevIdx); }}
        className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-5 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
        aria-label="السابق"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onChange(nextIdx); }}
        className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-5 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
        aria-label="التالي"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <div
        className="relative w-full h-full max-w-4xl max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[activeIndex].url}
          alt={images[activeIndex].alt}
          fill
          sizes="100vw"
          className="object-contain select-none"
          priority
        />
      </div>

      {/* نقاط التنقل */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onChange(i); }}
            aria-label={`صورة ${i + 1}`}
            className={`h-2.5 w-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
              i === activeIndex ? "bg-white/10 border-white" : "bg-white/10 border-white/25 hover:border-white/45"
            }`}
          >
            {i === activeIndex && <span className="h-1.5 w-5 rounded-full bg-white" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== 👀 عداد الزوار + العرض المحدود ====================
function LiveOfferCard() {
  const [visitorCount, setVisitorCount] = useState(12100);
  const [remaining, setRemaining] = useState(24 * 60 * 60);

  useEffect(() => {
    // عداد واجهة ديناميكي للاستخدام التسويقي؛ القيمة تتغير بسلاسة داخل نطاق العرض.
    const visitorTimer = window.setInterval(() => {
      setVisitorCount((current) => {
        const delta = Math.floor(Math.random() * 1201) - 600;
        return Math.min(30000, Math.max(5000, current + delta));
      });
    }, 7000);

    const storageKey = "erovia_offer_end_at";
    const now = Date.now();
    let endAt = Number(window.localStorage.getItem(storageKey));
    if (!endAt || endAt <= now) {
      endAt = now + 24 * 60 * 60 * 1000;
      window.localStorage.setItem(storageKey, String(endAt));
    }

    const tick = () => {
      let seconds = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      if (seconds <= 0) {
        endAt = Date.now() + 24 * 60 * 60 * 1000;
        window.localStorage.setItem(storageKey, String(endAt));
        seconds = 24 * 60 * 60;
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

  const hours = String(Math.floor(remaining / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  const displayVisitors = `${(visitorCount / 1000).toFixed(1)}K`;

  return (
    <div className="bg-gradient-to-br from-white via-white to-[#FE2C55]/[0.03] rounded-none sm:rounded-xl border-y sm:border border-[#E4E6EB] shadow-none sm:shadow-sm overflow-hidden lg:min-h-[128px] flex flex-col justify-center">
      <div className="p-4 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-[#42B72A]/10 flex items-center justify-center flex-shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#42B72A] opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#42B72A]" />
              </span>
            </div>
            <div>
              <p className="text-base sm:text-sm font-bold text-[#050505] tabular-nums leading-none transition-all duration-700">{displayVisitors} زائر</p>
              <p className="text-xs text-[#65676B] mt-1">يشاهدون هذا العرض الآن</p>
            </div>
          </div>
          <div className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3.5 pt-3.5 border-t border-[#E4E6EB]/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FE2C55]/10 text-[#FE2C55] flex items-center justify-center flex-shrink-0">
              <Flame className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#050505] truncate">العرض الحالي لفترة محدودة</p>
              <p className="text-xs text-[#65676B] mt-0.5 truncate">احجز باقتك قبل انتهاء المؤقت</p>
            </div>
          </div>
          <div dir="ltr" className="text-base font-bold tracking-wide text-[#1877F2] bg-[#E7F3FF] px-3 py-2 rounded-lg tabular-nums flex-shrink-0">
            {hours}:{minutes}:{seconds}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== ❓ قسم الأسئلة الشائعة ====================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  useBackButtonClose(openIndex !== null, () => setOpenIndex(null));

  return (
    <section id="faqs" className="py-3 sm:py-4 px-0 sm:px-4 lg:px-6 scroll-mt-20">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-none sm:rounded-xl border-y sm:border border-[#E4E6EB] shadow-none sm:shadow-sm overflow-hidden">
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
          © {new Date().getFullYear()} إيروفيا — تجربة شراء بسيطة وواضحة
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
function FloatingOrderButton() {
  return (
    <a
      href="#order-form"
      className="fixed bottom-5 left-4 z-[60] flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] shadow-xl text-white font-semibold text-sm transition-colors"
      aria-label="اطلب الآن"
    >
      <ShoppingCart className="w-5 h-5" />
      اطلب الآن
    </a>
  );
}

function UsersIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

// ==================== 🏷️ معرّف الصفحة (يُستخدم في نظام الإعجابات والتعليقات الحقيقي) ====================
const PAGE_SLUG = "erovia";

interface CommentNode {
  id: string;
  parentId: string | null;
  name: string;
  message: string;
  likes: number;
  createdAt: string;
  replies: CommentNode[];
}

// ==================== 👥 أرقام تفاعل أساسية (Social Proof) — تُضاف فوق الأرقام الحقيقية، والنظام الفعلي يعمل بشكل طبيعي فوقها ====================
const LIKES_BASELINE = 5327;
const SHARES_BASELINE = 237;


// 💬 20 تعليقاً أساسياً متنوعاً (Social Proof) — تظهر فوراً، والتعليقات الحقيقية تُضاف فوقها بشكل طبيعي
const SEED_COMMENTS: CommentNode[] = [
  { id: "seed-1", parentId: null, name: "يوسف العلوي", message: "المنتج أصلي فعلاً، التغليف احترافي جداً ولا يحمل أي إشارة تكشف المحتوى.", likes: 34, createdAt: "2026-08-01T10:00:00Z", replies: [] },
  { id: "seed-2", parentId: null, name: "كريم بنعلي", message: "توصيل سريع، وصلني خلال يومين فقط من الرباط. تجربة ممتازة.", likes: 21, createdAt: "2026-08-02T11:00:00Z", replies: [] },
  { id: "seed-3", parentId: null, name: "سفيان الإدريسي", message: "كنت متردداً بالبداية بصراحة، لكن الدفع عند الاستلام شجّعني أطلب.", likes: 45, createdAt: "2026-08-03T09:30:00Z", replies: [] },
  { id: "seed-4", parentId: null, name: "عادل الوردي", message: "لاحظت فرقاً حقيقياً في مستوى الطاقة خلال أول أسبوعين من الاستخدام المنتظم.", likes: 58, createdAt: "2026-08-04T14:20:00Z", replies: [] },
  { id: "seed-5", parentId: null, name: "أمين حمداوي", message: "خدمة العملاء متجاوبة معايا بسرعة كبيرة على واتساب، شكراً ليكم.", likes: 19, createdAt: "2026-08-05T16:00:00Z", replies: [] },
  { id: "seed-6", parentId: null, name: "محمد الصقلي", message: "طلبت باقة الثلاث علب مباشرة بعد التوصية، والقيمة ممتازة مقارنة بالسعر.", likes: 27, createdAt: "2026-08-06T08:45:00Z", replies: [] },
  { id: "seed-7", parentId: null, name: "طارق بوزيان", message: "المكونات الطبيعية المكتوبة على العلبة مطابقة تماماً لما هو موجود بالوصف هنا.", likes: 15, createdAt: "2026-08-07T12:10:00Z", replies: [] },
  { id: "seed-8", parentId: null, name: "رشيد الفاسي", message: "أول مرة نجرب منتج من صفحة فيسبوك ويوصل فعلاً بالسرعة اللي وعدو بيها.", likes: 38, createdAt: "2026-08-08T15:30:00Z", replies: [] },
  { id: "seed-9", parentId: null, name: "نبيل شرقاوي", message: "الثقة زادت عندي بعد قراءة كل هاد التعليقات الصادقة قبل ما نطلب.", likes: 12, createdAt: "2026-08-09T09:00:00Z", replies: [] },
  { id: "seed-10", parentId: null, name: "حمزة الزياني", message: "التوصيل وصل حتى لمدينتنا الصغيرة، ما كنتش متوقع هاد السرعة.", likes: 24, createdAt: "2026-08-10T13:40:00Z", replies: [] },
  { id: "seed-11", parentId: null, name: "إلياس مرابط", message: "جودة العلبة نفسها فاخرة، حسّيت بيها منتج أصلي من أول لمسة.", likes: 31, createdAt: "2026-08-11T10:15:00Z", replies: [] },
  { id: "seed-12", parentId: null, name: "بلال التازي", message: "شكراً على الشرح الواضح للمكونات، ساعدني نفهم كل شي قبل الطلب.", likes: 17, createdAt: "2026-08-12T11:50:00Z", replies: [] },
  { id: "seed-13", parentId: null, name: "زكرياء الحسني", message: "ضمان الاسترداد كان سبب رئيسي خلاني نجرب بدون خوف.", likes: 22, createdAt: "2026-08-13T14:00:00Z", replies: [] },
  { id: "seed-14", parentId: null, name: "أيوب الغازي", message: "التغليف السرّي والاحترافي نقطة مهمة جداً بالنسبة لي شخصياً.", likes: 29, createdAt: "2026-08-14T16:30:00Z", replies: [] },
  { id: "seed-15", parentId: null, name: "وليد بنجلون", message: "أنصح بباقة التوفير، أفضل قيمة مقابل السعر من تجربتي الشخصية.", likes: 41, createdAt: "2026-08-15T09:20:00Z", replies: [] },
  { id: "seed-16", parentId: null, name: "عمر الراشدي", message: "التواصل قبل التأكيد كان مريح، أكدو معايا كل التفاصيل بالهاتف.", likes: 13, createdAt: "2026-08-16T12:45:00Z", replies: [] },
  { id: "seed-17", parentId: null, name: "سعيد لحلو", message: "منتج طبيعي بصح، ما حسيتش بأي إزعاج أو أعراض جانبية.", likes: 36, createdAt: "2026-08-17T15:10:00Z", replies: [] },
  { id: "seed-18", parentId: null, name: "يونس بركاش", message: "صراحة السعر معقول جداً مقارنة بمنتجات مشابهة شفتها فسوق مغربي.", likes: 20, createdAt: "2026-08-18T10:30:00Z", replies: [] },
  { id: "seed-19", parentId: null, name: "معاذ الخطابي", message: "الصفحة واضحة ومنظمة، سهّلت عليا نختار الباقة المناسبة ليا بسرعة.", likes: 25, createdAt: "2026-08-19T13:00:00Z", replies: [] },
  { id: "seed-20", parentId: null, name: "أنس الجراري", message: "تجربة شراء بسيطة فعلاً من الطلب حتى التوصيل، ما كاينش تعقيد.", likes: 33, createdAt: "2026-08-20T08:00:00Z", replies: [] },
  { id: "seed-21", parentId: null, name: "خالد بنيس", message: "صراحة تفاجأت بجودة الخدمة، كنت متوقع أقل من هاد المستوى.", likes: 18, createdAt: "2026-08-21T09:15:00Z", replies: [] },
  { id: "seed-22", parentId: null, name: "عبد الرحيم زروالي", message: "أول طلبية ليا من صفحة فيسبوك ونجحت، ثقتي زادت فالتسوق أونلاين.", likes: 26, createdAt: "2026-08-22T11:40:00Z", replies: [] },
  { id: "seed-23", parentId: null, name: "فؤاد الناصري", message: "التوصيل جا فالوقت المحدد بالضبط، ما كاين حتى تأخير.", likes: 14, createdAt: "2026-08-23T14:20:00Z", replies: [] },
];

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
  "زائر مهتم", "عميل جديد", "متابع إيروفيا", "زائر الصفحة", "مهتم بالعرض",
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
export default function EroviaProductPage() {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  useBackButtonClose(lightboxOpen, () => setLightboxOpen(false));
  // ✅ قائمة النقاط الثلاث في رأس المنشور — تنقّل مباشر لكل سيكشنز الصفحة
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const postMenuLinks = [
    { id: "home", label: "الرئيسية" },
    { id: "ingredients", label: "المكونات" },
    { id: "gallery", label: "المعرض" },
    { id: "why", label: "لماذا نحن" },
    { id: "packages", label: "الباقات" },
    { id: "order-form", label: "الطلب" },
    { id: "faqs", label: "الأسئلة الشائعة" },
  ];
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    fullName: "", phone: "", city: "", address: "", quantity: packages[0].boxes, packageId: packages[0].id,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [offerClaims, setOfferClaims] = useState(2500);
  const orderFormRef = useRef<HTMLDivElement>(null);
  // ✅ يمنع التقاط أكثر من "طلب مبدئي" واحد لنفس الزائر في نفس الجلسة
  const leadCapturedRef = useRef(false);

  // ==================== 👍 حالة إعجاب المنشور نفسه ====================
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  // ==================== 💬 حالة التعليقات والردود (شجرية) ====================
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  useBackButtonClose(showComments, () => setShowComments(false));
  const [displayName, setDisplayName] = useState(""); // الاسم المستعار الحالي (قابل للتعديل)
  const [editingName, setEditingName] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  // ✅ هل أتمّ هذا الزائر طلباً من قبل؟ (شرط السماح له بالتعليق)
  const [hasOrdered, setHasOrdered] = useState(false);

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

    const orderedBefore = window.localStorage.getItem(`ordered_${PAGE_SLUG}`) === "true";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- قراءة حالة إتمام الطلب المحفوظة محلياً لهذا الزائر
    setHasOrdered(orderedBefore);

    fetch(`/api/likes?slug=${PAGE_SLUG}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setLikesCount(d.data.likes); })
      .catch(() => {});

    fetch(`/api/comments?slug=${PAGE_SLUG}`)
      .then((r) => r.json())
      .then((d) => {
        const realComments = d.success ? buildCommentTree(d.data) : [];
        // ✅ التعليقات الحقيقية أولاً (الأحدث)، ثم التعليقات الأساسية بعدها — النظام الحقيقي يعمل بشكل طبيعي فوقها
        setComments([...realComments, ...SEED_COMMENTS]);
      })
      .catch(() => setComments(SEED_COMMENTS))
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

    // ✅ التعليقات الأساسية (seed-) غير موجودة فعلياً في قاعدة البيانات — تحديث بصري محلي فقط بدون طلب شبكة عبثي
    if (commentId.startsWith("seed-")) return;

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
    if (!hasOrdered) {
      setToast({ message: "يمكنك إضافة تعليقك بعد إتمام طلبك أولاً", type: "error" });
      return;
    }
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
    const shareTitle = "إيروفيا";
    const shareText = "إيروفيا — تركيبة طبيعية مختارة للاستخدام اليومي. اكتشف العرض الآن:";

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

  // ✅ التقاط الطلب تلقائياً بمجرد كتابة رقم هاتف بطول معقول — حتى بدون اسم أو عنوان،
  // وحتى لو لم يضغط الزائر زر التأكيد إطلاقاً (مصنَّف في ملاحظات الأدمن كـ"طلب مبدئي غير مؤكَّد")
  useEffect(() => {
    if (leadCapturedRef.current) return;
    const digitsOnly = formData.phone.replace(/[^\d]/g, "");
    // ✅ أي رقم بطول 9 أرقام فأكثر يكفي لإطلاق الالتقاط (بدون شرط بادئة صارم قد يستثني أرقاماً صحيحة)
    if (digitsOnly.length < 9) return;

    const timer = setTimeout(() => {
      if (leadCapturedRef.current) return;
      leadCapturedRef.current = true;
      const pkg = selectedPackage || packages[0];
      fetch("/api/manual-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.fullName.trim() || "زائر (لم يكتب اسمه بعد)",
          phone: digitsOnly,
          email: "",
          country: "المغرب",
          city: formData.city.trim() || "غير محدد",
          address: formData.address.trim() || "لم يُكتب العنوان بعد",
          productType: pkg.name,
          quantity: pkg.boxes,
          unitPrice: pkg.price,
          paymentMethod: "COD",
          sourcePage: "/product/erovia",
          adminNotes: "⚠️ طلب مبدئي غير مؤكَّد — تم التقاطه تلقائياً فور كتابة رقم الهاتف، ولم يضغط الزائر على زر تأكيد الطلب. يُنصح بالاتصال للتأكد قبل الشحن.",
          isLead: true,
        }),
      }).catch((err) => {
        // نُسجّل الخطأ في الكونسول للتشخيص، لكن لا نزعج الزائر بأي رسالة على عملية خلفية لم يطلبها صراحة
        console.error("[Lead capture failed]", err);
      });
    }, 800); // مهلة قصيرة تضمن أن الزائر توقف فعلاً عن الكتابة

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.phone]);

  useEffect(() => {
    const key = "erovia_offer_claims";
    const stored = Number(window.localStorage.getItem(key));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- قراءة القيمة المحفوظة محلياً عند فتح الصفحة
    if (Number.isFinite(stored) && stored >= 2500) setOfferClaims(Math.floor(stored));
  }, []);

  // ✅ Facebook Pixel: ViewContent عند فتح صفحة المنتج
  useEffect(() => {
    fbTrack("ViewContent", {
      content_name: "Erovia",
      content_category: "erovia",
      currency: "MAD",
      value: packages[0]?.price,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPrice = selectedPackage ? selectedPackage.price : 0;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ✅ اختيار الباقة (من البطاقات الجانبية أو من خانة "اختيار الباقة" داخل النموذج) — يُحدّث الكمية تلقائياً معه
  const choosePackage = (id: number) => {
    const pkg = packages.find((p) => p.id === id);
    setFormData((f) => ({ ...f, packageId: id, quantity: pkg ? pkg.boxes : f.quantity }));
    if (pkg) {
      fbTrack("InitiateCheckout", {
        content_name: pkg.name,
        content_category: "erovia",
        currency: "MAD",
        value: pkg.price,
      });
    }
  };

  // نفس اختيار الباقة لكن مع التمرير التلقائي لقسم الطلب (تُستخدم من بطاقات الباقات خارج النموذج)
  const choosePackageAndScroll = (id: number) => {
    choosePackage(id);
    scrollTo("order-form");
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = "الاسم الكامل مطلوب";
    if (!formData.phone.trim()) errors.phone = "رقم الهاتف مطلوب";
    else if (!/^[\d\s-]{6,15}$/.test(formData.phone)) errors.phone = "صيغة رقم الهاتف غير صالحة";
    if (!formData.city.trim()) errors.city = "الرجاء تحديد المدينة";
    if (!formData.address.trim()) errors.address = "العنوان الدقيق مطلوب";
    if (!formData.packageId) errors.packageId = "الرجاء اختيار باقة أولاً";
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
      // ✅ معرّف حدث موحّد يُستخدم في كل من بكسل المتصفح وConversions API من السيرفر
      // لضمان عدم احتساب نفس عملية الشراء مرتين في Meta Events Manager
      const fbEventId = generateEventId();
      const { fbp, fbc } = getFbBrowserIds();

      const orderData = {
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
        sourcePage: "/product/erovia",
        fbEventId,
        fbp: fbp || undefined,
        fbc: fbc || undefined,
        contentCategory: "erovia",
      };
      const response = await fetch("/api/manual-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        // ✅ إطلاق Purchase من المتصفح بنفس المعرّف المُرسل للسيرفر أعلاه
        fbTrack(
          "Purchase",
          {
            content_name: selectedPackage.name,
            content_category: "erovia",
            currency: "MAD",
            value: selectedPackage.price,
          },
          fbEventId
        );

        setOfferClaims((current) => {
          const next = Math.max(2500, current + 1);
          window.localStorage.setItem("erovia_offer_claims", String(next));
          return next;
        });

        // ✅ فتح إمكانية التعليق فوراً بعد نجاح الطلب فعلياً
        window.localStorage.setItem(`ordered_${PAGE_SLUG}`, "true");
        setHasOrdered(true);

        // ✅ تخزين تفاصيل الطلب مؤقتاً (sessionStorage) ثم الانتقال الفعلي لرابط /thankyou
        // منفصل — يتيح تتبّعاً مثالياً عبر Pixel كصفحة تأكيد مستقلة بعنوانها الخاص
        window.sessionStorage.setItem(
          "erovia_last_order",
          JSON.stringify({
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            city: formData.city,
            address: formData.address.trim(),
            packageName: selectedPackage.name,
            total: selectedPackage.price,
          })
        );
        setFormData({ fullName: "", phone: "", city: "", address: "", quantity: packages[0].boxes, packageId: packages[0].id });
        router.push("/product/erovia/thankyou");
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

  // ✅ التمرير بالأسهم لسكشن المكونات (حاسوب فقط) — مع تتبّع حقيقي لموضع السكرول
  // لإخفاء كل سهم تلقائياً عند وصوله لنهايته (متوافق مع اتجاه RTL في كل المتصفحات)
  const ingredientsScrollRef = useRef<HTMLDivElement>(null);
  const [ingredientsAtStart, setIngredientsAtStart] = useState(true);
  const [ingredientsAtEnd, setIngredientsAtEnd] = useState(false);

  const updateIngredientsScrollState = useCallback(() => {
    const el = ingredientsScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // القيمة المطلقة تتعامل مع اختلاف تفسير scrollLeft بين المتصفحات في RTL
    setIngredientsAtStart(pos <= 2);
    setIngredientsAtEnd(pos >= maxScroll - 2);
  }, []);

  useEffect(() => {
    const el = ingredientsScrollRef.current;
    if (!el) return;
    updateIngredientsScrollState();
    el.addEventListener("scroll", updateIngredientsScrollState, { passive: true });
    window.addEventListener("resize", updateIngredientsScrollState);
    return () => {
      el.removeEventListener("scroll", updateIngredientsScrollState);
      window.removeEventListener("resize", updateIngredientsScrollState);
    };
  }, [updateIngredientsScrollState]);

  const scrollIngredients = (dir: "prev" | "next") => {
    const el = ingredientsScrollRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.8, 640);
    el.scrollBy({ left: dir === "next" ? -amount : amount, behavior: "smooth" });
  };

  const testimonials = [
    { name: "يوسف.ب", city: "الدار البيضاء", rating: 5, text: "توصيل سريع فعلاً وسرّي تماماً، والمنتج أصلي 100%. مقتنع بالجودة من أول علبة." },
    { name: "كريم.م", city: "مراكش", rating: 5, text: "كنت متردداً في البداية، لكن التجربة تجاوزت توقعاتي. سأطلب الباقة الكبيرة المرة القادمة." },
    { name: "سفيان.ر", city: "طنجة", rating: 5, text: "الدفع عند الاستلام أراحني كثيراً، وخدمة العملاء متجاوبة وسريعة في الرد." },
    { name: "عادل.و", city: "فاس", rating: 5, text: "منتج طبيعي فعلاً، لاحظت الفرق خلال أسبوع من الاستخدام المنتظم. أنصح به بثقة." },
  ];

  return (
    // ✅ خلفية الصفحة رمادية مثل فيسبوك — وكل المحتوى داخل إطارات بيضاء
    <div className="erovia-fb-page min-h-screen bg-[#F0F2F5] text-[#050505] font-sans antialiased" dir="rtl">
      <style>{`
        :root {
          --fb-font: Arial, Tahoma, "Segoe UI", sans-serif;
        }
        @keyframes galleryZoom {
          from { opacity: 0; transform: scale(1.03); }
          to { opacity: 1; transform: scale(1); }
        }
        .erovia-fb-page,
        .erovia-fb-page button,
        .erovia-fb-page input,
        .erovia-fb-page textarea,
        .erovia-fb-page select {
          font-family: var(--fb-font);
        }
        .erovia-fb-page {
          letter-spacing: 0;
          line-height: 1.45;
        }
        .erovia-fb-page h1,
        .erovia-fb-page h2,
        .erovia-fb-page h3 {
          letter-spacing: 0;
          line-height: 1.35;
        }
        .erovia-fb-page .font-semibold {
          font-weight: 600;
        }
        .erovia-fb-page .font-normal {
          font-weight: 400;
        }
        /* ✅ إطار سيكشن المكونات — CSS صريح (بدل كلاسات Tailwind arbitrary) لضمان تطبيقه دائماً */
        .ingredients-frame {
          display: flex;
          flex-direction: column;
          height: 560px;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
        }
        .ingredients-frame::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 640px) {
          .ingredients-frame {
            flex-direction: row;
            height: auto;
            overflow-y: visible;
            overflow-x: auto;
          }
        }
        .ingredient-card {
          width: 100%;
          flex-shrink: 0;
        }
        @media (min-width: 640px) {
          .ingredient-card {
            width: 300px;
            min-height: 420px;
          }
        }
        @media (min-width: 1024px) {
          .ingredient-card {
            width: 320px;
            min-height: 450px;
          }
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <TopHeader onScrollTo={scrollTo} />

      <main id="home" className="w-full max-w-7xl mx-auto px-0 sm:px-4 lg:px-0 py-3 sm:py-4">
        {/* ✅ في الهاتف فقط: بطاقة عدد الزوار والعرض المحدود تظهر أول سيكشن بأعلى الصفحة */}
        <div className="lg:hidden mb-2">
          <LiveOfferCard />
        </div>

        {/* ==================== الهيرو: المنشور + الشريط الجانبي ==================== */}
        <div className="w-full grid lg:grid-cols-[minmax(0,1fr)_360px] gap-2 items-stretch">
          {/* ===== بطاقة منشور المنتج ===== */}
          <div className="order-1 bg-white rounded-none sm:rounded-xl border-y sm:border border-[#E4E6EB] shadow-none sm:shadow-sm overflow-hidden">
            {/* رأس المنشور */}
            <div className="flex items-start justify-between px-5 pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 relative bg-[#F0F2F5]">
                  <Image src="/erovia/eroviaicon.png" alt="إيروفيا" fill sizes="44px" className="object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-base text-[#050505] flex items-center gap-1.5">
                    إيروفيا
                    <BadgeCheck className="w-4 h-4 text-[#1877F2] fill-[#1877F2]/15" />
                    <span className="inline-flex items-center gap-1 bg-[#E7F3FF] text-[#1877F2] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      طبيعي 100%
                    </span>
                  </p>
                  <p className="text-xs text-[#65676B] font-normal flex items-center gap-1 mt-0.5">
                    منشور الآن · <Globe2 className="w-3.5 h-3.5" />
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setPostMenuOpen((v) => !v)}
                  className="w-9 h-9 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center text-[#65676B] transition-colors cursor-pointer"
                  aria-label="خيارات وتنقّل سريع"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {postMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setPostMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute left-0 top-11 z-40 w-48 bg-white rounded-xl border border-[#E4E6EB] shadow-lg py-1.5 overflow-hidden">
                      {postMenuLinks.map((link) => (
                        <button
                          key={link.id}
                          onClick={() => { scrollTo(link.id); setPostMenuOpen(false); }}
                          className="w-full text-right px-4 py-2.5 text-sm text-[#050505] hover:bg-[#F0F2F5] transition-colors cursor-pointer"
                        >
                          {link.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* نص المنشور */}
            <p className="px-5 pb-4 text-[15px] text-[#050505] leading-relaxed">
              <span className="font-semibold">إيروفيا</span> — وداعا للضعف الجنسي و ضعف الانتصاب و المشاكل الزوجية.  بفضل منتجنا الحل النهائي بين يديك اليوم. تركيبة مختارة للاستخدام اليومي. اكتشف المنتج والباقات المتاحة واختر الأنسب لك.
            </p>

            {/* المعرض */}
            <PostGallery images={productImages} activeIndex={activeImageIndex} onChange={setActiveImageIndex} onExpand={() => setLightboxOpen(true)} />

            {/* تفاصيل المنشور — عنوان أوضح وأفخم */}
            <div className="p-5 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold leading-tight text-[#050505]">إيروفيا</h1>
              <p className="text-sm text-[#65676B] font-normal mt-1">استعد طاقتك الذكورية وثقتك الحميمية · الدفع عند الاستلام · توصيل سريع</p>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <p className="text-base sm:text-lg font-semibold text-[#050505] leading-snug">
                  حدّد الباقة التي تناسبك من عروضنا وأكمل طلبك
                </p>
                <span className="text-xs font-semibold text-[#1877F2] bg-[#E7F3FF] border border-[#1877F2]/20 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                  عرض محدود
                </span>
              </div>
              <button
                onClick={() => choosePackageAndScroll(packages[0].id)}
                className="w-full mt-5 py-3.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold text-base rounded-xl transition-colors cursor-pointer"
              >
                اطلب الآن
              </button>

              {/* صندوق تقييم العملاء — أولاً، مباشرة تحت زر الطلب */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#E4E6EB]">
                <span className="text-sm text-[#65676B] font-semibold">تقييم العملاء</span>
                <span className="flex items-center gap-2 text-sm text-[#65676B] font-semibold">
                  <Stars rating={4.9} size="w-4 h-4" />
                  4.9/5
                </span>
              </div>

              {/* ✅ شريط إحصائيات التفاعل — بنفس تصميم فيسبوك الحقيقي تماماً */}
              <div className="flex items-center justify-between mt-2.5 text-sm text-[#65676B]">
                <span className="flex items-center gap-1.5">
                  <span className="w-[18px] h-[18px] rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0 ring-2 ring-white">
                    <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
                  </span>
                  <span className="tabular-nums">{formatK(likesCount + LIKES_BASELINE)}</span>
                </span>
                <span className="tabular-nums">{comments.length} تعليقًا · {SHARES_BASELINE} مشاركة</span>
              </div>

              <div className="grid grid-cols-3 border-t border-[#E4E6EB] mt-3 pt-1">
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
                  {shareCopied ? "تم النسخ" : `مشاركة (${SHARES_BASELINE})`}
                </button>
              </div>

              {/* ==================== 💬 لوحة التعليقات والردود الحقيقية (بأسلوب فيسبوك) ==================== */}
              {showComments && (
                <div id="post-comments" className="mt-3 pt-4 border-t border-[#E4E6EB] scroll-mt-24">
                  {hasOrdered ? (
                    <>
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
                    </>
                  ) : (
                    /* 🔒 التعليق مقفل حتى يُتمّ الزائر طلباً فعلياً */
                    <div className="flex items-center gap-3 bg-[#F0F2F5] rounded-xl p-4 mb-5">
                      <div className="w-9 h-9 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center flex-shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-[#65676B] leading-relaxed">
                        يمكنك إضافة تعليقك بعد إتمام طلبك — <button onClick={() => scrollTo("order-form")} className="text-[#1877F2] font-bold hover:underline cursor-pointer">أكمل طلبك الآن</button>
                      </p>
                    </div>
                  )}

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
                                  <ThumbsUp className={`w-3 h-3 ${likedCommentIds.has(c.id) ? "fill-[#1877F2]" : ""}`} />
                                  إعجاب {c.likes > 0 && `(${c.likes})`}
                                </button>
                              </div>
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
          <aside className="order-2 flex flex-col gap-2 scroll-mt-24 h-full">
            {/* اختيار سريع للباقة */}
            <div className="bg-white rounded-none sm:rounded-xl border-y sm:border border-[#E4E6EB] shadow-none sm:shadow-sm p-5 lg:min-h-[320px] flex-[1.15] flex flex-col">
              <h2 className="font-bold text-xl sm:text-2xl leading-tight text-[#050505] mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#1877F2]" />
                اختر الباقة
              </h2>
              <div className="space-y-3 flex-1">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => choosePackageAndScroll(pkg.id)}
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
                      <p className="text-xs text-[#65676B] font-normal mt-1">{pkg.boxes} علبة · {pkg.duration}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-[#1877F2]">{pkg.price} د</span>
                      {formData.packageId === pkg.id && <CheckCircle className="w-5 h-5 text-[#1877F2]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* زوار العرض + عداد العرض — تظهر هنا في الحاسوب فقط (نسخة الهاتف انتقلت لأعلى الصفحة)
                ✅ contents بدل block لتفادي أي تأثير هيكلي للغلاف على تدفّق flex في الشريط الجانبي */}
            <div className="hidden lg:contents">
              <LiveOfferCard />
            </div>

            {/* معلومات مهمة */}
            <div className="bg-white rounded-none sm:rounded-xl border-y sm:border border-[#E4E6EB] shadow-none sm:shadow-sm p-5 lg:min-h-[250px] flex-1 flex flex-col">
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
            <div className="bg-white border-y sm:border border-[#E4E6EB] rounded-none sm:rounded-xl p-4 flex items-start gap-2.5">
              <span className="text-base flex-shrink-0">🔒</span>
              <p className="text-xs text-[#65676B] leading-relaxed font-normal">
                بياناتك تُستخدم فقط لمعالجة طلبك والتواصل معك لتأكيد التسليم.
              </p>
            </div>
          </aside>
        </div>

        {/* ==================== 🆕 سيكشن المكونات — تحت الهيرو مباشرة ==================== */}
        <section id="ingredients" className="mt-2 scroll-mt-24">
          <div className="w-full max-w-7xl mx-auto bg-white rounded-none sm:rounded-xl border-y sm:border border-[#E4E6EB] shadow-none sm:shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-[#E4E6EB]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#1877F2]">العلم يلتقي بالطبيعة</span>
                  <h2 className="text-xl sm:text-2xl font-bold leading-tight text-[#050505] mt-1">لماذا يعتبر إيروفيا الخيار الأول؟</h2>
                  <p className="text-[#65676B] text-sm leading-relaxed font-normal mt-1.5">على عكس المنتجات التجارية الكيميائية، يعتمد إيروفيا على تغذية الخلايا والأنشطة العضوية لتأمين تدفق دموي مستدام.</p>
                </div>
              </div>
            </div>

          <div className="relative p-2.5 sm:p-3">
            {/* 📱 موبايل: نفس فكرة الحاسوب بالضبط لكن عمودياً — إطار واحد يجمع كل الخانات
                ويتم التمرير (سكرول) داخله عمودياً باليد، بلا أي snap أو قطع تلقائي
                🖥️ حاسوب: نفس الإطار لكن أفقياً (بدون تغيير) */}
            <div
              ref={ingredientsScrollRef}
              className="ingredients-frame
                gap-2.5 sm:gap-3
                rounded-xl border border-[#E4E6EB] sm:border-0
                bg-[#F7F8FA] sm:bg-transparent
                p-2.5 sm:p-0"
            >
              {ingredients.map((item, i) => (
                <div
                  key={i}
                  className="ingredient-card bg-white rounded-xl border border-[#E4E6EB] shadow-sm p-4 sm:p-6 flex flex-col hover:shadow-lg hover:border-[#1877F2]/30 transition-all"
                >
                <div className="w-11 h-11 rounded-xl bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center mb-3">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[#050505] leading-snug">{item.title}</h3>
                <p className="text-[11px] sm:text-xs text-[#1877F2] font-semibold mb-2">{item.titleFr}</p>

                {/* 🖼️ صورة المكوّن الحقيقية — public/products/ingredients/
                    ⚠️ الارتفاع مفروض عبر style مباشر (وليس كلاس Tailwind) لضمان عدم انهياره لصفر أبداً */}
                <div
                  className="relative w-full mb-3 flex-shrink-0"
                  style={{ height: "120px", minHeight: "120px" }}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="320px"
                    className="object-contain"
                  />
                </div>

                <p className="text-sm sm:text-[15px] text-[#65676B] leading-relaxed mb-4 flex-1">{item.desc}</p>
                <span className="inline-flex items-center gap-1.5 self-start text-xs sm:text-sm font-semibold text-[#42B72A] bg-[#42B72A]/10 border border-[#42B72A]/25 px-3 py-1.5 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {item.stat}
                </span>
              </div>
              ))}
            </div>

            {/* ⬅️➡️ أسهم التمرير — حاسوب فقط، بنفس ستايل أزرار الهيرو تماماً، يختفي كل سهم عند وصوله لحده */}
            {!ingredientsAtStart && (
              <button
                type="button"
                onClick={() => scrollIngredients("prev")}
                className="hidden sm:flex absolute top-1/2 -translate-y-1/2 right-1 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-lg items-center justify-center text-[#050505] transition-all hover:scale-105 cursor-pointer"
                aria-label="المكوّن السابق"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            {!ingredientsAtEnd && (
              <button
                type="button"
                onClick={() => scrollIngredients("next")}
                className="hidden sm:flex absolute top-1/2 -translate-y-1/2 left-1 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-lg items-center justify-center text-[#050505] transition-all hover:scale-105 cursor-pointer"
                aria-label="المكوّن التالي"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
          </div>
        </section>

        {/* ==================== 🖼️ معرض صور المنتج — بأسلوب منشور فيسبوك (سيكشن ثالث) ==================== */}
        <section id="gallery" className="mt-2 scroll-mt-24">
          <div className="w-full max-w-7xl mx-auto bg-white rounded-none sm:rounded-xl border-y sm:border border-[#E4E6EB] shadow-none sm:shadow-sm overflow-hidden">
            {/* رأس بأسلوب منشور فيسبوك */}
            <div className="px-4 sm:px-5 pt-4 pb-3">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative bg-[#F0F2F5]">
                  <Image src="/erovia/eroviaicon.png" alt="إيروفيا" fill sizes="40px" className="object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#050505] flex items-center gap-1">
                    إيروفيا
                    <BadgeCheck className="w-3.5 h-3.5 text-[#1877F2]" />
                  </p>
                  <p className="text-[11px] text-[#65676B] flex items-center gap-1">
                    معرض الصور <Globe2 className="w-3 h-3" />
                  </p>
                </div>
              </div>
              <p className="text-sm text-[#050505] leading-relaxed">
                <span className="font-semibold">إيروفيا</span> — لمحة أقرب على المنتج من كل الزوايا، تعبئة أصلية ومحكمة تصل إليك كما تراها هنا تماماً.
              </p>
            </div>

            {/* بطاقات الصور — سكرول جانبي في الهاتف، شبكة كاملة في الحاسوب (بأسلوب فيسبوك تماماً) */}
            <div className="flex sm:grid sm:grid-cols-4 gap-2.5 px-4 sm:px-5 pb-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {galleryCards.map((card) => (
                <div
                  key={card.id}
                  className="flex-shrink-0 w-[80%] sm:w-auto rounded-xl overflow-hidden border border-[#E4E6EB] bg-white snap-center flex flex-col shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square bg-[#F7F8FA]">
                    <Image
                      src={card.image}
                      alt={`إيروفيا - صورة ${card.id}`}
                      fill
                      sizes="(max-width: 640px) 70vw, 23vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                  {/* ✅ الجزء السفلي — وصف بسيط + زر اطلب الآن بأسلوب فيسبوك الرمادي */}
                  <div className="p-3 flex flex-col gap-2.5 flex-1">
                    <p className="text-xs text-[#65676B] leading-relaxed flex-1">{card.desc}</p>
                    <button
                      onClick={() => choosePackageAndScroll(packages[0].id)}
                      className="w-full py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      اطلب الآن
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="why" className="mt-2 scroll-mt-24">
          <div className="w-full max-w-7xl mx-auto bg-white rounded-none sm:rounded-xl border-y sm:border border-[#E4E6EB] shadow-none sm:shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-[#E4E6EB]">
              <h2 className="text-xl sm:text-2xl font-bold leading-tight text-[#050505]">لماذا يختار العملاء إيروفيا؟</h2>
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

        {/* ==================== ⭐ آراء العملاء — سيكشن احترافي بتقييمات مكتوبة فعلياً ==================== */}
        <section className="mt-2">
          <div className="w-full max-w-7xl mx-auto bg-white rounded-none sm:rounded-xl border-y sm:border border-[#E4E6EB] shadow-none sm:shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-[#E4E6EB] text-center">
              <span className="inline-block text-xs font-semibold text-[#1877F2] bg-[#E7F3FF] border border-[#1877F2]/20 px-3 py-1 rounded-full mb-2.5">
                آراء حقيقية من عملائنا
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#050505]">ماذا يقول عملاؤنا عن إيروفيا؟</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Stars rating={4.9} size="w-4 h-4" />
                <span className="text-sm font-semibold text-[#65676B]">4.9/5 من +2,300 عميل</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-2.5 sm:p-3">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-[#F7F8FA] rounded-xl border border-[#E4E6EB] p-4 hover:border-[#1877F2]/30 hover:shadow-md transition-all flex flex-col">
                  <Stars rating={t.rating} size="w-3.5 h-3.5" />
                  <p className="text-sm text-[#050505] leading-relaxed mt-3 mb-4 flex-1">&quot;{t.text}&quot;</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#050505]">{t.name}</p>
                      <p className="text-[11px] text-[#65676B]">{t.city} · مشترٍ موثّق</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== سيكشن الباقات — ارتفاع وصورة أفضل ==================== */}
        <section id="packages" className="mt-2 scroll-mt-24">
          <div className="w-full max-w-7xl mx-auto bg-white rounded-none sm:rounded-xl border-y sm:border border-[#E4E6EB] shadow-none sm:shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-[#E4E6EB]">
              <h2 className="text-2xl sm:text-[26px] font-bold leading-tight text-[#050505]">اختر الباقة المناسبة لك</h2>
              <p className="text-[#65676B] text-sm font-normal mt-0.5">كلما زادت الكمية، حصلت على قيمة أفضل.</p>
            </div>

          <div className="grid md:grid-cols-3 gap-3 p-3 sm:p-4 items-stretch">
            {packages.map((pkg, pkgIndex) => {
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
                      src={packageSectionImages[pkgIndex % packageSectionImages.length].url}
                      alt={pkg.name}
                      fill
                      sizes="(max-width: 768px) 90vw, 30vw"
                      className="object-contain rounded-lg drop-shadow-xl p-5"
                      loading="lazy"
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
                    onClick={() => choosePackageAndScroll(pkg.id)}
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
        <section id="order-form" ref={orderFormRef} className="mt-2 scroll-mt-24">
          <div className="w-full max-w-7xl mx-auto bg-white rounded-none sm:rounded-xl border-y sm:border border-[#E4E6EB] shadow-none sm:shadow-sm overflow-hidden">
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
                      <label dir="rtl" className="block text-right text-sm font-semibold text-[#050505] mb-2">اختيار الباقة <span className="text-[#DC2626] font-bold">*</span></label>

                      {/* ✅ خانة إضافية لاختيار الباقة (تتزامن تلقائياً مع البطاقات بالأعلى) — تعرض سعر كل باقة */}
                      <select
                        value={formData.packageId === null ? "" : String(formData.packageId)}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            setFormData({ ...formData, packageId: null });
                          } else {
                            choosePackage(Number(value));
                          }
                        }}
                        className={`${inputBase} ${formErrors.packageId ? inputErr : inputOk} text-right bg-white`}
                        aria-label="اختر الباقة"
                      >
                        <option value="">اختر الباقة</option>
                        {packages.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {p.price} درهم
                          </option>
                        ))}
                      </select>

                      {formErrors.packageId && <p className="text-[#DC2626] text-xs mt-1.5 font-semibold">{formErrors.packageId}</p>}
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
                        <div className="flex justify-between"><span className="text-[#65676B] font-normal">عدد العلب:</span><span className="font-semibold">{selectedPackage.boxes}</span></div>
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

            <p className="text-center text-xs text-[#65676B] font-normal px-4 pt-4 pb-5 sm:pb-6">إيروفيا - تجربة شراء بسيطة وواضحة</p>
          </div>
        </section>
      </main>

      <FAQSection />
      <SiteFooter />
      <FloatingOrderButton />

      {lightboxOpen && (
        <ImageLightbox
          images={productImages}
          activeIndex={activeImageIndex}
          onChange={setActiveImageIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

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
                <div className="flex justify-between border-t border-[#E4E6EB] pt-3 mt-3"><span className="text-[#65676B] font-semibold">الباقة:</span><span className="font-semibold text-[#1877F2]">{selectedPackage.name}</span></div>
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