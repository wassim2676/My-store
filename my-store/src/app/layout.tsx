import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import Providers from "./providers";
import { getDirection } from "@/i18n/config";
import { SITE_NAME } from "@/lib/site";

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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
