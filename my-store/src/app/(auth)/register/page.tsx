"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Mail, Phone, Lock, ShieldCheck, User, Store } from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

type AccountType = "BUYER" | "SELLER";

function getPasswordStrength(password: string): { strength: number; label: "weak" | "medium" | "strong"; color: string } {
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) return { strength: 33, label: "weak", color: "bg-red-500" };
  if (strength <= 4) return { strength: 66, label: "medium", color: "bg-yellow-500" };
  return { strength: 100, label: "strong", color: "bg-green-500" };
}

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tc = useTranslations("common");

  const [accountType, setAccountType] = useState<AccountType>("BUYER");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    storeName: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(getPasswordStrength(""));

  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, password: value });
    setPasswordStrength(getPasswordStrength(value));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError(t("error.passwordMismatch"));
      return false;
    }
    if (formData.password.length < 6) {
      setError(t("error.passwordShort"));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(t("error.emailInvalid"));
      return false;
    }
    if (accountType === "SELLER" && !formData.storeName.trim()) {
      setError(t("error.storeNameRequired"));
      return false;
    }
    if (!acceptTerms) {
      setError(t("error.termsRequired"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          accountType,
          storeName: accountType === "SELLER" ? formData.storeName : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        setError(data.error || t("error.unknown"));
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(t("error.unknown"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-sky-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 end-4 z-10">
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="max-w-md w-full space-y-6">
        {/* Logo & Header */}
        <div className="text-center">
          <Link href="/" className="cursor-pointer">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg mb-4 hover:scale-105 transition-transform">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">{t("registerTitle")}</h2>
          <p className="mt-2 text-gray-600">{t("registerSubtitle")}</p>
        </div>

        {/* Account Type Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAccountType("BUYER")}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all cursor-pointer ${
              accountType === "BUYER"
                ? "border-orange-500 bg-orange-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <User className={`w-6 h-6 ${accountType === "BUYER" ? "text-orange-600" : "text-gray-400"}`} />
            <span className={`text-sm font-semibold ${accountType === "BUYER" ? "text-orange-700" : "text-gray-700"}`}>
              {t("accountTypeBuyer")}
            </span>
            <span className="text-xs text-gray-500 text-center">{t("accountTypeBuyerDesc")}</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType("SELLER")}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all cursor-pointer ${
              accountType === "SELLER"
                ? "border-orange-500 bg-orange-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <Store className={`w-6 h-6 ${accountType === "SELLER" ? "text-orange-600" : "text-gray-400"}`} />
            <span className={`text-sm font-semibold ${accountType === "SELLER" ? "text-orange-700" : "text-gray-700"}`}>
              {t("accountTypeSeller")}
            </span>
            <span className="text-xs text-gray-500 text-center">{t("accountTypeSellerDesc")}</span>
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder={t("firstNamePlaceholder")}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <input
              type="text"
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder={t("lastNamePlaceholder")}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          {/* Store Name — يظهر فقط عند اختيار "بائع" */}
          {accountType === "SELLER" && (
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <Store className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder={t("storeNamePlaceholder")}
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              required
              className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder={t("emailPlaceholder")}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Phone className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="tel"
              className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder={t("phonePlaceholder")}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full ps-10 pe-10 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder={t("passwordPlaceholder")}
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{t(`passwordStrength.${passwordStrength.label}`)}</span>
                  <span>{formData.password.length}/12+</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <ShieldCheck className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              className="block w-full ps-10 pe-10 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder={t("confirmPasswordPlaceholder")}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Seller note */}
          {accountType === "SELLER" && (
            <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
              {t("sellerNote")}
            </p>
          )}

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-600">
              {t("terms")}{" "}
              <a href="/terms" className="text-orange-600 hover:underline">{t("termsLink")}</a>{" "}
              {t("and")}{" "}
              <a href="/privacy" className="text-orange-600 hover:underline">{t("privacyLink")}</a>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                {t("loadingRegister")}
              </span>
            ) : accountType === "SELLER" ? (
              t("registerAsSellerBtn")
            ) : (
              t("registerBtn")
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t("hasAccount")}{" "}
            <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
              {t("login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
