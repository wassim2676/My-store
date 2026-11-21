// ==================== 🛡️ حماية روابط الأفلييت: الجمهور الجغرافي + الروبوتات ====================
// تُطبَّق في /go/{offerId} (المكان الوحيد الذي يُكشف فيه رابط الأفلييت) على كل المتاجر.
// - الروبوتات وزواحف منصات التواصل (معاينة الروابط) لا ترى رابط الأفلييت أبداً: تُحوَّل لرابط المنتج
//   "النظيف" في المتجر بدون معرّف التتبع (tag / click id / affiliate id) — فلا تُسجَّل نقرات وهمية على حسابك.
// - الدول المستبعدة لا تصل لرابط الأفلييت: صفحة محايدة أو وجهة يحددها المسوّق.
// آمن للعميل والخادم (بدون استيرادات خادمية).

import { z } from "zod";

// -------------------- ⚙️ إعدادات الجمهور (عمود LandingPage.audience) --------------------
export const GEO_MODES = ["all", "allow", "block"] as const;
export const BLOCK_ACTIONS = ["page", "redirect"] as const;

export interface AudienceSettings {
  geoMode: (typeof GEO_MODES)[number]; // all = الجميع، allow = هذه الدول فقط، block = الكل ما عدا هذه الدول
  countries: string[]; // رموز ISO من حرفين (US, GB, ...)
  blockAction: (typeof BLOCK_ACTIONS)[number]; // page = صفحة محايدة، redirect = وجهة مخصّصة
  redirectUrl: string | null;
  botProtection: boolean; // مفعّلة افتراضياً
}

export const DEFAULT_AUDIENCE: AudienceSettings = {
  geoMode: "all",
  countries: [],
  blockAction: "page",
  redirectUrl: null,
  botProtection: true,
};

const COUNTRY_RE = /^[A-Z]{2}$/;

/** يقرأ الإعدادات من قاعدة البيانات بأمان (أي قيمة ناقصة/خاطئة → الافتراضي الآمن) */
export function parseAudience(raw: unknown): AudienceSettings {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const countries = Array.isArray(o.countries)
    ? [...new Set(o.countries.filter((c): c is string => typeof c === "string").map((c) => c.toUpperCase()).filter((c) => COUNTRY_RE.test(c)))].slice(0, 250)
    : [];
  const geoMode = (GEO_MODES as readonly unknown[]).includes(o.geoMode) ? (o.geoMode as AudienceSettings["geoMode"]) : "all";
  const blockAction = (BLOCK_ACTIONS as readonly unknown[]).includes(o.blockAction) ? (o.blockAction as AudienceSettings["blockAction"]) : "page";
  const redirectUrl = typeof o.redirectUrl === "string" && /^https?:\/\//i.test(o.redirectUrl) ? o.redirectUrl.slice(0, 1000) : null;
  return {
    // "هذه الدول فقط" بدون أي دولة = لا أحد يمر — نعتبرها "الجميع" حتى يختار دولاً (حماية من قفل الصفحة بالخطأ)
    geoMode: geoMode !== "all" && countries.length === 0 ? "all" : geoMode,
    countries,
    blockAction: blockAction === "redirect" && !redirectUrl ? "page" : blockAction,
    redirectUrl,
    botProtection: o.botProtection !== false,
  };
}

/** التحقق من مدخلات لوحة التحكم */
export const audienceSchema = z.object({
  geoMode: z.enum(GEO_MODES),
  countries: z.array(z.string().regex(COUNTRY_RE)).max(250),
  blockAction: z.enum(BLOCK_ACTIONS),
  redirectUrl: z
    .string()
    .trim()
    .max(1000)
    .nullable()
    .optional()
    .transform((v) => (v ? (/^https?:\/\//i.test(v) ? v : `https://${v}`) : null))
    .refine((v) => !v || URL.canParse(v), "invalid_url"),
  botProtection: z.boolean(),
});

// -------------------- 🌍 بلد الزائر --------------------
/** من رؤوس Vercel (أو Cloudflare). null إن كان غير معروف (مثلاً على جهاز التطوير) */
export function visitorCountry(h: Headers): string | null {
  const c = (h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "").toUpperCase();
  return COUNTRY_RE.test(c) && c !== "XX" && c !== "T1" ? c : null;
}

/** هل يُسمح لهذا البلد بالوصول لرابط الأفلييت؟ (بلد غير معروف: يمر فقط في وضع "الجميع" أو "الكل ما عدا") */
export function isCountryAllowed(a: AudienceSettings, country: string | null): boolean {
  if (a.geoMode === "all") return true;
  if (a.geoMode === "allow") return !!country && a.countries.includes(country);
  return !country || !a.countries.includes(country);
}

// -------------------- 🤖 كشف الروبوتات --------------------
// ⚠️ متصفحات التطبيقات (Facebook/Instagram/TikTok/Snapchat in-app) زوار حقيقيون ولا تُحجب —
// نحجب فقط "زواحف المعاينة" الخاصة بالمنصات والأدوات الآلية.
const BOT_UA = new RegExp(
  [
    // زواحف معاينة الروابط في منصات التواصل
    "facebookexternalhit", "facebookcatalog", "meta-externalagent", "meta-externalfetcher", "facebot",
    "twitterbot", "linkedinbot", "slackbot", "slack-imgproxy", "telegrambot", "whatsapp", "discordbot",
    "pinterestbot", "pinterest/0\\.", "redditbot", "snap url preview", "bytespider", "tiktokspider",
    "skypeuripreview", "iframely", "embedly", "vkshare", "mastodon", "cardyb",
    "google-pagerenderer", "google-inspectiontool", "googleother", "feedfetcher", "applebot",
    // محركات البحث والذكاء الاصطناعي وأدوات SEO
    "googlebot", "adsbot", "mediapartners-google", "apis-google", "bingbot", "bingpreview", "msnbot", "yandex",
    "baiduspider", "duckduckbot", "sogou", "exabot", "ia_archiver", "ahrefs", "semrush", "mj12bot", "dotbot",
    "petalbot", "seznambot", "gptbot", "chatgpt-user", "oai-searchbot", "claudebot", "claude-web", "anthropic-ai",
    "perplexitybot", "ccbot", "amazonbot", "cohere-ai", "diffbot", "youbot",
    // متصفحات بلا واجهة ومكتبات البرمجة
    "headlesschrome", "phantomjs", "puppeteer", "playwright", "selenium", "lighthouse",
    "curl/", "wget/", "python-requests", "python-urllib", "aiohttp", "httpx", "go-http-client", "okhttp",
    "java/", "libwww", "axios/", "node-fetch", "undici", "scrapy", "postmanruntime", "insomnia",
    // عام: "compatible; XBot" و"+http://" (توقيع الروبوتات). \bbot\b لا يطابق هواتف مثل CUBOT
    "\\bbot\\b", "compatible;[^)]*bot", "\\+https?:", "crawl", "spider", "slurp", "scraper", "url preview", "link preview", "uptime", "validator",
  ].join("|"),
  "i",
);

// زواحف معاينة الروابط ومراجعة الإعلانات في منصات التواصل. تحصل على نفس وجهة الإنسان تماماً،
// لأن عرض وجهة مختلفة لها يُعتبر Cloaking عند Meta/TikTok وقد يؤدي لحظر الدومين كله.
const LINK_PREVIEW_UA =
  /facebookexternalhit|facebookcatalog|meta-externalagent|meta-externalfetcher|facebot|twitterbot|linkedinbot|slackbot|telegrambot|whatsapp|discordbot|pinterestbot|pinterest\/0\.|redditbot|snap url preview|tiktokspider|bytespider|skypeuripreview|applebot/i;

/** زاحف معاينة/مراجعة تابع لمنصة تواصل (وليس سكربت أو أداة نسخ) */
export function isLinkPreviewBot(h: Headers): boolean {
  return LINK_PREVIEW_UA.test(h.get("user-agent") || "");
}

export type VisitorKind = "human" | "bot" | "prefetch";

/** يصنّف الطلب: إنسان، روبوت/زاحف، أو جلب مسبق من المتصفح */
export function classifyVisitor(h: Headers): VisitorKind {
  if (h.get("next-router-prefetch") || h.get("purpose") === "prefetch" || h.get("sec-purpose")?.includes("prefetch") || h.get("x-moz") === "prefetch")
    return "prefetch";
  const ua = h.get("user-agent") || "";
  if (!ua || ua.length < 12 || BOT_UA.test(ua)) return "bot";
  // المتصفحات الحقيقية ترسل دائماً لغة مفضّلة أو رؤوس Sec-Fetch عند فتح رابط — السكربتات غالباً لا
  if (!h.get("accept-language") && !h.get("sec-fetch-mode") && !h.get("sec-fetch-dest")) return "bot";
  return "human";
}

// -------------------- 🧼 الرابط النظيف (بدون معرّف الأفلييت) --------------------
// مواقع التحويل الوسيطة لشبكات الأفلييت (Impact, Awin, Rakuten, CJ, ShareASale, Skimlinks...)
const REDIRECTOR_HOSTS = [
  "amzn.to", "a.co", "amzn.eu", "amzn.asia", "goto.walmart.com", "goto.target.com", "click.linksynergy.com", "linksynergy.com",
  "awin1.com", "prf.hn", "tkqlhce.com", "anrdoezrs.net", "jdoqocy.com", "dpbolvw.net", "kqzyfj.com", "emjcd.com",
  "shareasale.com", "go.skimresources.com", "skimresources.com", "howl.me", "rstyle.me", "shopstyle.it", "liketk.it",
  "s.click.aliexpress.com", "click.aliexpress.com", "rover.ebay.com", "ebay.us", "etsy.me", "temu.to", "app.temu.com",
  "bit.ly", "tinyurl.com", "t.co", "lnk.to", "geni.us", "pxf.io", "sjv.io", "7eer.net", "evyy.net", "ojrq.net", "jmpv.net",
  "avantlink.com", "pntrs.com", "pntra.com", "pntrac.com", "gopjn.com", "partnerize.com", "impact.com", "linkby.com",
];

// معاملات الوجهة داخل روابط التحويل
const TARGET_PARAMS = ["u", "url", "murl", "ued", "dest", "destination", "redirect", "redirect_url", "r", "to", "target", "link", "deeplink", "dl", "out", "mpre", "loc", "p"];

// متاجر معروفة: نُبقي فقط معاملات اختيار المنتج (النسخة/المقاس) ونحذف كل ما عداها
const KNOWN_STORES = [
  "amazon.", "walmart.com", "target.com", "ebay.", "aliexpress.", "etsy.com", "temu.com", "bestbuy.com", "homedepot.com",
  "sephora.com", "wayfair.com", "lowes.com", "costco.com", "macys.com", "nordstrom.com", "ulta.com", "kohls.com", "shein.com",
];
const KEEP_PARAMS = new Set(["th", "psc", "skuid", "sku", "variant", "var", "size", "color", "colour", "selectedsellerid", "id", "item", "listing_id", "goods_id"]);

// معاملات تتبّع/أفلييت تُحذف من أي رابط آخر
const TRACKING_PARAM = /^(utm_|aff|ir|ran|cj|mk|_x_|sv|pf_rd|ref_?$|ref$|tag$|ascsubtag|linkcode|linkid|creative|camp$|campaign|clickid|click_id|gclid|fbclid|msclkid|ttclid|twclid|dclid|wbraid|gbraid|yclid|igshid|mc_|sub_?id|subid|sharedid|wmlspartner|sourceid|veh$|adid|ad_id|partner|pid$|sid$|afid|cpng|campid|toolid|customid|spm|scm|srsltid|sk$|terminal_id|afsmartredirect|click_key|click_sum|awc$|source$|src$|share)/i;

function hostMatches(host: string, list: string[]): boolean {
  const h = host.toLowerCase().replace(/^www\./, "");
  return list.some((d) => (d.endsWith(".") ? h.startsWith(d) || h.includes("." + d) : h === d || h.endsWith("." + d)));
}

function stripParams(u: URL): URL {
  const known = hostMatches(u.hostname, KNOWN_STORES);
  for (const key of [...u.searchParams.keys()]) {
    if (known ? !KEEP_PARAMS.has(key.toLowerCase()) : TRACKING_PARAM.test(key)) u.searchParams.delete(key);
  }
  // Amazon: معرّفات الأفلييت قد تكون داخل المسار أيضاً (/ref=..., /tag=...)
  if (/amazon\./i.test(u.hostname)) u.pathname = u.pathname.replace(/\/ref=[^/]*/gi, "").replace(/\/tag=[^/]*/gi, "");
  u.hash = "";
  return u;
}

/**
 * يحوّل رابط الأفلييت إلى رابط المنتج في المتجر بدون أي معرّف تتبّع.
 * - يستخرج الوجهة من روابط شبكات الأفلييت الوسيطة (Impact: ?u= ، Awin: ?ued= ، Rakuten: ?murl= ...)
 * - إن تعذّر الاستخراج (رابط مختصر مثل amzn.to) يعيد null — والمستدعي يستعمل صفحة المراجعة بدلاً منه.
 */
export function cleanAffiliateUrl(raw: string, depth = 0): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(u.protocol) || depth > 3) return null;

  if (hostMatches(u.hostname, REDIRECTOR_HOSTS)) {
    for (const key of TARGET_PARAMS) {
      const v = u.searchParams.get(key);
      if (v && /^https?(:|%3A)/i.test(v)) {
        const target = /^https?%3A/i.test(v) ? decodeURIComponent(v) : v;
        return cleanAffiliateUrl(target, depth + 1);
      }
    }
    return null; // رابط مختصر/وسيط بلا وجهة مقروءة: لا نكشفه
  }
  return stripParams(u).toString();
}

// -------------------- 🌐 قائمة الدول (ISO 3166-1) --------------------
export const COUNTRY_CODES = [
  "AF","AX","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CG","CD","CK","CR","CI","HR","CU","CW","CY","CZ","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MK","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","RE","RO","RU","RW","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","US","UM","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","XK",
] as const;

/** مجموعات جاهزة لاختيار سريع */
export const COUNTRY_PRESETS: Record<string, string[]> = {
  us: ["US"],
  northAmerica: ["US", "CA"],
  english: ["US", "GB", "CA", "AU", "NZ", "IE"],
  eu: ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"],
  gcc: ["SA", "AE", "KW", "QA", "BH", "OM"],
};

/** علم الدولة كإيموجي من رمزها */
export function flagEmoji(code: string): string {
  return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}
