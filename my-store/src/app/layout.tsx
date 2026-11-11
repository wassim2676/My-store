import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import Providers from "./providers";
import { getDirection } from "@/i18n/config";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL) : undefined,
  title: { default: `${SITE_NAME} — Affiliate landing pages`, template: `%s · ${SITE_NAME}` },
  description: "صفحات هبوط فخمة للمسوّقين بالعمولة — اعرض عروضك من Amazon وWalmart وTarget في رابط واحد.",
};

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
