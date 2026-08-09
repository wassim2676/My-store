// ==================== ⚙️ إعدادات نظام اللغات المركزي ====================
// أي إضافة للغة جديدة تتم فقط من هنا + إضافة ملف ترجمة في /messages

export const locales = ["ar", "en", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const localeCookieName = "NEXT_LOCALE";

export const localeInfo: Record<
  Locale,
  { label: string; nativeLabel: string; dir: "rtl" | "ltr"; flag: string }
> = {
  ar: { label: "Arabic", nativeLabel: "العربية", dir: "rtl", flag: "🇲🇦" },
  en: { label: "English", nativeLabel: "English", dir: "ltr", flag: "🇬🇧" },
  fr: { label: "French", nativeLabel: "Français", dir: "ltr", flag: "🇫🇷" },
};

export function isValidLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function getDirection(locale: string): "rtl" | "ltr" {
  return isValidLocale(locale) ? localeInfo[locale].dir : "ltr";
}
