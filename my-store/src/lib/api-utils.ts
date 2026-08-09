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