import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { SITE_NAME } from "@/lib/site";
import NavbarClient, { type NavLabels } from "./NavbarClient";

// ==================== 🧭 شريط التنقل للمنصة (يجلب الجلسة والنصوص ثم يرسم الواجهة التفاعلية) ====================
export default async function SiteNavbar() {
  const t = await getTranslations("platform.nav");
  const session = await auth();

  const keys = [
    "features", "how", "stores", "resources", "blog", "guide", "help", "faq",
    "blogDesc", "guideDesc", "helpDesc", "faqDesc", "dashboard", "login", "start", "menu",
  ] as const;
  const labels = Object.fromEntries(keys.map((k) => [k, t(k)])) as NavLabels;

  return <NavbarClient siteName={SITE_NAME} loggedIn={!!session?.user} labels={labels} />;
}
