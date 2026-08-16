"use client";

/**
 * ==================== 📊 Facebook Pixel — مكتبة المتصفح ====================
 * توليد event_id موحّد يُستخدم في كل من Pixel (متصفح) وConversions API (سيرفر)
 * لمنع احتساب نفس الحدث مرتين (Deduplication) — هذا أساس أي إعداد احترافي.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/** توليد معرّف حدث فريد (UUID مبسّط كافٍ لهذا الغرض) */
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/** قراءة كوكي fbp أو fbc التي يضعها بكسل فيسبوك تلقائياً في المتصفح — ضرورية لجودة مطابقة CAPI */
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export function getFbBrowserIds() {
  return {
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
  };
}

/**
 * إطلاق حدث بكسل من المتصفح، مع تمرير event_id موحّد اختياري
 * (نفس المعرّف يُرسل لاحقاً إلى Conversions API من السيرفر لمنع الاحتساب المزدوج)
 */
export function fbTrack(
  eventName: "PageView" | "ViewContent" | "InitiateCheckout" | "Purchase" | "Lead",
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (eventId) {
    window.fbq("track", eventName, params || {}, { eventID: eventId });
  } else {
    window.fbq("track", eventName, params || {});
  }
}
