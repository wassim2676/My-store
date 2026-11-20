import Link from "next/link";
import type { Metadata } from "next";
import { after } from "next/server";
import { getTranslations } from "next-intl/server";
import { CircleAlert, CircleCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AuthFrame, { authButtonCls } from "@/components/auth/AuthFrame";
import { readToken, requestEmailLocale, sendWelcome } from "@/lib/email/account";

export const metadata: Metadata = { title: "Verify email", robots: { index: false, follow: false } };

// ==================== ✅ تفعيل الحساب من رابط الإيميل ====================
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const t = await getTranslations("platform.auth.verify");

  let ok = false;
  const userId = await readToken("verify", token, true);
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, emailVerified: true, landingPage: { select: { slug: true } } },
    });
    if (user) {
      ok = true;
      if (!user.emailVerified) {
        await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
        // رسالة الترحيب تُرسل مرة واحدة: عند أول تفعيل للحساب
        const locale = await requestEmailLocale();
        after(() => sendWelcome(user, locale, user.landingPage?.slug).catch((err) => console.error("[WELCOME_EMAIL]", err)));
      }
    }
  }

  return (
    <AuthFrame>
      <div className="text-center">
        <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${ok ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-amber-400/30 bg-amber-400/10 text-amber-300"}`}>
          {ok ? <CircleCheck className="h-7 w-7" /> : <CircleAlert className="h-7 w-7" />}
        </span>
        <h1 className="mt-5 font-serif text-2xl font-semibold">{ok ? t("okTitle") : t("badTitle")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{ok ? t("okBody") : t("badBody")}</p>
        <Link href="/dashboard" className={`${authButtonCls} mt-7`}>
          {ok ? t("okCta") : t("badCta")}
        </Link>
      </div>
    </AuthFrame>
  );
}
