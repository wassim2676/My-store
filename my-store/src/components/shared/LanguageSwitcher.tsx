"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown, Check } from "lucide-react";
import { locales, localeInfo, type Locale } from "@/i18n/config";

/**
 * مكوّن تبديل اللغة — يعمل في كل صفحات الموقع بدون أي إعادة تحميل كاملة للصفحة
 * يحفظ الاختيار في كوكيز لمدة سنة، ثم يعيد تحديث محتوى السيرفر (router.refresh)
 */
export default function LanguageSwitcher({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function changeLocale(locale: Locale) {
    if (locale === currentLocale) {
      setOpen(false);
      return;
    }
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    setOpen(false);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
          variant === "compact"
            ? "text-gray-700 hover:bg-gray-100"
            : "text-white/90 hover:bg-white/10"
        }`}
        aria-label="اختيار اللغة"
      >
        <Globe className="w-4 h-4" />
        <span>{localeInfo[currentLocale].flag}</span>
        <span className="hidden sm:inline">{localeInfo[currentLocale].nativeLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-48 rounded-xl bg-white shadow-xl ring-1 ring-black/5 py-1.5 z-50 overflow-hidden">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => changeLocale(locale)}
              className="w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>{localeInfo[locale].flag}</span>
                <span>{localeInfo[locale].nativeLabel}</span>
              </span>
              {locale === currentLocale && <Check className="w-4 h-4 text-orange-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
