import type { BlogArticle, NetworkSlug } from "./types";
import { NETWORKS, NETWORK_BY_SLUG } from "./networks";
import { AMAZON_ARTICLES } from "./amazon";
import { WALMART_ARTICLES } from "./walmart";
import { TARGET_ARTICLES } from "./target";
import { EBAY_ARTICLES } from "./ebay";
import { BESTBUY_ARTICLES } from "./bestbuy";
import { ALIEXPRESS_ARTICLES } from "./aliexpress";
import { ETSY_ARTICLES } from "./etsy";
import { HOMEDEPOT_ARTICLES } from "./homedepot";
import { TEMU_ARTICLES } from "./temu";
import { SEPHORA_ARTICLES } from "./sephora";
import { WAYFAIR_ARTICLES } from "./wayfair";
import { EXTRA_RETAIL } from "./extra-retail";
import { EXTRA_MARKETPLACES } from "./extra-marketplaces";
import { EXTRA_HOME_BEAUTY } from "./extra-home-beauty";
import { DEEP_A } from "./deep-a";
import { DEEP_B } from "./deep-b";
import { DEEP_C } from "./deep-c";

export * from "./types";
export { NETWORKS, NETWORK_BY_SLUG };

const EXTRA: Record<string, string> = {};
for (const src of [EXTRA_RETAIL, EXTRA_MARKETPLACES, EXTRA_HOME_BEAUTY, DEEP_A, DEEP_B, DEEP_C]) {
  for (const [k, v] of Object.entries(src)) EXTRA[k] = EXTRA[k] ? `${EXTRA[k]}\n\n${v}` : v;
}

/** يدرج الأقسام الإضافية قبل خاتمة الروابط (Next steps / Related) إن وُجدت، وإلا في النهاية */
function withExtra(a: BlogArticle): BlogArticle {
  const extra = EXTRA[a.slug];
  if (!extra) return a;
  const lines = a.body.split("\n");
  let at = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i].trim();
    if (/^## (Next steps|Related|Keep reading|Read next)/i.test(l)) { at = i; break; }
    if (at === -1 && /^Related:/.test(l)) at = i;
  }
  const body = at === -1 ? `${a.body}\n\n${extra}` : [...lines.slice(0, at), extra, "", ...lines.slice(at)].join("\n");
  return { ...a, body };
}

// ==================== 📚 فهرس مقالات المدونة ====================
export const ARTICLES: BlogArticle[] = [
  ...AMAZON_ARTICLES, ...WALMART_ARTICLES, ...TARGET_ARTICLES, ...EBAY_ARTICLES, ...BESTBUY_ARTICLES, ...ALIEXPRESS_ARTICLES,
  ...ETSY_ARTICLES, ...HOMEDEPOT_ARTICLES, ...TEMU_ARTICLES, ...SEPHORA_ARTICLES, ...WAYFAIR_ARTICLES,
].map(withExtra).sort((a, b) => (a.published < b.published ? 1 : a.published > b.published ? -1 : a.network.localeCompare(b.network)));

const BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));

export const getArticle = (slug: string) => BY_SLUG.get(slug) ?? null;
export const articlesByNetwork = (n: NetworkSlug) => ARTICLES.filter((a) => a.network === n);

/** مقالات ذات صلة: نفس الشبكة أولاً ثم المقالات المرتبطة بالروابط ثم نفس النوع من شبكات أخرى */
export function relatedArticles(a: BlogArticle, limit = 6): BlogArticle[] {
  const linked = [...a.body.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)].map((m) => BY_SLUG.get(m[1])).filter((x): x is BlogArticle => !!x && x.slug !== a.slug);
  const sameNetwork = articlesByNetwork(a.network).filter((x) => x.slug !== a.slug);
  const sameKind = ARTICLES.filter((x) => x.kind === a.kind && x.network !== a.network);
  const out: BlogArticle[] = [];
  for (const x of [...sameNetwork, ...linked, ...sameKind]) if (!out.some((o) => o.slug === x.slug)) out.push(x);
  return out.slice(0, limit);
}

/** عدد الكلمات ووقت القراءة */
export function readingTime(a: BlogArticle) {
  const words = a.body.split(/\s+/).length + a.faq.reduce((n, f) => n + f.q.split(/\s+/).length + f.a.split(/\s+/).length, 0);
  return { words, minutes: Math.max(3, Math.round(words / 220)) };
}

// 🔗 فحص الروابط الداخلية أثناء البناء: أي رابط /blog/... لمقال غير موجود يُوقف البناء
for (const a of ARTICLES) {
  if (!NETWORK_BY_SLUG[a.network]) throw new Error(`[blog] unknown network "${a.network}" in ${a.slug}`);
  for (const m of a.body.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) {
    if (!BY_SLUG.has(m[1])) throw new Error(`[blog] broken internal link /blog/${m[1]} in ${a.slug}`);
  }
}
if (BY_SLUG.size !== ARTICLES.length) throw new Error("[blog] duplicate article slug");
for (const k of Object.keys(EXTRA)) if (!BY_SLUG.has(k)) throw new Error(`[blog] extra section for unknown slug ${k}`);
