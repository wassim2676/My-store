import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { EyeOff, PenLine, Sparkles } from "lucide-react";
import { pageDir, parseDesign, themeStyle } from "@/lib/landing";
import LandingFonts from "./LandingFonts";
import LandingFooter from "./LandingFooter";
import { getDirection } from "@/i18n/config";
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
  const design = parseDesign(page.design);
  // شريط المالك بلغة واجهة المنصة (لغة المسوّق)، لا بلغة الصفحة
  const [t, uiLocale] = isOwner ? await Promise.all([getTranslations("platform.owner"), getLocale()]) : [null, "en"];
  return (
    <div
      data-lp
      lang={lang}
      dir={pageDir(lang)}
      style={themeStyle(page.theme, page.accentColor, design)}
      className="min-h-screen antialiased"
    >
      <LandingFonts fonts={[design.font, design.bodyFont]} />
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

      <LandingFooter lang={lang} title={page.title} showDisclosure={page.showDisclosure} disclosure={page.disclosure} />
    </div>
  );
}
