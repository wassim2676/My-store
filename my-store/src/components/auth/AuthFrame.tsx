import Link from "next/link";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import Logo from "@/components/shared/Logo";

// ==================== 🔐 إطار صفحات الحساب الصغيرة (التفعيل، نسيت كلمة المرور، إعادة التعيين) ====================
export default function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div data-ui="dark" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07090D] px-4 py-16 text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] max-w-full -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="absolute end-4 top-4 z-10">
        <LanguageSwitcher variant="dark" />
      </div>
      <div className="relative w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 flex w-fit" aria-label="Home">
          <Logo className="h-10" priority />
        </Link>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur sm:p-8">{children}</div>
      </div>
    </div>
  );
}

export const authInputCls =
  "block w-full ps-10 pe-3 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition-all disabled:opacity-50";

export const authButtonCls =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 py-3.5 font-semibold text-black shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";
