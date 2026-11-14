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
    `relative inline-flex h-8 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors ${active ? "bg-white/[0.08] text-white" : "text-white/60 hover:bg-white/[0.05] hover:text-white"}`;

  return (
    // 🧭 شريط عائم رفيع: كبسولة زجاجية تطفو فوق المحتوى، تزداد عتمتها مع التمرير
    <header className="sticky top-0 z-50 px-3 pt-3 text-white sm:px-4">
      <div
        className={`mx-auto max-w-6xl rounded-[26px] border transition-[background-color,border-color,box-shadow] duration-300 ${
          solid
            ? "border-white/[0.09] bg-[#0A0C11]/80 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.85)] backdrop-blur-2xl backdrop-saturate-150"
            : "border-white/[0.06] bg-white/[0.03] backdrop-blur-xl"
        }`}
      >
        <div className="flex h-[52px] items-center gap-3 ps-3 pe-1.5">
          {/* الشعار */}
          <Link href="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
            <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-[0_0_20px_-6px_rgba(245,180,60,0.75)]">
              <Sparkles className="h-3.5 w-3.5 text-black" />
            </span>
            <span className="font-serif text-[16px] font-semibold tracking-tight">{siteName}</span>
          </Link>

          {/* روابط سطح المكتب — في الوسط، ممتدة بلا إطار داخلي سميك */}
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {main.map((m) => (
              <Link key={m.href} href={m.href} className={linkCls(isActive(m.href))}>
                {m.label}
              </Link>
            ))}

            {/* قائمة الموارد المنسدلة (تعمل بالمرور والتركيز بدون JS) */}
            <div className="group relative">
              <button type="button" className={`${linkCls(resActive)} gap-1 cursor-pointer`} aria-haspopup="true">
                {l.resources}
                <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
              </button>
              <div className="invisible absolute left-1/2 top-full z-50 w-[540px] -translate-x-1/2 translate-y-1 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/[0.08] bg-[#0C0F15]/95 p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
                  {resources.map(({ href, label, desc, icon: Icon }) => (
                    <Link key={href} href={href} className="group/item flex gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.05]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-amber-300 transition-colors group-hover/item:border-amber-400/30 group-hover/item:bg-amber-400/10">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-[13.5px] font-semibold text-white">{label}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-white/50">{desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* الإجراءات */}
          <div className="ms-auto flex shrink-0 items-center gap-1 lg:ms-0">
            <div className="hidden sm:block">
              <LanguageSwitcher variant="dark" />
            </div>
            {loggedIn ? (
              <Link href="/dashboard" className="group/cta hidden h-[38px] items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-black transition hover:bg-amber-100 sm:inline-flex">
                {l.dashboard}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5 rtl:rotate-180 rtl:group-hover/cta:-translate-x-0.5" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden h-8 items-center rounded-full px-3 text-[13px] font-medium text-white/70 transition hover:text-white sm:inline-flex">
                  {l.login}
                </Link>
                <Link href="/register" className="group/cta hidden h-[38px] items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-black transition hover:bg-amber-100 sm:inline-flex">
                  {l.start}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5 rtl:rotate-180 rtl:group-hover/cta:-translate-x-0.5" />
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-full text-white/80 transition hover:bg-white/[0.07] lg:hidden cursor-pointer"
              aria-label={l.menu}
              aria-expanded={open}
            >
              {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>

        {/* قائمة الجوال: تمتد داخل نفس الكبسولة */}
        {open && (
          <div className="max-h-[calc(100dvh-5.5rem)] overflow-y-auto border-t border-white/[0.06] lg:hidden">
            <div className="space-y-5 p-3">
              <div className="grid gap-0.5">
                {main.map((m) => (
                  <Link key={m.href} href={m.href} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium text-white/85 transition-colors hover:bg-white/[0.05]">
                    {m.label}
                    <ArrowRight className="h-4 w-4 text-white/25 rtl:rotate-180" />
                  </Link>
                ))}
              </div>
              <div>
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">{l.resources}</p>
                <div className="grid gap-0.5 sm:grid-cols-2">
                  {resources.map(({ href, label, desc, icon: Icon }) => (
                    <Link key={href} href={href} onClick={() => setOpen(false)} className="flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.05]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-amber-300">
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
              <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
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
      </div>
    </header>
  );
}
