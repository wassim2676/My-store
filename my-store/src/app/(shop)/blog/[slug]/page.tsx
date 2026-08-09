import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });

  if (!post || post.status !== "PUBLISHED") notFound();

  // زيادة عدد المشاهدات (بدون انتظار — لا يؤثر على سرعة عرض الصفحة)
  prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {});

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/blog" className="hover:text-orange-600">المدونة</Link> / <span className="text-slate-800">{post.title}</span>
        </nav>

        {post.coverImage && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 bg-slate-100">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="768px" priority />
          </div>
        )}

        {post.category && <span className="text-xs font-bold text-orange-600 uppercase">{post.category}</span>}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 mb-3">{post.title}</h1>
        <p className="text-sm text-slate-400 mb-8">
          بقلم {post.authorName} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ar-MA") : ""}
        </p>

        <article className="prose prose-slate max-w-none whitespace-pre-line leading-relaxed text-slate-700">
          {post.content}
        </article>
      </main>

      <MegaFooter />
    </div>
  );
}
