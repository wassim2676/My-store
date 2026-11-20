// ==================== 🏷️ هوية المنصة ====================
// يمكن تغيير الاسم من متغير البيئة NEXT_PUBLIC_SITE_NAME دون تعديل الكود
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Primeshelf";

/** النطاق الرسمي للمنصة */
export const PRODUCTION_URL = "https://primeshelf.store";

// الرابط الأساسي للموقع (البيانات المنظّمة، خريطة الموقع، روابط الإيميلات):
// متغير صريح ← النطاق الرسمي في إنتاج Vercel ← NEXTAUTH_URL ← localhost
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_ENV === "production" ? PRODUCTION_URL : process.env.NEXTAUTH_URL) ||
  "http://localhost:3000"
).replace(/\/$/, "");

// ==================== ✉️ عناوين البريد ====================
/** المرسِل لكل إيميلات المنصة (تفعيل، ترحيب، كلمة المرور) */
export const EMAIL_FROM = process.env.EMAIL_FROM || `${SITE_NAME} <community@primeshelf.store>`;
/** عنوان التواصل والرد على الإيميلات */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@primeshelf.store";
