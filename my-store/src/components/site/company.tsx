/* eslint-disable @next/next/no-img-element -- شعارات SVG صغيرة ثابتة */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NETWORKS } from "@/content/blog";

// ==================== 🏛️ عناصر مشتركة لصفحات الشركة (من نحن، الأسئلة، التواصل) ====================

/** خلفية فاخرة للأقسام الكبيرة: توهّج ذهبي + شبكة خطوط تتلاشى */
export function Glow({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute -top-56 start-1/2 h-[620px] w-[1200px] max-w-[200vw] -translate-x-1/2 rounded-full bg-amber-500/[0.10] blur-[140px] rtl:translate-x-1/2" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
    </div>
  );
}

/** عنوان قسم: سطر صغير ذهبي + عنوان كبير + وصف */
export function SectionTitle({ eyebrow, title, text, center = false }: { eyebrow?: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-amber-300/90">{eyebrow}</p>}
      <h2 className="mt-3 font-serif text-3xl font-semibold leading-[1.1] tracking-tight sm:text-[44px]">{title}</h2>
      {text && <p className="mt-4 text-lg leading-relaxed text-white/55">{text}</p>}
    </div>
  );
}

/** شريط الأرقام */
export function StatBand({ stats }: { stats: { v: string; l: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.07] lg:grid-cols-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-[#090B10] p-7 sm:p-9">
          <p className="bg-gradient-to-b from-white to-white/60 bg-clip-text font-serif text-4xl font-semibold tracking-tight text-transparent sm:text-5xl" dir="ltr">{s.v}</p>
          <p className="mt-2 text-sm leading-snug text-white/50">{s.l}</p>
        </div>
      ))}
    </div>
  );
}

/** جدار شعارات المتاجر المدعومة */
export function StoreWall() {
  return (
    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {NETWORKS.map((n) => (
        <li key={n.slug} className="group flex h-20 items-center justify-center rounded-2xl border border-white/[0.07] bg-white px-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(245,184,0,0.45)]">
          <img src={`/brands/${n.slug}.svg`} alt={n.name} loading="lazy" className="max-h-9 max-w-full object-contain" />
        </li>
      ))}
      <li className="flex h-20 items-center justify-center rounded-2xl border border-dashed border-white/15 px-4 text-center text-xs font-medium text-white/45">+ more</li>
    </ul>
  );
}

/** دعوة ختامية أنيقة بدون صورة */
export function CtaBand({ title, text, primary, primaryHref = "/register", secondary, secondaryHref }: { title: string; text: string; primary: string; primaryHref?: string; secondary?: string; secondaryHref?: string }) {
  return (
    <section className="px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2.25rem] border border-white/[0.08] bg-gradient-to-br from-[#11141B] via-[#0B0E14] to-[#0A0C11] px-6 py-16 text-center sm:px-12 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,black,transparent)]" />
        <div aria-hidden className="pointer-events-none absolute -top-40 start-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-amber-500/[0.16] blur-[120px] rtl:translate-x-1/2" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">{title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/60">{text}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href={primaryHref} className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-semibold text-black shadow-[0_10px_30px_-10px_rgba(245,184,0,0.6)] transition hover:bg-amber-300">
              {primary} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
            {secondary && secondaryHref && (
              <Link href={secondaryHref} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/[0.04]">
                {secondary}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
