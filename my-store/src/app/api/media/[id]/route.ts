import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// ==================== 🖼️ GET /api/media/{id}: تقديم ملف مرفوع ====================
// المعرّف عشوائي ولا يتغيّر محتواه أبداً → كاش دائم في المتصفح وشبكة Vercel (لا ضغط على قاعدة البيانات)
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]{20,40}$/.test(id)) return new Response("Not found", { status: 404 });

  const media = await prisma.media.findUnique({ where: { id }, select: { mime: true, data: true } });
  if (!media) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(media.data), {
    headers: {
      "Content-Type": media.mime,
      "Content-Length": String(media.data.byteLength),
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // SVG مفتوح مباشرة لا يستطيع تشغيل أي سكربت
      "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
    },
  });
}
