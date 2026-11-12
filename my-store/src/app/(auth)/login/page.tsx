"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BarChart3, Check, Eye, EyeOff, Gem, Loader2, Lock, Mail, MousePointerClick, Sparkles } from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

const inputCls =
  "block w-full ps-10 pe-3 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition-all disabled:opacity-50";

// يحدد وجهة التوجيه الافتراضية بعد الدخول حسب دور المستخدم
function getDefaultRedirect(role?: string) {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "/admin/dashboard";
  return "/dashboard";
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090D]" />}>
      <LoginForm />
    </Suspense>
  );
}

// ==================== 🔐 تسجيل الدخول (نفس هوية صفحة التسجيل الداكنة) ====================
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const t = useTranslations("platform.login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const justRegistered = searchParams.get("registered") === "true";

  useEffect(() => {
    if (status === "authenticated") {
      const callbackUrl = searchParams.get("callbackUrl") || getDefaultRedirect(session?.user?.role);
      router.replace(callbackUrl);
    }
  }, [status, router, searchParams, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email: email.trim(), password: password.trim(), redirect: false });
      if (result?.error) {
        setError(t("invalid"));
      } else if (result?.ok) {
        const updated = await update();
        const role = (updated as { user?: { role?: string } } | null)?.user?.role;
        router.push(searchParams.get("callbackUrl") || getDefaultRedirect(role));
        router.refresh();
      } else {
        setError(t("unknown"));
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(t("unknown"));
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    { icon: Gem, text: t("side1") },
    { icon: MousePointerClick, text: t("side2") },
    { icon: BarChart3, text: t("side3") },
  ];

  return (
    <div className="relative grid min-h-screen overflow-hidden bg-[#07090D] text-white lg:grid-cols-2">
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[520px] w-[820px] max-w-full -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="absolute end-4 top-4 z-10">
        <LanguageSwitcher variant="dark" />
      </div>

      {/* النموذج */}
      <div className="relative flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-start">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 shadow-lg shadow-amber-500/20">
                <Sparkles className="h-5 w-5 text-black" />
              </span>
            </Link>
            <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h1>
            <p className="mt-2 text-white/60">{t("subtitle")}</p>
          </div>

          {status === "loading" || status === "authenticated" ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-amber-300" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur sm:p-8">
              {justRegistered && !error && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  <Check className="h-4 w-4 shrink-0" />
                  {t("registered")}
                </div>
              )}
              {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

              <div className="relative">
                <Mail className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className={inputCls}
                  placeholder={t("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className={inputCls + " pe-10"}
                  placeholder={t("password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 cursor-pointer"
                  aria-label="toggle password"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-white/60">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 cursor-pointer accent-amber-500" />
                  {t("remember")}
                </label>
                <Link href="/contact" className="font-medium text-amber-300 hover:text-amber-200">
                  {t("forgot")}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 py-3.5 font-semibold text-black shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("loading")}
                  </span>
                ) : (
                  t("submit")
                )}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-white/55 lg:text-start">
            {t("noAccount")}{" "}
            <Link href="/register" className="font-semibold text-amber-300 hover:text-amber-200">
              {t("create")}
            </Link>
          </p>
        </div>
      </div>

      {/* لوحة جانبية (شاشات كبيرة) */}
      <aside className="relative hidden overflow-hidden border-s border-white/[0.06] bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,rgba(200,162,74,0.16),transparent_70%)] lg:flex lg:items-center lg:justify-center">
        <div className="max-w-md px-12">
          <p className="font-serif text-4xl font-semibold leading-tight">{t("sideTitle")}</p>
          <ul className="mt-10 space-y-5">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4 text-white/75">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/[0.07] text-amber-300">
                  <Icon className="h-5 w-5" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          {/* بطاقة معاينة صغيرة */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121621] shadow-2xl">
            <div className="m-2 mb-0 aspect-[16/9] rounded-xl bg-gradient-to-br from-white to-neutral-200" />
            <div className="flex items-center justify-between px-4 py-3">
              <span className="h-2.5 w-28 rounded-full bg-white/15" />
              <span className="text-xs font-semibold text-[#C8A24A]">$249</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
