import Image from "next/image";
import { Store } from "lucide-react";

export interface BrandLogoData {
  name: string;
  logoSvg?: string | null;
  logoUrl?: string | null;
  accentColor?: string | null;
}

// ==================== 🧹 تعقيم بسيط لكود SVG (دفاع إضافي) ====================
// المحتوى يُضاف من لوحة الأدمن فقط (ليس من زوار الموقع)، لكننا نزيل أي <script>
// أو خصائص on* احتياطاً، لأن هذا هو المحتوى الوحيد في الموقع الذي يُحقن كـ HTML خام.
function sanitizeSvg(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

// ==================== 🏷️ شعار العلامة التجارية ====================
// الأولوية: SVG خام (يلصقه الأدمن) > رابط صورة/SVG > حرف أول داخل شارة ملوّنة
export default function BrandLogo({
  brand,
  size = 28,
  className = "",
}: {
  brand: BrandLogoData;
  size?: number;
  className?: string;
}) {
  const accent = brand.accentColor || "#1D4ED8";

  if (brand.logoSvg) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label={brand.name}
        // ⚠️ محتوى يُدخله الأدمن فقط من لوحة التحكم المحمية — ليس مدخلاً من الزوار
        dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.logoSvg) }}
      />
    );
  }

  if (brand.logoUrl) {
    return (
      <span
        className={`relative inline-block shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image src={brand.logoUrl} alt={brand.name} fill sizes={`${size}px`} className="object-contain" />
      </span>
    );
  }

  // 🔤 شارة احتياطية بحرف أول من اسم العلامة التجارية + أيقونة متجر عامة
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg font-black shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: `${accent}1A`, color: accent }}
      role="img"
      aria-label={brand.name}
    >
      {brand.name ? (
        <span style={{ fontSize: Math.max(10, size * 0.42) }}>{brand.name.trim().charAt(0).toUpperCase()}</span>
      ) : (
        <Store style={{ width: size * 0.55, height: size * 0.55 }} />
      )}
    </span>
  );
}
