import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

// ==================== 🖼️ أدوات صور المعاينة (Open Graph) ====================
// صور 1200×630 تولَّد تلقائياً لكل صفحة/عرض/مقال، وتظهر عند مشاركة الرابط في فيسبوك وواتساب وX وتيليغرام...
export const OG_SIZE = { width: 1200, height: 630 };

// -------------------- 🔤 الخطوط (تُجلب مرة واحدة لكل نسخة سيرفر) --------------------
type Font = { name: string; data: ArrayBuffer; weight: 400 | 500 | 600 | 700 | 800; style: "normal" };
const fontCache = new Map<string, Promise<ArrayBuffer | null>>();

async function googleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  const key = `${family}:${weight}`;
  if (!fontCache.has(key)) {
    fontCache.set(
      key,
      (async () => {
        try {
          // بدون User-Agent حديث يُرجع Google ملف TTF (المدعوم في توليد الصور)
          const css = await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`, {
            signal: AbortSignal.timeout(6000),
          }).then((r) => r.text());
          const url = /src:\s*url\(([^)]+)\)\s*format\(['"](?:truetype|opentype)['"]\)/.exec(css)?.[1];
          if (!url) return null;
          return await fetch(url, { signal: AbortSignal.timeout(8000) }).then((r) => r.arrayBuffer());
        } catch {
          return null;
        }
      })().then((d) => {
        if (!d) fontCache.delete(key); // نعيد المحاولة في الطلب القادم
        return d;
      }),
    );
  }
  return fontCache.get(key)!;
}

export async function ogFonts(arabic = false): Promise<Font[]> {
  const specs: [string, string, Font["weight"]][] = [
    ["Inter", "Inter", 500],
    ["Inter", "Inter", 700],
    ["Inter", "Inter", 800],
    ["Playfair Display", "Playfair", 700],
  ];
  if (arabic) specs.push(["IBM Plex Sans Arabic", "Arabic", 500], ["IBM Plex Sans Arabic", "Arabic", 700]);
  const loaded = await Promise.all(specs.map(async ([family, name, weight]) => ({ name, weight, data: await googleFont(family, weight) })));
  return loaded.filter((f): f is { name: string; weight: Font["weight"]; data: ArrayBuffer } => !!f.data).map((f) => ({ ...f, style: "normal" as const }));
}

/** خط الواجهة مع بديل عربي */
export const sans = (arabic: boolean) => (arabic ? "Arabic, Inter" : "Inter, Arabic");
export const serif = (arabic: boolean) => (arabic ? "Arabic, Playfair" : "Playfair, Arabic");

// -------------------- 🖼️ الصور → data URI (PNG/JPEG فقط يدعمها مولّد الصور) --------------------
const MAX_BYTES = 6 * 1024 * 1024;

async function toPng(buf: Buffer, max: number): Promise<string | null> {
  try {
    const sharp = (await import("sharp")).default;
    const out = await sharp(buf, { animated: false }).resize(max, max, { fit: "inside", withoutEnlargement: true }).png().toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * يجلب صورة (رابط خارجي أو /api/media/{id} من قاعدة البيانات) ويحوّلها لصيغة يقبلها مولّد الصور.
 * أي فشل → null (الصورة تُعرض بدون هذا العنصر بدل أن تفشل كلها).
 */
export async function loadImage(src: string | null | undefined, max = 900): Promise<string | null> {
  if (!src) return null;
  try {
    let buf: Buffer;
    let mime: string;
    const media = /^\/api\/media\/([a-z0-9]{20,40})$/.exec(src);
    if (media) {
      const row = await prisma.media.findUnique({ where: { id: media[1] }, select: { mime: true, data: true } });
      if (!row) return null;
      buf = Buffer.from(row.data);
      mime = row.mime;
    } else {
      const url = src.startsWith("/") ? `${SITE_URL}${src}` : src;
      if (!/^https?:\/\//i.test(url)) return null;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { Accept: "image/png,image/jpeg,image/*;q=0.8" } });
      if (!res.ok) return null;
      mime = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
      const ab = await res.arrayBuffer();
      if (ab.byteLength > MAX_BYTES) return null;
      buf = Buffer.from(ab);
    }
    if (!mime.startsWith("image/")) return null;
    // نحوّل كل شيء (webp/avif/svg/صور ضخمة) إلى PNG بحجم مناسب
    return await toPng(buf, max);
  } catch {
    return null;
  }
}

// -------------------- 🎨 مساعدات --------------------
export function hexToRgba(hex: string, alpha: number) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return `rgba(200,162,74,${alpha})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export function clip(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

export const hasArabic = (...texts: (string | null | undefined)[]) => texts.some((t) => !!t && /[؀-ۿ]/.test(t));
