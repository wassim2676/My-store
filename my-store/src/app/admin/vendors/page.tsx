"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Store } from "lucide-react";
import AdminButton from "@/components/admin/AdminButton";

interface AdminVendor {
  id: string;
  storeName: string;
  slug: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
  email: string;
  ownerName: string;
  phone: string | null;
  productsCount: number;
  totalSales: number;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SUSPENDED: "bg-red-50 text-red-700 border-red-200",
  REJECTED: "bg-slate-100 text-slate-500 border-slate-200",
};

const statusLabels: Record<string, string> = {
  PENDING: "قيد المراجعة", APPROVED: "مفعّل", SUSPENDED: "موقوف", REJECTED: "مرفوض",
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/vendors")
      .then((r) => r.json())
      .then((d) => { if (d.success) setVendors(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- تحميل أولي عند فتح الصفحة
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch(`/api/admin/vendors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      load();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Store className="w-6 h-6 text-sky-500" /> إدارة البائعين
      </h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent" />
        </div>
      ) : vendors.length === 0 ? (
        <p className="text-gray-500">لا يوجد بائعون مسجلون بعد.</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 text-xs">
                <th className="text-start px-4 py-3">المتجر</th>
                <th className="text-start px-4 py-3">المالك</th>
                <th className="text-start px-4 py-3">المنتجات</th>
                <th className="text-start px-4 py-3">المبيعات</th>
                <th className="text-start px-4 py-3">الحالة</th>
                <th className="text-start px-4 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{v.storeName}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {v.ownerName}<br /><span className="text-xs text-gray-400">{v.email}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.productsCount}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.totalSales.toFixed(0)} د.م</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${statusStyles[v.status]}`}>
                      {statusLabels[v.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {v.status !== "APPROVED" && (
                        <AdminButton
                          size="sm"
                          variant="primary"
                          loading={updating === v.id}
                          onClick={() => updateStatus(v.id, "APPROVED")}
                          title="موافقة"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </AdminButton>
                      )}
                      {v.status === "APPROVED" && (
                        <AdminButton
                          size="sm"
                          variant="secondary"
                          loading={updating === v.id}
                          onClick={() => updateStatus(v.id, "SUSPENDED")}
                          title="إيقاف"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </AdminButton>
                      )}
                      {v.status === "PENDING" && (
                        <AdminButton
                          size="sm"
                          variant="danger"
                          loading={updating === v.id}
                          onClick={() => updateStatus(v.id, "REJECTED")}
                          title="رفض"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </AdminButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
