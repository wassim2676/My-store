import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { localeCookieName } from "@/i18n/config";
import { sendEmail } from "./send";
import { emailChangedEmail, passwordChangedEmail, resetPasswordEmail, verifyEmail, welcomeEmail, type EmailLocale } from "./templates";

// ==================== 🔐 رموز التفعيل وإعادة تعيين كلمة المرور ====================
// نستخدم جدول VerificationToken الموجود: identifier = "<kind>:<userId>".
// في القاعدة نحفظ بصمة SHA-256 فقط، والرمز الحقيقي يصل للمستخدم في الرابط — تسريب القاعدة لا يكشف أي رابط صالح.
type Kind = "verify" | "reset";

export const VERIFY_HOURS = 48;
export const RESET_MINUTES = 60;
const TTL: Record<Kind, number> = { verify: VERIFY_HOURS * 3600_000, reset: RESET_MINUTES * 60_000 };
/** أقل مدة بين إرسالين متتاليين لنفس النوع (منع الإغراق) */
const COOLDOWN_MS = 60_000;

const hash = (raw: string) => createHash("sha256").update(raw).digest("hex");

export type IssueResult = { ok: true; token: string } | { ok: false; reason: "cooldown"; retryAfter: number };

async function issueToken(kind: Kind, userId: string, force = false): Promise<IssueResult> {
  const identifier = `${kind}:${userId}`;
  const last = await prisma.verificationToken.findFirst({ where: { identifier }, orderBy: { expires: "desc" }, select: { expires: true } });
  if (last && !force) {
    const issuedAt = last.expires.getTime() - TTL[kind];
    const wait = issuedAt + COOLDOWN_MS - Date.now();
    if (wait > 0) return { ok: false, reason: "cooldown", retryAfter: Math.ceil(wait / 1000) };
  }
  const token = randomBytes(32).toString("base64url");
  // رابط واحد صالح في كل وقت: إصدار رابط جديد يُبطل القديم
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier } }),
    prisma.verificationToken.create({ data: { identifier, token: hash(token), expires: new Date(Date.now() + TTL[kind]) } }),
  ]);
  return { ok: true, token };
}

/** يتحقق من الرمز ويُرجع صاحب الحساب. consume=true يحذفه (استعمال واحد). */
export async function readToken(kind: Kind, raw: string | null | undefined, consume: boolean): Promise<string | null> {
  if (!raw || raw.length < 20 || raw.length > 100) return null;
  const row = await prisma.verificationToken.findUnique({ where: { token: hash(raw) } });
  if (!row || !row.identifier.startsWith(`${kind}:`)) return null;
  if (row.expires.getTime() < Date.now()) {
    await prisma.verificationToken.deleteMany({ where: { token: row.token } });
    return null;
  }
  if (consume) {
    // deleteMany يُرجع العدد: إن سبقنا طلب متزامن إلى نفس الرمز نرفض (لا استعمال مزدوج)
    const { count } = await prisma.verificationToken.deleteMany({ where: { token: row.token } });
    if (count === 0) return null;
  }
  return row.identifier.slice(kind.length + 1);
}

export async function clearTokens(kind: Kind, userId: string) {
  await prisma.verificationToken.deleteMany({ where: { identifier: `${kind}:${userId}` } });
}

// ==================== 🌐 لغة الإيميل ====================
/** لغة الإيميل = لغة الواجهة التي يستعملها صاحب الطلب الآن (الكوكي)، والإنجليزية افتراضياً */
export async function requestEmailLocale(): Promise<EmailLocale> {
  try {
    const v = (await cookies()).get(localeCookieName)?.value;
    return v === "ar" || v === "fr" ? v : "en";
  } catch {
    return "en";
  }
}

type Recipient = { id: string; email: string; firstName?: string | null };
const nameOf = (u: Recipient) => u.firstName?.trim() || "";

// ==================== 📨 إيميلات الحساب ====================
export async function sendVerification(user: Recipient, locale: EmailLocale, force = false): Promise<IssueResult & { sent?: boolean }> {
  const issued = await issueToken("verify", user.id, force);
  if (!issued.ok) return issued;
  const url = `${SITE_URL}/verify-email?token=${issued.token}`;
  const sent = await sendEmail({ to: user.email, tag: "verify", ...verifyEmail(locale, { name: nameOf(user), url, hours: VERIFY_HOURS }) });
  return { ...issued, sent };
}

export async function sendWelcome(user: Recipient, locale: EmailLocale, pageSlug?: string | null) {
  return sendEmail({
    to: user.email,
    tag: "welcome",
    ...welcomeEmail(locale, { name: nameOf(user), url: `${SITE_URL}/dashboard`, pageUrl: pageSlug ? `${SITE_URL}/${pageSlug}` : undefined }),
  });
}

export async function sendPasswordReset(user: Recipient, locale: EmailLocale): Promise<IssueResult & { sent?: boolean }> {
  const issued = await issueToken("reset", user.id);
  if (!issued.ok) return issued;
  const url = `${SITE_URL}/reset-password?token=${issued.token}`;
  const sent = await sendEmail({ to: user.email, tag: "reset", ...resetPasswordEmail(locale, { name: nameOf(user), url, minutes: RESET_MINUTES }) });
  return { ...issued, sent };
}

export async function sendPasswordChanged(user: Recipient, locale: EmailLocale) {
  return sendEmail({
    to: user.email,
    tag: "password-changed",
    ...passwordChangedEmail(locale, { name: nameOf(user), when: new Date(), resetUrl: `${SITE_URL}/forgot-password` }),
  });
}

/** يُرسَل إلى البريد القديم عند تغيير بريد الحساب */
export async function sendEmailChangedNotice(oldEmail: string, user: { firstName?: string | null }, newEmail: string, locale: EmailLocale) {
  return sendEmail({ to: oldEmail, tag: "email-changed", ...emailChangedEmail(locale, { name: user.firstName?.trim() || "", newEmail }) });
}
