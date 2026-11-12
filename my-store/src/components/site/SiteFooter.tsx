import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Sparkles } from "lucide-react";
import { SITE_NAME } from "@/lib/site";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

// ==================== 🦶 تذييل المنصة: أعمدة روابط + دعوة للتسجيل ====================
export default async function SiteFooter() {
  const t = await getTranslations("platform");
  const f = (k: string) => t(`footer.${k}`);

  const columns = [
    {
      title: f("product"),
      links: [
        { href: "/#features", label: f("features") },
        { href: "/#how", label: f("how") },
        { href: "/stores", label: f("stores") },
        { href: "/register", label: f("getStarted") },
      ],
    },
    {
      title: f("resources"),
      links: [
        { href: "/blog", label: f("blog") },
        { href: "/guide", label: f("guide") },
        { href: "/help", label: f("help") },
        { href: "/faq", label: f("faq") },
      ],
    },
    {
      title: f("company"),
      links: [
        { href: "/about", label: f("about") },
        { href: "/contact", label: f("contact") },
        { href: "/login", label: f("login") },
      ],
    },
    {
      title: f("legal"),
      links: [
        { href: "/terms", label: f("terms") },
        { href: "/privacy", label: f("privacy") },
        { href: "/cookies", label: f("cookies") },
        { href: "/affiliate-disclosure", label: f("disclosure") },
        { href: "/acceptable-use", label: f("acceptableUse") },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#05070A] text-white">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[900px] max-w-[150vw] -translate-x-1/2 rounded-full bg-amber-500/[0.06] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          {/* العلامة */}
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600">
                <Sparkles className="h-4 w-4 text-black" />
              </span>
              <span className="font-serif text-lg font-semibold">{SITE_NAME}</span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-white/50">{f("tagline")}</p>
            <Link
              href="/register"
              className="group mt-7 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/[0.06] px-5 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/[0.12]"
            >
              {f("getStarted")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </div>

          {/* أعمدة الروابط */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {columns.map((c) => (
              <div key={c.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">{c.title}</p>
                <ul className="mt-4 space-y-3">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-white/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. {f("rights")}
          </p>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">{f("madeFor")}</span>
            <LanguageSwitcher variant="dark" dropUp />
          </div>
        </div>
      </div>
    </footer>
  );
}
