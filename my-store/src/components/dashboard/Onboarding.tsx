"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";
import SlugField, { type SlugStatus } from "./SlugField";
import { toSlug } from "@/lib/landing";

// ==================== 👋 اختيار اسم صفحة الهبوط (للحسابات التي لا تملك صفحة بعد) ====================
export default function Onboarding({ firstName }: { firstName: string | null }) {
  const t = useTranslations("dash");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState<SlugStatus>("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "available") return setError(t("slug.chooseValid"));
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/marketer/landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || t("common.error"));
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-white flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600">
          <Sparkles className="h-5 w-5 text-black" />
        </span>
        <div>
          <h1 className="font-serif text-3xl font-semibold">{t("onboarding.title", { name: firstName || "" })}</h1>
          <p className="mt-2 text-white/60">{t("onboarding.subtitle")}</p>
        </div>
        {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        <label className="block space-y-1.5">
          <span className="text-sm text-white/70">{t("onboarding.pageTitle")}</span>
          <input
            required
            value={title}
            maxLength={80}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(toSlug(e.target.value));
            }}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </label>
        <div className="space-y-1.5">
          <span className="text-sm text-white/70">{t("onboarding.pageLink")}</span>
          <SlugField
            value={slug}
            onChange={(v) => {
              setSlugTouched(true);
              setSlug(v);
            }}
            onStatus={setStatus}
          />
        </div>
        <button disabled={loading} className="w-full rounded-xl bg-amber-400 py-3 font-semibold text-black hover:bg-amber-300 disabled:opacity-50 cursor-pointer">
          {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : t("onboarding.submit")}
        </button>
      </form>
    </div>
  );
}
