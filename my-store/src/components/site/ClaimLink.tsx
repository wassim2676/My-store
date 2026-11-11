"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useSiteHost } from "@/components/shared/useSiteHost";

/** حقل "احجز رابطك" في الصفحة الرئيسية → صفحة التسجيل مع الاسم المختار */
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
      className="mx-auto flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur sm:flex-row"
    >
      <div className="flex flex-1 items-center px-3" dir="ltr">
        <span className="whitespace-nowrap text-white/40">{host}/</span>
        <input
          dir="ltr"
          value={slug}
          maxLength={40}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent py-3 text-white placeholder-white/30 focus:outline-none"
        />
      </div>
      <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 px-6 py-3 font-semibold text-black hover:brightness-110 cursor-pointer">
        {cta}
        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </button>
    </form>
  );
}
