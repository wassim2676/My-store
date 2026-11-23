"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, Clock, LogOut, ShieldCheck, Users, X, Zap } from "lucide-react";
import { ChangesTable, STATUS_PILL, useKindText, type TeamRequest } from "./TeamManager";
import { useTimeAgo } from "@/components/notifications/useNotificationText";

// ==================== 🙋 الفريق من جهة العضو: وضعه + طلباته ====================
export default function TeamMemberView({ pageTitle, ownerName, requireApproval, requests: initial }: { pageTitle: string; ownerName: string; requireApproval: boolean; requests: TeamRequest[] }) {
  const t = useTranslations("dash.team");
  const router = useRouter();
  const kindText = useKindText();
  const ago = useTimeAgo();
  const [requests, setRequests] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cancel = async (id: string) => {
    const res = await fetch(`/api/team/requests/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel" }) });
    if (res.ok) {
      setRequests((list) => list.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r)));
      router.refresh();
    }
  };

  const leave = async () => {
    if (!confirm(t("confirmLeave", { page: pageTitle }))) return;
    setBusy(true);
    const res = await fetch("/api/team/leave", { method: "POST" });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else setBusy(false);
  };

  return (
    <div className="w-full space-y-6">
      <div className="border-b border-white/[0.06] pb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{t("title")}</h1>
        <p className="mt-1 text-sm text-white/50">{t("memberSubtitle")}</p>
      </div>

      <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-400/10 text-violet-300">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">{t("memberOf", { page: pageTitle })}</h2>
              <p className="mt-1 text-sm text-white/50">{t("ownedBy", { name: ownerName })}</p>
            </div>
          </div>
          <button type="button" onClick={leave} disabled={busy} className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/75 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-200 disabled:opacity-40 cursor-pointer sm:self-auto">
            <LogOut className="h-4 w-4" />
            {t("leave")}
          </button>
        </div>
        <div className="flex items-start gap-2.5 border-t border-white/[0.06] bg-white/[0.015] px-5 py-3.5 text-xs leading-relaxed text-white/60 sm:px-6">
          {requireApproval ? <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" /> : <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />}
          {requireApproval ? t("modeApproval") : t("modeDirect")}
        </div>
        <div className="flex items-start gap-2.5 border-t border-white/[0.06] px-5 py-3.5 text-xs leading-relaxed text-white/45 sm:px-6">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("cannot")}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
        <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <h2 className="font-semibold">{t("myRequests")}</h2>
        </div>
        {requests.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-white/45">{t("noRequests")}</p>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {requests.map((r) => (
              <div key={r.id} className="px-5 py-3.5 sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)} className="flex min-w-0 items-center gap-2 text-start cursor-pointer">
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{kindText(r.kind, r.label)}</span>
                      <span className="block text-xs text-white/40">
                        {ago(r.createdAt)}
                        {r.note && ` · “${r.note}”`}
                        {r.error && ` · ${r.error}`}
                      </span>
                    </span>
                    {r.changes.length > 0 && <ChevronDown className={`h-4 w-4 shrink-0 text-white/40 transition ${open === r.id ? "rotate-180" : ""}`} />}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_PILL[r.status] ?? STATUS_PILL.cancelled}`}>{t(`reqStatus.${r.status}`)}</span>
                    {r.status === "pending" && (
                      <button type="button" onClick={() => cancel(r.id)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/50 hover:bg-white/5 hover:text-white cursor-pointer">
                        <X className="h-3.5 w-3.5" />
                        {t("cancelRequest")}
                      </button>
                    )}
                  </div>
                </div>
                {open === r.id && (
                  <div className="mt-3">
                    <ChangesTable changes={r.changes} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
