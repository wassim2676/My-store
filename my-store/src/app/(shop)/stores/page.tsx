import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Plus } from "lucide-react";
import BrandLogo from "@/components/shop/BrandLogo";
import { PageFrame, PageHeader } from "@/components/site/StaticPage";
import { getActiveBrands } from "@/lib/brands";

export async function generateMetadata() {
  const t = await getTranslations("pages.storesPage");
  return { title: t("title"), description: t("intro") };
}

// ==================== 🏬 المتاجر المدعومة (من جدول Brand + شعارات public/brands) ====================
export default async function StoresPage() {
  const t = await getTranslations("pages.storesPage");
  const brands = await getActiveBrands().catch(() => []);

  return (
    <PageFrame>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((b) => (
            <div
              key={b.id}
              className="group flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition hover:border-white/15 hover:bg-white/[0.04]"
            >
              <span className="flex h-10 items-center text-white opacity-75 transition group-hover:opacity-100">
                <BrandLogo brand={b} size={32} fallback="name" className="[&_img]:brightness-0 [&_img]:invert [&_svg]:brightness-0 [&_svg]:invert" />
              </span>
              <span className="text-xs font-medium text-white/45">{b.name}</span>
            </div>
          ))}
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-amber-400/25 bg-amber-400/[0.03] p-5 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/30 text-amber-300">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">{t("other")}</span>
            <span className="text-xs leading-snug text-white/45">{t("otherDesc")}</span>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/register" className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-100">
            {t("cta")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </PageFrame>
  );
}
