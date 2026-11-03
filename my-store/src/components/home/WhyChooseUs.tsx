"use client";

import { ShieldCheck, TrendingDown, Zap, HeartHandshake } from "lucide-react";
import { useTranslations } from "next-intl";

export default function WhyChooseUs() {
  const t = useTranslations("home");

  const features = [
    { icon: ShieldCheck, title: t("whyUsQuality"), desc: t("whyUsQualityDesc") },
    { icon: TrendingDown, title: t("whyUsPrice"), desc: t("whyUsPriceDesc") },
    { icon: Zap, title: t("whyUsSpeed"), desc: t("whyUsSpeedDesc") },
    { icon: HeartHandshake, title: t("whyUsSupport"), desc: t("whyUsSupportDesc") },
  ];

  return (
    <section className="py-10 lg:py-14 bg-white">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-6 lg:mb-8">{t("whyUsTitle")}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((f) => (
            <div key={f.title} className="border-t-2 border-slate-900 pt-4">
              <f.icon className="w-6 h-6 text-orange-600 mb-3" strokeWidth={1.75} />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5">{f.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
