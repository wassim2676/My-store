"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, Clock, Copy, ExternalLink, Globe, Link2, Loader2, RefreshCw, ShieldCheck, Trash2,
} from "lucide-react";
import type { DomainStatus } from "@/lib/vercel-domains";

// ==================== 🌐 ربط دومين خاص بصفحة المسوّق ====================
export default function DomainManager({
  enabled,
  initialDomain,
  initialActive,
  platformUrl,
  canManage = true,
}: {
  /** 👥 عضو فريق: يرى الحالة فقط (الربط والفصل لصاحب الصفحة) */
  canManage?: boolean;
  enabled: boolean;
  initialDomain: string | null;
  initialActive: boolean;
  /** رابط الصفحة على المنصة (primeshelf.store/slug) */
  platformUrl: string;
}) {
  const t = useTranslations("dash.domain");
  const router = useRouter();
  const [status, setStatus] = useState<DomainStatus | null>(
    initialDomain ? { domain: initialDomain, state: initialActive ? "active" : "dns", records: [] } : null,
  );
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState<"add" | "check" | "remove" | null>(null);
  const [loaded, setLoaded] = useState(!initialDomain);
  const [error, setError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const errorText = (code: unknown) => {
    const c = typeof code === "string" ? code : "provider_error";
    return t.has(`errors.${c}`) ? t(`errors.${c}`) : t("errors.provider_error");
  };

  const check = useCallback(
    async (manual = false) => {
      if (manual) setBusy("check");
      try {
        const res = await fetch("/api/marketer/domain", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          if (manual) setError(errorText(json.error));
          return;
        }
        const prev = status?.state;
        setStatus(json.data);
        setCheckedAt(new Date());
        if (manual) setError("");
        if (json.data?.state === "active" && prev !== "active") router.refresh();
      } catch {
        if (manual) setError(t("errors.network"));
      } finally {
        setLoaded(true);
        if (manual) setBusy(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status?.state],
  );

  // أول تحميل + فحص تلقائي كل 20 ثانية ما دام الدومين غير فعّال
  useEffect(() => {
    if (!enabled || !status) return;
    const first = loaded ? null : setTimeout(() => check(), 0);
    const id = status.state === "active" ? null : setInterval(() => document.visibilityState === "visible" && check(), 20_000);
    return () => {
      if (first) clearTimeout(first);
      if (id) clearInterval(id);
    };
  }, [enabled, status, loaded, check]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setBusy("add");
    setError("");
    try {
      const res = await fetch("/api/marketer/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: input }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(errorText(json.error));
        return;
      }
      setStatus(json.data);
      setCheckedAt(new Date());
      setInput("");
      router.refresh();
    } catch {
      setError(t("errors.network"));
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy("remove");
    setError("");
    try {
      const res = await fetch("/api/marketer/domain", { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(errorText(json.error));
        return;
      }
      setStatus(null);
      setConfirmRemove(false);
      router.refresh();
    } catch {
      setError(t("errors.network"));
    } finally {
      setBusy(null);
    }
  };

  const active = status?.state === "active";
  const companion = status?.records.find((r) => r.optional);

  return (
    <div className="w-full">
      {/* العنوان */}
      <div className="mb-8 flex flex-col gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{t("title")}</h1>
          <p className="mt-1 text-sm text-white/50">{t("subtitle")}</p>
        </div>
        {status && enabled && (
          <button
            type="button"
            onClick={() => check(true)}
            disabled={busy !== null}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium transition hover:bg-white/[0.07] disabled:opacity-50 cursor-pointer sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${busy === "check" || !loaded ? "animate-spin" : ""}`} />
            {t("check")}
          </button>
        )}
      </div>

      {!enabled ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-5 text-sm text-amber-100/90">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          {t("notEnabled")}
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {!status && !canManage ? (
            <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#0A0D12] p-5 text-sm text-white/60">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              {t("ownerOnly")}
            </div>
          ) : !status ? (
            /* ➕ ربط دومين */
            <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
              <div className="p-5 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-amber-300">
                    <Globe className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">{t("connectTitle")}</h2>
                    <p className="mt-1 max-w-2xl text-sm text-white/50">{t("connectText")}</p>
                  </div>
                </div>
                <form onSubmit={add} className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <div className="flex min-w-0 flex-1 items-center rounded-lg border border-white/10 bg-black/40 transition focus-within:border-amber-400/60 focus-within:ring-2 focus-within:ring-amber-400/15" dir="ltr">
                    <span className="ps-4 text-sm text-white/30">https://</span>
                    <input
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        setError("");
                      }}
                      placeholder="mydeals.com"
                      autoComplete="off"
                      spellCheck={false}
                      inputMode="url"
                      className="min-w-0 flex-1 bg-transparent px-1.5 py-3 text-sm outline-none placeholder:text-white/25"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy === "add" || !input.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/85 disabled:opacity-40 cursor-pointer disabled:cursor-default"
                  >
                    {busy === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                    {t("connect")}
                  </button>
                </form>
                <p className="mt-2.5 text-xs text-white/40">{t("inputHint")}</p>
              </div>

              {/* 🧭 كيف يعمل */}
              <div className="grid grid-cols-1 divide-y divide-white/[0.06] border-t border-white/[0.06] bg-white/[0.015] md:grid-cols-3 md:divide-x md:divide-y-0 rtl:md:divide-x-reverse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-5 sm:px-8 sm:py-6">
                    <span className="font-mono text-xs text-amber-300/80">0{n}</span>
                    <p className="mt-2 text-sm font-semibold">{t(`how.s${n}`)}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/50">{t(`how.s${n}Text`)}</p>
                  </div>
                ))}
              </div>
              <p className="flex items-start gap-2 border-t border-white/[0.06] px-5 py-4 text-xs leading-relaxed text-white/45 sm:px-8">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/70" />
                {t("needDomain")}
              </p>
            </section>
          ) : (
            /* 📍 بطاقة الدومين (بأسلوب لوحات الاستضافة) */
            <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
              {/* الرأس */}
              <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${active ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-white/[0.04] text-white/60"}`}>
                    <Globe className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <a
                      href={`https://${status.domain}`}
                      target="_blank"
                      rel="noopener"
                      dir="ltr"
                      className="group inline-flex max-w-full items-center gap-1.5 text-lg font-semibold hover:underline"
                    >
                      <span className="truncate">{status.domain}</span>
                      <ExternalLink className="h-4 w-4 shrink-0 text-white/35 group-hover:text-white/70" />
                    </a>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <StateBadge state={status.state} t={t} loading={!loaded} />
                      {companion && (
                        <span className="inline-flex items-center gap-1 text-xs text-white/40" dir="ltr">
                          {companion.host === "www" ? `www.${status.domain}` : status.domain.replace(/^www\./, "")}
                          <ArrowRight className="h-3 w-3" />
                          {status.domain}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {active && (
                    <a
                      href={`https://${status.domain}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/85"
                    >
                      {t("visit")}
                    </a>
                  )}
                  {!canManage ? null : confirmRemove ? (
                    <>
                      <button type="button" onClick={() => setConfirmRemove(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5 cursor-pointer">
                        {t("cancel")}
                      </button>
                      <button
                        type="button"
                        onClick={remove}
                        disabled={busy === "remove"}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-50 cursor-pointer"
                      >
                        {busy === "remove" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        {t("confirmRemove")}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/75 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("remove")}
                    </button>
                  )}
                </div>
              </div>
              {confirmRemove && <p className="border-t border-rose-500/15 bg-rose-500/[0.04] px-5 py-3 text-xs text-rose-200/80 sm:px-6">{t("removeText")}</p>}

              {/* شريط المعلومات */}
              <div className="grid grid-cols-1 divide-y divide-white/[0.06] border-t border-white/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0 rtl:sm:divide-x-reverse">
                <Info label={t("info.status")}>
                  {active ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-300"><CheckCircle2 className="h-4 w-4" />{t("info.valid")}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-300"><Clock className="h-4 w-4" />{t("info.invalid")}</span>
                  )}
                </Info>
                <Info label={t("info.ssl")}>
                  {active ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-300"><ShieldCheck className="h-4 w-4" />{t("info.sslOn")}</span>
                  ) : (
                    <span className="text-white/45">{t("info.sslPending")}</span>
                  )}
                </Info>
                <Info label={t("info.platform")}>
                  <span className="flex min-w-0 items-center gap-1.5 text-white/70" dir="ltr">
                    <span className="truncate">{platformUrl.replace(/^https?:\/\//, "")}</span>
                    {active && <><ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/35" /><span className="shrink-0 text-white/45">{t("info.redirects")}</span></>}
                  </span>
                </Info>
              </div>

              {active && (
                <div className="flex items-start gap-2.5 border-t border-white/[0.06] bg-emerald-400/[0.04] px-5 py-4 text-sm text-emerald-100/85 sm:px-6">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {t("activeText")}
                </div>
              )}

              {/* 🧾 سجلات DNS */}
              {status.records.length > 0 && (
                <div className="border-t border-white/[0.06]">
                  <div className="px-5 pb-4 pt-6 sm:px-6">
                    <h2 className="font-semibold">{active ? t("records.titleDone") : t("records.title")}</h2>
                    <p className="mt-1 max-w-3xl text-sm text-white/50">{status.state === "verify" ? t("records.verifyText") : t("records.text")}</p>
                  </div>

                  <div className="mx-5 mb-6 overflow-hidden rounded-lg border border-white/[0.08] sm:mx-6">
                    <div className="hidden grid-cols-[110px_minmax(140px,1fr)_minmax(0,2.4fr)_130px] gap-4 border-b border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-white/40 md:grid" dir="ltr">
                      <span>{t("records.type")}</span>
                      <span>{t("records.host")}</span>
                      <span>{t("records.value")}</span>
                      <span className="text-end">{t("records.status")}</span>
                    </div>
                    {status.records.map((r) => (
                      <div
                        key={`${r.type}-${r.host}`}
                        className="grid grid-cols-1 gap-2.5 border-b border-white/[0.06] px-4 py-4 last:border-b-0 md:grid-cols-[110px_minmax(140px,1fr)_minmax(0,2.4fr)_130px] md:items-center md:gap-4"
                        dir="ltr"
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-mono text-sm font-semibold">{r.type}</span>
                          {r.optional && <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-white/50">{t("records.optional")}</span>}
                        </div>
                        <CopyCell value={r.host} label={t("records.host")} />
                        <CopyCell value={r.value} label={t("records.value")} />
                        <span className="flex md:justify-end">
                          {r.ok ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300"><Check className="h-3.5 w-3.5" />{t("records.ok")}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300"><Clock className="h-3.5 w-3.5" />{t("records.pending")}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {!active && (
                    <div className="border-t border-white/[0.06] bg-white/[0.015] px-5 py-5 sm:px-6">
                      <ul className="grid grid-cols-1 gap-x-8 gap-y-2.5 text-xs leading-relaxed text-white/55 lg:grid-cols-2">
                        <li className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300/80" />{t("tips.remove")}</li>
                        <li className="flex gap-2"><Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />{t("tips.wait")}</li>
                        <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />{t("tips.cloudflare")}</li>
                        {companion && <li className="flex gap-2"><ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40 rtl:rotate-180" />{t("tips.www")}</li>}
                      </ul>
                      {checkedAt && <p className="mt-4 text-[11px] text-white/35">{t("autoCheck")}</p>}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 px-5 py-4 sm:px-6">
      <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">{label}</p>
      <div className="mt-1.5 text-sm font-medium">{children}</div>
    </div>
  );
}

function StateBadge({ state, t, loading }: { state: DomainStatus["state"]; t: ReturnType<typeof useTranslations>; loading: boolean }) {
  if (loading)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-white/60">
        <Loader2 className="h-3 w-3 animate-spin" />
        {t("state.loading")}
      </span>
    );
  const map = {
    active: "bg-emerald-400/10 text-emerald-300",
    dns: "bg-amber-400/10 text-amber-300",
    verify: "bg-amber-400/10 text-amber-300",
    missing: "bg-rose-500/10 text-rose-300",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${map[state]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${state === "active" ? "bg-emerald-400" : state === "missing" ? "bg-rose-400" : "animate-pulse bg-amber-400"}`} />
      {t(`state.${state}`)}
    </span>
  );
}

function CopyCell({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {}
      }}
      title={label}
      className="group flex min-w-0 items-center justify-between gap-3 rounded-md border border-white/[0.08] bg-black/40 px-3 py-2 text-start font-mono text-[13px] text-white/85 transition hover:border-white/25 cursor-pointer"
    >
      <span className="min-w-0 break-all">{value}</span>
      {copied ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 shrink-0 text-white/30 group-hover:text-white/70" />}
    </button>
  );
}
