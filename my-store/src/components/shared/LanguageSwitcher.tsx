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
  dropUp = false,
  placement = "inline",
  label = "Language",
}: {
  /** row: صف "اللغة ›" قابل للتوسيع (قوائم الهاتف، مثل المواقع العالمية) */
  variant?: "default" | "compact" | "dark" | "segmented" | "row";
  /** عنوان صف اللغة (row) */
  label?: string;
  dropUp?: boolean;
  /**
   * أين تنزل القائمة: "inline" تحت الزر مباشرة، "navbar" تحت خط الشريط العائم (مثل قائمة Resources)،
   * "topbar" تحت خط الشريط العلوي للوحات التحكم (ارتفاعه 64px)
   */
  placement?: "inline" | "navbar" | "topbar";
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

  // 📱 صف قابل للتوسيع: "🌐 اللغة ............ English ⌄" ثم قائمة اللغات بأسمائها الأصلية
  if (variant === "row") {
    return (
      <div className="border-b border-white/[0.07]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 py-3.5 text-[16px] font-medium text-white/90 cursor-pointer"
        >
          <span className="flex items-center gap-3">
            <Globe className="h-[18px] w-[18px] text-white/50" />
            {label}
          </span>
          <span className="flex items-center gap-2 text-[15px] font-normal text-white/55">
            {localeInfo[currentLocale].nativeLabel}
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        </button>
        {open && (
          <div className="mb-3 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]" role="radiogroup" aria-label={label}>
            {locales.map((locale) => {
              const on = locale === currentLocale;
              return (
                <button
                  key={locale}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={isPending}
                  onClick={() => changeLocale(locale)}
                  className={`flex w-full items-center justify-between gap-3 border-b border-white/[0.05] px-4 py-3.5 text-start last:border-b-0 transition-colors cursor-pointer disabled:opacity-60 ${on ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"}`}
                >
                  <span className="flex flex-col">
                    <span className={`text-[15px] ${on ? "font-semibold text-white" : "text-white/80"}`}>{localeInfo[locale].nativeLabel}</span>
                    <span className="text-xs text-white/40">{localeInfo[locale].label}</span>
                  </span>
                  {on && <Check className="h-4 w-4 text-amber-300" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 📱 أزرار ظاهرة كلها (لقوائم الهاتف): لا قائمة منسدلة قد تُقص داخل حاوية قابلة للتمرير
  if (variant === "segmented") {
    return (
      <div className="flex w-full gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1" role="radiogroup" aria-label="Language">
        {locales.map((locale) => {
          const on = locale === currentLocale;
          return (
            <button
              key={locale}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={isPending}
              onClick={() => changeLocale(locale)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-60 ${
                on ? "bg-white text-black" : "text-white/65 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {on && <Check className="h-3.5 w-3.5" />}
              {localeInfo[locale].nativeLabel}
            </button>
          );
        })}
      </div>
    );
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
            : variant === "dark"
              ? "text-white/70 hover:bg-white/[0.06] hover:text-white"
              : "text-white/90 hover:bg-white/10"
        }`}
        aria-label="Language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeInfo[currentLocale].nativeLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className={`absolute end-0 z-50 w-52 overflow-hidden animate-[lp-pop_140ms_ease-out] ${
            dropUp ? "bottom-full mb-2" : placement === "navbar" ? "top-full mt-3" : placement === "topbar" ? "top-full mt-[22px]" : "top-full mt-2"
          } ${
            variant === "dark"
              ? "rounded-2xl border border-white/[0.08] bg-[#0C0F15]/95 p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
              : "rounded-xl bg-white py-1.5 shadow-xl ring-1 ring-black/5"
          }`}
        >
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => changeLocale(locale)}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm transition-colors cursor-pointer ${variant === "dark" ? "rounded-xl text-white/80 hover:bg-white/[0.06] hover:text-white" : "text-gray-700 hover:bg-gray-50"}`}
            >
              <span className="flex flex-col items-start">
                <span>{localeInfo[locale].nativeLabel}</span>
                <span className={`text-[11px] ${variant === "dark" ? "text-white/35" : "text-gray-400"}`}>{localeInfo[locale].label}</span>
              </span>
              {locale === currentLocale && <Check className={`w-4 h-4 ${variant === "dark" ? "text-amber-300" : "text-orange-500"}`} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
