"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSiteOrigin } from "@/components/shared/useSiteHost";

/** زر نسخ الرابط الكامل لصفحة الهبوط أو العرض */
export default function CopyLink({ path, compact = false }: { path: string; compact?: boolean }) {
  const t = useTranslations("dash");
  const origin = useSiteOrigin();
  const [copied, setCopied] = useState(false);
  const url = `${origin}${path}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* تجاهل */
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={copy}
        title={url}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/5 cursor-pointer"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? t("common.copied") : t("common.copy")}
      </button>
    );
  }

  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]" dir="ltr">
      <span className="flex-1 truncate px-4 py-2.5 text-sm text-white/70">{url}</span>
      <button type="button" onClick={copy} className="flex items-center gap-1.5 border-s border-white/10 px-4 text-sm font-medium hover:bg-white/5 cursor-pointer">
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        {copied ? t("common.copied") : t("common.copy")}
      </button>
    </div>
  );
}
