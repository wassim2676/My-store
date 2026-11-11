"use client";

import { useState } from "react";
import { Copy, Check, Ticket } from "lucide-react";
import { publicT } from "@/lib/landing";

export default function CouponCopy({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* المتصفح منع الوصول للحافظة — الكود ظاهر للنسخ اليدوي */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-[color-mix(in_srgb,var(--lp-accent)_60%,transparent)] bg-[color-mix(in_srgb,var(--lp-accent)_8%,transparent)] px-4 py-3 cursor-pointer"
    >
      <span className="flex items-center gap-2 text-sm text-[var(--lp-muted)]">
        <Ticket className="h-4 w-4 text-[var(--lp-accent)]" />
        {publicT(lang, "coupon")}
        <code className="font-mono text-base font-bold tracking-widest text-[var(--lp-text)]">{code}</code>
      </span>
      <span className="flex items-center gap-1 text-xs font-semibold text-[var(--lp-accent)]">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {publicT(lang, copied ? "copied" : "copy")}
      </span>
    </button>
  );
}
