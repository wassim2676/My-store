"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

// ⚠️ فئات مختارة يدوياً حالياً (لا يوجد بعد نموذج Category مستقل بقاعدة البيانات)
// مُجمَّعة في 3 وحدات (وحدتان لكل وحدة) بأسلوب "بطاقة الوحدة" المعتمد في أمازون
const modules = [
  {
    slug: "energy-fitness",
    label: { ar: "الطاقة واللياقة", en: "Energy & Fitness", fr: "Énergie & Fitness" },
    items: [
      {
        slug: "energy",
        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop",
        label: { ar: "مكملات الطاقة", en: "Energy Supplements", fr: "Compléments énergétiques" },
      },
      {
        slug: "fitness",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop",
        label: { ar: "اللياقة البدنية", en: "Fitness", fr: "Fitness" },
      },
    ],
  },
  {
    slug: "beauty-health",
    label: { ar: "الجمال والعناية", en: "Beauty & Care", fr: "Beauté & Soins" },
    items: [
      {
        slug: "beauty",
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
        label: { ar: "الجمال والعناية", en: "Beauty & Care", fr: "Beauté & Soins" },
      },
      {
        slug: "health",
        image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=400&fit=crop",
        label: { ar: "العناية بالصحة", en: "Health Care", fr: "Soins de santé" },
      },
    ],
  },
  {
    slug: "natural-nutrition",
    label: { ar: "التغذية الطبيعية", en: "Natural Nutrition", fr: "Nutrition naturelle" },
    items: [
      {
        slug: "vitamins",
        image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop",
        label: { ar: "الفيتامينات", en: "Vitamins", fr: "Vitamines" },
      },
      {
        slug: "organic",
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop",
        label: { ar: "منتجات عضوية", en: "Organic", fr: "Bio" },
      },
    ],
  },
];

export default function CategoryGrid() {
  const locale = useLocale() as "ar" | "en" | "fr";
  const t = useTranslations("home");
  const isRtl = locale === "ar";
  const ChevronEnd = isRtl ? ChevronLeft : ChevronRight;

  return (
    <section className="py-8 lg:py-12 bg-slate-50">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 lg:mb-6">
          {t("shopByCategory")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {modules.map((mod) => (
            <div key={mod.slug} className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">{mod.label[locale]}</h3>
                <Link
                  href={`/marketplace?cat=${mod.slug}`}
                  aria-label={t("viewAll")}
                  className="text-slate-400 hover:text-orange-600 transition-colors flex-shrink-0"
                >
                  <ChevronEnd className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 flex-1">
                {mod.items.map((item) => (
                  <Link key={item.slug} href={`/marketplace?cat=${item.slug}`} className="group cursor-pointer">
                    <div className="relative aspect-square rounded-md overflow-hidden bg-slate-100 mb-2">
                      <Image
                        src={item.image}
                        alt={item.label[locale]}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="200px"
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-700 group-hover:text-orange-600 transition-colors leading-tight block">
                      {item.label[locale]}
                    </span>
                  </Link>
                ))}
              </div>

              <Link
                href={`/marketplace?cat=${mod.slug}`}
                className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-semibold mt-4 pt-3 border-t border-slate-100 cursor-pointer"
              >
                {t("viewAll")}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
