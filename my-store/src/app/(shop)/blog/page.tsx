import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageFrame, PageHeader } from "@/components/site/StaticPage";

export async function generateMetadata() {
  const t = await getTranslations("pages.blog");
  return { title: t("title"), description: t("intro") };
}

export default async function BlogPage() {
  const t = await getTranslations("pages.blog");
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <PageFrame>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 py-24 text-white/40">
            <Newspaper className="h-10 w-10" />
            <p className="text-sm font-medium">{t("empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: (typeof posts)[number]) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] transition hover:-translate-y-1 hover:border-amber-400/30"
              >
                <div className="relative aspect-video bg-white/[0.04]">
                  {post.coverImage && (
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                  )}
                </div>
                <div className="p-5">
                  {post.category && <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">{post.category}</span>}
                  <h2 className="mt-1.5 line-clamp-2 font-serif text-lg font-semibold transition-colors group-hover:text-amber-200">{post.title}</h2>
                  {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-white/50">{post.excerpt}</p>}
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
                    {t("read")}
                    <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageFrame>
  );
}
