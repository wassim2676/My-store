// ==================== 🏷️ هوية المنصة ====================
// غيّر الاسم من متغير البيئة NEXT_PUBLIC_SITE_NAME دون تعديل الكود
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Showroom";

// الرابط الأساسي للموقع (للبيانات المنظّمة وخريطة الموقع): متغير صريح، ثم نطاق Vercel الإنتاجي، ثم NEXTAUTH_URL
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.NEXTAUTH_URL) ||
  "http://localhost:3000"
).replace(/\/$/, "");
