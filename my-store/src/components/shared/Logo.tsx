/* eslint-disable @next/next/no-img-element -- شعار SVG ثابت، لا يحتاج تحسين next/image */
import { SITE_NAME } from "@/lib/site";

// ==================== 🏷️ شعار Primeshelf ====================
// النسخة الكاملة (رمز + اسم) مصمَّمة للخلفيات الداكنة: "Prime" أبيض و"shelf" ذهبي.
// الارتفاع يُحدَّد بالـ className (مثل h-7) والعرض يتبع النسبة تلقائياً.
export const LOGO_SRC = "/brand/primeshelf-logo.svg";
export const MARK_SRC = "/brand/primeshelf-mark.svg";

export default function Logo({ className = "h-7", mark = false, priority = false }: { className?: string; mark?: boolean; priority?: boolean }) {
  return (
    <img
      src={mark ? MARK_SRC : LOGO_SRC}
      alt={SITE_NAME}
      width={mark ? 330 : 1240}
      height={mark ? 330 : 315}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      draggable={false}
      className={`block w-auto shrink-0 select-none ${className}`}
    />
  );
}
