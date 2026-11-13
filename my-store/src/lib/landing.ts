// ==================== 🔗 أدوات مشتركة لصفحات هبوط المسوّقين (آمنة للعميل والخادم) ====================
import { fontStack, getFont } from "./fonts";
import type { CSSProperties } from "react";

export const PAGE_LANGUAGES = ["en", "ar", "fr"] as const;
export type PageLanguage = (typeof PAGE_LANGUAGES)[number];

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

/** ثيمات جاهزة + "custom" (لون خلفية حر تُشتق منه بقية الألوان تلقائياً) */
export const PRESET_THEMES = ["midnight", "noir", "navy", "emerald", "bordeaux", "ivory", "pearl", "sand"] as const;
export const PAGE_THEMES = [...PRESET_THEMES, "custom"] as const;
export type PresetTheme = (typeof PRESET_THEMES)[number];
export type PageTheme = (typeof PAGE_THEMES)[number];

// ---- أدوات ألوان صغيرة (hex فقط) ----
const HEX = /^#[0-9a-f]{6}$/i;
export const isHexColor = (v: unknown): v is string => typeof v === "string" && HEX.test(v);
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]: [number, number, number]): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}
/** يمزج لونين: ratio = نسبة اللون الثاني */
export function mixHex(a: string, b: string, ratio: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex([x[0] + (y[0] - x[0]) * ratio, x[1] + (y[1] - x[1]) * ratio, x[2] + (y[2] - x[2]) * ratio]);
}
/** السطوع النسبي (0 داكن جداً ← 1 فاتح جداً) */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** نسبة التباين بين لونين (WCAG): 1 → 21 */
export function contrastRatio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/** أفضل لون نص (أبيض أو شبه أسود) فوق خلفية معيّنة */
export function bestTextOn(bg: string): string {
  return contrastRatio("#FFFFFF", bg) >= contrastRatio("#141414", bg) ? "#FFFFFF" : "#141414";
}

/**
 * يعدّل لوناً تدريجياً (نحو الأبيض أو الأسود) حتى يحقق تبايناً كافياً مع كل الخلفيات المعطاة.
 * مثال: لون تمييز داكن على صفحة داكنة يُفتَّح قليلاً حين يُستخدم كنص، فلا يبدو "منطفئاً".
 */
export function ensureContrast(color: string, backgrounds: string[], min = 4.5): string {
  const bgs = backgrounds.filter(isHexColor);
  if (!isHexColor(color) || bgs.length === 0) return color;
  const ok = (c: string) => bgs.every((b) => contrastRatio(c, b) >= min);
  if (ok(color)) return color.toUpperCase();
  const target = luminance(bgs[0]) < 0.5 ? "#FFFFFF" : "#000000";
  for (let i = 1; i <= 20; i++) {
    const c = mixHex(color, target, i * 0.05);
    if (ok(c)) return c;
  }
  return bestTextOn(bgs[0]);
}

/** يشتق ألوان الصفحة كاملة من لون خلفية واحد (نص مقروء + أسطح + حدود) */
export function deriveTokens(bg: string): ThemeTokens {
  const base = isHexColor(bg) ? bg.toUpperCase() : "#0B0E14";
  // نختار لون النص الأعلى تبايناً فعلياً (لا عتبة سطوع ثابتة) — مهم للألوان المتوسطة كالأخضر والأزرق
  const L = luminance(base);
  const isDark = 1.05 / (L + 0.05) >= (L + 0.05) / 0.05;
  const text = isDark ? "#FFFFFF" : "#141414";
  return {
    bg: base,
    surface: isDark ? mixHex(base, "#FFFFFF", 0.05) : mixHex(base, "#FFFFFF", 0.65),
    surface2: isDark ? mixHex(base, "#FFFFFF", 0.09) : mixHex(base, "#000000", 0.04),
    text,
    muted: mixHex(text, base, 0.28),
    border: isDark ? "rgba(255,255,255,0.09)" : mixHex(base, "#000000", 0.1),
    isDark,
  };
}

export const THEMES: Record<PresetTheme, ThemeTokens> = {
  midnight: { bg: "#0B0E14", surface: "#121621", surface2: "#1A1F2C", text: "#F3EFE6", muted: "#9AA1AE", border: "rgba(255,255,255,0.08)", isDark: true },
  noir: { bg: "#050505", surface: "#0E0E0E", surface2: "#171717", text: "#F5F5F4", muted: "#A3A3A3", border: "rgba(255,255,255,0.09)", isDark: true },
  navy: { bg: "#0A1428", surface: "#101D36", surface2: "#172745", text: "#EEF2FA", muted: "#97A3BC", border: "rgba(255,255,255,0.09)", isDark: true },
  emerald: { bg: "#071A14", surface: "#0D241C", surface2: "#143026", text: "#EEF6F1", muted: "#93AE9F", border: "rgba(255,255,255,0.09)", isDark: true },
  bordeaux: { bg: "#1A0A10", surface: "#241018", surface2: "#311622", text: "#F8EEF1", muted: "#B5949F", border: "rgba(255,255,255,0.09)", isDark: true },
  ivory: { bg: "#F8F5EF", surface: "#FFFFFF", surface2: "#F2EDE3", text: "#1C1A17", muted: "#6F6A61", border: "#E8E1D3", isDark: false },
  pearl: { bg: "#F4F5F7", surface: "#FFFFFF", surface2: "#ECEEF2", text: "#15171C", muted: "#646A76", border: "#E1E4EA", isDark: false },
  sand: { bg: "#EFE6D8", surface: "#F8F2E8", surface2: "#E6DAC7", text: "#2A2219", muted: "#7A6B58", border: "#DCCDB5", isDark: false },
};

export function isPageTheme(v: unknown): v is PageTheme {
  return typeof v === "string" && (PAGE_THEMES as readonly string[]).includes(v);
}

export function isPageLanguage(v: unknown): v is PageLanguage {
  return typeof v === "string" && (PAGE_LANGUAGES as readonly string[]).includes(v);
}

// ==================== 🧩 خيارات التصميم الإضافية (عمود design JSON) ====================
export const BG_STYLES = ["solid", "glow", "gradient", "grid", "dots"] as const;
/** القيم القديمة للخط (قبل مكتبة الخطوط) → اسم الخط الفعلي */
const LEGACY_FONTS: Record<string, string> = {
  serif: "Playfair Display",
  elegant: "Cormorant Garamond",
  modern: "Manrope",
  sans: "Inter",
};
/** اسم خط من المكتبة (أو قيمة قديمة) → اسم خط صالح، وإلا البديل */
export function resolveFontName(v: unknown, fallback: string): string {
  const name = typeof v === "string" ? (LEGACY_FONTS[v] ?? v) : "";
  return getFont(name) ? name : fallback;
}
export const RADIUS_STYLES = ["sharp", "soft", "round"] as const;
export const BUTTON_STYLES = ["square", "rounded", "pill"] as const;
export const GRID_COLUMNS = [2, 3, 4] as const;
export const CARD_IMAGE_STYLES = ["white", "surface"] as const;
/** شريط التنقل: يتبع الصفحة، زجاجي، لون حر، أو لون التمييز */
export const NAV_STYLES = ["theme", "glass", "solid", "accent"] as const;

export interface PageDesign {
  bgColor: string; // يُستخدم مع الثيم "custom"
  background: (typeof BG_STYLES)[number];
  font: string; // خط العناوين (اسم من مكتبة الخطوط)
  bodyFont: string; // خط النصوص
  radius: (typeof RADIUS_STYLES)[number];
  button: (typeof BUTTON_STYLES)[number];
  columns: (typeof GRID_COLUMNS)[number];
  cardImage: (typeof CARD_IMAGE_STYLES)[number];
  nav: (typeof NAV_STYLES)[number];
  navColor: string; // يُستخدم مع nav = "solid"
}

export const DEFAULT_DESIGN: PageDesign = {
  bgColor: "#0B0E14",
  background: "glow",
  font: "Playfair Display",
  bodyFont: "Inter",
  radius: "round",
  button: "rounded",
  columns: 4,
  cardImage: "white",
  nav: "theme",
  navColor: "#111111",
};

function pick<T extends string | number>(list: readonly T[], v: unknown, fallback: T): T {
  return (list as readonly unknown[]).includes(v) ? (v as T) : fallback;
}

/** يقرأ قيمة design من قاعدة البيانات بأمان (أي قيمة ناقصة/خاطئة → الافتراضي) */
export function parseDesign(raw: unknown): PageDesign {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    bgColor: isHexColor(o.bgColor) ? o.bgColor.toUpperCase() : DEFAULT_DESIGN.bgColor,
    background: pick(BG_STYLES, o.background, DEFAULT_DESIGN.background),
    font: resolveFontName(o.font, DEFAULT_DESIGN.font),
    bodyFont: resolveFontName(o.bodyFont, DEFAULT_DESIGN.bodyFont),
    radius: pick(RADIUS_STYLES, o.radius, DEFAULT_DESIGN.radius),
    button: pick(BUTTON_STYLES, o.button, DEFAULT_DESIGN.button),
    columns: pick(GRID_COLUMNS, o.columns, DEFAULT_DESIGN.columns),
    cardImage: pick(CARD_IMAGE_STYLES, o.cardImage, DEFAULT_DESIGN.cardImage),
    nav: pick(NAV_STYLES, o.nav, DEFAULT_DESIGN.nav),
    navColor: isHexColor(o.navColor) ? o.navColor.toUpperCase() : DEFAULT_DESIGN.navColor,
  };
}

/** ألوان الثيم الفعلية (الجاهز أو المشتق من لون الخلفية الحر) */
export function resolveTokens(theme: string, design?: Partial<PageDesign> | null): ThemeTokens {
  if (theme === "custom") return deriveTokens(design?.bgColor || DEFAULT_DESIGN.bgColor);
  return THEMES[(PRESET_THEMES as readonly string[]).includes(theme) ? (theme as PresetTheme) : "midnight"];
}

const RADIUS = { sharp: ["6px", "4px"], soft: ["14px", "10px"], round: ["24px", "16px"] } as const;
const BUTTON_RADIUS = { square: "6px", rounded: "14px", pill: "999px" } as const;

/** خلفية الصفحة حسب النمط المختار */
export function backgroundImage(style: PageDesign["background"], t: ThemeTokens, accent: string): string | undefined {
  const line = t.isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.055)";
  const dot = t.isDark ? "rgba(255,255,255,0.11)" : "rgba(0,0,0,0.12)";
  switch (style) {
    case "glow":
      return `radial-gradient(ellipse 80% 55% at 50% -5%, color-mix(in srgb, ${accent} 20%, transparent), transparent 70%)`;
    case "gradient":
      return `linear-gradient(180deg, color-mix(in srgb, ${accent} 16%, ${t.bg}) 0%, ${t.bg} 55%)`;
    case "grid":
      return `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`;
    case "dots":
      return `radial-gradient(${dot} 1px, transparent 1px)`;
    default:
      return undefined;
  }
}

const bgIsTopOnly = (s: PageDesign["background"]) => s === "glow" || s === "gradient";

/** متغيرات CSS تُطبَّق على غلاف الصفحة العامة والمعاينات (مع data-lp لتفعيل قواعد globals.css) */
export function themeStyle(theme: string, accent: string, designInput?: Partial<PageDesign> | null): CSSProperties {
  const design = { ...DEFAULT_DESIGN, ...(designInput ?? {}) };
  const t = resolveTokens(theme, design);
  const a = isHexColor(accent) ? accent.toUpperCase() : "#C8A24A";

  // 🎯 ألوان ذكية: كل نص يحقق تبايناً مقروءاً مع الخلفية والبطاقات مهما كانت الألوان المختارة
  const surfaces = [t.bg, t.surface];
  const accentInk = ensureContrast(a, surfaces, 4.5); // لون التمييز عندما يُستخدم كنص/أيقونة
  const muted = ensureContrast(t.muted, surfaces, 4.5);
  const towardText = (c: string, r: number) => (isHexColor(c) ? mixHex(c, t.text, r) : c);
  const hover = towardText(t.surface, 0.07); // خلفية المرور: فرق واضح دون أن يكون فاقعاً
  const hoverStrong = towardText(t.surface, 0.13);
  const borderStrong = towardText(t.bg, 0.24);
  // زر/شارة بلون التمييز فوق الخلفية: إن كان قريباً جداً من لون الصفحة نضيف حداً يفصله
  const accentEdge = contrastRatio(a, t.bg) < 1.6 ? borderStrong : "transparent";

  // 🧭 شريط التنقل
  const nav = navTokens(design, t, a);

  return {
    "--lp-bg": t.bg,
    "--lp-surface": t.surface,
    "--lp-surface2": t.surface2,
    "--lp-text": t.text,
    "--lp-muted": muted,
    "--lp-border": t.border,
    "--lp-border-strong": borderStrong,
    "--lp-hover": hover,
    "--lp-hover-strong": hoverStrong,
    "--lp-accent": a,
    "--lp-accent-ink": accentInk,
    "--lp-accent-fg": bestTextOn(a),
    "--lp-accent-edge": accentEdge,
    "--lp-nav-bg": nav.bg,
    "--lp-nav-text": nav.text,
    "--lp-nav-muted": nav.muted,
    "--lp-nav-border": nav.border,
    "--lp-nav-field": nav.field,
    "--lp-nav-field2": nav.field2,
    "--lp-nav-btn": nav.btn,
    "--lp-nav-btn-fg": nav.btnFg,
    "--lp-nav-blur": nav.blur,
    // الشعارات تظهر مباشرة على البطاقة: بيضاء في الثيمات الداكنة (كثير منها نصّه داكن)، بألوانها في الفاتحة
    "--lp-logo-filter": t.isDark ? "brightness(0) invert(1)" : "none",
    "--lp-radius-lg": RADIUS[design.radius][0],
    "--lp-radius-md": RADIUS[design.radius][1],
    "--lp-btn-radius": BUTTON_RADIUS[design.button],
    // الخطوط تُحمَّل من Google Fonts عبر <LandingFonts fonts={...} />
    "--lp-font-heading": fontStack(design.font),
    "--lp-font-body": fontStack(design.bodyFont),
    "--lp-card-img": design.cardImage === "white" ? "#FFFFFF" : t.surface2,
    backgroundColor: t.bg,
    backgroundImage: backgroundImage(design.background, t, a),
    // التوهج والتدرّج يغطيان أعلى الصفحة فقط (لا يتمددان مع طول الصفحة)
    backgroundSize:
      design.background === "grid" ? "44px 44px" : design.background === "dots" ? "22px 22px" : bgIsTopOnly(design.background) ? "100% 900px" : undefined,
    backgroundRepeat: bgIsTopOnly(design.background) ? "no-repeat" : undefined,
    color: t.text,
    colorScheme: t.isDark ? "dark" : "light",
  } as CSSProperties;
}

/** ألوان شريط التنقل حسب النمط المختار (النص والحقول تُشتق تلقائياً لتبقى مقروءة) */
function navTokens(design: PageDesign, t: ThemeTokens, accent: string) {
  const fromColor = (color: string) => {
    const d = deriveTokens(color);
    const btn = ensureContrast(accent, [color], 1.8) === accent.toUpperCase() ? accent : d.text;
    return {
      bg: d.bg,
      text: d.text,
      muted: ensureContrast(d.muted, [d.bg], 4.5),
      border: d.isDark ? "rgba(255,255,255,0.12)" : mixHex(d.bg, "#000000", 0.12),
      field: d.isDark ? mixHex(d.bg, "#FFFFFF", 0.1) : "#FFFFFF",
      field2: d.isDark ? mixHex(d.bg, "#FFFFFF", 0.16) : mixHex(d.bg, "#000000", 0.06),
      btn,
      btnFg: bestTextOn(btn),
      blur: "none",
    };
  };
  switch (design.nav) {
    case "solid":
      return fromColor(design.navColor);
    case "accent":
      return fromColor(accent);
    case "glass":
      return {
        bg: `color-mix(in srgb, ${t.surface} 55%, transparent)`,
        text: t.text,
        muted: ensureContrast(t.muted, [t.bg, t.surface], 4.5),
        border: t.border,
        field: `color-mix(in srgb, ${t.bg} 70%, transparent)`,
        field2: `color-mix(in srgb, ${t.surface2} 80%, transparent)`,
        btn: accent,
        btnFg: bestTextOn(accent),
        blur: "blur(18px) saturate(1.4)",
      };
    default:
      return {
        bg: `color-mix(in srgb, ${t.bg} 88%, transparent)`,
        text: t.text,
        muted: ensureContrast(t.muted, [t.bg, t.surface], 4.5),
        border: t.border,
        field: t.surface,
        field2: t.surface2,
        btn: accent,
        btnFg: bestTextOn(accent),
        blur: "blur(20px)",
      };
  }
}

// ==================== 🔤 قاموس واجهة الزوار (حسب لغة الصفحة التي اختارها المسوّق) ====================
const DICT = {
  en: {
    searchIn: "Search {name}",
    allCategories: "All categories",
    allStores: "All stores",
    results: "{n} results",
    resultOne: "1 result",
    offerOne: "pick",
    clear: "Clear filters",
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
    searchIn: "ابحث في {name}",
    allCategories: "كل الفئات",
    allStores: "كل المتاجر",
    results: "{n} نتيجة",
    resultOne: "نتيجة واحدة",
    offerOne: "عرض",
    clear: "مسح الفلاتر",
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
    searchIn: "Rechercher dans {name}",
    allCategories: "Toutes les catégories",
    allStores: "Toutes les boutiques",
    results: "{n} résultats",
    resultOne: "1 résultat",
    offerOne: "sélection",
    clear: "Effacer les filtres",
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
  "guide", "cookies", "affiliate-disclosure", "acceptable-use", "resources", "brands", "legal",
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
export function resolveStore(
  brand: StoreBrand | null | undefined,
  storeName: string | null | undefined,
  storeLogo?: string | null
): StoreBrand {
  if (brand) return brand;
  // متجر حر: الاسم الذي كتبه المسوّق + شعاره المرفوع (إن وُجد)
  return { name: storeName?.trim() || "Store", accentColor: null, logoUrl: storeLogo || null };
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
