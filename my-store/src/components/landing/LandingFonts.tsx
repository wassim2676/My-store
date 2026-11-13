// ==================== 🔤 خطوط صفحات الهبوط ====================
// نستخدم ورقة أنماط Google Fonts مباشرة بدل next/font/google: الأخير يفشل في البناء النظيف
// مع Turbopack في هذا الإصدار ("next/font/google queries have exactly one entry") ففشل النشر على Vercel.
// React 19 يرفع <link precedence> إلى <head> تلقائياً ويحمّله مرة واحدة فقط مهما تكرر.

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap";

/** ضعه داخل أي مكوّن يعرض صفحة هبوط أو معاينتها */
export default function LandingFonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />
    </>
  );
}
