"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, BookOpen, ChevronDown, CircleHelp, LifeBuoy, Menu, Newspaper, X } from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import Logo from "@/components/shared/Logo";

export type NavLabels = Record<
  | "features" | "how" | "stores" | "resources" | "blog" | "guide" | "help" | "faq"
  | "blogDesc" | "guideDesc" | "helpDesc" | "faqDesc" | "dashboard" | "login" | "start" | "menu" | "language",
  string
>;

// تتبّع التمرير بدون setState داخل effect
function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}
const useScrolled = () => useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);

// ==================== 🧭 شريط التنقل: شريط كامل العرض (الشعار والروابط يساراً، الدخول والتسجيل يميناً) ====================
// overlay: فوق فيديو الصفحة الرئيسية — شفاف في الأعلى ويصبح داكناً مع التمرير
export default function NavbarClient({ siteName, loggedIn, labels: l, overlay = false }: { siteName: string; loggedIn: boolean; labels: NavLabels; overlay?: boolean }) {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  // منع تمرير الصفحة خلف قائمة الجوال
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const main = [
    { href: "/#features", label: l.features },
    { href: "/#how", label: l.how },
    { href: "/stores", label: l.stores },
  ];
  const resources = [
    { href: "/blog", label: l.blog, desc: l.blogDesc, icon: Newspaper },
    { href: "/guide", label: l.guide, desc: l.guideDesc, icon: BookOpen },
    { href: "/help", label: l.help, desc: l.helpDesc, icon: LifeBuoy },
    { href: "/faq", label: l.faq, desc: l.faqDesc, icon: CircleHelp },
  ];
  const isActive = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(href + "/"));
  const resActive = resources.some((r) => isActive(r.href));
  const transparent = overlay && !scrolled && !open;

  const linkCls = (active: boolean) =>
    `inline-flex h-16 items-center gap-1 px-3 text-[14px] font-medium transition-colors ${active ? "text-amber-300" : "text-white/85 hover:text-amber-300"}`;

  return (
    <header
      className={`${overlay ? "fixed" : "sticky"} inset-x-0 top-0 z-50 w-full text-white transition-[background-color,border-color,backdrop-filter] duration-300 ${
        transparent
          ? "border-b border-transparent bg-gradient-to-b from-black/55 to-transparent"
          : "border-b border-white/[0.07] bg-[#0B0E11]/95 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-2 px-4 sm:px-6 lg:px-8">
        {/* الشعار */}
        <Link href="/" className="me-4 flex shrink-0 items-center" aria-label={siteName} onClick={() => setOpen(false)}>
          <Logo className="h-8" priority />
        </Link>

        {/* روابط سطح المكتب: بجانب الشعار */}
        <nav className="hidden items-center lg:flex">
          {main.map((m) => (
            <Link key={m.href} href={m.href} className={linkCls(isActive(m.href))}>
              {m.label}
            </Link>
          ))}

          {/* الموارد: قائمة منسدلة بالمرور والتركيز (بدون JS) */}
          <div className="group relative">
            <button type="button" className={`${linkCls(resActive)} cursor-pointer`} aria-haspopup="true">
              {l.resources}
              <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
            </button>
            <div className="invisible absolute start-0 top-full z-50 w-[520px] translate-y-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/[0.08] bg-[#1E2329] p-2 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.85)]">
                {resources.map(({ href, label, desc, icon: Icon }) => (
                  <Link key={href} href={href} className="group/item flex gap-3 rounded-lg p-3 transition-colors hover:bg-white/[0.06]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-amber-300 transition-colors group-hover/item:bg-amber-400/15">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-[14px] font-semibold text-white">{label}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-white/50">{desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* الإجراءات */}
        <div className="ms-auto flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher variant="dark" placement="navbar" />
          </div>
          {loggedIn ? (
            <Link href="/dashboard" className="hidden h-9 items-center gap-1.5 rounded-full bg-amber-400 px-4 text-[14px] font-semibold text-black transition hover:bg-amber-300 sm:inline-flex">
              {l.dashboard}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden h-9 items-center rounded-full bg-white/[0.1] px-4 text-[14px] font-medium text-white transition hover:bg-white/[0.16] sm:inline-flex">
                {l.login}
              </Link>
              <Link href="/register" className="hidden h-9 items-center rounded-full bg-amber-400 px-4 text-[14px] font-semibold text-black transition hover:bg-amber-300 sm:inline-flex">
                {l.start}
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition hover:bg-white/[0.08] lg:hidden cursor-pointer"
            aria-label={l.menu}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* قائمة الجوال: ملء الشاشة تحت الشريط */}
      {open && (
        <div className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/[0.07] bg-[#0B0E11] lg:hidden">
          <div className="space-y-6 px-4 py-5 sm:px-6">
            {!loggedIn && (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setOpen(false)} className="flex h-11 items-center justify-center rounded-full bg-white/[0.1] text-[15px] font-medium">
                  {l.login}
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="flex h-11 items-center justify-center rounded-full bg-amber-400 text-[15px] font-semibold text-black">
                  {l.start}
                </Link>
              </div>
            )}
            {loggedIn && (
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-amber-400 text-[15px] font-semibold text-black">
                {l.dashboard}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            )}
            <div className="grid">
              {main.map((m) => (
                <Link key={m.href} href={m.href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-white/[0.06] py-3.5 text-[16px] font-medium text-white/90">
                  {m.label}
                  <ArrowRight className="h-4 w-4 text-white/25 rtl:rotate-180" />
                </Link>
              ))}
            </div>
            <div>
              <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">{l.resources}</p>
              <div className="grid gap-1 sm:grid-cols-2">
                {resources.map(({ href, label, desc, icon: Icon }) => (
                  <Link key={href} href={href} onClick={() => setOpen(false)} className="flex gap-3 rounded-lg p-2.5 transition-colors hover:bg-white/[0.05]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-amber-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{label}</span>
                      <span className="block text-xs text-white/50">{desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <LanguageSwitcher variant="row" label={l.language} />
          </div>
        </div>
      )}
    </header>
  );
}
