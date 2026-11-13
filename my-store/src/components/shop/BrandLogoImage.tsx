"use client";
/* eslint-disable @next/next/no-img-element -- شعار صغير من /public أو رابط خارجي */
import { useState, type ReactNode } from "react";

/** نسبة البكسلات المعتمة التي فوقها نعتبر الشعار "شارة" ممتلئة (مربع/بطاقة ملوّنة) */
const BADGE_COVERAGE = 0.5;

/**
 * هل الشعار شارة ممتلئة (مثل مربع Home Depot أو بطاقة Best Buy)؟
 * فلتر "الأبيض فقط" يحوّل الشارة إلى مربع أبيض/رمادي، لذلك نُبقي ألوانها الأصلية.
 * الشعارات النصية/الخطية (Amazon, eBay...) تغطي جزءاً صغيراً من مساحتها فتبقى قابلة للتلوين بالأبيض.
 */
function isBadge(img: HTMLImageElement): boolean {
  try {
    const size = 48;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = Math.max(1, Math.round((size * (img.naturalHeight || 1)) / (img.naturalWidth || 1)));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let opaque = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 200) opaque++;
    return opaque / (data.length / 4) >= BADGE_COVERAGE;
  } catch {
    return false; // صورة من نطاق خارجي بلا CORS → لا يمكن القراءة، نُبقي السلوك الافتراضي
  }
}

/**
 * صورة شعار تعرض `fallback` (بدون الإطار) إذا فشل تحميلها، مثلاً ملف غير موجود في /public/brands.
 * تضيف data-badge للشعارات الممتلئة كي لا يُطبَّق عليها فلتر الأبيض (انظر logo-classes.ts).
 */
export default function BrandLogoImage({
  src,
  alt,
  fallback,
  className,
  size,
  squareScale = 1,
}: {
  src: string;
  alt: string;
  fallback: ReactNode;
  className?: string;
  size: number;
  /** تكبير الشعارات المربّعة (كي لا تبدو صغيرة بجانب الشعارات العريضة) */
  squareScale?: number;
}) {
  const [failed, setFailed] = useState(false);
  const [badge, setBadge] = useState(false);
  const [square, setSquare] = useState(false);
  if (failed) return <>{fallback}</>;

  const inspect = (el: HTMLImageElement) => {
    if (el.naturalWidth > 0) {
      setBadge(isBadge(el));
      setSquare(el.naturalWidth / (el.naturalHeight || 1) < 1.4);
    }
  };
  const h = square ? Math.round(size * squareScale) : size;

  return (
    <span className={className} style={{ height: h, minWidth: h, maxWidth: size * 5 }}>
      <img
        ref={(el) => {
          if (!el) return;
          // صورة "مكتملة" بأبعاد صفر = فشل قبل hydration غالباً؛ نتأكد بطلب HEAD (بعض ملفات SVG بلا أبعاد تُبلغ صفراً)
          if (el.complete && el.naturalWidth === 0) {
            fetch(src, { method: "HEAD" })
              .then((r) => !r.ok && setFailed(true))
              .catch(() => {});
          } else if (el.complete) {
            inspect(el); // حُمّلت قبل hydration فلن يصل حدث onLoad
          }
        }}
        src={src}
        alt={alt}
        data-badge={badge ? "" : undefined}
        onLoad={(e) => inspect(e.currentTarget)}
        onError={() => setFailed(true)}
        className="mx-auto h-full w-auto max-w-full object-contain"
      />
    </span>
  );
}
