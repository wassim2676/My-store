"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

// بانر رئيسي دوّار بأسلوب أمازون — نص وأزرار من next-intl، الصور ثابتة قابلة للتغيير لاحقاً من لوحة الأدمن
export default function HeroBanner() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const slides = [
    {
      title: t("hero1Title"),
      subtitle: t("hero1Subtitle"),
      cta: t("hero1Cta"),
      href: "/marketplace?deals=true",
      image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600&h=600&fit=crop",
      gradient: "from-orange-600/90 via-orange-500/50 to-transparent",
    },
    {
      title: t("hero2Title"),
      subtitle: t("hero2Subtitle"),
      cta: t("hero2Cta"),
      href: "/marketplace",
      image: "https://images.unsplash.com/photo-1584308972272-9cf4b93c8c65?w=1600&h=600&fit=crop",
      gradient: "from-emerald-700/90 via-emerald-600/50 to-transparent",
    },
    {
      title: t("hero3Title"),
      subtitle: t("hero3Subtitle"),
      cta: t("hero3Cta"),
      href: "/register",
      image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1600&h=600&fit=crop",
      gradient: "from-slate-900/90 via-slate-800/50 to-transparent",
    },
  ];

  const [active, setActive] = useState(0);

  const next = useCallback(() => setActive((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setActive((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full h-[340px] sm:h-[400px] lg:h-[480px] overflow-hidden bg-slate-900">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === active ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
          <div className={`absolute inset-0 bg-gradient-to-${isRtl ? "l" : "r"} ${slide.gradient}`} />

          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center max-w-xl">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-3 lg:mb-4 leading-tight drop-shadow-md">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-lg text-white/90 mb-5 lg:mb-6 max-w-md drop-shadow-sm">
              {slide.subtitle}
            </p>
            <Link
              href={slide.href}
              className="inline-flex w-fit items-center gap-2 bg-white text-slate-900 font-bold px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all shadow-lg text-sm sm:text-base"
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      ))}

      {/* أزرار التنقل */}
      <button
        onClick={prev}
        aria-label="previous slide"
        className="absolute top-1/2 -translate-y-1/2 start-3 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all cursor-pointer"
      >
        {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
      <button
        onClick={next}
        aria-label="next slide"
        className="absolute top-1/2 -translate-y-1/2 end-3 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all cursor-pointer"
      >
        {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {/* نقاط التنقل */}
      <div className="absolute bottom-4 sm:bottom-6 start-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              i === active ? "w-7 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
