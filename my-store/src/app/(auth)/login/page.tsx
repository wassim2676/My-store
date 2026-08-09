"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

// يحدد وجهة التوجيه الافتراضية بعد الدخول حسب دور المستخدم
function getDefaultRedirect(role?: string) {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "/admin/dashboard";
  if (role === "SELLER") return "/vendor/dashboard";
  return "/account/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const t = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const result = await signIn("credentials", {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (result?.error) {
        setError(t("error.invalidCredentials"));
      } else if (result?.ok) {
        const updated = await update();
        const role = (updated as { user?: { role?: string } } | null)?.user?.role;
        const callbackUrl = searchParams.get("callbackUrl") || getDefaultRedirect(role);
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(t("error.unknown"));
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(t("error.unknown"));
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-sky-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-sky-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 end-4 z-10">
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg mb-4 hover:scale-105 transition-transform">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">{t("loginTitle")}</h2>
          <p className="mt-2 text-gray-600">{t("loginSubtitle")}</p>
        </div>

        <form className="mt-8 space-y-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              autoComplete="email"
              required
              disabled={loading}
              className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={loading}
                className="block w-full ps-10 pe-10 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer disabled:opacity-50"
              />
              <span className="ms-2 text-sm text-gray-700">{t("rememberMe")}</span>
            </label>
            <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors">
              {t("forgotPassword")}
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                {t("loadingLogin")}
              </span>
            ) : (
              t("loginBtn")
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t("noAccount")}{" "}
            <Link href="/register" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
              {t("createOne")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
