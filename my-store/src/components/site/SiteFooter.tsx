import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { SITE_NAME } from "@/lib/site";

export default async function SiteFooter() {
  const t = await getTranslations("platform");
  const links = [
    { href: "/about", label: t("footer.about") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/help", label: t("footer.help") },
    { href: "/contact", label: t("footer.contact") },
    { href: "/terms", label: t("footer.terms") },
    { href: "/privacy", label: t("footer.privacy") },
  ];
  return (
    <footer className="border-t border-white/[0.06] bg-[#05070A] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-600">
              <Sparkles className="h-4 w-4 text-black" />
            </span>
            <span className="font-serif text-lg font-semibold">{SITE_NAME}</span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-white/50">{t("footer.tagline")}</p>
        </div>
        <nav className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm text-white/55 sm:grid-cols-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">{l.label}</Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/[0.06] py-5 text-center text-xs text-white/35">
        © {new Date().getFullYear()} {SITE_NAME}. {t("footer.rights")}
      </div>
    </footer>
  );
}
