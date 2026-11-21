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
}: {
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

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 border-b border-white/[0.06] pb-5">
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-white/50">{t("subtitle")}</p>
      </div>

      {!enabled ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-5 text-sm text-amber-100/90">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          {t("notEnabled")}
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {!status ? (
            <>
              {/* ➕ ربط دومين */}
              <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
                <div className="mb-5 flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-amber-300">
                    <Globe className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h2 className="font-semibold">{t("connectTitle")}</h2>
                    <p className="mt-0.5 text-sm text-white/50">{t("connectText")}</p>
                  </div>
                </div>
                <form onSubmit={add} className="flex flex-col gap-2.5 sm:flex-row">
                  <input
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setError("");
                    }}
                    placeholder="mydeals.com"
                    dir="ltr"
                    autoComplete="off"
                    spellCheck={false}
                    inputMode="url"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-amber-400/60"
                  />
                  <button
                    type="submit"
                    disabled={busy === "add" || !input.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-40 cursor-pointer disabled:cursor-default"
                  >
                    {busy === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                    {t("connect")}
                  </button>
                </form>
                <p className="mt-2.5 text-xs text-white/40">{t("inputHint")}</p>
              </section>

              {/* 🧭 كيف يعمل */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/10 text-xs font-bold text-amber-300">{n}</span>
                    <p className="mt-3 text-sm font-semibold">{t(`how.s${n}`)}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/50">{t(`how.s${n}Text`)}</p>
                  </div>
                ))}
              </div>

              <p className="flex items-center gap-2 text-xs text-white/40">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/70" />
                {t("needDomain")}
              </p>
            </>
          ) : (
            <>
              {/* 📍 الدومين الحالي */}
              <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-white/40">{t("yourDomain")}</p>
                    <p className="mt-1 truncate text-lg font-semibold" dir="ltr">{status.domain}</p>
                    <div className="mt-2">
                      <StateBadge state={status.state} t={t} loading={!loaded} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {status.state === "active" && (
                      <a
                        href={`https://${status.domain}`}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t("visit")}
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => check(true)}
                      disabled={busy !== null}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium hover:bg-white/5 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`h-4 w-4 ${busy === "check" || !loaded ? "animate-spin" : ""}`} />
                      {t("check")}
                    </button>
                  </div>
                </div>

                {status.state === "active" ? (
                  <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4 text-sm text-emerald-100/90">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <p>{t("activeText")}</p>
                      <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-emerald-100/60" dir="ltr">
                        <span className="truncate">{platformUrl.replace(/^https?:\/\//, "")}</span>
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        <span className="font-semibold text-emerald-200">{status.domain}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  checkedAt && (
                    <p className="mt-4 text-xs text-white/35">
                      {t("autoCheck")}
                    </p>
                  )
                )}
              </section>

              {/* 🧾 سجلات DNS */}
              {status.records.length > 0 && (
                <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
                  <h2 className="font-semibold">{status.state === "active" ? t("records.titleDone") : t("records.title")}</h2>
                  <p className="mt-0.5 text-sm text-white/50">
                    {status.state === "verify" ? t("records.verifyText") : t("records.text")}
                  </p>

                  <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.08]">
                    <div className="hidden grid-cols-[90px_1fr_2fr_70px] gap-3 border-b border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/40 sm:grid">
                      <span>{t("records.type")}</span>
                      <span>{t("records.host")}</span>
                      <span>{t("records.value")}</span>
                      <span className="text-end">{t("records.status")}</span>
                    </div>
                    {status.records.map((r) => (
                      <div
                        key={`${r.type}-${r.host}`}
                        className="grid grid-cols-1 gap-2 border-b border-white/[0.06] px-4 py-3.5 last:border-b-0 sm:grid-cols-[90px_1fr_2fr_70px] sm:items-center sm:gap-3"
                        dir="ltr"
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          {r.type}
                          {r.optional && <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-white/50">{t("records.optional")}</span>}
                        </span>
                        <CopyCell value={r.host} label={t("records.host")} />
                        <CopyCell value={r.value} label={t("records.value")} />
                        <span className="flex justify-start sm:justify-end">
                          {r.ok ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400"><Check className="h-3.5 w-3.5" />OK</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-300"><Clock className="h-3.5 w-3.5" />{t("records.pending")}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {status.state !== "active" && (
                    <ul className="mt-5 space-y-2 text-xs leading-relaxed text-white/55">
                      <li className="flex gap-2"><span className="text-amber-300">•</span>{t("tips.remove")}</li>
                      <li className="flex gap-2"><span className="text-amber-300">•</span>{t("tips.cloudflare")}</li>
                      <li className="flex gap-2"><span className="text-amber-300">•</span>{t("tips.wait")}</li>
                      {status.records.some((r) => r.optional) && <li className="flex gap-2"><span className="text-amber-300">•</span>{t("tips.www")}</li>}
                    </ul>
                  )}
                </section>
              )}

              {/* 🗑️ فصل الدومين */}
              <section className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.03] p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold">{t("removeTitle")}</h2>
                    <p className="mt-0.5 text-sm text-white/50">{t("removeText")}</p>
                  </div>
                  {confirmRemove ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmRemove(false)}
                        className="rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5 cursor-pointer"
                      >
                        {t("cancel")}
                      </button>
                      <button
                        type="button"
                        onClick={remove}
                        disabled={busy === "remove"}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-50 cursor-pointer"
                      >
                        {busy === "remove" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        {t("confirmRemove")}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(true)}
                      className="inline-flex items-center gap-1.5 self-start rounded-xl border border-rose-500/30 px-4 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/10 cursor-pointer sm:self-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("remove")}
                    </button>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StateBadge({ state, t, loading }: { state: DomainStatus["state"]; t: ReturnType<typeof useTranslations>; loading: boolean }) {
  if (loading)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/60">
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
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${map[state]}`}>
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
      className="group flex min-w-0 items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-start font-mono text-[13px] text-white/85 transition hover:border-amber-400/40 cursor-pointer"
    >
      <span className="break-all">{value}</span>
      {copied ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 shrink-0 text-white/30 group-hover:text-white/70" />}
    </button>
  );
}
