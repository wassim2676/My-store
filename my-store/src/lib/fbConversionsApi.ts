import crypto from "crypto";

/**
 * ==================== 📊 Facebook Conversions API (CAPI) — من السيرفر ====================
 * يُرسل نفس الحدث الذي يُرسله المتصفح (Pixel) لكن مباشرة من الخادم،
 * مع نفس event_id لضمان عدم احتسابه مرتين في Meta Events Manager.
 *
 * ⚠️ يتطلب متغيّرين في .env (راجع تعليمات التركيب):
 *   - NEXT_PUBLIC_FB_PIXEL_ID  (نفس رقم البكسل المستخدم في المتصفح)
 *   - FB_CONVERSIONS_ACCESS_TOKEN  (توكن سرّي من Meta Events Manager → Conversions API → Generate Token)
 */

const GRAPH_API_VERSION = "v21.0";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/** تطبيع رقم الهاتف قبل التجزئة (يزيل المسافات والرموز، يُبقي الأرقام فقط) — مطلوب من Meta لجودة مطابقة أعلى */
function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

interface CapiEventInput {
  eventName: "PageView" | "ViewContent" | "InitiateCheckout" | "Purchase" | "Lead";
  eventId: string;
  eventSourceUrl: string;
  actionSource?: "website";
  // بيانات المستخدم (تُجزَّأ تلقائياً هنا قبل الإرسال — لا تُرسل بيانات خام غير مجزّأة أبداً لـ Meta)
  phone?: string;
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  // بيانات مخصّصة للحدث
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
}

export async function sendServerEvent(input: CapiEventInput): Promise<{ ok: boolean; error?: string }> {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const accessToken = process.env.FB_CONVERSIONS_ACCESS_TOKEN;

  // لا نُفشل عملية إنشاء الطلب أبداً بسبب غياب إعداد التتبّع — فقط نتجاهل بصمت
  if (!pixelId || !accessToken) {
    return { ok: false, error: "FB_PIXEL_ID أو FB_CONVERSIONS_ACCESS_TOKEN غير مضبوطين في .env" };
  }

  const userData: Record<string, string | string[]> = {};
  if (input.phone) userData.ph = [sha256(normalizePhone(input.phone))];
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.userAgent) userData.client_user_agent = input.userAgent;
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;

  const customData: Record<string, unknown> = {};
  if (input.value !== undefined) customData.value = input.value;
  if (input.currency) customData.currency = input.currency;
  if (input.contentName) customData.content_name = input.contentName;
  if (input.contentCategory) customData.content_category = input.contentCategory;

  const payload = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId, // ✅ نفس المعرّف المُرسل من المتصفح — أساس منع الاحتساب المزدوج
        event_source_url: input.eventSourceUrl,
        action_source: input.actionSource || "website",
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[FB_CAPI_ERROR]", res.status, errBody);
      return { ok: false, error: `Meta API returned ${res.status}` };
    }

    return { ok: true };
  } catch (error) {
    console.error("[FB_CAPI_NETWORK_ERROR]", error);
    return { ok: false, error: "network error" };
  }
}
