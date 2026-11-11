import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { SITE_NAME } from "@/lib/site";

// ==================== 🧭 شريط التنقل للمنصة ====================
export default async function SiteNavbar() {
  const t = await getTranslations("platform");
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07090D]/80 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-600">
            <Sparkles className="h-4 w-4 text-black" />
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight">{SITE_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-white/60 md:flex">
          <Link href="/#features" className="hover:text-white">{t("nav.features")}</Link>
          <Link href="/#how" className="hover:text-white">{t("nav.how")}</Link>
          <Link href="/blog" className="hover:text-white">{t("nav.blog")}</Link>
          <Link href="/faq" className="hover:text-white">{t("nav.faq")}</Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="compact" />
          {session?.user ? (
            <Link href="/dashboard" className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300">
              {t("nav.dashboard")}
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-xl px-3 py-2 text-sm text-white/70 hover:text-white sm:block">
                {t("nav.login")}
              </Link>
              <Link href="/register" className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300">
                {t("nav.start")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
