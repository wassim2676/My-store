"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Link2, Loader2, X } from "lucide-react";
import { checkSlugFormat } from "@/lib/landing";
import { useSiteHost } from "@/components/shared/useSiteHost";

export type SlugStatus = "idle" | "checking" | "available" | "taken" | "format" | "reserved";

/** حقل اسم رابط صفحة الهبوط مع فحص التوفر الحي */
export default function SlugField({
  value,
  onChange,
  onStatus,
  currentSlug,
}: {
  value: string;
  onChange: (v: string) => void;
  onStatus?: (s: SlugStatus) => void;
  currentSlug?: string;
}) {
  const t = useTranslations("dash");
  const host = useSiteHost();
  const [status, setStatus] = useState<SlugStatus>("idle");
  const reqId = useRef(0);
  const statusCb = useRef(onStatus);
  useEffect(() => {
    statusCb.current = onStatus;
  });

  useEffect(() => {
    const apply = (s: SlugStatus) => {
      setStatus(s);
      statusCb.current?.(s);
    };
    const id = ++reqId.current;
    const problem = value ? checkSlugFormat(value) : null;
    const timer = setTimeout(async () => {
      if (!value) return apply("idle");
      if (problem) return apply(problem);
      if (currentSlug && value === currentSlug) return apply("available");
      apply("checking");
      try {
        const res = await fetch(`/api/marketer/slug-check?slug=${encodeURIComponent(value)}`);
        const data = await res.json();
        if (id === reqId.current) apply(data.available ? "available" : data.reason || "taken");
      } catch {
        if (id === reqId.current) apply("idle");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, currentSlug]);

  return (
    <div>
      <div className="flex items-stretch overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] focus-within:ring-2 focus-within:ring-amber-400/50" dir="ltr">
        <span className="flex items-center gap-1.5 whitespace-nowrap ps-3 pe-1 text-sm text-white/40">
          <Link2 className="h-4 w-4" />
          {host}/
        </span>
        <input
          dir="ltr"
          value={value}
          maxLength={40}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          placeholder="your-name"
          className="min-w-0 flex-1 bg-transparent py-2.5 pe-3 text-white placeholder-white/30 focus:outline-none"
        />
      </div>
      <div className="mt-1.5 min-h-5 text-xs">
        {status === "checking" && (
          <span className="flex items-center gap-1 text-white/50"><Loader2 className="h-3.5 w-3.5 animate-spin" />{t("slug.checking")}</span>
        )}
        {status === "available" && (
          <span className="flex items-center gap-1 text-emerald-400"><Check className="h-3.5 w-3.5" />{t("slug.available")}</span>
        )}
        {status === "taken" && <span className="flex items-center gap-1 text-rose-400"><X className="h-3.5 w-3.5" />{t("slug.taken")}</span>}
        {status === "reserved" && <span className="flex items-center gap-1 text-rose-400"><X className="h-3.5 w-3.5" />{t("slug.reserved")}</span>}
        {status === "format" && <span className="text-amber-300/90">{t("slug.format")}</span>}
      </div>
    </div>
  );
}
