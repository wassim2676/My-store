// ==================== 🔗 أدوات مشتركة لصفحات هبوط المسوّقين (آمنة للعميل والخادم) ====================
import type { CSSProperties } from "react";

export const PAGE_LANGUAGES = ["en", "ar", "fr"] as const;
export type PageLanguage = (typeof PAGE_LANGUAGES)[number];

export const PAGE_THEMES = ["midnight", "noir", "ivory"] as const;
export type PageTheme = (typeof PAGE_THEMES)[number];

export const SOCIAL_KEYS = ["instagram", "tiktok", "youtube", "x", "facebook", "pinterest", "website"] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];
export type SocialLinks = Partial<Record<SocialKey, string>>;

export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "AED", "SAR", "MAD"] as const;

export const OFFER_BADGES = ["Best Pick", "Editor's Choice", "Best Value", "Premium Pick", "Trending", "Limited Deal"] as const;

// ==================== 🎨 الثيمات الفخمة ====================
export interface ThemeTokens {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
  isDark: boolean;
}

export const THEMES: Record<PageTheme, ThemeTokens> = {
  midnight: {
    bg: "#0B0E14",
    surface: "#121621",
    surface2: "#1A1F2C",
    text: "#F3EFE6",
    muted: "#9AA1AE",
    border: "rgba(255,255,255,0.08)",
    isDark: true,
  },
  noir: {
    bg: "#050505",
    surface: "#0E0E0E",
    surface2: "#171717",
    text: "#F5F5F4",
    muted: "#A3A3A3",
    border: "rgba(255,255,255,0.09)",
    isDark: true,
  },
  ivory: {
    bg: "#F8F5EF",
    surface: "#FFFFFF",
    surface2: "#F2EDE3",
    text: "#1C1A17",
    muted: "#6F6A61",
    border: "#E8E1D3",
    isDark: false,
  },
};

export function isPageTheme(v: unknown): v is PageTheme {
  return typeof v === "string" && (PAGE_THEMES as readonly string[]).includes(v);
}

export function isPageLanguage(v: unknown): v is PageLanguage {
  return typeof v === "string" && (PAGE_LANGUAGES as readonly string[]).includes(v);
}

/** متغيرات CSS تُطبَّق على غلاف الصفحة العامة */
export function themeStyle(theme: string, accent: string): CSSProperties {
  const t = THEMES[isPageTheme(theme) ? theme : "midnight"];
  return {
    "--lp-bg": t.bg,
    "--lp-surface": t.surface,
    "--lp-surface2": t.surface2,
    "--lp-text": t.text,
    "--lp-muted": t.muted,
    "--lp-border": t.border,
    "--lp-accent": accent || "#C8A24A",
    backgroundColor: t.bg,
    color: t.text,
  } as CSSProperties;
}

// ==================== 🔤 قاموس واجهة الزوار (حسب لغة الصفحة التي اختارها المسوّق) ====================
const DICT = {
  en: {
    buyOn: "Buy on {store}",
    shopAt: "Shop at {store}",
    checkPrice: "Check price on {store}",
    viewReview: "Read review",
    pros: "What we love",
    cons: "Keep in mind",
    highlights: "Key features",
    specs: "Specifications",
    verdict: "The verdict",
    ourScore: "Our score",
    fullReview: "Full review",
    featured: "Featured",
    allOffers: "All",
    search: "Search offers…",
    noOffers: "No offers yet. Check back soon.",
    noResults: "No offers match your search.",
    coupon: "Coupon",
    copy: "Copy",
    copied: "Copied!",
    endsOn: "Deal ends {date}",
    backTo: "Back to {name}",
    moreFrom: "More picks from {name}",
    share: "Share",
    off: "OFF",
    offers: "picks",
    disclosureTitle: "Affiliate disclosure",
    disclosureDefault:
      "This page contains affiliate links. If you buy through them, I may earn a commission at no extra cost to you. Prices and availability are accurate as of the date shown and are subject to change.",
    priceNote: "Price may change — the final price is shown on {store}.",
    poweredBy: "Built with",
    video: "Watch the video",
  },
  ar: {
    buyOn: "الشراء من {store}",
    shopAt: "تسوّق من {store}",
    checkPrice: "اعرف السعر على {store}",
    viewReview: "اقرأ المراجعة",
    pros: "ما أعجبنا",
    cons: "ما يجب معرفته",
    highlights: "أبرز المميزات",
    specs: "المواصفات",
    verdict: "الخلاصة",
    ourScore: "تقييمنا",
    fullReview: "المراجعة الكاملة",
    featured: "مميّز",
    allOffers: "الكل",
    search: "ابحث في العروض…",
    noOffers: "لا توجد عروض بعد. عُد قريباً.",
    noResults: "لا توجد عروض مطابقة لبحثك.",
    coupon: "كوبون",
    copy: "نسخ",
    copied: "تم النسخ!",
    endsOn: "ينتهي العرض {date}",
    backTo: "العودة إلى {name}",
    moreFrom: "اختيارات أخرى من {name}",
    share: "مشاركة",
    off: "خصم",
    offers: "عرض",
    disclosureTitle: "إفصاح التسويق بالعمولة",
    disclosureDefault:
      "تحتوي هذه الصفحة على روابط تسويق بالعمولة. عند الشراء من خلالها قد أحصل على عمولة دون أي تكلفة إضافية عليك. الأسعار والتوفر قابلة للتغيير.",
    priceNote: "قد يتغيّر السعر — السعر النهائي يظهر على {store}.",
    poweredBy: "صُنعت بواسطة",
    video: "شاهد الفيديو",
  },
  fr: {
    buyOn: "Acheter sur {store}",
    shopAt: "Voir sur {store}",
    checkPrice: "Voir le prix sur {store}",
    viewReview: "Lire l'avis",
    pros: "Ce qu'on aime",
    cons: "À savoir",
    highlights: "Points forts",
    specs: "Caractéristiques",
    verdict: "Le verdict",
    ourScore: "Notre note",
    fullReview: "Avis complet",
    featured: "En vedette",
    allOffers: "Tout",
    search: "Rechercher une offre…",
    noOffers: "Aucune offre pour le moment.",
    noResults: "Aucune offre ne correspond à votre recherche.",
    coupon: "Code promo",
    copy: "Copier",
    copied: "Copié !",
    endsOn: "Fin de l'offre {date}",
    backTo: "Retour à {name}",
    moreFrom: "Autres sélections de {name}",
    share: "Partager",
    off: "OFF",
    offers: "sélections",
    disclosureTitle: "Divulgation d'affiliation",
    disclosureDefault:
      "Cette page contient des liens d'affiliation. Si vous achetez via ces liens, je peux percevoir une commission sans frais supplémentaires pour vous. Les prix et la disponibilité peuvent changer.",
    priceNote: "Le prix peut changer — le prix final est affiché sur {store}.",
    poweredBy: "Créé avec",
    video: "Voir la vidéo",
  },
} as const;

export type PublicDictKey = keyof (typeof DICT)["en"];

export function publicT(lang: string, key: PublicDictKey, vars?: Record<string, string>): string {
  const dict = DICT[isPageLanguage(lang) ? lang : "en"];
  let text: string = dict[key] ?? DICT.en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, v);
  return text;
}

export function pageDir(lang: string): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr";
}

/** لون نص مقروء (أسود/أبيض) فوق لون خلفية معيّن */
export function readableText(hex: string | null | undefined): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return "#FFFFFF";
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#0A0A0A" : "#FFFFFF";
}

// ==================== 💰 تنسيق السعر ====================
export function formatPrice(value: number | null | undefined, currency: string, lang = "en"): string | null {
  if (value == null || Number.isNaN(value)) return null;
  try {
    return new Intl.NumberFormat(lang === "ar" ? "ar" : lang === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function discountPercent(price: number | null, compareAt: number | null): number {
  if (!price || !compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

// ==================== 🔤 slug ====================
export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

/** مسارات محجوزة لا يمكن استخدامها كاسم صفحة هبوط (تتعارض مع مسارات الموقع) */
export const RESERVED_SLUGS = new Set([
  "admin", "api", "app", "auth", "login", "logout", "register", "signup", "signin", "dashboard",
  "account", "settings", "vendor", "blog", "about", "contact", "faq", "help", "privacy", "terms",
  "product", "products", "deals", "store", "stores", "go", "explore", "pricing", "support", "static",
  "public", "assets", "images", "img", "_next", "favicon.ico", "robots.txt", "sitemap.xml", "www",
  "mail", "new", "edit", "home", "index", "null", "undefined", "root", "system", "official",
]);

export function toSlug(input: string, maxLen = 40): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLen)
    .replace(/-$/g, "");
}

export type SlugProblem = "format" | "reserved";

export function checkSlugFormat(slug: string): SlugProblem | null {
  if (!SLUG_PATTERN.test(slug) || slug.includes("--")) return "format";
  if (RESERVED_SLUGS.has(slug)) return "reserved";
  return null;
}

// ==================== 🏬 المتجر ====================
export interface StoreBrand {
  name: string;
  logoSvg?: string | null;
  logoUrl?: string | null;
  accentColor?: string | null;
  buyLabel?: string | null;
}

/** اسم المتجر المعروض: علامة من القائمة أو اسم حر كتبه المسوّق */
export function resolveStore(brand: StoreBrand | null | undefined, storeName: string | null | undefined): StoreBrand {
  if (brand) return brand;
  return { name: storeName?.trim() || "Store", accentColor: null };
}

/** يحوّل رابط يوتيوب/فيميو إلى رابط تضمين، وإلا null */
export function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (host === "vimeo.com") return `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean)[0]}`;
  } catch {
    return null;
  }
  return null;
}

export interface OfferSpec {
  label: string;
  value: string;
}

export function parseSpecs(value: unknown): OfferSpec[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is OfferSpec => !!s && typeof s === "object" && typeof (s as OfferSpec).label === "string")
    .map((s) => ({ label: String(s.label), value: String(s.value ?? "") }));
}

export function parseSocials(value: unknown): SocialLinks {
  if (!value || typeof value !== "object") return {};
  const out: SocialLinks = {};
  for (const key of SOCIAL_KEYS) {
    const v = (value as Record<string, unknown>)[key];
    if (typeof v === "string" && v.trim()) out[key] = v.trim();
  }
  return out;
}
