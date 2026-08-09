import { NextRequest, NextResponse } from "next/server";
import { isValidLocale, localeCookieName } from "@/i18n/config";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const locale = body?.locale;

  if (!isValidLocale(locale)) {
    return NextResponse.json({ error: "لغة غير مدعومة" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true, locale });
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // سنة كاملة
    sameSite: "lax",
  });

  return response;
}
