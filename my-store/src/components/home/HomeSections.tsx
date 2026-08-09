"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Toast from "@/components/shared/Toast";
import ProductSection from "@/components/home/ProductSection";
import DealsSection from "@/components/home/DealsSection";
import type { HomeProduct } from "@/lib/products";

interface HomeSectionsProps {
  featured: HomeProduct[];
  deals: HomeProduct[];
  newArrivals: HomeProduct[];
}

export default function HomeSections({ featured, deals, newArrivals }: HomeSectionsProps) {
  const t = useTranslations("home");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // ⚠️ إضافة حقيقية للسلة (استدعاء /api/cart) ستُفعَّل في المرحلة 3 عند بناء السلة والدفع
  const handleAddToCart = () => {
    setToast({ message: "تمت الإضافة للسلة", type: "success" });
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ProductSection
        title={t("featuredTitle")}
        subtitle={t("featuredSubtitle")}
        products={featured}
        onAddToCart={handleAddToCart}
        bgClassName="bg-slate-50"
      />

      <DealsSection products={deals} onAddToCart={handleAddToCart} />

      <ProductSection
        title={t("newArrivalsTitle")}
        products={newArrivals}
        onAddToCart={handleAddToCart}
        bgClassName="bg-white"
      />
    </>
  );
}
