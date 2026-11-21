import type { Metadata } from "next";

// ==================== 🔌 تكاملات المسوّق (وسوم التحقق من ملكية الدومين) ====================
// تُحفظ في LandingPage.integrations وتُطبع كوسوم <meta> في الصفحة الرئيسية لصفحة المسوّق.
export const VERIFY_KEYS = ["meta", "pinterest", "google", "bing"] as const;
export type VerifyKey = (typeof VERIFY_KEYS)[number];

export type Integrations = { verify: Partial<Record<VerifyKey, string>> };

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
  return { verify };
}

/** وسوم التحقق لـ generateMetadata */
export function verificationMetadata(raw: unknown): Metadata["verification"] | undefined {
  const { verify } = parseIntegrations(raw);
  const other: Record<string, string> = {};
  for (const k of VERIFY_KEYS) if (verify[k] && k !== "google") other[VERIFY_META_NAME[k]] = verify[k]!;
  if (!verify.google && !Object.keys(other).length) return undefined;
  return { ...(verify.google ? { google: verify.google } : {}), ...(Object.keys(other).length ? { other } : {}) };
}
