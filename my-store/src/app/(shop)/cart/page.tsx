"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    compareAt: number | null;
    image: string;
    stock: number;
    vendorName: string | null;
  };
}

export default function CartPage() {
  const { status } = useSession();
  const router = useRouter();
  const tc = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      if (data.success) setItems(data.data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/cart");
      return;
    }
    if (status === "authenticated") loadCart();
  }, [status, loadCart, router]);

  const updateQty = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
      }
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== itemId));
    } finally {
      setUpdating(null);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 lg:mb-8 flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-orange-500" />
          {tc("siteName") === "متجري" ? "سلة التسوق" : "Cart"}
        </h1>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 bg-white rounded-2xl border border-dashed border-slate-200">
            <ShoppingBag className="w-14 h-14 text-slate-300" />
            <p className="text-slate-500 font-medium">السلة فارغة حالياً</p>
            <Link href="/marketplace" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* قائمة العناصر */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white rounded-2xl border border-slate-200 p-4">
                  <Link href={`/product/${item.product.slug}`} className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-50">
                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="100px" />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link href={`/product/${item.product.slug}`} className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 hover:text-orange-600 transition-colors">
                      {item.product.name}
                    </Link>
                    {item.product.vendorName && (
                      <p className="text-xs text-slate-400 mt-0.5">يُباع من طرف {item.product.vendorName}</p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="flex items-center gap-1 border border-slate-200 rounded-lg">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          disabled={updating === item.id || item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          disabled={updating === item.id || item.quantity >= item.product.stock}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-black text-slate-900">
                        {(item.product.price * item.quantity).toFixed(2)} {tc("currency")}
                      </span>

                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="text-red-500 hover:text-red-600 p-1.5 cursor-pointer disabled:opacity-40"
                        aria-label="remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* الملخص */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">
                <h2 className="font-bold text-lg text-slate-900 mb-4">ملخص الطلب</h2>
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>المجموع الفرعي</span>
                  <span className="font-semibold">{subtotal.toFixed(2)} {tc("currency")}</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">الشحن والضرائب تُحسب عند الدفع</p>
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  إتمام الشراء
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <MegaFooter />
    </div>
  );
}
