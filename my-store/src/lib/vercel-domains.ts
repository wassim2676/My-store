import { dnsHostLabel } from "@/lib/domains";

// ==================== ▲ ربط الدومينات بمشروع Vercel (REST API) ====================
// المتغيرات المطلوبة على السيرفر:
//   VERCEL_API_TOKEN  : من vercel.com/account/tokens (صلاحية على الفريق/المشروع)
//   VERCEL_PROJECT_ID : Project Settings → General → Project ID
//   VERCEL_TEAM_ID    : (اختياري) إن كان المشروع داخل فريق: Team Settings → Team ID
const API = "https://api.vercel.com";

function env() {
  return {
    token: process.env.VERCEL_API_TOKEN?.trim(),
    project: process.env.VERCEL_PROJECT_ID?.trim(),
    team: process.env.VERCEL_TEAM_ID?.trim(),
  };
}

export const domainsEnabled = () => {
  const e = env();
  return !!(e.token && e.project);
};

type VercelError = { error?: { code?: string; message?: string } };
type Res<T> = { ok: boolean; status: number; data: T & VercelError };

async function call<T>(path: string, init: RequestInit = {}): Promise<Res<T>> {
  const { token, team } = env();
  const url = new URL(API + path);
  if (team) url.searchParams.set("teamId", team);
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const data = (await res.json().catch(() => ({}))) as T & VercelError;
  if (!res.ok && res.status !== 404) console.error("[VERCEL_DOMAINS]", init.method ?? "GET", path, res.status, data.error);
  return { ok: res.ok, status: res.status, data };
}

const p = () => encodeURIComponent(env().project!);
const d = (name: string) => encodeURIComponent(name);

type ProjectDomain = {
  name: string;
  apexName: string;
  verified: boolean;
  redirect?: string | null;
  verification?: { type: string; domain: string; value: string; reason: string }[];
};

type DomainConfig = {
  misconfigured: boolean;
  recommendedIPv4?: { rank: number; value: string[] }[];
  recommendedCNAME?: { rank: number; value: string }[];
};

export type AddResult =
  | { ok: true; apexName: string }
  | { ok: false; error: "in_use" | "invalid_domain" | "provider_error" };

/** يضيف الدومين للمشروع، ومعه نسخة www (أو بدونها) تحوّل إليه تلقائياً */
export async function addDomain(name: string): Promise<AddResult> {
  const r = await call<ProjectDomain>(`/v10/projects/${p()}/domains`, { method: "POST", body: JSON.stringify({ name }) });
  if (!r.ok) {
    const code = r.data.error?.code ?? "";
    if (r.status === 409 || /in_use|already|taken|exists/i.test(code)) {
      // مضاف مسبقاً لنفس المشروع؟ نعتبره نجاحاً
      const existing = await call<ProjectDomain>(`/v9/projects/${p()}/domains/${d(name)}`);
      if (existing.ok && !existing.data.redirect) return { ok: true, apexName: existing.data.apexName };
      return { ok: false, error: "in_use" };
    }
    if (r.status === 400) return { ok: false, error: "invalid_domain" };
    return { ok: false, error: "provider_error" };
  }
  const apexName = r.data.apexName || name;
  const companion = companionOf(name, apexName);
  if (companion) {
    await call(`/v10/projects/${p()}/domains`, {
      method: "POST",
      body: JSON.stringify({ name: companion, redirect: name, redirectStatusCode: 308 }),
    }).catch(() => null);
  }
  return { ok: true, apexName };
}

/** example.com ⇄ www.example.com (لا نضيف رفيقاً للنطاقات الفرعية الأخرى مثل shop.example.com) */
export function companionOf(name: string, apexName: string): string | null {
  if (name === apexName) return `www.${apexName}`;
  if (name === `www.${apexName}`) return apexName;
  return null;
}

export async function removeDomain(name: string) {
  const info = await call<ProjectDomain>(`/v9/projects/${p()}/domains/${d(name)}`);
  const companion = info.ok ? companionOf(name, info.data.apexName) : null;
  if (companion) {
    const c = await call<ProjectDomain>(`/v9/projects/${p()}/domains/${d(companion)}`);
    // لا نحذف الرفيق إلا إن كنا نحن من أضفناه كتحويل لهذا الدومين
    if (c.ok && c.data.redirect === name) await call(`/v9/projects/${p()}/domains/${d(companion)}`, { method: "DELETE" });
  }
  const r = await call(`/v9/projects/${p()}/domains/${d(name)}`, { method: "DELETE" });
  return r.ok || r.status === 404;
}

export type DnsRecord = { type: "A" | "CNAME" | "TXT"; host: string; value: string; ok: boolean; optional?: boolean };

export type DomainStatus = {
  domain: string;
  /** active: يعمل | dns: بانتظار سجلات DNS | verify: يحتاج سجل TXT لإثبات الملكية | missing: غير موجود في Vercel */
  state: "active" | "dns" | "verify" | "missing";
  records: DnsRecord[];
};

async function config(name: string) {
  const r = await call<DomainConfig>(`/v6/domains/${d(name)}/config?projectIdOrName=${p()}`);
  return r.ok ? r.data : null;
}

// 🌍 عناوين Vercel التي ثبت وصولها من كل الشبكات التي اختبرناها.
// عناوين أخرى يقترحها Vercel (مثل 64.29.17.x و216.198.79.65) لا تصل إليها بعض الشبكات (منها مزوّدون في المغرب)،
// وCNAME إلى vercel-dns يُرجع عنوانين أحدهما من تلك ← انقطاع متقطع (ERR_CONNECTION_TIMED_OUT).
// لذلك نطلب سجل A إلى عنوان واحد مضمون حتى للنطاقات الفرعية (www, shop...) — وVercel يعتبره إعداداً صحيحاً.
const RELIABLE_IPS = ["216.198.79.1", "76.76.21.21"];

function recordFor(name: string, apexName: string, cfg: DomainConfig | null): Omit<DnsRecord, "ok"> {
  const host = dnsHostLabel(name, apexName);
  const recommended = (cfg?.recommendedIPv4 ?? []).sort((a, b) => a.rank - b.rank).flatMap((r) => r.value ?? []);
  const ip = recommended.find((v) => RELIABLE_IPS.includes(v)) ?? RELIABLE_IPS[0];
  return { type: "A", host, value: ip };
}

/** الحالة الحالية للدومين + السجلات التي يجب إضافتها عند مزوّد الدومين */
export async function domainStatus(name: string): Promise<DomainStatus> {
  let info = await call<ProjectDomain>(`/v9/projects/${p()}/domains/${d(name)}`);
  if (info.status === 404) return { domain: name, state: "missing", records: [] };
  if (!info.ok) throw new Error("vercel_unavailable");

  // دومين مستعمل سابقاً في حساب Vercel آخر: نحاول التحقق (ينجح إن أُضيف سجل TXT)
  if (!info.data.verified) {
    const v = await call<ProjectDomain>(`/v9/projects/${p()}/domains/${d(name)}/verify`, { method: "POST" });
    if (v.ok) info = v;
  }

  const apexName = info.data.apexName || name;
  const companion = companionOf(name, apexName);
  const [cfg, companionCfg] = await Promise.all([config(name), companion ? config(companion) : Promise.resolve(null)]);

  const records: DnsRecord[] = [];
  const mainOk = !!cfg && !cfg.misconfigured;
  records.push({ ...recordFor(name, apexName, cfg), ok: mainOk });
  if (companion) records.push({ ...recordFor(companion, apexName, companionCfg), ok: !!companionCfg && !companionCfg.misconfigured, optional: true });

  if (!info.data.verified) {
    for (const v of info.data.verification ?? []) {
      if (v.type === "TXT") records.unshift({ type: "TXT", host: dnsHostLabel(v.domain, apexName), value: v.value, ok: false });
    }
    return { domain: name, state: "verify", records };
  }
  return { domain: name, state: mainOk ? "active" : "dns", records };
}
