"use client";

import { useState } from "react";
import { Share2, Check, MessageCircle, Send } from "lucide-react";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // تجاهل صامت إن رفض المتصفح صلاحية النسخ
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;

  return (
    <div className="flex items-center gap-2 mt-5">
      <span className="text-xs text-slate-400 flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5" /> شارك المنتج:
      </span>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
        aria-label="مشاركة عبر واتساب"
      >
        <MessageCircle className="w-4 h-4" />
      </a>
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-500 hover:text-sky-600 flex items-center justify-center transition-colors cursor-pointer"
        aria-label="مشاركة عبر تيليجرام"
      >
        <Send className="w-4 h-4" />
      </a>
      <button
        onClick={handleCopy}
        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        aria-label="نسخ الرابط"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
