import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED", ...(category ? { category } : {}) },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true, title: true, slug: true, excerpt: true, coverImage: true,
        category: true, authorName: true, publishedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error("[PUBLIC_BLOG_API_ERROR]", error);
    return NextResponse.json({ success: false, error: "فشل جلب المقالات" }, { status: 500 });
  }
}
