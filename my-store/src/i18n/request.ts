import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, isValidLocale, localeCookieName, type Locale } from "./config";

// نظام next-intl هنا يعمل بدون بادئة رابط (بدون /ar أو /en في الرابط)
// اللغة تُقرأ من الكوكيز، وإن لم توجد نحاول قراءة تفضيل المتصفح (Accept-Language)
async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  if (isValidLocale(cookieLocale)) return cookieLocale;

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language") || "";
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0];
  if (isValidLocale(preferred)) return preferred;

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    timeZone: "Africa/Casablanca",
  };
});
