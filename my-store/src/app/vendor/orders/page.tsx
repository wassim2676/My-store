"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";
import VendorSidebar from "@/components/vendor/VendorSidebar";

interface VendorOrderItem {
  id: string;
  productName: string;
  image: string | null;
  quantity: number;
  total: number;
  order: { id: string; orderNumber: number; status: string; paymentStatus: string; paymentMethod: string; createdAt: string };
}

const statusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار", CONFIRMED: "مؤكد", PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن", DELIVERED: "تم التسليم", CANCELLED: "ملغى", REFUNDED: "مُسترجع", RETURNED: "مُرجع",
};

export default function VendorOrdersPage() {
  const [items, setItems] = useState<VendorOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/orders")
      .then((r) => r.json())
      .then((d) => { if (d.success) setItems(d.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          <VendorSidebar />

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">الطلبات</h1>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                <ShoppingBag className="w-10 h-10" />
                <p className="text-sm font-medium">لا توجد طلبات بعد</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                      {item.image && <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="56px" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">{item.productName}</p>
                      <p className="text-xs text-slate-500">طلب #{item.order.orderNumber} · الكمية: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 whitespace-nowrap">
                      {statusLabels[item.order.status] || item.order.status}
                    </span>
                    <span className="font-black text-slate-900 text-sm whitespace-nowrap">{item.total.toFixed(2)} د.م</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <MegaFooter />
    </div>
  );
}
