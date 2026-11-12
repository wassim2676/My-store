"use client";
/* eslint-disable @next/next/no-img-element -- شعار صغير من /public أو رابط خارجي */
import { useState, type ReactNode } from "react";

/**
 * صورة شعار تعرض `fallback` (بدون الإطار) إذا فشل تحميلها، مثلاً ملف غير موجود في /public/brands.
 * نفحص أيضاً الصورة عند ربط العنصر لأن الخطأ قد يحدث قبل اكتمال hydration فيضيع حدث onError.
 */
export default function BrandLogoImage({
  src,
  alt,
  fallback,
  className,
  size,
}: {
  src: string;
  alt: string;
  fallback: ReactNode;
  className?: string;
  size: number;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <span className={className} style={{ height: size, minWidth: size, maxWidth: size * 5 }}>
      <img
        ref={(el) => {
          // صورة "مكتملة" بأبعاد صفر = فشل قبل hydration غالباً؛ نتأكد بطلب HEAD (بعض ملفات SVG بلا أبعاد تُبلغ صفراً)
          if (el && el.complete && el.naturalWidth === 0) {
            fetch(src, { method: "HEAD" })
              .then((r) => !r.ok && setFailed(true))
              .catch(() => {});
          }
        }}
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className="mx-auto h-full w-auto max-w-full object-contain"
      />
    </span>
  );
}
