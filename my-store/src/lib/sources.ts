// ==================== 📣 مصدر الزيارة (من أين جاء الزائر؟) ====================
// بدون قاعدة بيانات: آمن للاستيراد في proxy. الترتيب: متصفح التطبيق ← utm_source ← الـ referrer ← مباشر
export const SOURCES = [
  "instagram", "facebook", "tiktok", "whatsapp", "youtube", "pinterest", "snapchat", "x", "telegram", "reddit", "linkedin",
  "google", "bing", "email", "direct", "other",
] as const;
export type TrafficSource = (typeof SOURCES)[number];

/** كوكي الجلسة الذي يحفظ مصدر الدخول ليُنسب له النقر لاحقاً في /go */
export const SOURCE_COOKIE = "ps_src";

export const isSource = (v: unknown): v is TrafficSource => typeof v === "string" && (SOURCES as readonly string[]).includes(v);

// متصفحات التطبيقات تعرّف نفسها في الـ User-Agent
const IN_APP: [RegExp, TrafficSource][] = [
  [/instagram/i, "instagram"],
  [/\bFBAN\/|\bFBAV\/|\bFB_IAB\/|\bFBIOS|\[FB/i, "facebook"],
  [/musical_ly|\bTikTok|BytedanceWebview|ByteLocale|trill_/i, "tiktok"],
  [/Snapchat/i, "snapchat"],
  [/Pinterest/i, "pinterest"],
  [/LinkedInApp/i, "linkedin"],
  [/Twitter for|TwitterAndroid/i, "x"],
  [/Telegram/i, "telegram"],
  [/WhatsApp/i, "whatsapp"],
];

const REFERRERS: [RegExp, TrafficSource][] = [
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, "facebook"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "whatsapp"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)pinterest\.[a-z.]+$|(^|\.)pin\.it$/, "pinterest"],
  [/(^|\.)snapchat\.com$/, "snapchat"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "x"],
  [/(^|\.)(t\.me|telegram\.org)$/, "telegram"],
  [/(^|\.)reddit\.com$/, "reddit"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin"],
  [/(^|\.)google\.[a-z.]+$/, "google"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)(mail\.google\.com|outlook\.(live|office)\.com|mail\.yahoo\.com)$/, "email"],
];

const UTM_ALIASES: Record<string, TrafficSource> = {
  ig: "instagram", insta: "instagram", instagram: "instagram",
  fb: "facebook", facebook: "facebook", meta: "facebook", messenger: "facebook",
  tiktok: "tiktok", tt: "tiktok",
  whatsapp: "whatsapp", wa: "whatsapp",
  youtube: "youtube", yt: "youtube",
  pinterest: "pinterest", pin: "pinterest",
  snapchat: "snapchat", snap: "snapchat",
  x: "x", twitter: "x",
  telegram: "telegram", tg: "telegram",
  reddit: "reddit", linkedin: "linkedin",
  google: "google", bing: "bing",
  email: "email", newsletter: "email", mail: "email",
};

function fromReferrer(referrer: string | null | undefined, ownHost: string): TrafficSource | null {
  if (!referrer) return null;
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
  if (!host || host === ownHost.replace(/^www\./, "")) return null; // تنقّل داخلي
  for (const [re, s] of REFERRERS) if (re.test(host)) return s;
  return "other";
}

/**
 * يحدد مصدر الزيارة. يُرجع null إن كان تنقّلاً داخلياً بلا معلومة جديدة
 * (حينها نستعمل المصدر المحفوظ في الكوكي).
 */
export function detectSource(input: { userAgent?: string | null; utmSource?: string | null; referrer?: string | null; host: string }): TrafficSource | null {
  const ua = input.userAgent ?? "";
  for (const [re, s] of IN_APP) if (re.test(ua)) return s;
  const utm = input.utmSource?.trim().toLowerCase();
  if (utm) return UTM_ALIASES[utm] ?? (isSource(utm) ? utm : "other");
  return fromReferrer(input.referrer, input.host);
}

/** المصدر النهائي لطلب صفحة: ما نكتشفه الآن، وإلا الكوكي، وإلا "مباشر" */
export function resolveSource(h: Headers, opts: { utmSource?: string | null; host: string; cookie?: string | null }): TrafficSource {
  const detected = detectSource({ userAgent: h.get("user-agent"), utmSource: opts.utmSource, referrer: h.get("referer"), host: opts.host });
  if (detected) return detected;
  return isSource(opts.cookie) ? opts.cookie : "direct";
}
