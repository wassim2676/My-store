import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

// قسم عرض أحدث المقالات بشكل احترافي في الصفحة الرئيسية (Server Component)
export default async function BlogSection() {
  let posts: Awaited<ReturnType<typeof prisma.post.findMany>> = [];

  try {
    posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });
  } catch (error) {
    // ⚠️ لا نُسقط الصفحة الرئيسية إذا كان جدول Post غير موجود بعد بقاعدة البيانات
    console.error("[BlogSection] فشل جلب المقالات:", error);
    return null;
  }

  if (posts.length === 0) return null;

  const t = await getTranslations("home");
  const locale = await getLocale();
  const isRtl = locale === "ar";
  const dateLocale = locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-US";

  return (
    <section className="py-12 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 lg:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-1.5 lg:mb-2">
              {t("blogSectionTitle")}
            </h2>
            <p className="text-slate-500 text-sm sm:text-lg">{t("blogSectionSubtitle")}</p>
          </div>
          <Link
            href="/blog"
            className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-1 group text-sm sm:text-base w-fit"
          >
            {t("viewAll")}
            <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: (typeof posts)[number]) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-video bg-slate-200 overflow-hidden">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-400" />
                )}
                {post.category && (
                  <span className="absolute top-3 start-3 bg-white/95 backdrop-blur-sm text-orange-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
                    {post.category}
                  </span>
                )}
              </div>
              <div className="p-5">
                <p className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })
                    : ""}
                </p>
                <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug mb-2">
                  {post.title}
                </h3>
                {post.excerpt && <p className="text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
