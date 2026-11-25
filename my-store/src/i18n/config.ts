// ==================== ⚙️ إعدادات نظام اللغات المركزي ====================
// أي إضافة للغة جديدة تتم فقط من هنا + إضافة ملف ترجمة في /messages

export const locales = ["en", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];

// الإنجليزية دائماً حتى يختار الزائر لغة أخرى (يُحفظ اختياره في الكوكيز)
export const defaultLocale: Locale = "en";

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
