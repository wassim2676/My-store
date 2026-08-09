"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ShoppingBag, DollarSign, CheckCircle2, Clock, XCircle } from "lucide-react";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";
import VendorSidebar from "@/components/vendor/VendorSidebar";

interface Stats {
  productsCount: number;
  activeProductsCount: number;
  ordersCount: number;
  totalRevenue: number;
  status: "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
}

const statusConfig = {
  PENDING: { label: "قيد المراجعة", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  APPROVED: { label: "مفعّل", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  SUSPENDED: { label: "موقوف", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  REJECTED: { label: "مرفوض", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

export default function VendorDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          <VendorSidebar />

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">نظرة عامة على متجرك</h1>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
              </div>
            ) : stats ? (
              <>
                {stats.status !== "APPROVED" && (
                  <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 mb-6 text-sm font-semibold ${statusConfig[stats.status].color}`}>
                    {(() => { const Icon = statusConfig[stats.status].icon; return <Icon className="w-5 h-5 flex-shrink-0" />; })()}
                    {stats.status === "PENDING" && "متجرك قيد المراجعة من طرف فريقنا، ستتمكن من إضافة منتجات فور الموافقة."}
                    {stats.status === "SUSPENDED" && "تم إيقاف متجرك مؤقتاً. تواصل مع الدعم لمزيد من المعلومات."}
                    {stats.status === "REJECTED" && "للأسف تم رفض طلب متجرك. تواصل مع الدعم لمزيد من المعلومات."}
                  </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "إجمالي المنتجات", value: stats.productsCount, icon: Package, color: "text-blue-600 bg-blue-50" },
                    { label: "منتجات نشطة", value: stats.activeProductsCount, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
                    { label: "عدد الطلبات", value: stats.ordersCount, icon: ShoppingBag, color: "text-purple-600 bg-purple-50" },
                    { label: "إجمالي المبيعات", value: `${stats.totalRevenue.toFixed(0)} د.م`, icon: DollarSign, color: "text-orange-600 bg-orange-50" },
                  ].map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                        <card.icon className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-black text-slate-900">{card.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{card.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-900">جاهز لإضافة منتج جديد؟</p>
                    <p className="text-sm text-slate-500">أضف منتجاتك واجعلها متاحة لآلاف العملاء</p>
                  </div>
                  <Link
                    href="/vendor/products"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                  >
                    إدارة المنتجات
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-slate-500">تعذر تحميل بيانات المتجر.</p>
            )}
          </div>
        </div>
      </main>

      <MegaFooter />
    </div>
  );
}
