// ==================== 📰 مقالات المسوّقين: تحقق + تحويل Markdown مبسّط إلى كتل آمنة ====================
// آمن للعميل والخادم (يُستخدم في معاينة المحرر وفي الصفحة العامة).
// لا نحقن HTML أبداً: النص يُحلَّل إلى كتل ثم يُرسم كعناصر React.

import { z } from "zod";
import { toSlug } from "./landing";

export const ARTICLE_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

const MEDIA_PATH = /^\/api\/media\/[a-z0-9]{20,40}$/;
export const isSafeImageUrl = (u: string) => MEDIA_PATH.test(u) || /^https:\/\/[^\s"'<>]+$/i.test(u);
export const isSafeLinkUrl = (u: string) => /^(https?:\/\/|\/(?!\/)|mailto:|#)[^\s"'<>]*$/i.test(u);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => v || null);

export const articleSchema = z.object({
  title: z.string().trim().min(3).max(150),
  slug: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? toSlug(v, 120) : "")),
  excerpt: optionalText(300),
  content: z.string().max(60000),
  coverImage: z
    .string()
    .trim()
    .max(1000)
    .nullable()
    .optional()
    .transform((v) => v || null)
    .refine((v) => !v || isSafeImageUrl(v), "invalid_image"),
  category: optionalText(60),
  status: z.enum(ARTICLE_STATUSES),
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
});
export type ArticleInput = z.infer<typeof articleSchema>;

// -------------------- 🧱 الكتل --------------------
export type Block =
  | { t: "h2" | "h3"; text: string; id: string }
  | { t: "p" | "quote"; text: string }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "img"; src: string; alt: string }
  | { t: "offer"; slug: string }
  | { t: "hr" };

const headingId = (text: string, used: Set<string>) => {
  const base = toSlug(text, 60) || "section";
  let id = base;
  for (let i = 2; used.has(id); i++) id = `${base}-${i}`;
  used.add(id);
  return id;
};

/** يحلّل Markdown مبسّط: ## و### للعناوين، قوائم - و1.، اقتباس >، صور ![](...)، فاصل ---، وتضمين عرض {{offer:slug}} */
export function parseArticle(md: string): Block[] {
  const blocks: Block[] = [];
  const used = new Set<string>();
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  let para: string[] = [];
  let list: { t: "ul" | "ol"; items: string[] } | null = null;
  let quote: string[] = [];

  const flush = () => {
    if (para.length) blocks.push({ t: "p", text: para.join(" ").trim() });
    if (list) blocks.push(list);
    if (quote.length) blocks.push({ t: "quote", text: quote.join(" ").trim() });
    para = [];
    list = null;
    quote = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{2,3})\s+(.+)$/)) || (m = line.match(/^(#)\s+(.+)$/))) {
      flush();
      const text = m[2].trim();
      blocks.push({ t: m[1].length === 3 ? "h3" : "h2", text, id: headingId(text, used) });
    } else if ((m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/))) {
      flush();
      if (isSafeImageUrl(m[2])) blocks.push({ t: "img", alt: m[1].trim(), src: m[2] });
    } else if ((m = line.match(/^\{\{\s*offer:\s*([a-z0-9-]+)\s*\}\}$/i))) {
      flush();
      blocks.push({ t: "offer", slug: m[1].toLowerCase() });
    } else if (/^(-{3,}|\*{3,})$/.test(line)) {
      flush();
      blocks.push({ t: "hr" });
    } else if ((m = line.match(/^[-*•]\s+(.+)$/))) {
      if (para.length || quote.length || (list && list.t !== "ul")) flush();
      list ??= { t: "ul", items: [] };
      list.items.push(m[1]);
    } else if ((m = line.match(/^\d+[.)]\s+(.+)$/))) {
      if (para.length || quote.length || (list && list.t !== "ol")) flush();
      list ??= { t: "ol", items: [] };
      list.items.push(m[1]);
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      if (para.length || list) flush();
      quote.push(m[1]);
    } else {
      if (list || quote.length) flush();
      para.push(line);
    }
  }
  flush();
  return blocks;
}

// -------------------- ✍️ نص داخل السطر (عريض/مائل/رابط/كود) --------------------
export type InlineNode =
  | { k: "text"; v: string }
  | { k: "b" | "i" | "code"; v: string }
  | { k: "a"; v: string; href: string };

export function parseInline(text: string): InlineNode[] {
  const out: InlineNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ k: "text", v: text.slice(last, m.index) });
    if (m[1]) out.push({ k: "b", v: m[1] });
    else if (m[2]) out.push({ k: "i", v: m[2] });
    else if (m[3]) out.push({ k: "code", v: m[3] });
    else if (m[4]) out.push(isSafeLinkUrl(m[5]) ? { k: "a", v: m[4], href: m[5] } : { k: "text", v: m[4] });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ k: "text", v: text.slice(last) });
  return out;
}

/** نص خام بدون رموز Markdown (للمقتطف/الوصف/مدة القراءة) */
export function plainText(md: string): string {
  return parseArticle(md)
    .map((b) => ("text" in b ? b.text : "items" in b ? b.items.join(" ") : ""))
    .join(" ")
    .replace(/\*\*|\*|`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingMinutes(md: string): number {
  const words = plainText(md).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function autoExcerpt(md: string, max = 200): string {
  const t = plainText(md);
  return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, "") + "…" : t;
}

/** صورة الغلاف أو أول صورة في المقال */
export function articleImage(a: { coverImage: string | null; content: string }): string | null {
  if (a.coverImage) return a.coverImage;
  const img = parseArticle(a.content).find((b) => b.t === "img");
  return img && img.t === "img" ? img.src : null;
}

/** روابط عروض مضمّنة في المقال */
export function embeddedOfferSlugs(md: string): string[] {
  return [...new Set(parseArticle(md).flatMap((b) => (b.t === "offer" ? [b.slug] : [])))];
}
