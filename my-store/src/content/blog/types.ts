// ==================== 📰 مقالات المدونة (محتوى ثابت في الكود — يُبنى مسبقاً وسريع جداً للأرشفة) ====================
// النص بصيغة Markdown مبسّطة: ## عنوان، ### عنوان فرعي، فقرات، "- " قائمة، "1. " قائمة مرقّمة، "> " ملاحظة، جداول "| a | b |"
// وداخل الفقرات: **عريض** و[رابط](/blog/slug)
export type NetworkSlug =
  | "amazon" | "walmart" | "target" | "ebay" | "best-buy" | "aliexpress" | "etsy" | "home-depot" | "temu" | "sephora" | "wayfair";

export type BlogArticle = {
  slug: string;
  network: NetworkSlug;
  /** العنوان الظاهر (H1) */
  title: string;
  /** عنوان محرك البحث (≤ 60 حرفاً) */
  seoTitle: string;
  /** وصف محرك البحث (140–160 حرفاً) */
  description: string;
  keywords: string[];
  /** نوع المقال (يظهر على الغلاف) */
  kind: "Guide" | "Commissions" | "Strategy" | "Social" | "Compliance";
  published: string; // YYYY-MM-DD
  updated?: string;
  excerpt: string;
  body: string;
  faq: { q: string; a: string }[];
};

export type Network = {
  slug: NetworkSlug;
  name: string;
  program: string;
  color: string;
  ink: string;
  hubTitle: string;
  hubDescription: string;
  hubIntro: string[];
};
