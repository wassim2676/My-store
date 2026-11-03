"use client";

import { ExternalLink } from "lucide-react";
import BrandLogo, { type BrandLogoData } from "./BrandLogo";

export default function AffiliateBuyButton({
  slug,
  affiliateUrl,
  brand,
  label,
  size = "lg",
}: {
  slug: string;
  affiliateUrl: string;
  brand: BrandLogoData;
  label?: string | null;
  size?: "lg" | "md";
}) {
  const accent = brand.accentColor || "#1D4ED8";
  const text = label || `الانتقال للشراء من ${brand.name}`;

  const handleClick = () => {
    // 📊 تسجيل الضغطة بشكل غير معطّل — لا ننتظره ولا نمنع فتح الرابط لو فشل
    try {
      fetch(`/api/affiliate-products/${encodeURIComponent(slug)}/click`, {
        method: "POST",
        keepalive: true,
      }).catch(() => {});
    } catch {
      // تجاهل صامت — التتبع ثانوي ولا يجب أن يعطّل تجربة الشراء
    }
  };

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      onClick={handleClick}
      className={`group inline-flex w-full items-center justify-center gap-2.5 rounded-xl font-bold text-white shadow-sm transition-transform active:scale-[0.98] cursor-pointer ${
        size === "lg" ? "px-6 py-4 text-base" : "px-4 py-2.5 text-sm"
      }`}
      style={{ backgroundColor: accent }}
    >
      <BrandLogo brand={brand} size={size === "lg" ? 24 : 20} className="bg-white/15 rounded-md" />
      <span>{text}</span>
      <ExternalLink className={`${size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} opacity-80 transition-transform group-hover:translate-x-0.5`} />
    </a>
  );
}
