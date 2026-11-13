import { ExternalLink } from "lucide-react";
import BrandLogo from "@/components/shop/BrandLogo";
import { bestTextOn, isHexColor, publicT, type StoreBrand } from "@/lib/landing";

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
  const fg = bestTextOn(isHexColor(bg) ? bg : "#C8A24A");
  return (
    <a
      href={`/go/${offerId}`}
      target="_blank"
      rel="nofollow sponsored noopener"
      className={`group flex w-full items-center justify-center gap-3 rounded-[var(--lp-btn-radius)] font-bold transition hover:brightness-110 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lp-accent-ink)] ${
        size === "lg" ? "px-6 py-4 text-base" : "px-5 py-3 text-sm"
      }`}
      style={{ backgroundColor: bg, color: fg }}
    >
      <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-white px-1">
        <BrandLogo brand={store} size={20} />
      </span>
      <span>{label || publicT(lang, "buyOn", { store: store.name })}</span>
      <ExternalLink className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
    </a>
  );
}
