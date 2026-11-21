import type { Metadata } from "next";

// ==================== 🔌 تكاملات المسوّق (وسوم التحقق + بكسلات الإعلانات) ====================
// تُحفظ في LandingPage.integrations: وسوم التحقق تُطبع كـ <meta>، والبكسلات تُحمَّل للزوار (ليس للمالك).
export const VERIFY_KEYS = ["meta", "pinterest", "google", "bing"] as const;
export type VerifyKey = (typeof VERIFY_KEYS)[number];

export type Pixels = { meta?: string; tiktok?: string };
export type Integrations = { verify: Partial<Record<VerifyKey, string>>; pixels: Pixels };

/** Meta Pixel ID: أرقام فقط (15-16 عادةً) · TikTok Pixel ID: حروف وأرقام (مثل C4ABCD1234EFGH5678IJ) */
const PIXEL_RE: Record<keyof Pixels, RegExp> = { meta: /^\d{10,20}$/, tiktok: /^[A-Z0-9]{12,30}$/ };

/** يقبل رقم البكسل وحده أو كود البكسل كاملاً ويستخرج الرقم. null = فارغ · false = غير صالح */
export function cleanPixelId(kind: keyof Pixels, raw: unknown): string | null | false {
  if (raw == null) return null;
  if (typeof raw !== "string") return false;
  let v = raw.trim();
  if (!v) return null;
  if (kind === "meta") v = /fbq\(\s*["']init["']\s*,\s*["'](\d+)/.exec(v)?.[1] ?? v.replace(/\s/g, "");
  else v = (/ttq\.load\(\s*["']([A-Za-z0-9]+)/.exec(v)?.[1] ?? v.replace(/\s/g, "")).toUpperCase();
  return PIXEL_RE[kind].test(v) ? v : false;
}

/** اسم وسم <meta> لكل منصة */
export const VERIFY_META_NAME: Record<VerifyKey, string> = {
  meta: "facebook-domain-verification",
  pinterest: "p:domain_verify",
  google: "google-site-verification",
  bing: "msvalidate.01",
};

/**
 * يقبل الرمز وحده أو وسم <meta> كاملاً كما تنسخه المنصة، ويُرجع الرمز النظيف فقط.
 * null = فارغ · false = غير صالح
 */
export function cleanVerifyToken(raw: unknown): string | null | false {
  if (raw == null) return null;
  if (typeof raw !== "string") return false;
  let v = raw.trim();
  if (!v) return null;
  const m = /content\s*=\s*["']([^"']+)["']/i.exec(v);
  if (m) v = m[1].trim();
  return /^[A-Za-z0-9_\-.:=+/]{6,120}$/.test(v) ? v : false;
}

export function parseIntegrations(raw: unknown): Integrations {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const vo = o.verify && typeof o.verify === "object" ? (o.verify as Record<string, unknown>) : {};
  const verify: Integrations["verify"] = {};
  for (const k of VERIFY_KEYS) {
    const t = cleanVerifyToken(vo[k]);
    if (t) verify[k] = t;
  }
  const po = o.pixels && typeof o.pixels === "object" ? (o.pixels as Record<string, unknown>) : {};
  const pixels: Pixels = {};
  for (const k of ["meta", "tiktok"] as const) {
    const v = cleanPixelId(k, po[k]);
    if (v) pixels[k] = v;
  }
  return { verify, pixels };
}

/** وسوم التحقق لـ generateMetadata */
export function verificationMetadata(raw: unknown): Metadata["verification"] | undefined {
  const { verify } = parseIntegrations(raw);
  const other: Record<string, string> = {};
  for (const k of VERIFY_KEYS) if (verify[k] && k !== "google") other[VERIFY_META_NAME[k]] = verify[k]!;
  if (!verify.google && !Object.keys(other).length) return undefined;
  return { ...(verify.google ? { google: verify.google } : {}), ...(Object.keys(other).length ? { other } : {}) };
}
