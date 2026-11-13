"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Loader2 } from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import SlugField, { type SlugStatus } from "@/components/dashboard/SlugField";
import { toSlug } from "@/lib/landing";

const inputCls =
  "block w-full ps-10 pe-3 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition-all";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

// ==================== 🧑‍💼 تسجيل مسوّق: الحساب + اسم ورابط صفحة الهبوط ====================
function RegisterForm() {
  const searchParams = useSearchParams();
  const t = useTranslations("register");

  const initialSlug = toSlug(searchParams.get("slug") || "");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", pageTitle: "", slug: initialSlug });
  const [slugTouched, setSlugTouched] = useState(!!initialSlug);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onTitle = (value: string) => {
    setForm((f) => ({ ...f, pageTitle: value, slug: slugTouched ? f.slug : toSlug(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError(t("errors.passwordShort"));
    if (slugStatus !== "available") return setError(t("errors.slugInvalid"));
    if (!acceptTerms) return setError(t("errors.terms"));

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("errors.unknown"));
        return;
      }
      const login = await signIn("credentials", { email: form.email.trim(), password: form.password, redirect: false });
      // تحميل كامل واحد: الجلسة الجديدة تصل لكل المكوّنات دون سباق تنقّلات
      window.location.assign(login?.ok ? "/dashboard?welcome=1" : "/login?registered=true");
      return;
    } catch {
      setError(t("errors.unknown"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-white relative overflow-hidden flex items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute -top-40 start-1/2 -translate-x-1/2 h-[520px] w-[820px] max-w-full rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="absolute top-4 end-4 z-10">
        <LanguageSwitcher variant="dark" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-black" />
            </span>
          </Link>
          <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-white/60">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur">
          {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

          {/* صفحة الهبوط */}
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">{t("pageSection")}</p>
            <div className="relative">
              <Sparkles className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35" />
              <input required className={inputCls} placeholder={t("pageTitlePlaceholder")} value={form.pageTitle} onChange={(e) => onTitle(e.target.value)} maxLength={80} />
            </div>
            <SlugField
              value={form.slug}
              onChange={(v) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: v }));
              }}
              onStatus={setSlugStatus}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35" />
              <input required className={inputCls} placeholder={t("firstName")} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <input className={inputCls.replace("ps-10", "ps-4")} placeholder={t("lastName")} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>

          <div className="relative">
            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35" />
            <input type="email" required autoComplete="email" className={inputCls} placeholder={t("email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35" />
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              className={inputCls + " pe-10"}
              placeholder={t("password")}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 cursor-pointer" aria-label="toggle password">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <label className="flex items-start gap-2 cursor-pointer text-sm text-white/60">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 h-4 w-4 accent-amber-500 cursor-pointer" />
            <span>
              {t("terms")}{" "}
              <Link href="/terms" className="text-amber-300 hover:underline">{t("termsLink")}</Link>{" "}
              {t("and")}{" "}
              <Link href="/privacy" className="text-amber-300 hover:underline">{t("privacyLink")}</Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 py-3.5 font-semibold text-black shadow-lg shadow-amber-500/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t("loading")}</span>
            ) : (
              t("submit")
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/55">
          {t("hasAccount")}{" "}
          <Link href="/login" className="font-semibold text-amber-300 hover:text-amber-200">{t("login")}</Link>
        </p>
      </div>
    </div>
  );
}
