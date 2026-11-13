import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { EyeOff, PenLine, ShieldCheck, Sparkles } from "lucide-react";
import { pageDir, parseDesign, publicT, themeStyle } from "@/lib/landing";
import LandingFonts from "./LandingFonts";
import { getDirection } from "@/i18n/config";
import { SITE_NAME } from "@/lib/site";
import type { LandingPage } from "@prisma/client";

// ==================== 🧱 الغلاف المشترك لصفحة الهبوط وصفحة العرض ====================
export default async function LandingShell({
  page,
  isOwner,
  hiddenNotice,
  children,
}: {
  page: LandingPage;
  isOwner: boolean;
  hiddenNotice?: boolean;
  children: React.ReactNode;
}) {
  const lang = page.language;
  // شريط المالك بلغة واجهة المنصة (لغة المسوّق)، لا بلغة الصفحة
  const [t, uiLocale] = isOwner ? await Promise.all([getTranslations("platform.owner"), getLocale()]) : [null, "en"];
  return (
    <div
      data-lp
      lang={lang}
      dir={pageDir(lang)}
      style={themeStyle(page.theme, page.accentColor, parseDesign(page.design))}
      className="min-h-screen antialiased"
    >
      <LandingFonts />
      {isOwner && t && (
        <div className="relative z-50 border-b border-white/10 bg-black text-white" dir={getDirection(uiLocale)}>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs">
            <span className="flex items-center gap-2 text-white/70">
              {hiddenNotice ? <EyeOff className="h-3.5 w-3.5 text-amber-300" /> : <Sparkles className="h-3.5 w-3.5 text-amber-300" />}
              {hiddenNotice ? t("hidden") : t("preview")}
            </span>
            <Link href="/dashboard" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold hover:bg-white/20">
              <PenLine className="h-3.5 w-3.5" />
              {t("dashboard")}
            </Link>
          </div>
        </div>
      )}

      {children}

      <footer className="mt-20 border-t border-[var(--lp-border)]">
        <div className="mx-auto max-w-4xl px-4 py-10 text-center">
          {page.showDisclosure && (
            <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-5 text-start">
              <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--lp-accent-ink)]">
                <ShieldCheck className="h-4 w-4" />
                {publicT(lang, "disclosureTitle")}
              </p>
              <p className="text-[13px] leading-relaxed text-[var(--lp-muted)]">{page.disclosure || publicT(lang, "disclosureDefault")}</p>
            </div>
          )}
          <p className="text-xs text-[var(--lp-muted)]">
            © {new Date().getFullYear()} {page.title} · {publicT(lang, "poweredBy")}{" "}
            <Link href="/" className="font-semibold text-[var(--lp-text)] hover:text-[var(--lp-accent-ink)]">
              {SITE_NAME}
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
