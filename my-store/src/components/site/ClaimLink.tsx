"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useSiteHost } from "@/components/shared/useSiteHost";

/** حقل "احجز رابطك" في الصفحة الرئيسية (شريط نحيف وممتد) → صفحة التسجيل مع الاسم المختار */
export default function ClaimLink({ cta, placeholder }: { cta: string; placeholder: string }) {
  const router = useRouter();
  const host = useSiteHost();
  const [slug, setSlug] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/register${slug ? `?slug=${encodeURIComponent(slug)}` : ""}`);
      }}
      className="group mx-auto flex h-[52px] w-full max-w-2xl items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] p-1 ps-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_50px_-25px_rgba(245,180,60,0.45)] backdrop-blur transition focus-within:border-amber-300/50 focus-within:bg-white/[0.06]"
    >
      <label className="flex h-full min-w-0 flex-1 cursor-text items-center text-[15px]" dir="ltr">
        <span className="hidden whitespace-nowrap text-white/40 sm:inline">{host}/</span>
        <span className="text-white/40 sm:hidden">/</span>
        <input
          dir="ltr"
          value={slug}
          maxLength={40}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
        />
      </label>
      <button className="inline-flex h-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 px-5 text-sm font-semibold text-black transition hover:brightness-110 cursor-pointer">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-focus-within:translate-x-0.5 rtl:rotate-180" />
      </button>
    </form>
  );
}
