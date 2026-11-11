import { z } from "zod";
import type { Offer, Brand, LandingPage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  CURRENCIES,
  PAGE_LANGUAGES,
  PAGE_THEMES,
  SOCIAL_KEYS,
  checkSlugFormat,
  parseSpecs,
} from "@/lib/landing";

// ==================== 🔐 جلسة المسوّق ====================
export async function getMarketerSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const landingPage = await prisma.landingPage.findUnique({ where: { userId: session.user.id } });
  return { session, userId: session.user.id, landingPage };
}

// ==================== ✅ مخططات التحقق ====================
const httpUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => {
    try {
      const u = new URL(v);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  }, "الرابط يجب أن يبدأ بـ https://");

const optionalUrl = z.union([httpUrl, z.literal("")]).optional().nullable();
const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .superRefine((v, ctx) => {
    const problem = checkSlugFormat(v);
    if (problem === "format")
      ctx.addIssue({ code: "custom", message: "الاسم يجب أن يكون 3–40 حرفاً: أحرف إنجليزية صغيرة وأرقام وشرطة (-)" });
    if (problem === "reserved") ctx.addIssue({ code: "custom", message: "هذا الاسم محجوز، اختر اسماً آخر" });
  });

export const landingPageSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(2, "عنوان الصفحة قصير جداً").max(80),
  tagline: optionalText(160),
  bio: optionalText(2000),
  avatarUrl: optionalUrl,
  coverUrl: optionalUrl,
  language: z.enum(PAGE_LANGUAGES).default("en"),
  theme: z.enum(PAGE_THEMES).default("midnight"),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "صيغة اللون غير صحيحة")
    .default("#C8A24A"),
  socialLinks: z.partialRecord(z.enum(SOCIAL_KEYS), z.union([httpUrl, z.literal("")])).optional().nullable(),
  showDisclosure: z.boolean().default(true),
  disclosure: optionalText(1500),
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
  isPublished: z.boolean().default(true),
});

const nullableNumber = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : Number(v)))
  .refine((v) => v == null || (Number.isFinite(v) && v >= 0 && v < 100_000_000), "قيمة رقمية غير صحيحة");

const stringList = (maxItems: number, maxLen: number) =>
  z
    .array(z.string().trim().max(maxLen))
    .max(maxItems)
    .default([])
    .transform((arr) => arr.filter(Boolean));

export const offerSchema = z
  .object({
    title: z.string().trim().min(2, "عنوان العرض مطلوب").max(200),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9](?:[a-z0-9-]{0,118}[a-z0-9])?$/, "رابط العرض: أحرف إنجليزية صغيرة وأرقام وشرطة فقط")
      .optional()
      .or(z.literal("")),
    subtitle: optionalText(200),
    brandId: z.string().trim().optional().nullable(),
    storeName: optionalText(80),
    shortReview: z.string().trim().min(10, "اكتب مراجعة مختصرة (10 أحرف على الأقل)").max(700),
    review: optionalText(20000),
    pros: stringList(12, 200),
    cons: stringList(12, 200),
    highlights: stringList(12, 200),
    specs: z
      .array(z.object({ label: z.string().trim().max(60), value: z.string().trim().max(200) }))
      .max(30)
      .default([])
      .transform((arr) => arr.filter((s) => s.label && s.value)),
    verdict: optionalText(400),
    images: z.array(httpUrl).max(10).default([]),
    videoUrl: optionalUrl,
    affiliateUrl: httpUrl,
    buttonLabel: optionalText(60),
    couponCode: optionalText(60),
    price: nullableNumber,
    compareAt: nullableNumber,
    currency: z.enum(CURRENCIES).default("USD"),
    dealEndsAt: z
      .union([z.string(), z.null()])
      .optional()
      .transform((v) => (v ? new Date(v) : null))
      .refine((d) => d == null || !Number.isNaN(d.getTime()), "تاريخ غير صحيح"),
    rating: z
      .union([z.number(), z.string(), z.null()])
      .optional()
      .transform((v) => (v === "" || v == null ? null : Number(v)))
      .refine((v) => v == null || (v >= 0 && v <= 5), "التقييم بين 0 و 5"),
    category: optionalText(80),
    badge: optionalText(40),
    isFeatured: z.boolean().default(false),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  })
  .refine((d) => !!d.brandId || !!d.storeName, {
    message: "اختر المتجر (Amazon، Walmart…) أو اكتب اسمه",
    path: ["brandId"],
  });

export type OfferInput = z.infer<typeof offerSchema>;

export function offerDataFromInput(d: OfferInput) {
  return {
    title: d.title,
    subtitle: d.subtitle || null,
    brandId: d.brandId || null,
    storeName: d.brandId ? null : d.storeName || null,
    shortReview: d.shortReview,
    review: d.review || null,
    pros: d.pros,
    cons: d.cons,
    highlights: d.highlights,
    specs: d.specs,
    verdict: d.verdict || null,
    images: d.images,
    videoUrl: d.videoUrl || null,
    affiliateUrl: d.affiliateUrl,
    buttonLabel: d.buttonLabel || null,
    couponCode: d.couponCode || null,
    price: d.price,
    compareAt: d.compareAt,
    currency: d.currency,
    dealEndsAt: d.dealEndsAt,
    rating: d.rating,
    category: d.category || null,
    badge: d.badge || null,
    isFeatured: d.isFeatured,
    status: d.status,
  };
}

// ==================== 📈 الإحصائيات اليومية ====================
function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function bumpDailyStat(landingPageId: string, field: "views" | "clicks") {
  const date = todayUtc();
  await prisma.landingPageDailyStat.upsert({
    where: { landingPageId_date: { landingPageId, date } },
    create: { landingPageId, date, [field]: 1 },
    update: { [field]: { increment: 1 } },
  });
}

/** يتجاهل الزيارات من الروبوتات ومن طلبات الجلب المسبق */
export function isCountableRequest(h: Headers): boolean {
  const ua = h.get("user-agent") || "";
  if (!ua || /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram/i.test(ua)) return false;
  if (h.get("next-router-prefetch") || h.get("purpose") === "prefetch" || h.get("sec-purpose")?.includes("prefetch"))
    return false;
  return true;
}

// ==================== 🔁 تحويل للعميل (Decimal → number) ====================
export type OfferWithBrand = Offer & { brand: Brand | null };

export function serializeOffer(o: OfferWithBrand) {
  return {
    id: o.id,
    slug: o.slug,
    title: o.title,
    subtitle: o.subtitle,
    shortReview: o.shortReview,
    review: o.review,
    pros: o.pros,
    cons: o.cons,
    highlights: o.highlights,
    specs: parseSpecs(o.specs),
    verdict: o.verdict,
    images: o.images,
    videoUrl: o.videoUrl,
    affiliateUrl: o.affiliateUrl,
    buttonLabel: o.buttonLabel,
    couponCode: o.couponCode,
    price: o.price != null ? Number(o.price) : null,
    compareAt: o.compareAt != null ? Number(o.compareAt) : null,
    currency: o.currency,
    dealEndsAt: o.dealEndsAt ? o.dealEndsAt.toISOString() : null,
    rating: o.rating,
    category: o.category,
    badge: o.badge,
    isFeatured: o.isFeatured,
    status: o.status,
    position: o.position,
    views: o.views,
    clicks: o.clicks,
    brandId: o.brandId,
    storeName: o.storeName,
    brand: o.brand
      ? {
          id: o.brand.id,
          name: o.brand.name,
          logoSvg: o.brand.logoSvg,
          logoUrl: o.brand.logoUrl,
          accentColor: o.brand.accentColor,
          buyLabel: o.brand.buyLabel,
        }
      : null,
    updatedAt: o.updatedAt.toISOString(),
  };
}

export type SerializedOffer = ReturnType<typeof serializeOffer>;

export function serializeLandingPage(p: LandingPage) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    bio: p.bio,
    avatarUrl: p.avatarUrl,
    coverUrl: p.coverUrl,
    language: p.language,
    theme: p.theme,
    accentColor: p.accentColor,
    socialLinks: (p.socialLinks as Record<string, string> | null) ?? {},
    showDisclosure: p.showDisclosure,
    disclosure: p.disclosure,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    isPublished: p.isPublished,
    views: p.views,
  };
}

export type SerializedLandingPage = ReturnType<typeof serializeLandingPage>;

/** يولّد slug فريد للعرض داخل صفحة المسوّق */
export async function uniqueOfferSlug(landingPageId: string, base: string, excludeId?: string): Promise<string> {
  const root = base || `offer-${Date.now().toString(36)}`;
  let candidate = root;
  for (let i = 2; i < 50; i++) {
    const exists = await prisma.offer.findFirst({
      where: { landingPageId, slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!exists) return candidate;
    candidate = `${root.slice(0, 110)}-${i}`;
  }
  return `${root.slice(0, 100)}-${Date.now().toString(36)}`;
}
