"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle, Phone, Truck, Shield, MessageCircle, BadgeCheck,
} from "lucide-react";

interface CompletedOrderInfo {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  packageName: string;
  total: number;
}

export default function EroviaThankYouPage() {
  const [order, setOrder] = useState<CompletedOrderInfo | null>(null);
  const [checked, setChecked] = useState(false);

  // ✅ قراءة تفاصيل آخر طلب ناجح من sessionStorage (مُخزَّنة من صفحة المنتج قبل التنقّل هنا مباشرة)
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("erovia_last_order");
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- قراءة بيانات الطلب المخزّنة مؤقتاً عند الوصول للصفحة
        setOrder(JSON.parse(raw));
      }
    } catch {
      // تجاهل بيانات تالفة بصمت
    } finally {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- انتهاء محاولة القراءة
      setChecked(true);
    }
  }, []);

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans antialiased" dir="rtl" style={{ colorScheme: "light" }}>
      {/* هيدر مبسّط */}
      <header className="bg-white border-b border-[#E4E6EB]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-center">
          <Link href="/product/erovia" className="font-semibold text-lg text-[#050505] flex items-center gap-1.5">
            إيروفيا
            <BadgeCheck className="w-4 h-4 text-[#1877F2]" />
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* شارة النجاح */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#42B72A]/10 flex items-center justify-center mb-5">
            <div className="w-14 h-14 rounded-full bg-[#42B72A] flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#050505] mb-2">تم استلام طلبك بنجاح! 🎉</h1>
          <p className="text-[#65676B] text-sm sm:text-base leading-relaxed max-w-md">
            شكراً لثقتك بنا — طلبك الآن قيد المعالجة.
          </p>
        </div>

        {/* إشعار الاتصال للتأكيد */}
        <div className="bg-[#E7F3FF] border border-[#1877F2]/20 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-[#050505] text-sm sm:text-base mb-1">سيتصل بك أحد أفراد فريقنا قريباً</p>
            <p className="text-[#65676B] text-xs sm:text-sm leading-relaxed">
              للتأكد من صحة بياناتك وتأكيد موعد التوصيل النهائي. يُرجى إبقاء هاتفك بالقرب منك.
            </p>
          </div>
        </div>

        {/* ملخص الطلب — يظهر فقط إذا وصلت بيانات الطلب فعلياً */}
        {order && (
          <div className="bg-white rounded-xl border border-[#E4E6EB] shadow-sm overflow-hidden mb-6">
            <div className="px-4 sm:px-5 py-3.5 border-b border-[#E4E6EB]">
              <h2 className="font-semibold text-[#050505] text-sm sm:text-base">ملخص طلبك</h2>
            </div>
            <div className="p-4 sm:p-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#65676B]">الاسم الكامل</span><span className="font-semibold text-[#050505]">{order.fullName}</span></div>
              <div className="flex justify-between"><span className="text-[#65676B]">رقم الهاتف</span><span className="font-semibold text-[#050505]" dir="ltr">{order.phone}</span></div>
              <div className="flex justify-between"><span className="text-[#65676B]">المدينة</span><span className="font-semibold text-[#050505]">{order.city}</span></div>
              {order.address && (
                <div className="flex justify-between gap-4">
                  <span className="text-[#65676B] flex-shrink-0">العنوان بالتفصيل</span>
                  <span className="font-semibold text-[#050505] text-left">{order.address}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#E4E6EB] pt-3"><span className="text-[#65676B]">الباقة</span><span className="font-semibold text-[#1877F2]">{order.packageName}</span></div>
              <div className="flex justify-between"><span className="text-[#65676B] font-semibold">الإجمالي (دفع عند الاستلام)</span><span className="font-bold text-lg text-[#050505]">{order.total} درهم</span></div>
            </div>
          </div>
        )}

        {/* شارات الثقة */}
        <div className="grid grid-cols-3 gap-2.5 mb-8">
          <div className="bg-white rounded-xl border border-[#E4E6EB] p-3.5 text-center">
            <CheckCircle className="w-5 h-5 text-[#42B72A] mx-auto mb-1.5" />
            <p className="text-[11px] sm:text-xs font-semibold text-[#050505]">دفع عند الاستلام</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E4E6EB] p-3.5 text-center">
            <Truck className="w-5 h-5 text-[#1877F2] mx-auto mb-1.5" />
            <p className="text-[11px] sm:text-xs font-semibold text-[#050505]">توصيل سريع</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E4E6EB] p-3.5 text-center">
            <Shield className="w-5 h-5 text-[#1877F2] mx-auto mb-1.5" />
            <p className="text-[11px] sm:text-xs font-semibold text-[#050505]">بيانات محمية</p>
          </div>
        </div>

        {/* دعم العملاء */}
        <div className="text-center">
          <p className="text-xs text-[#65676B] mb-3">لديك سؤال بخصوص طلبك؟</p>
          <a
            href="https://wa.me/2126XXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            تواصل معنا عبر واتساب
          </a>
        </div>
      </main>

      <footer className="bg-white border-t border-[#E4E6EB] py-6 text-center">
        <p className="text-[11px] text-[#65676B]">© {new Date().getFullYear()} إيروفيا — تجربة شراء بسيطة وواضحة</p>
      </footer>
    </div>
  );
}
