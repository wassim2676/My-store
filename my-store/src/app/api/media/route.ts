import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ==================== 🖼️ POST /api/media: رفع صورة (للمستخدم المسجّل فقط) ====================
// الصور النقطية تصل مضغوطة من المتصفح (WebP ≤ 1600px). SVG يُقبل كما هو بعد فحص بسيط.
const ALLOWED = new Set(["image/webp", "image/png", "image/jpeg", "image/gif", "image/avif", "image/svg+xml"]);
const MAX_BYTES = 3 * 1024 * 1024; // أقل من حد Vercel لجسم الطلب (4.5MB)
const MAX_SVG_BYTES = 400 * 1024;
const MAX_FILES_PER_USER = 2000;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ success: false, error: "no_file" }, { status: 400 });

  const mime = file.type.toLowerCase();
  if (!ALLOWED.has(mime)) return NextResponse.json({ success: false, error: "type" }, { status: 415 });
  if (file.size > (mime === "image/svg+xml" ? MAX_SVG_BYTES : MAX_BYTES))
    return NextResponse.json({ success: false, error: "too_large" }, { status: 413 });

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (mime === "image/svg+xml") {
    const text = new TextDecoder().decode(bytes);
    // نرفض أي SVG يحتوي سكربت أو معالجات أحداث (يُعرض أصلاً داخل <img> حيث لا تعمل السكربتات، لكن احتياطاً)
    if (!/<svg[\s>]/i.test(text) || /<script|\son[a-z]+\s*=|javascript:|<foreignObject/i.test(text))
      return NextResponse.json({ success: false, error: "svg_unsafe" }, { status: 400 });
  }

  const count = await prisma.media.count({ where: { userId: session.user.id } });
  if (count >= MAX_FILES_PER_USER) return NextResponse.json({ success: false, error: "quota" }, { status: 429 });

  const media = await prisma.media.create({
    data: { userId: session.user.id, mime, size: bytes.byteLength, data: bytes },
    select: { id: true },
  });
  return NextResponse.json({ success: true, url: `/api/media/${media.id}` }, { status: 201 });
}
