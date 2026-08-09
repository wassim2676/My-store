"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShoppingCart, CheckCircle, Truck, Shield, Star, Phone, 
  Mail, MapPin, CreditCard, Package, ChevronDown, ChevronUp,
  AlertCircle, Loader2, X, MessageCircle,
  Leaf, Zap, Heart, Award, Clock, Flame, TrendingUp, Sparkles, Check, Info, HelpCircle
} from "lucide-react";

// ==================== 📦 تعريف الأنواع ====================
type ToastType = "success" | "error" | "info";

interface Country {
  code: string;
  name: string;
  flag: string;
  phonePrefix: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address: string;
  packageId: number;
  paymentMethod: "COD" | "STRIPE";
  terms: boolean;
}

// ==================== 💰 الباقات والأسعار ====================
const packages = [
  { 
    id: 1, 
    name: "باقة التجربة الحيوية",
    boxes: 1, 
    price: 500, 
    originalPrice: 650, 
    duration: "شهر واحد من الاستخدام اليومي",
    save: 150, 
    popular: false,
    badge: "خيار رائع للتجربة",
    benefits: ["1 علبة فيجارا بلس الأصلية", "شحن عادي سريع وطبيعي", "ضمان حماية المشتري لمدة 30 يومًا"]
  },
  { 
    id: 2, 
    name: "باقة العلاج المكثف والتوفير",
    boxes: 2, 
    price: 900, 
    originalPrice: 1300, 
    duration: "كورس متكامل لمدة 2-3 أشهر",
    save: 400, 
    popular: true,
    badge: "الباقة الأكثر مبيعاً ورضا للعملاء 🔥",
    benefits: ["2 علبة فيجارا بلس الأصلية", "شحن سريع مجاني لجميع المدن", "ضمان استرداد الأموال الكامل 60 يومًا", "استشارة هاتفية مجانية مع خبير تغذية"]
  },
  { 
    id: 3, 
    name: "باقة الشفاء والتأهيل الكامل",
    boxes: 3, 
    price: 1200, 
    originalPrice: 1950, 
    duration: "استعادة كاملة تمتد إلى 4-5 أشهر",
    save: 750, 
    popular: false,
    badge: "أعلى توفير وقيمة علاجية مستدامة",
    benefits: ["3 علب فيجارا بلس الأصلية", "شحن VIP سريع ومجاني بالكامل", "ضمان ذهبي ممتد حتى 90 يومًا", "متابعة دورية أسبوعية واستشارة مجانية دائمًا", "هدية حصرية فاخرة مرفقة"]
  },
];

// ==================== 🌿 مكونات المنتج ====================
const ingredients = [
  {
    icon: Leaf,
    title: "الجينسنغ الأحمر الكوري الأقوى",
    desc: "مستخلص نقي بتركيز عالي يعزز مستويات الطاقة الخلوية، يرفع القدرة البدنية على التحمل، ويقوي جدران الأوعية الدموية بشكل طبيعي ومثبت علمياً.",
    benefit: "+40% طاقة مستدامة",
  },
  {
    icon: Zap,
    title: "مستخلص Horny Goat Weed الطبيعي",
    desc: "محفز حيوي فوري يعمل على تحسين كفاءة ومعدل ضخ الدورة الدموية الطرفية، مما يعزز من قوة وسرعة الاستجابة الجسدية دون أي إجهاد للقلب.",
    benefit: "+35% تدفق فوري للشرايين",
  },
  {
    icon: Heart,
    title: "عشبة Tribulus Terrestris النقية",
    desc: "تعمل بذكاء على دعم وتحفيز إنتاج التستوستيرون الطبيعي الحر بالجسم، مما يرفع الكفاءة العضلية الكلية ويزيد مستويات الأداء اليومي.",
    benefit: "+25% هرمون ذكورة حر",
  },
  {
    icon: Award,
    title: "جذور الماكا البيروفية العضوية",
    desc: "الذهب الأسود النادر من مرتفعات الأنديز، يعزز التوازن الهرموني، ويرفع مستويات الخصوبة الذكورية بشكل جذري، ويقضي على الإجهاد الذهني والبدني المفرط.",
    benefit: "+30% خصوبة حيوية وثبات",
  },
];

// ==================== 📸 صور المنتج ====================
const productImages = [
  { url: "https://images.unsplash.com/photo-1584308972272-9cf4b93c8c65?w=600&h=600&fit=crop", alt: "فيجارا بلس - المظهر الطبيعي الموثوق" },
  { url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=600&fit=crop", alt: "مكونات طبيعية نقية لفيجارا بلس" },
  { url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=600&fit=crop", alt: "فوائد مثبتة علمياً لفيجارا بلس" },
  { url: "https://images.unsplash.com/photo-1550596334-7bb40a71b6bc?w=600&h=600&fit=crop", alt: "علب فيجارا بلس الفاخرة والأصلية" },
];

// ==================== ❓ الأسئلة الشائعة ====================
const faqs = [
  {
    question: "ما هو فيجارا بلس وكيف يعمل؟",
    answer: "فيجارا بلس هو منتج طبيعي 100% مستخلص من أعشاب نادرة، يعمل على تعزيز الطاقة والحيوية الجنسية بشكل طبيعي وآمن. يحتوي على مكونات مدعومة بأبحاث علمية لتحسين الأداء دون آثار جانبية.",
  },
  {
    question: "كم من الوقت يستغرق ظهور النتائج؟",
    answer: "معظم العملاء يلاحظون تحسناً خلال الأسبوع الأول من الاستخدام المنتظم. للحصول على أفضل النتائج، نوصي باستخدام المنتج يومياً وفقاً للجرعة المحددة.",
  },
  {
    question: "هل هناك آثار جانبية؟",
    answer: "لا، فيجارا بلس مصنوع من مكونات طبيعية 100% وخالي من المواد الكيميائية الضارة. ومع ذلك، ننصح باستشارة الطبيب في حال وجود حالات صحية خاصة أو تناول أدوية أخرى.",
  },
  {
    question: "كيف يتم الشحن والتغليف؟",
    answer: "نضمن سرية تامة في التغليف والشحن. جميع الطلبات تُرسل في صناديق مغلقة لا تحمل أي شعارات أو إشارات لمحتواها، ويتم التوصيل خلال 2-5 أيام عمل.",
  },
  {
    question: "ما هي سياسة الاسترداد؟",
    answer: "نقدم ضمان استرداد الأموال لمدة 30 يوماً. إذا لم تكن راضياً عن المنتج لأي سبب، يمكنك التواصل معنا لاسترداد كامل المبلغ المدفوع.",
  },
  {
    question: "هل يمكنني الدفع عند الاستلام؟",
    answer: "نعم، نقبل الدفع عند الاستلام (COD) في جميع الدول التي نخدمها. لن تدفع أي مبلغ حتى تستلم طلبك وتتأكد من سلامته.",
  },
];

// ==================== 🌍 الدول الكاملة مع الأعلام ومفاتيح الهواتف ====================
const countriesWithFlags: Country[] = [
  { code: "MA", name: "المغرب", flag: "🇲🇦", phonePrefix: "+212" },
  { code: "DZ", name: "الجزائر", flag: "🇩🇿", phonePrefix: "+213" },
  { code: "TN", name: "تونس", flag: "🇹🇳", phonePrefix: "+216" },
  { code: "LY", name: "ليبيا", flag: "🇱🇾", phonePrefix: "+218" },
  { code: "EG", name: "مصر", flag: "🇪🇬", phonePrefix: "+20" },
  { code: "SD", name: "السودان", flag: "🇸🇩", phonePrefix: "+249" },
  { code: "SA", name: "السعودية", flag: "🇸🇦", phonePrefix: "+966" },
  { code: "AE", name: "الإمارات", flag: "🇦🇪", phonePrefix: "+971" },
  { code: "KW", name: "الكويت", flag: "🇰🇼", phonePrefix: "+965" },
  { code: "BH", name: "البحرين", flag: "🇧🇭", phonePrefix: "+973" },
  { code: "QA", name: "قطر", flag: "🇶🇦", phonePrefix: "+974" },
  { code: "OM", name: "عُمان", flag: "🇴🇲", phonePrefix: "+968" },
  { code: "YE", name: "اليمن", flag: "🇾🇪", phonePrefix: "+967" },
  { code: "JO", name: "الأردن", flag: "🇯🇴", phonePrefix: "+962" },
  { code: "LB", name: "لبنان", flag: "🇱🇧", phonePrefix: "+961" },
  { code: "SY", name: "سوريا", flag: "🇸🇾", phonePrefix: "+963" },
  { code: "IQ", name: "العراق", flag: "🇮🇶", phonePrefix: "+964" },
  { code: "PS", name: "فلسطين", flag: "🇵🇸", phonePrefix: "+970" },
  { code: "MR", name: "موريتانيا", flag: "🇲🇷", phonePrefix: "+222" },
  { code: "SO", name: "الصومال", flag: "🇸🇴", phonePrefix: "+252" },
  { code: "DJ", name: "جيبوتي", flag: "🇩🇯", phonePrefix: "+253" },
  { code: "KM", name: "جزر القمر", flag: "🇰🇲", phonePrefix: "+269" },
  { code: "FR", name: "فرنسا", flag: "🇫🇷", phonePrefix: "+33" },
  { code: "ES", name: "إسبانيا", flag: "🇪🇸", phonePrefix: "+34" },
  { code: "DE", name: "ألمانيا", flag: "🇩🇪", phonePrefix: "+49" },
  { code: "IT", name: "إيطاليا", flag: "🇮🇹", phonePrefix: "+39" },
  { code: "BE", name: "بلجيكا", flag: "🇧🇪", phonePrefix: "+32" },
  { code: "NL", name: "هولندا", flag: "🇳🇱", phonePrefix: "+31" },
  { code: "GB", name: "بريطانيا", flag: "🇬🇧", phonePrefix: "+44" },
  { code: "CA", name: "كندا", flag: "🇨🇦", phonePrefix: "+1" },
  { code: "US", name: "الولايات المتحدة", flag: "🇺🇸", phonePrefix: "+1" },
  { code: "OTHER", name: "دولة أخرى", flag: "🌍", phonePrefix: "+" },
];

// ==================== 🎨 مكون Toast ====================
function Toast({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: ToastType; 
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: "bg-emerald-500", icon: CheckCircle, border: "border-emerald-600" },
    error: { bg: "bg-red-500", icon: AlertCircle, border: "border-red-600" },
    info: { bg: "bg-blue-500", icon: Info, border: "border-blue-600" },
  };

  const { bg, icon: Icon, border } = config[type];

  return (
    <div className={`fixed top-4 left-4 z-[70] ${bg} ${border} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right max-w-sm border`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-white/90 hover:text-white transition-colors cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ==================== ⏰ مكون العداد التنازلي ====================
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 44, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 44, seconds: 12 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-red-100 shadow-sm">
      <div className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </div>
      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">ينتهي الخصم خلال:</span>
      <div className="flex gap-1 font-mono text-[10px] font-black">
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-red-500">:</span>
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-red-500">:</span>
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

// ==================== ❓ مكون الأسئلة الشائعة ====================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            دعم العملاء
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 mb-4">
            الأسئلة الشائعة
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            إجابات على أكثر الأسئلة التي يطرحها عملاؤنا الكرام
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden transition-all hover:border-blue-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-right cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 text-sm sm:text-base">{faq.question}</span>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {openIndex === idx && (
                <div className="px-4 sm:px-5 pb-5 pt-0">
                  <p className="text-sm text-slate-600 leading-relaxed pr-11">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-slate-600 mb-4">
            لم تجد إجابة لسؤالك؟
          </p>
          <a 
            href="https://wa.me/2126XXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg shadow-blue-500/20"
          >
            <MessageCircle className="w-4 h-4" />
            تواصل معنا مباشرة
          </a>
        </div>
      </div>
    </section>
  );
}

// ==================== 📱 زر واتساب العائم ====================
function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/2126XXXXXXXX"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-4 z-[60] flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-full shadow-2xl hover:bg-green-600 transform hover:scale-110 transition-all group"
      aria-label="تواصل عبر واتساب"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
      <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 whitespace-nowrap text-sm font-bold">
        واتساب
      </span>
    </a>
  );
}

// ==================== 🦶 الفوتر الأنيق ====================
function ElegantFooter() {
  return (
    <footer className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black">فيجارا بلس</span>
              <p className="text-xs text-slate-400">الصحة والحيوية الطبيعية</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
            <Link href="/privacy" className="text-slate-400 hover:text-blue-400 transition-colors">سياسة الخصوصية</Link>
            <Link href="/terms" className="text-slate-400 hover:text-blue-400 transition-colors">شروط الاستخدام</Link>
            <Link href="/shipping" className="text-slate-400 hover:text-blue-400 transition-colors">سياسة الشحن</Link>
            <Link href="/returns" className="text-slate-400 hover:text-blue-400 transition-colors">سياسة الاسترداد</Link>
          </div>

          <div className="text-center md:text-left">
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} فيجارا بلس. جميع الحقوق محفوظة.</p>
            <p className="text-[10px] text-slate-600 mt-1">منتج طبيعي غير دوائي - للاستخدام الخارجي فقط</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> دفع آمن</span>
          <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> شحن سري</span>
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> ضمان 30 يوم</span>
          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> دعم 24/7</span>
        </div>
      </div>
    </footer>
  );
}

// ==================== 🏠 المكون الرئيسي ====================
export default function VijaraPlusProductPage() {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [stockCount, setStockCount] = useState(14);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: "", lastName: "", phone: "", email: "",
    country: "MA", city: "", address: "", packageId: 2,
    paymentMethod: "COD", terms: true,
  });
  
  // رقم الهاتف المحلي (بدون البادئة)
  const [phoneLocal, setPhoneLocal] = useState("");
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // الدولة المختارة الحالية
  const selectedCountry = useMemo(() => {
    return countriesWithFlags.find(c => c.code === formData.country) || countriesWithFlags[0];
  }, [formData.country]);

  // Stock counter simulation
  useEffect(() => {
    const stockTimer = setInterval(() => {
      setStockCount(prev => (prev > 3 ? prev - 1 : 14));
    }, 45000);
    return () => clearInterval(stockTimer);
  }, []);

  // عند تغيير الدولة، تحديث بادئة الهاتف تلقائياً
  const handleCountryChange = (countryCode: string) => {
    const country = countriesWithFlags.find(c => c.code === countryCode);
    if (country) {
      const newPhone = phoneLocal ? `${country.phonePrefix} ${phoneLocal}` : "";
      setFormData({ 
        ...formData, 
        country: countryCode,
        phone: newPhone
      });
    }
  };

  // عند تغيير رقم الهاتف المحلي
  const handlePhoneLocalChange = (value: string) => {
    const cleaned = value.replace(/[^\d\s\-]/g, "");
    setPhoneLocal(cleaned);
    const fullPhone = cleaned ? `${selectedCountry.phonePrefix} ${cleaned}` : "";
    setFormData({ ...formData, phone: fullPhone });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = "الاسم الأول مطلوب بشكل إلزامي";
    if (!formData.lastName.trim()) errors.lastName = "اسم العائلة مطلوب للتحقق من الهوية";
    if (!phoneLocal.trim()) {
      errors.phone = "رقم الهاتف مطلوب لتأكيد الشحن فوراً";
    } else if (!/^[\d\s\-]{6,15}$/.test(phoneLocal)) {
      errors.phone = "صيغة رقم الهاتف التي أدخلتها غير صالحة";
    }
    if (!formData.city.trim()) errors.city = "الرجاء تحديد مدينة التوصيل";
    if (!formData.address.trim()) errors.address = "العنوان الدقيق مطلوب لعمال التوصيل سرياً";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePreSubmitCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setToast({ message: "يرجى مراجعة وتصحيح الحقول الملونة بالأحمر لتتمكن من حجز طلبك بنجاح", type: "error" });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalConfirmAndSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      const selectedPackage = packages.find(p => p.id === formData.packageId)!;
      const orderData = {
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        email: formData.email || "",
        country: selectedCountry.name,
        city: formData.city,
        address: formData.address,
        productType: selectedPackage.name,
        quantity: selectedPackage.boxes,
        unitPrice: selectedPackage.price / selectedPackage.boxes,
        paymentMethod: formData.paymentMethod,
        sourcePage: "/product/vijara-plus",
      };

      const response = await fetch("/api/manual-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setToast({ message: "🎉 تهانينا! تم حجز باقتك بنجاح. سيتصل بك موظف تأكيد الطلبات وعامل التوصيل سرياً خلال الساعات القادمة.", type: "success" });
        setFormData({ firstName: "", lastName: "", phone: "", email: "", country: "MA", city: "", address: "", packageId: 2, paymentMethod: "COD", terms: true });
        setPhoneLocal("");
      } else {
        setToast({ message: result.error || "حدث خطأ غير متوقع أثناء المعالجة، يرجى المحاولة مرة أخرى", type: "error" });
      }
    } catch (error) {
      setToast({ message: "خطأ في الاتصال بالخادم، يرجى تكرار المحاولة في غضون ثوانٍ", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPackage = packages.find(p => p.id === formData.packageId) || packages[1];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-500 selection:text-white" dir="rtl">
      
      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <span className="text-xl sm:text-2xl font-black bg-gradient-to-l from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                فيجارا بلس <span className="text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded-full">الأصلي</span>
              </span>
            </Link>
            <a href="#order-form-section" className="relative group overflow-hidden px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              احجز باقتك الآن
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/10 to-indigo-500/0 rounded-full blur-3xl opacity-70" />
          <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-400/10 to-purple-500/0 rounded-full blur-3xl opacity-60" />
          <div className="absolute inset-0 bg-[linear-gradient(to_left,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            <div className="lg:col-span-7 text-center lg:text-right space-y-6 max-w-2xl mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  تركيبة بريميوم طبيعية ومضمونة 100%
                </span>
                <CountdownTimer />
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] sm:leading-tight">
                استعد كامل ثقتك وحيويتك الذكورية اليوم مع{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent block sm:inline">
                  فيجارا بلس المكثف
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                الحل العضوي الفريد المستخلص بعناية فائقة من أندر الأعشاب والنباتات البرية البيروفية والكورية. صُمم خصيصاً ليمنحك الطاقة البدنية المتكاملة والأداء الثابت المستدام بكل أمان ودون أي آثار جانبية.
              </p>

              <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 rounded-2xl border border-amber-500/20 max-w-lg mx-auto lg:mx-0 flex items-center gap-3 justify-center lg:justify-start text-right">
                <Flame className="w-5 h-5 text-orange-600 animate-bounce shrink-0" />
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  تنبيه المخزون: متبقي فقط <span className="text-red-600 text-base font-black font-mono underline">{stockCount} علبة</span> في المستودع الإقليمي، احجز حصتك!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div className="flex justify-center gap-0.5 text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
                  </div>
                  <p className="text-base font-black text-slate-900">4.9/5.0</p>
                  <p className="text-[10px] text-slate-500 font-medium">+5,430 تقييم</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-base font-black text-blue-600">99.4%</p>
                  <p className="text-[10px] text-slate-500 font-medium">نسبة رضا العملاء</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-base font-black text-emerald-600">COD</p>
                  <p className="text-[10px] text-slate-500 font-medium">الدفع عند الاستلام</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4 max-w-md mx-auto w-full">
              <div className="relative aspect-square w-full bg-gradient-to-b from-slate-100 to-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-200/60 group">
                <Image
                  src={productImages[mainImageIndex].url}
                  alt={productImages[mainImageIndex].alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  priority
                />
                <div className="absolute top-4 right-4 flex flex-col gap-1.5">
                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg shadow-md">
                    خصم 40%
                  </span>
                  <span className="px-3 py-1 bg-slate-900/90 text-white text-[10px] font-bold rounded-lg shadow-md backdrop-blur-sm inline-flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-400" />
                    منتج أصلي
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-1 max-w-full justify-between">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImageIndex(idx)}
                    className={`relative w-[22%] aspect-square flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                      mainImageIndex === idx
                        ? "border-blue-600 ring-2 ring-blue-500/20 scale-95"
                        : "border-slate-200 bg-white hover:border-slate-400"
                    }`}
                  >
                    <Image src={img.url} alt={img.alt} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-100 border-y border-slate-200/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-600 tracking-widest uppercase bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">العلم يلتقي بالطبيعة</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 mb-4">
              لماذا يعتبر فيجارا بلس الخيار الأول؟
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              على عكس المنتجات التجارية الكيميائية، يعتمد فيجارا بلس على تغذية الخلايا والأنشطة العضوية لتأمين تدفق دموي مستدام.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ingredients.map((ingredient, idx) => (
              <div key={idx} className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ingredient.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition-colors">{ingredient.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">{ingredient.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50/70 border border-emerald-100 px-2.5 py-1.5 rounded-lg w-max">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {ingredient.benefit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">استثمار ذكي في صحتك</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 mb-3">حدد باقتك العلاجية ووفر أموالك اليوم</h2>
            <p className="text-slate-500 text-xs sm:text-sm">اضغط على الباقة المفضلة لربطها تلقائياً بنموذج الطلب.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
            {packages.map((pkg) => {
              const isSelected = formData.packageId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setFormData({ ...formData, packageId: pkg.id })}
                  className={`relative bg-gradient-to-b from-white to-slate-50 rounded-3xl border-2 p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-600 ring-4 ring-blue-500/10 shadow-xl shadow-blue-500/5 -translate-y-1 scale-[1.01]"
                      : "border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="absolute -top-3.5 left-6 right-6 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wide border shadow-sm ${
                      pkg.popular 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600" 
                        : isSelected 
                          ? "bg-slate-900 text-white border-slate-900" 
                          : "bg-white text-slate-600 border-slate-200"
                    }`}>
                      {pkg.badge}
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-black text-slate-900">{pkg.name}</h3>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"}`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-5">{pkg.duration}</p>
                    
                    <div className="flex items-baseline gap-2 mb-4 bg-slate-100 p-3 rounded-xl border border-slate-200/60 justify-center">
                      <span className="text-3xl font-black text-slate-900">{pkg.price} درهم</span>
                      {pkg.save > 0 && (
                        <span className="text-xs text-slate-400 line-through font-bold">{pkg.originalPrice} درهم</span>
                      )}
                    </div>

                    {pkg.save > 0 && (
                      <div className="mb-5 text-center">
                        <span className="inline-block px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black rounded-lg">
                          وفرت {pkg.save} درهم فوراً
                        </span>
                      </div>
                    )}

                    <ul className="space-y-2.5 border-t border-slate-200/80 pt-4 text-xs sm:text-sm">
                      {pkg.benefits.map((benefit, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    type="button"
                    className={`w-full mt-6 py-3 rounded-xl text-xs font-black transition-all ${
                      isSelected 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20" 
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    }`}
                  >
                    {isSelected ? "✓ تم اختيار هذه الباقة" : "اختر هذه الباقة"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Order Form Section */}
<section id="order-form-section" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-100 border-t border-slate-200/60">
  <div className="max-w-6xl mx-auto">
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid lg:grid-cols-12">
      
      {/* Sidebar - الجهة اليسرى - تصغيرها قليلاً */}
      <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white p-6 sm:p-8 flex flex-col justify-between order-2 lg:order-1">
        <div className="space-y-6">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">خطوة واحدة متبقية</span>
            <h3 className="text-xl sm:text-2xl font-black mt-2">نموذج الحجز السريع</h3>
            <p className="text-slate-400 text-xs leading-relaxed mt-1">يرجى كتابة معلوماتك بدقة لضمان وصول الشحنة بسرية وأمان تام.</p>
          </div>

          {/* 🆕 اختيار الباقة كمنسدل في الـ Sidebar */}
          <div>
            <label className="block text-xs font-black text-blue-400 mb-2 uppercase tracking-wider">اختر باقتك</label>
            <div className="relative">
              <select
                value={formData.packageId}
                onChange={(e) => setFormData({ ...formData, packageId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 pe-10 rounded-xl text-sm font-bold bg-white/10 backdrop-blur-sm border border-white/20 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id} className="bg-slate-900 text-white">
                    {pkg.boxes === 1 ? "علبة واحدة" : `${pkg.boxes} علب`} - {pkg.price} درهم {pkg.save > 0 ? `(وفر ${pkg.save})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
            </div>
            {/* عرض تفاصيل الباقة المختارة */}
            <div className="mt-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-black text-white">{selectedPackage.name}</p>
                <p className="text-lg font-black text-blue-400">{selectedPackage.price} د.م</p>
              </div>
              {selectedPackage.save > 0 && (
                <p className="text-[10px] text-emerald-400 font-bold mt-1">
                  ✅ وفرت {selectedPackage.save} درهم
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400"><Truck className="w-4 h-4" /></div>
              <div><p className="font-bold text-slate-200">شحن آمن وسري</p><p className="text-slate-400 text-[11px]">تغليف مغلق لا يحمل أي شعارات خارجية.</p></div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400"><Clock className="w-4 h-4" /></div>
              <div><p className="font-bold text-slate-200">توصيل في 24-48 ساعة</p><p className="text-slate-400 text-[11px]">اتصال مسبق من عامل الشحن لتنسيق الميعاد.</p></div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400"><CreditCard className="w-4 h-4" /></div>
              <div><p className="font-bold text-slate-200">ادفع عند الاستلام</p><p className="text-slate-400 text-[11px]">لن تدفع أي مبلغ حتى تستلم المنتج بيدك.</p></div>
            </div>
          </div>
        </div>

        {/* تقييمات */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <span className="text-sm font-black">4.9/5</span>
          </div>
          <p className="text-[11px] text-slate-400">+5,430 عميل راضٍ عن المنتج</p>
        </div>
      </div>

      {/* Form - الجهة اليمنى - تكبيرها */}
      <form onSubmit={handlePreSubmitCheck} className="lg:col-span-8 p-6 sm:p-8 space-y-5 order-1 lg:order-2">
        
        {/* الاسم الأول + اسم العائلة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">الاسم الأول *</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl text-sm border bg-slate-50 outline-none transition-all ${formErrors.firstName ? "border-red-500 bg-red-50/20 ring-2 ring-red-100" : "border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"}`}
              placeholder="مثال: كريم"
            />
            {formErrors.firstName && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.firstName}</p>}
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">اسم العائلة *</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl text-sm border bg-slate-50 outline-none transition-all ${formErrors.lastName ? "border-red-500 bg-red-50/20 ring-2 ring-red-100" : "border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"}`}
              placeholder="مثال: العلمي"
            />
            {formErrors.lastName && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.lastName}</p>}
          </div>
        </div>

        {/* الدولة + المدينة (مع الأعلام) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">الدولة *</label>
            <div className="relative">
              <select
                value={formData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-4 py-3 pe-12 rounded-xl text-sm border border-slate-200 bg-slate-50 outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
              >
                {countriesWithFlags.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-xl">
                {selectedCountry.flag}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">المدينة *</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl text-sm border bg-slate-50 outline-none transition-all ${formErrors.city ? "border-red-500 bg-red-50/20 ring-2 ring-red-100" : "border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"}`}
              placeholder="مثال: الدار البيضاء"
            />
            {formErrors.city && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.city}</p>}
          </div>
        </div>

        {/* 🆕 رقم الهاتف مع البادئة التلقائية - يساري (LTR) */}
<div dir="ltr">
  <label className="block text-xs font-black text-slate-700 mb-1.5 text-right">
    رقم الهاتف *
    <span className="text-[10px] font-normal text-slate-400 mr-2">(سيتم الاتصال بك على هذا الرقم)</span>
  </label>
  <div className="flex flex-row-reverse rounded-xl overflow-hidden border border-slate-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-slate-50 focus-within:bg-white">
    {/* حقل إدخال الرقم - يساري تماماً */}
    <input
      type="tel"
      required
      value={phoneLocal}
      onChange={(e) => handlePhoneLocalChange(e.target.value)}
      className={`flex-1 px-3 py-3 text-sm bg-transparent outline-none font-mono text-left ${formErrors.phone ? "bg-red-50/20" : ""}`}
      placeholder="600-123456"
      dir="ltr"
      style={{ textAlign: 'left' }}
    />
    {/* البادئة التلقائية مع العلم - على اليسار */}
    <div className="flex items-center gap-1.5 px-3 py-3 bg-slate-100 border-r border-slate-200 text-sm font-bold text-slate-700 whitespace-nowrap">
      <span>{selectedCountry.phonePrefix}</span>
      <span className="text-lg">{selectedCountry.flag}</span>
    </div>
  </div>
  {formErrors.phone && <p className="text-red-500 text-[10px] mt-1 font-bold text-right">{formErrors.phone}</p>}
  <p className="text-[10px] text-slate-400 mt-1 text-right">
    💡 سيتم تغيير البادئة تلقائياً عند اختيار دولة أخرى
  </p>
</div>

        {/* العنوان التفصيلي */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">العنوان التفصيلي *</label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl text-sm border bg-slate-50 outline-none transition-all ${formErrors.address ? "border-red-500 bg-red-50/20 ring-2 ring-red-100" : "border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"}`}
            placeholder="رقم الشقة، اسم الشارع، علامة مميزة"
          />
          {formErrors.address && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.address}</p>}
        </div>

        {/* 🆕 البريد الإلكتروني (اختياري) - في الأسفل */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">
            البريد الإلكتروني
            <span className="text-[10px] font-normal text-slate-400 mr-2">(اختياري - لإرسال الفاتورة)</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm border border-slate-200 bg-slate-50 outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            placeholder="example@email.com"
            dir="ltr"
            style={{ textAlign: 'left' }}
          />
        </div>

        {/* Inline Toast */}
        {toast && (
          <div className={`p-4 rounded-xl border flex items-start gap-2.5 transition-all animate-in fade-in zoom-in-95 duration-200 ${
            toast.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : toast.type === "error" 
                ? "bg-red-50 border-red-200 text-red-800" 
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}>
            {toast.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
            <div className="text-xs font-bold leading-relaxed">{toast.message}</div>
            <button type="button" onClick={() => setToast(null)} className="mr-auto text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl text-sm font-black tracking-wide shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري تأكيد الطلب...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
              احجز باقتك الآن - {selectedPackage.price} درهم
            </>
          )}
        </button>
      </form>
    </div>
  </div>
</section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Elegant Footer */}
      <ElegantFooter />

      {/* Floating WhatsApp Button */}
      <WhatsAppButton />

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowConfirmModal(false)} />
          
          <div className="relative bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-right">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <Info className="w-4 h-4" />
                </div>
                <h4 className="font-black text-slate-900 text-base">تأكيد طلبك النهائي</h4>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <p className="bg-amber-50 text-amber-900 font-bold p-3 rounded-xl border border-amber-200/60">
                الرجاء التأكد من صحة الاسم ورقم الهاتف ليتسنى لمندوب الشحن الوصول إليك سريعاً.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <div className="flex justify-between"><span className="text-slate-400 font-medium">الاسم:</span> <span className="font-bold text-slate-900">{formData.firstName} {formData.lastName}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-medium">الهاتف:</span> <span className="font-bold text-slate-900 font-mono" dir="ltr">{formData.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-medium">العنوان:</span> <span className="font-bold text-slate-900">{formData.city}، {formData.address}</span></div>
                <div className="flex justify-between border-t border-slate-200/60 pt-2 mt-2"><span className="text-slate-400 font-bold">الباقة:</span> <span className="font-black text-blue-600">{selectedPackage.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-bold">المبلغ:</span> <span className="font-black text-slate-900">{selectedPackage.price} درهم</span></div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-100 px-3 py-2 rounded-xl">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>بياناتك محمية بتشفير كامل.</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleFinalConfirmAndSubmit}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                نعم، أكمل واحجز طلبي
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                تعديل البيانات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}