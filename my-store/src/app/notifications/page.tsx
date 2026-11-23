import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { getMarketerSession } from "@/lib/marketer";
import Logo from "@/components/shared/Logo";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import NotificationsList from "@/components/notifications/NotificationsList";

export const metadata: Metadata = { title: "Notifications", robots: { index: false, follow: false } };

// ==================== 🔔 كل الإشعارات (صفحة مستقلة — ليست ضمن قائمة لوحة التحكم) ====================
export default async function NotificationsPage() {
  const ctx = await getMarketerSession();
  if (!ctx) redirect("/login?callbackUrl=/notifications");
  const t = await getTranslations("dash.notifications");

  return (
    <div data-ui="dark" className="min-h-screen bg-[#07090D] text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#07090D]/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-white/60 hover:bg-white/5 hover:text-white">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              <span className="hidden sm:inline">{t("back")}</span>
            </Link>
            <Link href="/dashboard" aria-label="Dashboard">
              <Logo className="h-8" />
            </Link>
          </div>
          <LanguageSwitcher variant="dark" placement="topbar" />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <NotificationsList />
      </main>
    </div>
  );
}
