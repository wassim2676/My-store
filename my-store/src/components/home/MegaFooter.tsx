"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Mail,
  MapPin,
  Phone,
  ArrowUp,
  ArrowRight,
  Check,
} from "lucide-react";

// ==================== 📱 أيقونات العلامات التجارية — SVG مضمّنة دقيقة
// (lucide-react لا يحتوي شعارات العلامات التجارية عمداً؛ هذه مسارات رسمية موثوقة) ====================
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.53 17.52 2.04 12 2.04S2 6.53 2 12.06c0 5 3.66 9.15 8.44 9.9v-7h-2.54v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.9h-2.34v7c4.78-.75 8.44-4.9 8.44-9.9Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.9 2H22l-7.6 8.68L23.4 22h-7.02l-5.5-7.19L4.6 22H1.48l8.13-9.29L1 2h7.2l4.97 6.57L18.9 2Zm-1.23 18h1.73L7.4 3.9H5.54L17.67 20Z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  );
}

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

  const socialLinks = [
    { icon: FacebookIcon, href: "#", label: "Facebook" },
    { icon: InstagramIcon, href: "#", label: "Instagram" },
    { icon: TwitterIcon, href: "#", label: "Twitter" },
    { icon: YoutubeIcon, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* النشرة البريدية */}
      <div className="border-b border-slate-800">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-9 lg:py-11 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-start">
            <h3 className="text-white text-lg sm:text-xl font-bold mb-1">{t("newsletterTitle")}</h3>
            <p className="text-slate-400 text-sm">{t("newsletterDesc")}</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto max-w-md gap-2.5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletterPlaceholder")}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 outline-none transition-colors"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              {subscribed ? <Check className="w-4 h-4" /> : t("newsletterBtn")}
              {!subscribed && <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />}
            </button>
          </form>
        </div>
      </div>

      {/* الأعمدة الرئيسية */}
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10 lg:gap-x-8">
          {/* الشعار والتواصل */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black">M</span>
              </div>
              <span className="text-white font-bold text-lg">{tc("siteName")}</span>
            </div>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2.5"><MapPin className="w-4 h-4 flex-shrink-0 text-slate-500" /> Casablanca, Morocco</p>
              <p className="flex items-center gap-2.5"><Phone className="w-4 h-4 flex-shrink-0 text-slate-500" /> +212 5XX-XXXXXX</p>
              <p className="flex items-center gap-2.5"><Mail className="w-4 h-4 flex-shrink-0 text-slate-500" /> support@mystore.ma</p>
            </div>
            <div className="flex items-center gap-2 mt-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-slate-800 hover:border-orange-500 hover:bg-orange-500/10 flex items-center justify-center transition-colors cursor-pointer text-slate-400 hover:text-orange-400"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* من نحن */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t("aboutTitle")}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-orange-400 transition-colors">{t("aboutUs")}</Link></li>
              <li><Link href="/careers" className="hover:text-orange-400 transition-colors">{t("careers")}</Link></li>
              <li><Link href="/blog" className="hover:text-orange-400 transition-colors">{t("blog")}</Link></li>
              <li><Link href="/contact" className="hover:text-orange-400 transition-colors">{t("contactUs")}</Link></li>
            </ul>
          </div>

          {/* المساعدة */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t("helpTitle")}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/help" className="hover:text-orange-400 transition-colors">{t("helpCenter")}</Link></li>
              <li><Link href="/shipping" className="hover:text-orange-400 transition-colors">{t("shipping")}</Link></li>
              <li><Link href="/returns" className="hover:text-orange-400 transition-colors">{t("returns")}</Link></li>
              <li><Link href="/faq" className="hover:text-orange-400 transition-colors">{t("faq")}</Link></li>
            </ul>
          </div>

          {/* قانوني */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t("legalTitle")}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/terms" className="hover:text-orange-400 transition-colors">{t("terms")}</Link></li>
              <li><Link href="/privacy" className="hover:text-orange-400 transition-colors">{t("privacy")}</Link></li>
            </ul>
          </div>

          {/* البيع معنا */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t("sellTitle")}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/register" className="text-orange-400 hover:text-orange-300 transition-colors font-semibold">{t("becomeSeller")}</Link></li>
              <li><Link href="/vendor/dashboard" className="hover:text-orange-400 transition-colors">{t("sellerCenter")}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* الشريط السفلي */}
      <div className="border-t border-slate-800">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-start">
            © {new Date().getFullYear()} {tc("siteName")} — {t("rights")}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 me-1 hidden sm:inline">{t("paymentMethods")}:</span>
            {["Visa", "Mastercard", "COD"].map((method) => (
              <span key={method} className="bg-slate-800/60 border border-slate-800 rounded-md px-2.5 py-1 text-[10px] font-semibold text-slate-400 tracking-wide">
                {method}
              </span>
            ))}
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-9 h-9 rounded-lg border border-slate-800 hover:border-orange-500 hover:bg-orange-500/10 flex items-center justify-center transition-colors cursor-pointer text-slate-400 hover:text-orange-400"
            aria-label="scroll to top"
          >
            <ArrowUp className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </footer>
  );
}
