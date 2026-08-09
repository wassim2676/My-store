"use client";

import Link from "next/link";
import { Store, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export default function SellerCtaBanner() {
  const t = useTranslations("home");
  const isRtl = useLocale() === "ar";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="py-14 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950 px-6 py-12 sm:px-12 sm:py-16 text-center">
          {/* زخرفة خلفية */}
          <div className="absolute -top-10 -end-10 w-56 h-56 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -start-10 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-5 shadow-xl">
              <Store className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>

            <span className="inline-flex items-center gap-1.5 bg-white/10 text-orange-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" /> {"100% مجاناً"}
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 max-w-xl mx-auto">
              {t("sellerCtaTitle")}
            </h2>
            <p className="text-slate-300 text-sm sm:text-lg mb-8 max-w-lg mx-auto">
              {t("sellerCtaSubtitle")}
            </p>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-7 py-3.5 rounded-xl hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              {t("sellerCtaButton")}
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
