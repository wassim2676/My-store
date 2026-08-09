import Link from "next/link";
import Image from "next/image";
import { Newspaper } from "lucide-react";
import { prisma } from "@/lib/prisma";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8">المدونة والمقالات</h1>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
            <Newspaper className="w-10 h-10" />
            <p className="text-sm font-medium">لا توجد مقالات منشورة بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: (typeof posts)[number]) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                <div className="relative aspect-video bg-slate-100">
                  {post.coverImage && (
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                  )}
                </div>
                <div className="p-5">
                  {post.category && <span className="text-[10px] font-bold text-orange-600 uppercase">{post.category}</span>}
                  <h2 className="font-bold text-slate-900 mt-1 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <MegaFooter />
    </div>
  );
}
