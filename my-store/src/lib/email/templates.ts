import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

// ==================== ✉️ قوالب إيميلات المنصة ====================
// تصميم نظيف بأسلوب المنصات الكبرى: بطاقة بيضاء، ترويسة داكنة بشريط ذهبي، زر واحد واضح،
// رابط احتياطي، وتذييل يشرح سبب وصول الرسالة. جداول + أنماط مضمّنة لتعمل في Gmail/Outlook/Apple Mail.
// كل قالب يُرجع html + نص عادي (يحسّن الوصول لصندوق الوارد).

export type EmailLocale = "en" | "fr" | "ar";
export type Rendered = { subject: string; html: string; text: string };

const C = {
  page: "#F2F3F5",
  card: "#FFFFFF",
  border: "#E3E5E8",
  head: "#0B0F17",
  gold: "#E9AE3B",
  ink: "#0F1111",
  body: "#3C4149",
  muted: "#6B7280",
  soft: "#F7F8FA",
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const host = SITE_URL.replace(/^https?:\/\//, "");

// ==================== 🌐 نصوص الإيميلات بثلاث لغات ====================
const T = {
  en: {
    hi: (n: string) => (n ? `Hi ${n},` : "Hi there,"),
    fallback: "Button not working? Copy and paste this link into your browser:",
    footerWhy: "You're receiving this email because of activity on your account.",
    footerHelp: "Need help? Contact us at",
    rights: "All rights reserved.",
    ignore: "If you didn't request this, you can safely ignore this email.",
    team: `— The ${SITE_NAME} team`,
    verify: {
      subject: `Confirm your email for ${SITE_NAME}`,
      pre: "One quick step to activate your account.",
      title: "Confirm your email address",
      body: "Thanks for joining. Please confirm this is your email address so we can activate your account and keep it secure.",
      cta: "Confirm email",
      note: (h: number) => `This link expires in ${h} hours.`,
    },
    welcome: {
      subject: `Welcome to ${SITE_NAME}`,
      pre: "Your account is ready. Here's how to get started.",
      title: "Your account is ready",
      body: "Your email is confirmed. You can now build a page that turns your recommendations into sales.",
      steps: ["Design your page: name, colors, fonts and logo.", "Add your first offer with images and your affiliate link.", "Publish articles to bring visitors from Google.", "Share your page link and follow your clicks in the dashboard."],
      stepsTitle: "Get started in 4 steps",
      pageLabel: "Your page:",
      cta: "Go to my dashboard",
    },
    reset: {
      subject: `Reset your ${SITE_NAME} password`,
      pre: "Use this link to choose a new password.",
      title: "Reset your password",
      body: "We received a request to reset the password for your account. Click the button below to choose a new one.",
      cta: "Reset password",
      note: (m: number) => `This link expires in ${m} minutes and can only be used once.`,
    },
    changed: {
      subject: `Your ${SITE_NAME} password was changed`,
      pre: "This is a confirmation of a change to your account.",
      title: "Your password was changed",
      body: "The password for your account was just changed.",
      warn: "If you didn't make this change, reset your password right away and contact us.",
      cta: "Reset password",
    },
    emailChanged: {
      subject: `The email on your ${SITE_NAME} account was changed`,
      pre: "This is a confirmation of a change to your account.",
      title: "Your sign-in email was changed",
      body: (to: string) => `The email address for your account was changed to ${to}. You'll use the new address to sign in from now on.`,
      warn: "If you didn't make this change, contact us immediately so we can secure your account.",
      cta: "Contact support",
    },
  },
  fr: {
    hi: (n: string) => (n ? `Bonjour ${n},` : "Bonjour,"),
    fallback: "Le bouton ne fonctionne pas ? Copiez et collez ce lien dans votre navigateur :",
    footerWhy: "Vous recevez cet e-mail en raison d'une activité sur votre compte.",
    footerHelp: "Besoin d'aide ? Écrivez-nous à",
    rights: "Tous droits réservés.",
    ignore: "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.",
    team: `— L'équipe ${SITE_NAME}`,
    verify: {
      subject: `Confirmez votre e-mail pour ${SITE_NAME}`,
      pre: "Une dernière étape pour activer votre compte.",
      title: "Confirmez votre adresse e-mail",
      body: "Merci de nous avoir rejoints. Confirmez qu'il s'agit bien de votre adresse pour activer votre compte et le sécuriser.",
      cta: "Confirmer mon e-mail",
      note: (h: number) => `Ce lien expire dans ${h} heures.`,
    },
    welcome: {
      subject: `Bienvenue sur ${SITE_NAME}`,
      pre: "Votre compte est prêt. Voici comment démarrer.",
      title: "Votre compte est prêt",
      body: "Votre e-mail est confirmé. Vous pouvez maintenant créer une page qui transforme vos recommandations en ventes.",
      steps: ["Personnalisez votre page : nom, couleurs, polices et logo.", "Ajoutez votre première offre avec images et lien d'affiliation.", "Publiez des articles pour attirer des visiteurs depuis Google.", "Partagez votre lien et suivez vos clics dans le tableau de bord."],
      stepsTitle: "Démarrez en 4 étapes",
      pageLabel: "Votre page :",
      cta: "Accéder à mon tableau de bord",
    },
    reset: {
      subject: `Réinitialisez votre mot de passe ${SITE_NAME}`,
      pre: "Utilisez ce lien pour choisir un nouveau mot de passe.",
      title: "Réinitialisez votre mot de passe",
      body: "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.",
      cta: "Réinitialiser le mot de passe",
      note: (m: number) => `Ce lien expire dans ${m} minutes et ne peut être utilisé qu'une seule fois.`,
    },
    changed: {
      subject: `Votre mot de passe ${SITE_NAME} a été modifié`,
      pre: "Confirmation d'une modification de votre compte.",
      title: "Votre mot de passe a été modifié",
      body: "Le mot de passe de votre compte vient d'être modifié.",
      warn: "Si vous n'êtes pas à l'origine de ce changement, réinitialisez immédiatement votre mot de passe et contactez-nous.",
      cta: "Réinitialiser le mot de passe",
    },
    emailChanged: {
      subject: `L'e-mail de votre compte ${SITE_NAME} a été modifié`,
      pre: "Confirmation d'une modification de votre compte.",
      title: "Votre e-mail de connexion a été modifié",
      body: (to: string) => `L'adresse e-mail de votre compte a été remplacée par ${to}. Vous utiliserez désormais cette adresse pour vous connecter.`,
      warn: "Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement pour sécuriser votre compte.",
      cta: "Contacter le support",
    },
  },
  ar: {
    hi: (n: string) => (n ? `مرحباً ${n}،` : "مرحباً،"),
    fallback: "الزر لا يعمل؟ انسخ هذا الرابط والصقه في المتصفح:",
    footerWhy: "وصلتك هذه الرسالة بسبب نشاط على حسابك.",
    footerHelp: "تحتاج مساعدة؟ راسلنا على",
    rights: "جميع الحقوق محفوظة.",
    ignore: "إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة بأمان.",
    team: `— فريق ${SITE_NAME}`,
    verify: {
      subject: `أكّد بريدك الإلكتروني في ${SITE_NAME}`,
      pre: "خطوة واحدة لتفعيل حسابك.",
      title: "أكّد بريدك الإلكتروني",
      body: "شكراً لانضمامك. أكّد أن هذا بريدك الإلكتروني لنفعّل حسابك ونحافظ على أمانه.",
      cta: "تأكيد البريد الإلكتروني",
      note: (h: number) => `ينتهي هذا الرابط خلال ${h} ساعة.`,
    },
    welcome: {
      subject: `مرحباً بك في ${SITE_NAME}`,
      pre: "حسابك جاهز. إليك طريقة البدء.",
      title: "حسابك جاهز",
      body: "تم تأكيد بريدك. يمكنك الآن بناء صفحة تحوّل توصياتك إلى مبيعات.",
      steps: ["صمّم صفحتك: الاسم والألوان والخطوط والشعار.", "أضف أول عرض بالصور ورابط الأفلييت الخاص بك.", "انشر مقالات لجلب زوار من Google.", "شارك رابط صفحتك وتابع النقرات من لوحة التحكم."],
      stepsTitle: "ابدأ في 4 خطوات",
      pageLabel: "رابط صفحتك:",
      cta: "الذهاب إلى لوحة التحكم",
    },
    reset: {
      subject: `إعادة تعيين كلمة المرور في ${SITE_NAME}`,
      pre: "استخدم هذا الرابط لاختيار كلمة مرور جديدة.",
      title: "إعادة تعيين كلمة المرور",
      body: "وصلنا طلب لإعادة تعيين كلمة مرور حسابك. اضغط الزر أدناه لاختيار كلمة مرور جديدة.",
      cta: "إعادة تعيين كلمة المرور",
      note: (m: number) => `ينتهي هذا الرابط خلال ${m} دقيقة ويُستخدم مرة واحدة فقط.`,
    },
    changed: {
      subject: `تم تغيير كلمة مرور حسابك في ${SITE_NAME}`,
      pre: "تأكيد لتغيير تم على حسابك.",
      title: "تم تغيير كلمة المرور",
      body: "تم للتو تغيير كلمة مرور حسابك.",
      warn: "إذا لم تقم بهذا التغيير، أعد تعيين كلمة المرور فوراً وتواصل معنا.",
      cta: "إعادة تعيين كلمة المرور",
    },
    emailChanged: {
      subject: `تم تغيير بريد حسابك في ${SITE_NAME}`,
      pre: "تأكيد لتغيير تم على حسابك.",
      title: "تم تغيير بريد تسجيل الدخول",
      body: (to: string) => `تم تغيير البريد الإلكتروني لحسابك إلى ${to}. ستستخدم العنوان الجديد لتسجيل الدخول من الآن.`,
      warn: "إذا لم تقم بهذا التغيير، تواصل معنا فوراً لنؤمّن حسابك.",
      cta: "التواصل مع الدعم",
    },
  },
};

// ==================== 🧱 الهيكل المشترك ====================
type Block = string;

function layout(locale: EmailLocale, preheader: string, blocks: Block[]): string {
  const rtl = locale === "ar";
  const dir = rtl ? "rtl" : "ltr";
  const align = rtl ? "right" : "left";
  const font = rtl ? "Tahoma, Arial, sans-serif" : "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const t = T[locale];
  return `<!doctype html>
<html lang="${locale}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${esc(SITE_NAME)}</title>
</head>
<body style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
<tr><td align="center" style="padding:32px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="${dir}" style="max-width:560px;background:${C.card};border:1px solid ${C.border};border-radius:10px;overflow:hidden;font-family:${font};text-align:${align};">
    <tr><td style="background:${C.head};padding:20px 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" dir="ltr"><tr>
        <td style="width:26px;height:26px;background:${C.gold};border-radius:7px;font-size:0;line-height:0;">&nbsp;</td>
        <td style="padding-left:10px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;letter-spacing:-0.3px;color:#FFFFFF;">${esc(SITE_NAME)}</td>
      </tr></table>
    </td></tr>
    <tr><td style="height:3px;background:${C.gold};font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td style="padding:36px 32px 12px;">
      ${blocks.join("\n      ")}
    </td></tr>
    <tr><td style="padding:8px 32px 32px;font-size:15px;line-height:24px;color:${C.body};">${esc(t.team)}</td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="${dir}" style="max-width:560px;font-family:${font};text-align:center;">
    <tr><td style="padding:22px 24px 0;font-size:12px;line-height:19px;color:${C.muted};">
      ${esc(t.footerWhy)}<br>
      ${esc(t.footerHelp)} <a href="mailto:${CONTACT_EMAIL}" style="color:${C.muted};text-decoration:underline;">${CONTACT_EMAIL}</a><br><br>
      © ${new Date().getFullYear()} ${esc(SITE_NAME)} · <a href="${SITE_URL}" style="color:${C.muted};text-decoration:none;">${esc(host)}</a> · ${esc(t.rights)}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

const h1 = (s: string) => `<h1 style="margin:0 0 18px;font-size:23px;line-height:30px;font-weight:700;color:${C.ink};">${esc(s)}</h1>`;
const p = (s: string) => `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:${C.body};">${esc(s)}</p>`;
const small = (s: string) => `<p style="margin:0 0 16px;font-size:13px;line-height:20px;color:${C.muted};">${esc(s)}</p>`;

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr>
        <td style="border-radius:8px;background:${C.gold};">
          <a href="${esc(href)}" target="_blank" style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:700;color:${C.ink};text-decoration:none;border-radius:8px;">${esc(label)}</a>
        </td></tr></table>`;
}

function fallbackLink(locale: EmailLocale, href: string) {
  return `<p style="margin:0 0 6px;font-size:13px;line-height:20px;color:${C.muted};">${esc(T[locale].fallback)}</p>
      <p dir="ltr" style="margin:0 0 22px;font-size:12px;line-height:18px;word-break:break-all;text-align:left;"><a href="${esc(href)}" style="color:#2A6CB0;text-decoration:underline;">${esc(href)}</a></p>`;
}

function notice(s: string, tone: "info" | "warn" = "info") {
  const bg = tone === "warn" ? "#FFF7E8" : C.soft;
  const border = tone === "warn" ? "#F2D08B" : C.border;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;"><tr>
        <td style="background:${bg};border:1px solid ${border};border-radius:8px;padding:14px 16px;font-size:14px;line-height:21px;color:${C.body};">${esc(s)}</td></tr></table>`;
}

function steps(title: string, items: string[]) {
  const rows = items
    .map(
      (s, i) => `<tr>
          <td valign="top" style="width:30px;padding:0 0 12px;"><div style="width:24px;height:24px;border-radius:12px;background:${C.head};color:#FFFFFF;font-size:12px;font-weight:700;line-height:24px;text-align:center;">${i + 1}</div></td>
          <td valign="top" style="padding:2px 8px 12px;font-size:15px;line-height:21px;color:${C.body};">${esc(s)}</td></tr>`,
    )
    .join("");
  return `<p style="margin:6px 0 14px;font-size:13px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:${C.ink};">${esc(title)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;">${rows}</table>`;
}

const plain = (...lines: (string | undefined | false)[]) =>
  [...lines.filter((l): l is string => typeof l === "string"), "", `${SITE_NAME} · ${host}`, CONTACT_EMAIL].join("\n");

// ==================== 📨 القوالب ====================
export function verifyEmail(locale: EmailLocale, o: { name: string; url: string; hours: number }): Rendered {
  const t = T[locale];
  const v = t.verify;
  return {
    subject: v.subject,
    html: layout(locale, v.pre, [h1(v.title), p(t.hi(o.name)), p(v.body), button(o.url, v.cta), small(v.note(o.hours)), fallbackLink(locale, o.url), small(t.ignore)]),
    text: plain(t.hi(o.name), "", v.body, "", `${v.cta}: ${o.url}`, "", v.note(o.hours), t.ignore, "", t.team),
  };
}

export function welcomeEmail(locale: EmailLocale, o: { name: string; url: string; pageUrl?: string }): Rendered {
  const t = T[locale];
  const w = t.welcome;
  return {
    subject: w.subject,
    html: layout(locale, w.pre, [h1(w.title), p(t.hi(o.name)), p(w.body), steps(w.stepsTitle, w.steps), button(o.url, w.cta), o.pageUrl ? small(`${w.pageLabel} ${o.pageUrl}`) : ""]),
    text: plain(t.hi(o.name), "", w.body, "", w.stepsTitle, ...w.steps.map((s, i) => `${i + 1}. ${s}`), "", `${w.cta}: ${o.url}`, "", t.team),
  };
}

export function resetPasswordEmail(locale: EmailLocale, o: { name: string; url: string; minutes: number }): Rendered {
  const t = T[locale];
  const r = t.reset;
  return {
    subject: r.subject,
    html: layout(locale, r.pre, [h1(r.title), p(t.hi(o.name)), p(r.body), button(o.url, r.cta), small(r.note(o.minutes)), fallbackLink(locale, o.url), notice(t.ignore)]),
    text: plain(t.hi(o.name), "", r.body, "", `${r.cta}: ${o.url}`, "", r.note(o.minutes), t.ignore, "", t.team),
  };
}

export function passwordChangedEmail(locale: EmailLocale, o: { name: string; when: Date; resetUrl: string }): Rendered {
  const t = T[locale];
  const c = t.changed;
  const when = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short", timeZone: "UTC" }).format(o.when) + " UTC";
  return {
    subject: c.subject,
    html: layout(locale, c.pre, [h1(c.title), p(t.hi(o.name)), p(c.body), notice(when), notice(c.warn, "warn"), button(o.resetUrl, c.cta)]),
    text: plain(t.hi(o.name), "", c.body, when, "", c.warn, `${c.cta}: ${o.resetUrl}`, "", t.team),
  };
}

export function emailChangedEmail(locale: EmailLocale, o: { name: string; newEmail: string }): Rendered {
  const t = T[locale];
  const c = t.emailChanged;
  const contact = `mailto:${CONTACT_EMAIL}`;
  return {
    subject: c.subject,
    html: layout(locale, c.pre, [h1(c.title), p(t.hi(o.name)), p(c.body(o.newEmail)), notice(c.warn, "warn"), button(contact, c.cta)]),
    text: plain(t.hi(o.name), "", c.body(o.newEmail), "", c.warn, CONTACT_EMAIL, "", t.team),
  };
}
