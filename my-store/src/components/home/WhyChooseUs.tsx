"use client";

import { ShieldCheck, TrendingDown, Zap, HeartHandshake } from "lucide-react";
import { useTranslations } from "next-intl";

export default function WhyChooseUs() {
  const t = useTranslations("home");

  const features = [
    { icon: ShieldCheck, title: t("whyUsQuality"), desc: t("whyUsQualityDesc"), color: "from-blue-500 to-blue-600" },
    { icon: TrendingDown, title: t("whyUsPrice"), desc: t("whyUsPriceDesc"), color: "from-emerald-500 to-emerald-600" },
    { icon: Zap, title: t("whyUsSpeed"), desc: t("whyUsSpeedDesc"), color: "from-orange-500 to-orange-600" },
    { icon: HeartHandshake, title: t("whyUsSupport"), desc: t("whyUsSupportDesc"), color: "from-purple-500 to-purple-600" },
  ];

  return (
    <section className="py-14 lg:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-3">{t("whyUsTitle")}</h2>
          <p className="text-slate-500 text-sm sm:text-lg">{t("whyUsSubtitle")}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <f.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5">{f.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
