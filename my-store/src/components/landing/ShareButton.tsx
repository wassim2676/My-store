"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { publicT } from "@/lib/landing";

export default function ShareButton({ title, lang, variant = "pill" }: { title: string; lang: string; variant?: "pill" | "icon" }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* أُلغيت المشاركة */
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={share}
        title={publicT(lang, copied ? "copied" : "share")}
        aria-label={publicT(lang, "share")}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--lp-nav-border)] text-[var(--lp-nav-muted)] transition hover:border-[var(--lp-nav-btn)] hover:bg-[color-mix(in_srgb,var(--lp-nav-text)_7%,transparent)] hover:text-[var(--lp-nav-text)] cursor-pointer"
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--lp-border)] px-3.5 py-1.5 text-xs font-medium text-[var(--lp-muted)] hover:text-[var(--lp-text)] transition cursor-pointer"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
      {publicT(lang, copied ? "copied" : "share")}
    </button>
  );
}
