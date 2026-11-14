import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import Providers from "./providers";
import { getDirection } from "@/i18n/config";
import { SITE_NAME } from "@/lib/site";

const PLATFORM_FONTS = [
  "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap",
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
];
const PLATFORM_FONTS_AR = [
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@500;600;700&display=swap",
];

// الرابط الأساسي للموقع: متغير صريح، ثم نطاق Vercel الإنتاجي، ثم NEXTAUTH_URL (للتطوير المحلي)
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.NEXTAUTH_URL);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.hero");
  return {
    metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
    title: { default: `${SITE_NAME} — ${t("title")}`, template: `%s · ${SITE_NAME}` },
    description: t("subtitle"),
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
