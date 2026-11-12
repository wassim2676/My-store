"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, BookOpen, ChevronDown, CircleHelp, LifeBuoy, Menu, Newspaper, Sparkles, X } from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

export type NavLabels = Record<
  | "features" | "how" | "stores" | "resources" | "blog" | "guide" | "help" | "faq"
  | "blogDesc" | "guideDesc" | "helpDesc" | "faqDesc" | "dashboard" | "login" | "start" | "menu",
  string
>;

// تتبّع التمرير بدون setState داخل effect
function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}
const useScrolled = () =>
  useSyncExternalStore(subscribeScroll, () => window.scrollY > 8, () => false);

export default function NavbarClient({ siteName, loggedIn, labels: l }: { siteName: string; loggedIn: boolean; labels: NavLabels }) {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

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
  const solid = scrolled || open;

  const linkCls = (active: boolean) =>
    `rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors ${active ? "bg-white/[0.07] text-white" : "text-white/60 hover:text-white"}`;

  return (
    <header
      className={`sticky top-0 z-50 text-white transition-[background-color,border-color,box-shadow] duration-300 ${
        solid
          ? "border-b border-white/[0.07] bg-[#07090D]/80 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* الشعار */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-[0_0_24px_-6px_rgba(245,180,60,0.7)]">
            <Sparkles className="h-4 w-4 text-black" />
          </span>
          <span className="font-serif text-[17px] font-semibold tracking-tight">{siteName}</span>
        </Link>

        {/* روابط سطح المكتب */}
        <nav className="hidden items-center gap-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] p-1 lg:flex">
          {main.map((m) => (
            <Link key={m.href} href={m.href} className={linkCls(isActive(m.href))}>
              {m.label}
            </Link>
          ))}

          {/* قائمة الموارد المنسدلة (تعمل بالمرور والتركيز بدون JS) */}
          <div className="group relative">
            <button type="button" className={`${linkCls(resActive)} inline-flex items-center gap-1 cursor-pointer`} aria-haspopup="true">
              {l.resources}
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 w-[520px] -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-[#0D1118]/95 p-2 shadow-2xl backdrop-blur-xl">
                {resources.map(({ href, label, desc, icon: Icon }) => (
                  <Link key={href} href={href} className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.05]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/[0.07] text-amber-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{label}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-white/50">{desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* الإجراءات */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:block">
            <LanguageSwitcher variant="dark" />
          </div>
          {loggedIn ? (
            <Link href="/dashboard" className="hidden items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13.5px] font-semibold text-black transition hover:bg-amber-100 sm:inline-flex">
              {l.dashboard}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-full px-3.5 py-2 text-[13.5px] font-medium text-white/70 transition hover:text-white sm:block">
                {l.login}
              </Link>
              <Link href="/register" className="group/cta hidden items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13.5px] font-semibold text-black transition hover:bg-amber-100 sm:inline-flex">
                {l.start}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5 rtl:rotate-180 rtl:group-hover/cta:-translate-x-0.5" />
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:bg-white/[0.06] lg:hidden cursor-pointer"
            aria-label={l.menu}
            aria-expanded={open}
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* قائمة الجوال */}
      {open && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/[0.06] lg:hidden">
          <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
            <div className="grid gap-1">
              {main.map((m) => (
                <Link key={m.href} href={m.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-base font-medium text-white/85 hover:bg-white/[0.05]">
                  {m.label}
                </Link>
              ))}
            </div>
            <div>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">{l.resources}</p>
              <div className="grid gap-1 sm:grid-cols-2">
                {resources.map(({ href, label, desc, icon: Icon }) => (
                  <Link key={href} href={href} onClick={() => setOpen(false)} className="flex gap-3 rounded-xl p-3 hover:bg-white/[0.05]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/[0.07] text-amber-300">
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
            <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
              <LanguageSwitcher variant="dark" />
              <div className="flex gap-2">
                {loggedIn ? (
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
                    {l.dashboard}
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setOpen(false)} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium">
                      {l.login}
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
                      {l.start}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
