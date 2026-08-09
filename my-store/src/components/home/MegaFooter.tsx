"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, MapPin, Phone, Link2, MessageCircle, Send, CreditCard, ArrowUp } from "lucide-react";

export default function MegaFooter() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // ⚠️ لا يوجد بعد باك-إند لحفظ الاشتراكات — سيُضاف عند بناء نظام التسويق بالبريد لاحقاً
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* النشرة البريدية */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="text-center lg:text-start">
            <h3 className="text-white text-lg sm:text-xl font-bold mb-1">{t("newsletterTitle")}</h3>
            <p className="text-slate-400 text-sm">{t("newsletterDesc")}</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto max-w-md gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletterPlaceholder")}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              {subscribed ? "✓" : t("newsletterBtn")}
            </button>
          </form>
        </div>
      </div>

      {/* الأعمدة الرئيسية */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* الشعار والتواصل */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-white font-black">M</span>
              </div>
              <span className="text-white font-bold text-lg">{tc("siteName")}</span>
            </div>
            <div className="space-y-2.5 text-sm">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 flex-shrink-0" /> Casablanca, Morocco</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 flex-shrink-0" /> +212 5XX-XXXXXX</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 flex-shrink-0" /> support@mystore.ma</p>
            </div>
            <div className="flex items-center gap-3 mt-5">
              {[Link2, MessageCircle, Send].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-orange-500 flex items-center justify-center transition-colors cursor-pointer">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* من نحن */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">{t("aboutTitle")}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-orange-400 transition-colors">{t("aboutUs")}</Link></li>
              <li><Link href="/careers" className="hover:text-orange-400 transition-colors">{t("careers")}</Link></li>
              <li><Link href="/blog" className="hover:text-orange-400 transition-colors">{t("blog")}</Link></li>
              <li><Link href="/contact" className="hover:text-orange-400 transition-colors">{t("contactUs")}</Link></li>
            </ul>
          </div>

          {/* المساعدة */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">{t("helpTitle")}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/help" className="hover:text-orange-400 transition-colors">{t("helpCenter")}</Link></li>
              <li><Link href="/shipping" className="hover:text-orange-400 transition-colors">{t("shipping")}</Link></li>
              <li><Link href="/returns" className="hover:text-orange-400 transition-colors">{t("returns")}</Link></li>
              <li><Link href="/faq" className="hover:text-orange-400 transition-colors">{t("faq")}</Link></li>
            </ul>
          </div>

          {/* قانوني */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">{t("legalTitle")}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/terms" className="hover:text-orange-400 transition-colors">{t("terms")}</Link></li>
              <li><Link href="/privacy" className="hover:text-orange-400 transition-colors">{t("privacy")}</Link></li>
            </ul>
          </div>

          {/* البيع معنا */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">{t("sellTitle")}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/register" className="hover:text-orange-400 transition-colors font-semibold text-orange-400">{t("becomeSeller")}</Link></li>
              <li><Link href="/vendor/dashboard" className="hover:text-orange-400 transition-colors">{t("sellerCenter")}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* الشريط السفلي */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-start">
            © {new Date().getFullYear()} {tc("siteName")} — {t("rights")}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 me-1 hidden sm:inline">{t("paymentMethods")}:</span>
            {["Visa", "Mastercard", "COD"].map((method) => (
              <span key={method} className="flex items-center gap-1 bg-slate-800 rounded-md px-2 py-1 text-[10px] font-semibold text-slate-300">
                <CreditCard className="w-3 h-3" /> {method}
              </span>
            ))}
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-orange-500 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
