"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

// ⚠️ فئات مختارة يدوياً حالياً (لا يوجد بعد نموذج Category مستقل بقاعدة البيانات)
// هذا سيتحول لاحقاً إلى بيانات حقيقية عند بناء نظام تصنيفات كامل للأدمن
const categories = [
  {
    slug: "energy",
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300&h=300&fit=crop",
    label: { ar: "مكملات الطاقة", en: "Energy Supplements", fr: "Compléments énergétiques" },
  },
  {
    slug: "health",
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=300&fit=crop",
    label: { ar: "العناية بالصحة", en: "Health Care", fr: "Soins de santé" },
  },
  {
    slug: "beauty",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop",
    label: { ar: "الجمال والعناية", en: "Beauty & Care", fr: "Beauté & Soins" },
  },
  {
    slug: "vitamins",
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&h=300&fit=crop",
    label: { ar: "الفيتامينات", en: "Vitamins", fr: "Vitamines" },
  },
  {
    slug: "fitness",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=300&fit=crop",
    label: { ar: "اللياقة البدنية", en: "Fitness", fr: "Fitness" },
  },
  {
    slug: "organic",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=300&fit=crop",
    label: { ar: "منتجات عضوية", en: "Organic", fr: "Bio" },
  },
];

export default function CategoryGrid() {
  const locale = useLocale() as "ar" | "en" | "fr";
  const t = useTranslations("home");

  return (
    <section className="py-10 lg:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mb-6 lg:mb-8">
          {t("shopByCategory")}
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/marketplace?cat=${cat.slug}`}
              className="group flex flex-col items-center gap-2 sm:gap-3 cursor-pointer"
            >
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-orange-400 transition-all shadow-sm group-hover:shadow-lg group-hover:scale-105 duration-300">
                <Image src={cat.image} alt={cat.label[locale]} fill className="object-cover" sizes="120px" />
              </div>
              <span className="text-[11px] sm:text-sm font-semibold text-slate-700 text-center group-hover:text-orange-600 transition-colors leading-tight">
                {cat.label[locale]}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
