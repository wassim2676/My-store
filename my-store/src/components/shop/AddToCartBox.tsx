"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Minus, Plus, ShoppingCart, CheckCircle } from "lucide-react";

export default function AddToCartBox({ productId, stock }: { productId: string; stock: number }) {
  const { status } = useSession();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const inStock = stock > 0;

  const handleAdd = async () => {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/product/${productId}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      if (res.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!inStock) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
        هذا المنتج نفد من المخزون حالياً
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="flex items-center border border-slate-200 rounded-xl w-fit">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center hover:bg-slate-50 cursor-pointer">
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-10 text-center font-bold">{qty}</span>
        <button onClick={() => setQty((q) => Math.min(stock, q + 1))} className="w-10 h-11 flex items-center justify-center hover:bg-slate-50 cursor-pointer">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
      >
        {added ? <CheckCircle className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
        {added ? "تمت الإضافة!" : "أضف للسلة"}
      </button>
    </div>
  );
}
