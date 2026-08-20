"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight, Phone, MapPin, Package, Clock, RefreshCw, Loader2,
  AlertTriangle, CheckCircle2, Trash2, Copy, User, X,
} from "lucide-react";

// ==================== 📦 الأنواع ====================
interface ManualOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sourcePage?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  isLead: boolean;
}

type ToastType = "success" | "error";

// ==================== 🔔 Toast بسيط ====================
function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-4 left-4 z-[90] ${type === "success" ? "bg-emerald-600" : "bg-red-600"} text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm`}>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-white/80 hover:text-white cursor-pointer" aria-label="إغلاق">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function LeadsPage() {
  const [allOrders, setAllOrders] = useState<ManualOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manual-orders?limit=1000");
      const data = await res.json();
      if (data.success) setAllOrders(data.data.orders);
    } catch {
      setToast({ message: "تعذر جلب البيانات، حاول تحديث الصفحة", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- تحميل أولي عند فتح الصفحة
    fetchAll();
  }, [fetchAll]);

  // ✅ الطلبات المبدئية فقط
  const leads = useMemo(() => allOrders.filter((o) => o.isLead), [allOrders]);

  // ✅ نظام كشف التكرار — يحسب عدد ظهور كل رقم هاتف عبر كل الطلبات (المبدئية والحقيقية معاً)
  // بحيث نعرف إن كان هذا الزائر قد ظهر من قبل (سواء بطلب مبدئي آخر أو بطلب حقيقي مؤكَّد فعلاً)
  const phoneOccurrences = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of allOrders) {
      const normalized = o.phone.replace(/[^\d]/g, "");
      map.set(normalized, (map.get(normalized) || 0) + 1);
    }
    return map;
  }, [allOrders]);

  const isPhoneConfirmedElsewhere = useCallback(
    (phone: string) => {
      const normalized = phone.replace(/[^\d]/g, "");
      return allOrders.some((o) => !o.isLead && o.phone.replace(/[^\d]/g, "") === normalized);
    },
    [allOrders]
  );

  // ✅ تأكيد الطلب المبدئي كطلب حقيقي (يزيله من هذه القائمة، ويُظهره في لوحة الطلبات الرئيسية)
  const handleConfirm = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/manual-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLead: false }),
      });
      if (res.ok) {
        setAllOrders((prev) => prev.map((o) => (o.id === id ? { ...o, isLead: false } : o)));
        setToast({ message: "✅ تم تأكيده كطلب حقيقي — انتقل للوحة الطلبات الرئيسية", type: "success" });
      } else {
        setToast({ message: "تعذر تنفيذ العملية", type: "error" });
      }
    } catch {
      setToast({ message: "خطأ في الاتصال بالخادم", type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  // ✅ تجاهل/حذف الطلب المبدئي نهائياً
  const handleDismiss = async (id: string) => {
    if (!confirm("تجاهل هذا الطلب المبدئي نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/manual-orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAllOrders((prev) => prev.filter((o) => o.id !== id));
        setToast({ message: "تم تجاهل الطلب المبدئي", type: "success" });
      } else {
        setToast({ message: "تعذر الحذف — قد يكون الطلب محمياً", type: "error" });
      }
    } catch {
      setToast({ message: "خطأ في الاتصال بالخادم", type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8" dir="rtl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-4xl mx-auto">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/admin/manual-orders" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-2">
              <ArrowRight className="w-4 h-4" /> العودة للوحة الطلبات
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
              الطلبات المبدئية غير المؤكَّدة
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              زوار أكملوا رقم هاتفهم لكن لم يضغطوا زر "تأكيد الطلب" — {leads.length} طلب حالياً
            </p>
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        </div>

        {/* حالة التحميل */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">لا توجد طلبات مبدئية غير مؤكَّدة حالياً — كل شيء نظيف ✨</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => {
              const occurrences = phoneOccurrences.get(lead.phone.replace(/[^\d]/g, "")) || 1;
              const isDuplicate = occurrences > 1;
              const confirmedElsewhere = isDuplicate && isPhoneConfirmedElsewhere(lead.phone);

              return (
                <div
                  key={lead.id}
                  className="bg-white dark:bg-gray-900 border border-amber-200/70 dark:border-amber-900/40 rounded-2xl p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{lead.customerName}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {new Date(lead.createdAt).toLocaleString("ar-MA")}
                        </p>
                      </div>
                    </div>
                    {/* ✅ شارة كشف التكرار */}
                    {isDuplicate && (
                      <span
                        className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                          confirmedElsewhere
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                        }`}
                      >
                        <Copy className="w-3 h-3" />
                        {confirmedElsewhere ? "لديه طلب حقيقي مؤكَّد" : `مكرر (${occurrences}×)`}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span dir="ltr">{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {lead.city}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {lead.productType}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleConfirm(lead.id)}
                      disabled={busyId === lead.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {busyId === lead.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      تأكيد كطلب حقيقي
                    </button>
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-sm font-semibold rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
                    >
                      <Phone className="w-4 h-4" /> اتصال
                    </a>
                    <button
                      onClick={() => handleDismiss(lead.id)}
                      disabled={busyId === lead.id}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
