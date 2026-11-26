import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

// ==================== ✉️ نموذج التواصل العام ====================
// يرسل الرسالة إلى بريد التواصل (بالإنجليزية) مع Reply-To = بريد الزائر.
// حماية: حقل فخّ مخفي للروبوتات + حد بسيط لعدد الرسائل لكل IP.

const TOPICS = ["support", "partnership", "report", "feedback", "other"] as const;
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // 🍯 الروبوتات تملأ الحقل المخفي: نتظاهر بالنجاح دون إرسال
  if (typeof body.company === "string" && body.company.trim()) return NextResponse.json({ ok: true });

  const name = String(body.name ?? "").trim().slice(0, 100);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const message = String(body.message ?? "").trim().slice(0, 5000);
  const topic = TOPICS.includes(body.topic as (typeof TOPICS)[number]) ? (body.topic as string) : "other";
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 10) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) return NextResponse.json({ error: "rate" }, { status: 429 });
  hits.set(ip, [...recent, now]);

  const topicLabel = topic.charAt(0).toUpperCase() + topic.slice(1);
  const ok = await sendEmail({
    to: CONTACT_EMAIL,
    replyTo: email,
    tag: "contact",
    subject: `[${SITE_NAME} contact] ${topicLabel} — ${name}`,
    text: `New contact message\n\nName: ${name}\nEmail: ${email}\nTopic: ${topicLabel}\n\n${message}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
<h2 style="margin:0 0 12px">New contact message</h2>
<p style="margin:0"><strong>Name:</strong> ${esc(name)}<br><strong>Email:</strong> ${esc(email)}<br><strong>Topic:</strong> ${esc(topicLabel)}</p>
<div style="margin-top:16px;padding:16px;background:#f5f5f4;border-radius:8px;white-space:pre-wrap">${esc(message)}</div>
<p style="margin-top:16px;color:#666;font-size:13px">Reply directly to this email to answer ${esc(name)}.</p>
</div>`,
  });
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "send" }, { status: 502 });
}
