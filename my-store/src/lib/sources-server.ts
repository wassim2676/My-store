import { cookies, headers } from "next/headers";
import { requestHost } from "@/lib/domains";
import { resolveSource, SOURCE_COOKIE, type TrafficSource } from "@/lib/sources";

/** مصدر زيارة الصفحة الحالية (للخادم): متصفح التطبيق ← utm_source ← referrer ← الكوكي ← مباشر */
export async function visitSource(utmSource?: string | string[] | null): Promise<TrafficSource> {
  const [h, c] = await Promise.all([headers(), cookies()]);
  return resolveSource(h, {
    utmSource: typeof utmSource === "string" ? utmSource : null,
    host: requestHost(h),
    cookie: c.get(SOURCE_COOKIE)?.value,
  });
}
