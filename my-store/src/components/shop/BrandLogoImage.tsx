"use client";
/* eslint-disable @next/next/no-img-element -- شعار صغير من /public أو رابط خارجي */
import { useState, type ReactNode } from "react";

/**
 * صورة شعار تعرض `fallback` إذا فشل تحميلها (مثلاً ملف غير موجود في /public/brands).
 * نفحص أيضاً الصورة عند ربط العنصر، لأن الخطأ قد يحدث قبل اكتمال hydration فيضيع حدث onError.
 */
export default function BrandLogoImage({ src, alt, fallback }: { src: string; alt: string; fallback: ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <img
      ref={(el) => {
        if (el && el.complete && el.naturalWidth === 0) setFailed(true);
      }}
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-full w-full object-contain"
    />
  );
}
