import { prisma } from "@/lib/prisma";

// ==================== 🧭 البحث عن الصفحة حسب الدومين (للـ proxy) ====================
// ذاكرة مؤقتة قصيرة لكل نسخة سيرفر: لا نسأل القاعدة في كل طلب
const cache = new Map<string, { slug: string | null; exp: number }>();

export async function slugForDomain(host: string): Promise<string | null> {
  const now = Date.now();
  const hit = cache.get(host);
  if (hit && hit.exp > now) return hit.slug;
  let slug: string | null = null;
  try {
    const page = await prisma.landingPage.findUnique({ where: { customDomain: host }, select: { slug: true } });
    slug = page?.slug ?? null;
  } catch (err) {
    console.error("[DOMAIN_LOOKUP_ERROR]", err);
    return hit?.slug ?? null;
  }
  if (cache.size > 5000) cache.clear();
  cache.set(host, { slug, exp: now + (slug ? 60_000 : 20_000) });
  return slug;
}

export function forgetDomain(host: string | null | undefined) {
  if (host) cache.delete(host);
}
