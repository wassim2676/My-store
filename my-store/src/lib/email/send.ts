import { CONTACT_EMAIL, EMAIL_FROM } from "@/lib/site";

// ==================== 📮 إرسال الإيميلات عبر Resend (REST مباشرة، بلا مكتبة إضافية) ====================
export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** وسم يظهر في لوحة Resend لتصنيف الإيميلات (verify, welcome, reset ...) */
  tag: string;
};

export async function sendEmail(mail: OutgoingEmail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[EMAIL] RESEND_API_KEY missing — "${mail.tag}" email to ${mail.to} not sent`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [mail.to],
        reply_to: CONTACT_EMAIL,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        tags: [{ name: "category", value: mail.tag }],
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[EMAIL] Resend ${res.status} for "${mail.tag}":`, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[EMAIL] send failed for "${mail.tag}"`, err);
    return false;
  }
}
