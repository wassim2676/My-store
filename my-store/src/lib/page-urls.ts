import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { requestHost } from "@/lib/domains";

// ==================== 🔗 روابط صفحة المسوّق (دومين المنصة أو دومينه الخاص) ====================

type DomainFields = { slug: string; customDomain: string | null; customDomainVerifiedAt: Date | null };

/** الدومين الخاص فعّال (DNS مضبوط وتحقّقنا منه) */
export const hasActiveDomain = (p: DomainFields) => !!(p.customDomain && p.customDomainVerifiedAt);

/** الرابط المطلق لمسار داخل صفحة المسوّق: https://mydeals.com/x أو https://primeshelf.store/slug/x */
export function pageAbsoluteUrl(p: DomainFields, sub = ""): string {
  if (hasActiveDomain(p)) return `https://${p.customDomain}${sub || "/"}`;
  return `${SITE_URL}/${p.slug}${sub}`;
}

/**
 * سياق الروابط لطلب الصفحة الحالي:
 *  - base: بادئة الروابط الداخلية ("" على الدومين الخاص، "/slug" على المنصة)
 *  - abs(): رابط مطلق رسمي (canonical / JSON-LD)
 * ويحوّل زوار رابط المنصة إلى الدومين الخاص متى أصبح فعّالاً (المالك يبقى للمعاينة).
 */
export async function pageLinks(p: DomainFields, opts: { sub?: string; isOwner?: boolean; redirectToDomain?: boolean } = {}) {
  const h = await headers();
  const onCustomDomain = !!p.customDomain && requestHost(h) === p.customDomain;
  if (opts.redirectToDomain !== false && !onCustomDomain && hasActiveDomain(p) && !opts.isOwner) {
    redirect(pageAbsoluteUrl(p, opts.sub ?? ""));
  }
  return {
    base: onCustomDomain ? "" : `/${p.slug}`,
    onCustomDomain,
    abs: (sub = "") => pageAbsoluteUrl(p, sub),
  };
}
