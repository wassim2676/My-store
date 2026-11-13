import { Store } from "lucide-react";
import { toSlug } from "@/lib/landing";
import BrandLogoImage from "./BrandLogoImage";

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
// الأولوية: SVG خام (يلصقه الأدمن) > رابط صورة/SVG > ملف public/brands/{slug}.svg > حرف أول داخل شارة ملوّنة
export default function BrandLogo({
  brand,
  size = 28,
  className = "",
  fallback = "initial",
  squareScale = 1,
}: {
  brand: BrandLogoData;
  size?: number;
  className?: string;
  /** عند غياب الشعار: "initial" شارة بالحرف الأول، "name" اسم المتجر كنص بلونه (للبطاقات الداكنة) */
  fallback?: "initial" | "name";
  /** تكبير الشعارات المربّعة في الأماكن التي تتسع لذلك (شريط الشعارات، البطاقات) */
  squareScale?: number;
}) {
  const accent = brand.accentColor || "#1D4ED8";

  if (brand.logoSvg) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 [&_svg]:h-full [&_svg]:w-auto ${className}`}
        style={{ height: size, minWidth: size, maxWidth: size * 5 }}
        role="img"
        aria-label={brand.name}
        // ⚠️ محتوى يُدخله الأدمن فقط من لوحة التحكم المحمية — ليس مدخلاً من الزوار
        dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.logoSvg) }}
      />
    );
  }

  // 🔤 بديل الشعار: اسم المتجر كنص، أو شارة بحرف أول + أيقونة متجر عامة
  const initialBadge = fallback === "name" && brand.name ? (
    <span className={`whitespace-nowrap font-bold tracking-tight ${className}`} style={{ fontSize: Math.max(12, size * 0.62), lineHeight: 1 }}>
      {brand.name}
    </span>
  ) : (
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

  // رابط يحدّده الأدمن، وإلا ملف تلقائي من public/brands/{slug}.svg (مثل "Best Buy" → best-buy.svg)
  const fileSlug = brand.name ? toSlug(brand.name) : "";
  const src = brand.logoUrl || (fileSlug ? `/brands/${fileSlug}.svg` : null);
  if (!src) return initialBadge;

  return (
    <BrandLogoImage
      key={src}
      src={src}
      alt={brand.name}
      fallback={initialBadge}
      className={`relative inline-block shrink-0 ${className}`}
      size={size}
      squareScale={squareScale}
    />
  );
}
