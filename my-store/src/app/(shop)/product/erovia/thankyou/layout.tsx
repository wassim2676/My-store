import type { Metadata } from "next";

// ⚠️ ملاحظة: مكوّن <FacebookPixel /> لا يُضاف هنا عمداً — موروث تلقائياً من
// layout.tsx الأب (src/app/(shop)/product/erovia/layout.tsx) بما أن هذا المسار
// فرعي منه في نظام Next.js. إضافته هنا مجدداً كانت ستُشغّله مرتين بالخطأ.

export const metadata: Metadata = {
  title: "تم استلام طلبك بنجاح | إيروفيا",
  description: "شكراً لثقتك بنا — طلبك قيد المعالجة وسيتواصل معك فريقنا قريباً لتأكيده.",
  robots: { index: false, follow: false }, // صفحة تأكيد شخصية، لا داعي لفهرستها في محركات البحث
};

export default function EroviaThankYouLayout({ children }: { children: React.ReactNode }) {
  return children;
}
