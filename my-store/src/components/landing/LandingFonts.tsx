import { fontHref } from "@/lib/fonts";

// ==================== 🔤 خطوط صفحات الهبوط ====================
// نستخدم ورقة أنماط Google Fonts مباشرة بدل next/font/google: الأخير يفشل في البناء النظيف
// مع Turbopack في هذا الإصدار ("next/font/google queries have exactly one entry") ففشل النشر على Vercel.
// React 19 يرفع <link precedence> إلى <head> تلقائياً ويحمّل كل رابط مرة واحدة فقط مهما تكرر.
// نحمّل فقط الخطوط المختارة (رابط لكل خط بأوزانه المتاحة فعلاً).

/** ضعه داخل أي مكوّن يعرض صفحة هبوط أو معاينتها */
export default function LandingFonts({ fonts }: { fonts: string[] }) {
  const hrefs = [...new Set(fonts)].map(fontHref).filter((h): h is string => !!h);
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {hrefs.map((href) => (
        <link key={href} rel="stylesheet" href={href} precedence="default" />
      ))}
    </>
  );
}
