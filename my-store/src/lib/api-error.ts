// ==================== 🌐 رسائل أخطاء الخادم بلغة المستخدم ====================
// كثير من واجهات API تعيد رسائل تحقق مكتوبة بالعربية. لمستخدمي العربية نعرضها كما هي (دقيقة وحسب الحقل)،
// ولباقي اللغات نعرض رسالة مترجمة حسب نوع الخطأ (رمز HTTP) — لا تظهر أبداً رسالة بلغة غير لغة الواجهة.

const ARABIC = /[؀-ۿ]/;

export interface ApiErrorMessages {
  invalid: string; // 400 / 422: بيانات غير صالحة
  conflict: string; // 409: موجود مسبقاً (اسم/بريد/رابط مستخدم)
  unauthorized: string; // 401 / 403: انتهت الجلسة أو لا صلاحية
  generic: string; // غير ذلك
}

export function localizedApiError(serverMessage: unknown, status: number, locale: string, m: ApiErrorMessages): string {
  const text = typeof serverMessage === "string" ? serverMessage.trim() : "";
  if (text && (locale === "ar" || !ARABIC.test(text))) return text;
  if (status === 401 || status === 403) return m.unauthorized;
  if (status === 409) return m.conflict;
  if (status === 400 || status === 422) return m.invalid;
  return m.generic;
}
