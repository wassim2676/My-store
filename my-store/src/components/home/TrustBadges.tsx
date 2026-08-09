"use client";

import { Truck, ShieldCheck, Wallet, RotateCcw, Headphones } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TrustBadges() {
  const t = useTranslations("home");

  const badges = [
    { icon: Truck, title: t("trustShippingTitle"), desc: t("trustShippingDesc") },
    { icon: ShieldCheck, title: t("trustPaymentTitle"), desc: t("trustPaymentDesc") },
    { icon: Wallet, title: t("trustCodTitle"), desc: t("trustCodDesc") },
    { icon: RotateCcw, title: t("trustReturnsTitle"), desc: t("trustReturnsDesc") },
    { icon: Headphones, title: t("trustSupportTitle"), desc: t("trustSupportDesc") },
  ];

  return (
    <section className="py-10 lg:py-14 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
          {badges.map((badge, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2.5">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                <badge.icon className="w-6 h-6 lg:w-7 lg:h-7 text-orange-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">{badge.title}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
