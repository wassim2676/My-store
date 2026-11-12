import { ExternalLink } from "lucide-react";
import BrandLogo from "@/components/shop/BrandLogo";
import { publicT, readableText, type StoreBrand } from "@/lib/landing";

// ==================== 🛒 زر "الشراء من {المتجر}" — يمر عبر /go للتتبع ثم يحوّل لرابط الأفلييت ====================
export default function BuyButton({
  offerId,
  store,
  label,
  lang,
  fallbackColor,
  size = "lg",
}: {
  offerId: string;
  store: StoreBrand;
  label?: string | null;
  lang: string;
  fallbackColor: string;
  size?: "lg" | "md";
}) {
  const bg = store.accentColor || fallbackColor;
  const fg = readableText(bg);
  return (
    <a
      href={`/go/${offerId}`}
      target="_blank"
      rel="nofollow sponsored noopener"
      className={`group flex w-full items-center justify-center gap-3 rounded-[var(--lp-btn-radius)] font-bold shadow-lg transition hover:brightness-110 active:scale-[0.99] ${
        size === "lg" ? "px-6 py-4 text-base" : "px-5 py-3 text-sm"
      }`}
      style={{ backgroundColor: bg, color: fg, boxShadow: `0 18px 40px -18px ${bg}` }}
    >
      <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-white px-1">
        <BrandLogo brand={store} size={20} />
      </span>
      <span>{label || publicT(lang, "buyOn", { store: store.name })}</span>
      <ExternalLink className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
    </a>
  );
}
