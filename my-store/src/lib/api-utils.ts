import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// ✅ استجابة ناجحة موحدة
export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

// ❌ استجابة خطأ موحدة
export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// 🔐 فحص الجلسة (يعيد بيانات المستخدم أو null)
export async function getAuthSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
}

// 🧩 استخراج كود خطأ Prisma (مثل P2002/P2025) بأمان دون استخدام "any"
export function getPrismaErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}