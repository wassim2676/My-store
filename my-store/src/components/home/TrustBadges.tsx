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
    <section className="bg-white border-y border-slate-200">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-slate-100 rtl:divide-x-reverse">
          {badges.map((badge, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-5 lg:py-6">
              <badge.icon className="w-5 h-5 text-slate-700 flex-shrink-0" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{badge.title}</p>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
