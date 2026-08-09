"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MapPin, Wallet, CreditCard, Plus, CheckCircle2 } from "lucide-react";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";

interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  country: string;
  isDefault: boolean;
}

interface CartData {
  items: { id: string; quantity: number; product: { name: string; price: number; image: string } }[];
  subtotal: number;
}

export default function CheckoutPage() {
  const { status } = useSession();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "STRIPE">("COD");
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [addrRes, cartRes] = await Promise.all([fetch("/api/addresses"), fetch("/api/cart")]);
      const addrData = await addrRes.json();
      const cartData = await cartRes.json();

      if (addrData.success) {
        setAddresses(addrData.data);
        const def = addrData.data.find((a: Address) => a.isDefault) || addrData.data[0];
        if (def) setSelectedAddress(def.id);
      }
      if (cartData.success) setCart(cartData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    if (status === "authenticated") loadData();
  }, [status, loadData, router]);

  const handlePlaceOrder = async () => {
    setError("");
    if (!selectedAddress) {
      setError("الرجاء اختيار عنوان للتوصيل");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: selectedAddress, paymentMethod }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء إنشاء الطلب");
        return;
      }

      if (paymentMethod === "STRIPE" && data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
        return;
      }

      router.push(`/checkout/success?orderId=${data.data.orderId}`);
    } catch (e) {
      console.error(e);
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  const shippingFee = cart && cart.subtotal >= 500 ? 0 : 30;
  const total = (cart?.subtotal || 0) + shippingFee;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 lg:mb-8">إتمام الشراء</h1>

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center text-slate-500">
            سلتك فارغة. <Link href="/marketplace" className="text-orange-600 font-bold">تصفح المنتجات</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* العنوان */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h2 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" /> عنوان التوصيل
                </h2>

                {addresses.length === 0 ? (
                  <p className="text-sm text-slate-500 mb-3">لا يوجد لديك عنوان محفوظ بعد.</p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 border rounded-xl p-3 cursor-pointer transition-all ${
                          selectedAddress === addr.id ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === addr.id}
                          onChange={() => setSelectedAddress(addr.id)}
                          className="mt-1 accent-orange-500"
                        />
                        <div className="text-sm">
                          <p className="font-bold text-slate-900">{addr.label} — {addr.firstName} {addr.lastName}</p>
                          <p className="text-slate-500">{addr.street}, {addr.city}, {addr.country}</p>
                          <p className="text-slate-500">{addr.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <Link href="/account/addresses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700">
                  <Plus className="w-4 h-4" /> إضافة عنوان جديد
                </Link>
              </div>

              {/* طريقة الدفع */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h2 className="font-bold text-lg text-slate-900 mb-4">طريقة الدفع</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      paymentMethod === "COD" ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="accent-orange-500" />
                    <Wallet className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-bold text-sm text-slate-900">الدفع عند التوصيل</p>
                      <p className="text-xs text-slate-500">ادفع نقداً عند استلام طلبك</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      paymentMethod === "STRIPE" ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === "STRIPE"} onChange={() => setPaymentMethod("STRIPE")} className="accent-orange-500" />
                    <CreditCard className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-bold text-sm text-slate-900">بطاقة بنكية</p>
                      <p className="text-xs text-slate-500">دفع إلكتروني آمن عبر Stripe</p>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
              )}
            </div>

            {/* الملخص */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">
                <h2 className="font-bold text-lg text-slate-900 mb-4">ملخص الطلب</h2>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-slate-600">
                    <span>المجموع الفرعي</span>
                    <span>{cart.subtotal.toFixed(2)} درهم</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>الشحن</span>
                    <span>{shippingFee === 0 ? "مجاني" : `${shippingFee.toFixed(2)} درهم`}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-slate-900 text-base">
                    <span>الإجمالي</span>
                    <span>{total.toFixed(2)} درهم</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting || !selectedAddress}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  تأكيد الطلب
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <MegaFooter />
    </div>
  );
}
