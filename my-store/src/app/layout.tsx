import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import Providers from "./providers";
import { getDirection } from "@/i18n/config";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const PLATFORM_FONTS = [
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700;800&display=swap",
];
const PLATFORM_FONTS_AR = [
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@500;600;700&display=swap",
];

// 🔗 الرابط الأساسي الموحّد (www.primeshelf.store في الإنتاج) — نفس رابط الخريطة والـ canonical،
// حتى لا تشير الوسوم إلى primeshelf.store بدون www (يُحوَّل 308 فيعتبره Google رابطاً مكرراً)

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.hero");
  return {
    metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
    title: { default: `${SITE_NAME} — ${t("title")}`, template: `%s · ${SITE_NAME}` },
    description: t("subtitle"),
    applicationName: SITE_NAME,
    openGraph: { siteName: SITE_NAME, type: "website", locale: "en_US" },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body>
        {/* 🔤 خطوط المنصة (Google Fonts): لا نستخدم next/font لأنه يفشل في بناء Turbopack النظيف */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {(locale === "ar" ? [...PLATFORM_FONTS, ...PLATFORM_FONTS_AR] : PLATFORM_FONTS).map((href) => (
          <link key={href} rel="stylesheet" href={href} precedence="default" />
        ))}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
