import { PRODUCTION_URL } from "@/lib/site";

// ==================== 🌐 الدومينات الخاصة للمسوّقين (بدون قاعدة بيانات: آمن للاستيراد في proxy) ====================

/** نطاق المنصة الأساسي بدون www (primeshelf.store) */
export const PLATFORM_APEX = new URL(PRODUCTION_URL).hostname.replace(/^www\./, "");

/** يوحّد اسم المضيف: أحرف صغيرة، بدون منفذ أو نقطة أخيرة */
export function normalizeHost(host: string | null | undefined): string {
  return (host ?? "").trim().toLowerCase().split(",")[0].trim().replace(/:\d+$/, "").replace(/\.$/, "");
}

function hostOf(url: string | undefined) {
  if (!url) return "";
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

const EXTRA_PLATFORM_HOSTS = new Set(
  [hostOf(process.env.NEXT_PUBLIC_SITE_URL), hostOf(process.env.NEXTAUTH_URL), hostOf(process.env.AUTH_URL), ...(process.env.PLATFORM_HOSTS ?? "").split(",")]
    .map((h) => normalizeHost(h))
    .filter(Boolean),
);

/** هل هذا المضيف تابع للمنصة نفسها (وليس دومين مسوّق)؟ */
export function isPlatformHost(host: string): boolean {
  if (!host) return true;
  if (host === PLATFORM_APEX || host.endsWith(`.${PLATFORM_APEX}`)) return true;
  if (host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1" || host === "[::1]") return true;
  if (host.endsWith(".vercel.app")) return true;
  return EXTRA_PLATFORM_HOSTS.has(host);
}

/** المضيف الذي زاره المستخدم فعلاً (Vercel يضبط x-forwarded-host ولا يمكن للزائر تزويره) */
export function requestHost(h: Headers): string {
  return normalizeHost(h.get("x-forwarded-host") ?? h.get("host"));
}

const LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
const BLOCKED_SUFFIXES = ["vercel.app", "vercel.com", "vercel.sh", "now.sh", "localhost", "local", "internal", "test", "example", "invalid"];

/**
 * يحوّل ما كتبه المسوّق ("https://www.MyDeals.com/path") إلى دومين نظيف ("www.mydeals.com").
 * يُرجع null إن لم يكن دوميناً صالحاً يمكن ربطه.
 */
export function normalizeDomainInput(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let raw = input.trim().toLowerCase();
  if (!raw || raw.length > 300) return null;
  raw = raw.replace(/^[a-z]+:\/\//, "").split(/[/?#]/)[0].replace(/:\d+$/, "").replace(/\.$/, "");
  let host: string;
  try {
    host = new URL(`http://${raw}`).hostname; // يحوّل الأحرف غير اللاتينية إلى punycode
  } catch {
    return null;
  }
  if (!host || host.length > 253 || !/^[a-z0-9.-]+$/.test(host)) return null;
  const labels = host.split(".");
  if (labels.length < 2 || !labels.every((l) => LABEL.test(l))) return null;
  if (/^\d+$/.test(labels[labels.length - 1])) return null; // عنوان IP
  if (!/^(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/.test(labels[labels.length - 1])) return null;
  if (isPlatformHost(host)) return null;
  if (BLOCKED_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`))) return null;
  return host;
}

/** اسم السجل (Host) كما يُكتب في لوحة مزوّد الدومين: "@" للنطاق الرئيسي، أو الجزء قبل النطاق */
export function dnsHostLabel(name: string, apex: string): string {
  const n = name.replace(/\.$/, "").toLowerCase();
  if (n === apex) return "@";
  return n.endsWith(`.${apex}`) ? n.slice(0, -(apex.length + 1)) : n;
}
