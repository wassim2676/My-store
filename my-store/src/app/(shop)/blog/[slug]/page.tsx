import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PageFrame } from "@/components/site/StaticPage";

const DATE_LOCALE: Record<string, string> = { ar: "ar-MA", en: "en-US", fr: "fr-FR" };

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });

  if (!post || post.status !== "PUBLISHED") notFound();

  const [t, locale] = await Promise.all([getTranslations("pages.blog"), getLocale()]);

  // زيادة عدد المشاهدات (بدون انتظار — لا يؤثر على سرعة عرض الصفحة)
  prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {});

  return (
    <PageFrame>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <nav className="mb-8 text-sm text-white/45">
          <Link href="/blog" className="hover:text-amber-300">{t("back")}</Link> / <span className="text-white/75">{post.title}</span>
        </nav>

        {post.category && <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">{post.category}</span>}
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-white/45">
          {t("by")} {post.authorName}
          {post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString(DATE_LOCALE[locale] ?? "en-US")}` : ""}
        </p>

        {post.coverImage && (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.04]">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="768px" priority />
          </div>
        )}

        <div className="mt-10 whitespace-pre-line text-[17px] leading-[1.85] text-white/70">{post.content}</div>
      </article>
    </PageFrame>
  );
}
