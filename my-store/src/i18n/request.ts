import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isValidLocale, localeCookieName, type Locale } from "./config";

// نظام next-intl هنا يعمل بدون بادئة رابط (بدون /ar أو /en في الرابط)
// اللغة تُقرأ من الكوكيز فقط (اختيار الزائر). بدونها: الإنجليزية دائماً — لا نعتمد على لغة المتصفح.
async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  if (isValidLocale(cookieLocale)) return cookieLocale;
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();

  // رسائل الموقع الأساسية + رسائل منصة المسوّقين (ملف منفصل لسهولة الصيانة)
  const base = (await import(`../../messages/${locale}.json`)).default;
  const platform = (await import(`../../messages/platform/${locale}.json`)).default;
  const messages = { ...base, ...platform };

  return {
    locale,
    messages,
    timeZone: "Africa/Casablanca",
  };
});
