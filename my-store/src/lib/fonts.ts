// ==================== 🔤 مكتبة خطوط صفحات الهبوط (Google Fonts) ====================
// مُولَّدة ومُتحقَّق منها: كل خط وكل وزن هنا يُخدَّم فعلاً من fonts.googleapis.com (لا روابط مكسورة).
// الصيغة: [الاسم، الفئة، الأوزان المتاحة بين 400 و700 ("4567" = 400/500/600/700)، 1 = يدعم العربية]

export const FONT_CATEGORIES = ["serif", "sans", "display", "handwriting", "mono", "arabic"] as const;
export type FontCategory = (typeof FONT_CATEGORIES)[number];

export interface FontInfo {
  family: string;
  category: FontCategory;
  weights: number[];
  arabic: boolean;
}

type Row = [string, FontCategory, string, 1?];

const ROWS: Row[] = [
  ["Playfair Display", "serif", "4567"],
  ["Cormorant Garamond", "serif", "4567"],
  ["Lora", "serif", "4567"],
  ["Merriweather", "serif", "4567"],
  ["Libre Baskerville", "serif", "4567"],
  ["EB Garamond", "serif", "4567"],
  ["Crimson Pro", "serif", "4567"],
  ["DM Serif Display", "serif", "4"],
  ["Bodoni Moda", "serif", "4567"],
  ["Prata", "serif", "4"],
  ["Cinzel", "serif", "4567"],
  ["Spectral", "serif", "4567"],
  ["Source Serif 4", "serif", "4567"],
  ["Noto Serif", "serif", "4567"],
  ["PT Serif", "serif", "47"],
  ["Fraunces", "serif", "4567"],
  ["Libre Caslon Text", "serif", "47"],
  ["Marcellus", "serif", "4"],
  ["Cormorant", "serif", "4567"],
  ["Young Serif", "serif", "4"],
  ["Instrument Serif", "serif", "4"],
  ["Gloock", "serif", "4"],
  ["Literata", "serif", "4567"],
  ["Newsreader", "serif", "4567"],
  ["Bitter", "serif", "4567"],
  ["Zilla Slab", "serif", "4567"],
  ["Roboto Slab", "serif", "4567"],
  ["Arvo", "serif", "47"],
  ["Playfair", "serif", "4567"],
  ["Cardo", "serif", "47"],
  ["Gilda Display", "serif", "4"],
  ["Italiana", "serif", "4"],
  ["Bellefair", "serif", "4"],
  ["Noto Serif Display", "serif", "4567"],
  ["Libre Bodoni", "serif", "4567"],
  ["Castoro", "serif", "4567"],
  ["Petrona", "serif", "4567"],
  ["Brygada 1918", "serif", "4567"],
  ["Alice", "serif", "4"],
  ["Lustria", "serif", "4"],
  ["Inter", "sans", "4567"],
  ["Manrope", "sans", "4567"],
  ["Poppins", "sans", "4567"],
  ["Montserrat", "sans", "4567"],
  ["Roboto", "sans", "4567"],
  ["Open Sans", "sans", "4567"],
  ["Lato", "sans", "47"],
  ["Nunito", "sans", "4567"],
  ["Raleway", "sans", "4567"],
  ["Work Sans", "sans", "4567"],
  ["DM Sans", "sans", "4567"],
  ["Outfit", "sans", "4567"],
  ["Plus Jakarta Sans", "sans", "4567"],
  ["Sora", "sans", "4567"],
  ["Urbanist", "sans", "4567"],
  ["Space Grotesk", "sans", "4567"],
  ["Figtree", "sans", "4567"],
  ["Rubik", "sans", "4567", 1],
  ["Karla", "sans", "4567"],
  ["Mulish", "sans", "4567"],
  ["Barlow", "sans", "4567"],
  ["Josefin Sans", "sans", "4567"],
  ["Quicksand", "sans", "4567"],
  ["Lexend", "sans", "4567"],
  ["Archivo", "sans", "4567"],
  ["Red Hat Display", "sans", "4567"],
  ["Albert Sans", "sans", "4567"],
  ["Onest", "sans", "4567"],
  ["Geist", "sans", "4567"],
  ["Instrument Sans", "sans", "4567"],
  ["IBM Plex Sans", "sans", "4567"],
  ["Source Sans 3", "sans", "4567"],
  ["Noto Sans", "sans", "4567"],
  ["Kanit", "sans", "4567"],
  ["Hanken Grotesk", "sans", "4567"],
  ["Syne", "sans", "4567"],
  ["Epilogue", "sans", "4567"],
  ["Be Vietnam Pro", "sans", "4567"],
  ["Cabin", "sans", "4567"],
  ["Exo 2", "sans", "4567"],
  ["Jost", "sans", "4567"],
  ["Nunito Sans", "sans", "4567"],
  ["Heebo", "sans", "4567"],
  ["Assistant", "sans", "4567"],
  ["Public Sans", "sans", "4567"],
  ["Inter Tight", "sans", "4567"],
  ["Schibsted Grotesk", "sans", "4567"],
  ["Wix Madefor Display", "sans", "4567"],
  ["Golos Text", "sans", "4567"],
  ["Mona Sans", "sans", "4567"],
  ["Bebas Neue", "display", "4"],
  ["Anton", "display", "4"],
  ["Oswald", "display", "4567"],
  ["Abril Fatface", "display", "4"],
  ["Righteous", "display", "4"],
  ["Alfa Slab One", "display", "4"],
  ["Bungee", "display", "4"],
  ["Archivo Black", "display", "4"],
  ["Lobster", "display", "4"],
  ["Fredoka", "display", "4567"],
  ["Russo One", "display", "4"],
  ["Monoton", "display", "4"],
  ["Staatliches", "display", "4"],
  ["Unbounded", "display", "4567"],
  ["Bricolage Grotesque", "display", "4567"],
  ["Dela Gothic One", "display", "4"],
  ["Black Ops One", "display", "4"],
  ["Passion One", "display", "47"],
  ["Ultra", "display", "4"],
  ["Rozha One", "display", "4"],
  ["Titan One", "display", "4"],
  ["Chakra Petch", "display", "4567"],
  ["Orbitron", "display", "4567"],
  ["Audiowide", "display", "4"],
  ["Big Shoulders Display", "display", "4567"],
  ["Climate Crisis", "display", "4"],
  ["Rubik Mono One", "display", "4"],
  ["Shrikhand", "display", "4"],
  ["Bowlby One", "display", "4"],
  ["Paytone One", "display", "4"],
  ["Luckiest Guy", "display", "4"],
  ["Bungee Shade", "display", "4"],
  ["Syncopate", "display", "47"],
  ["Michroma", "display", "4"],
  ["League Spartan", "display", "4567"],
  ["Six Caps", "display", "4"],
  ["Limelight", "display", "4"],
  ["Poiret One", "display", "4"],
  ["Federo", "display", "4"],
  ["Cinzel Decorative", "display", "47"],
  ["Dancing Script", "handwriting", "4567"],
  ["Pacifico", "handwriting", "4"],
  ["Caveat", "handwriting", "4567"],
  ["Great Vibes", "handwriting", "4"],
  ["Sacramento", "handwriting", "4"],
  ["Satisfy", "handwriting", "4"],
  ["Parisienne", "handwriting", "4"],
  ["Allura", "handwriting", "4"],
  ["Kaushan Script", "handwriting", "4"],
  ["Shadows Into Light", "handwriting", "4"],
  ["Amatic SC", "handwriting", "47"],
  ["Indie Flower", "handwriting", "4"],
  ["Permanent Marker", "handwriting", "4"],
  ["Yellowtail", "handwriting", "4"],
  ["Homemade Apple", "handwriting", "4"],
  ["Alex Brush", "handwriting", "4"],
  ["Courgette", "handwriting", "4"],
  ["Cookie", "handwriting", "4"],
  ["Tangerine", "handwriting", "47"],
  ["Gloria Hallelujah", "handwriting", "4"],
  ["Pinyon Script", "handwriting", "4"],
  ["Mrs Saint Delafield", "handwriting", "4"],
  ["Italianno", "handwriting", "4"],
  ["Kalam", "handwriting", "47"],
  ["Patrick Hand", "handwriting", "4"],
  ["Architects Daughter", "handwriting", "4"],
  ["Rock Salt", "handwriting", "4"],
  ["Nothing You Could Do", "handwriting", "4"],
  ["La Belle Aurore", "handwriting", "4"],
  ["Marck Script", "handwriting", "4"],
  ["JetBrains Mono", "mono", "4567"],
  ["Fira Code", "mono", "4567"],
  ["Space Mono", "mono", "47"],
  ["IBM Plex Mono", "mono", "4567"],
  ["Roboto Mono", "mono", "4567"],
  ["DM Mono", "mono", "45"],
  ["Source Code Pro", "mono", "4567"],
  ["Courier Prime", "mono", "47"],
  ["Inconsolata", "mono", "4567"],
  ["Martian Mono", "mono", "4567"],
  ["Azeret Mono", "mono", "4567"],
  ["Red Hat Mono", "mono", "4567"],
  ["Cairo", "arabic", "4567", 1],
  ["Tajawal", "arabic", "457", 1],
  ["Almarai", "arabic", "47", 1],
  ["Amiri", "arabic", "47", 1],
  ["Noto Kufi Arabic", "arabic", "4567", 1],
  ["Noto Naskh Arabic", "arabic", "4567", 1],
  ["IBM Plex Sans Arabic", "arabic", "4567", 1],
  ["Readex Pro", "arabic", "4567", 1],
  ["Changa", "arabic", "4567", 1],
  ["El Messiri", "arabic", "4567", 1],
  ["Lalezar", "arabic", "4", 1],
  ["Reem Kufi", "arabic", "4567", 1],
  ["Markazi Text", "arabic", "4567", 1],
  ["Harmattan", "arabic", "4567", 1],
  ["Mada", "arabic", "4567", 1],
  ["Lateef", "arabic", "4567", 1],
  ["Scheherazade New", "arabic", "4567", 1],
  ["Aref Ruqaa", "arabic", "47", 1],
  ["Rakkas", "arabic", "4", 1],
  ["Baloo Bhaijaan 2", "arabic", "4567", 1],
  ["Marhey", "arabic", "4567", 1],
  ["Noto Sans Arabic", "arabic", "4567", 1],
  ["Alexandria", "arabic", "4567", 1],
  ["Zain", "arabic", "47", 1],
  ["Kufam", "arabic", "4567", 1],
  ["Lemonada", "arabic", "4567", 1],
  ["Katibeh", "arabic", "4", 1],
  ["Mirza", "arabic", "4567", 1],
  ["Jomhuria", "arabic", "4", 1],
  ["Vazirmatn", "arabic", "4567", 1],
  ["Blaka", "arabic", "4", 1],
  ["Gulzar", "arabic", "4", 1],
  ["Reem Kufi Fun", "arabic", "4567", 1],
  ["Qahiri", "arabic", "4", 1],
  ["Badeen Display", "arabic", "4", 1],
  ["Amiri Quran", "arabic", "4", 1],
  ["Aref Ruqaa Ink", "arabic", "47", 1],
  ["Playpen Sans Arabic", "arabic", "4567", 1],
  ["Handjet", "arabic", "4567", 1],
  ["Beiruti", "arabic", "4567", 1],
 ];

export const FONTS: FontInfo[] = ROWS.map(([family, category, w, ar]) => ({
  family,
  category,
  weights: w.split("").map((d) => Number(d) * 100),
  arabic: ar === 1,
}));

const BY_NAME = new Map(FONTS.map((f) => [f.family, f]));

export function getFont(family: unknown): FontInfo | undefined {
  return typeof family === "string" ? BY_NAME.get(family) : undefined;
}

const FALLBACK: Record<FontCategory, string> = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  display: "system-ui, sans-serif",
  handwriting: "cursive",
  mono: "ui-monospace, Menlo, Consolas, monospace",
  arabic: "system-ui, 'Segoe UI', Tahoma, sans-serif",
};

/** قيمة font-family كاملة مع بديل مناسب للفئة */
export function fontStack(family: string): string {
  const f = BY_NAME.get(family);
  return `'${family}', ${FALLBACK[f?.category ?? "sans"]}`;
}

/** رابط ورقة أنماط Google Fonts لخط واحد بأوزانه المتاحة (رابط لكل خط: فشل واحد لا يُسقط الباقي) */
export function fontHref(family: string): string | null {
  const f = BY_NAME.get(family);
  if (!f) return null;
  const name = encodeURIComponent(f.family).replace(/%20/g, "+");
  const w = f.weights.length > 1 ? `:wght@${f.weights.join(";")}` : "";
  return `https://fonts.googleapis.com/css2?family=${name}${w}&display=swap`;
}

/**
 * رابط خفيف جداً لمعاينة أسماء كل الخطوط داخل القائمة: Google يرسل فقط الحروف المطلوبة (text=)
 * فتُحمَّل 200+ خط ببضعة كيلوبايتات — نفس أسلوب Canva.
 */
export function fontPreviewHref(families: string[], text: string): string {
  const fam = families.map((f) => "family=" + encodeURIComponent(f).replace(/%20/g, "+")).join("&");
  return `https://fonts.googleapis.com/css2?${fam}&text=${encodeURIComponent(text)}&display=block`;
}

/** عيّنة عربية تُعرض بجانب الخطوط الداعمة للعربية */
export const ARABIC_SAMPLE = "أبجد هوز";
