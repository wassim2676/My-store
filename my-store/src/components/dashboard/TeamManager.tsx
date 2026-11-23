"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AlertTriangle, Check, CheckCheck, ChevronDown, Clock, Loader2, Mail, MoreHorizontal, PauseCircle, PlayCircle, RotateCw, Send, ShieldCheck, Trash2, UserPlus, Users, X,
} from "lucide-react";
import { Toggle } from "./OfferForm";
import { useTimeAgo } from "@/components/notifications/useNotificationText";

// ==================== 👥 إدارة الفريق (صاحب الصفحة) ====================
export type TeamRequest = {
  id: string; kind: string; label: string; author: string; status: string; note: string | null; error: string | null;
  createdAt: string; reviewedAt: string | null; changes: { field: string; before: string; after: string }[];
};
export type TeamMemberRow = {
  id: string; email: string; name: string; status: string; requireApproval: boolean; expired: boolean;
  inviteExpires: string | null; acceptedAt: string | null; lastActiveAt: string | null; approved: number;
};

export const STATUS_PILL: Record<string, string> = {
  pending: "bg-amber-400/10 text-amber-300",
  applying: "bg-sky-400/10 text-sky-300",
  approved: "bg-emerald-400/10 text-emerald-300",
  rejected: "bg-rose-500/10 text-rose-300",
  failed: "bg-rose-500/10 text-rose-300",
  cancelled: "bg-white/[0.06] text-white/50",
};

export function useKindText() {
  const tk = useTranslations("dash.team.kinds");
  return (kind: string, label: string) => (tk.has(kind) ? tk(kind, { label: label || "—" }) : kind);
}

export function ChangesTable({ changes }: { changes: TeamRequest["changes"] }) {
  const t = useTranslations("dash.team");
  if (!changes.length) return null;
  const field = (k: string) => (t.has(`fields.${k}`) ? t(`fields.${k}`) : k);
  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.07]">
      <div className="grid grid-cols-[minmax(90px,140px)_1fr_1fr] gap-3 border-b border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
        <span>{t("field")}</span>
        <span>{t("before")}</span>
        <span>{t("after")}</span>
      </div>
      {changes.map((c) => (
        <div key={c.field} className="grid grid-cols-[minmax(90px,140px)_1fr_1fr] gap-3 border-b border-white/[0.05] px-3 py-2 text-xs last:border-b-0">
          <span className="font-medium text-white/70">{field(c.field)}</span>
          <span className="min-w-0 break-words text-white/40 line-through decoration-white/20">{c.before}</span>
          <span className="min-w-0 break-words text-emerald-200/90">{c.after}</span>
        </div>
      ))}
    </div>
  );
}

export default function TeamManager({ members: initialMembers, pending: initialPending, history, max }: { members: TeamMemberRow[]; pending: TeamRequest[]; history: TeamRequest[]; max: number }) {
  const t = useTranslations("dash.team");
  const router = useRouter();
  const kindText = useKindText();
  const ago = useTimeAgo();
  const [members, setMembers] = useState(initialMembers);
  const [pending, setPending] = useState(initialPending);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [approval, setApproval] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [menu, setMenu] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const err = (code: unknown) => setNotice({ tone: "err", text: t.has(`errors.${String(code)}`) ? t(`errors.${String(code)}`) : t("errors.generic") });

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("invite");
    setNotice(null);
    try {
      const res = await fetch("/api/team/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name: name || null, requireApproval: approval }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) return err(json.error);
      setNotice({ tone: json.data.emailSent ? "ok" : "err", text: json.data.emailSent ? t("invited", { email }) : t("errors.email_failed") });
      setEmail("");
      setName("");
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const patchMember = async (id: string, body: Record<string, unknown>) => {
    setBusy(id);
    setMenu(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/team/members/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) return err(json.error);
      if (body.resend) setNotice({ tone: json.data.emailSent ? "ok" : "err", text: json.data.emailSent ? t("resent") : t("errors.email_failed") });
      else setMembers((list) => list.map((m) => (m.id === id ? { ...m, ...json.data } : m)));
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const removeMember = async (m: TeamMemberRow) => {
    setMenu(null);
    if (!confirm(t("confirmRemove", { name: m.name || m.email }))) return;
    setBusy(m.id);
    try {
      const res = await fetch(`/api/team/members/${m.id}`, { method: "DELETE" });
      if (!res.ok) return err("generic");
      setMembers((list) => list.filter((x) => x.id !== m.id));
      setPending((list) => list.filter((r) => r.author !== (m.name || m.email)));
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const review = async (r: TeamRequest, action: "approve" | "reject") => {
    setBusy(r.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/team/requests/${r.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, note: notes[r.id] || undefined }) });
      const json = await res.json().catch(() => ({}));
      setPending((list) => list.filter((x) => x.id !== r.id));
      if (!res.ok || !json.success) setNotice({ tone: "err", text: t("errors.apply_failed", { detail: json.detail || json.error || "" }) });
      else setNotice({ tone: "ok", text: action === "approve" ? t("approvedOk") : t("rejectedOk") });
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const approveAll = async () => {
    if (!confirm(t("confirmApproveAll", { count: pending.length }))) return;
    for (const r of [...pending]) await review(r, "approve");
  };

  const statusLabel = (m: TeamMemberRow) =>
    m.status === "pending" ? (m.expired ? t("status.expired") : t("status.invited")) : m.status === "suspended" ? t("status.suspended") : t("status.active");
  const statusClass = (m: TeamMemberRow) =>
    m.status === "active" ? "bg-emerald-400/10 text-emerald-300" : m.status === "suspended" ? "bg-rose-500/10 text-rose-300" : m.expired ? "bg-white/[0.06] text-white/50" : "bg-amber-400/10 text-amber-300";

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{t("title")}</h1>
          <p className="mt-1 text-sm text-white/50">{t("subtitle")}</p>
        </div>
        <span className="text-xs text-white/40">{t("seats", { used: members.length, max })}</span>
      </div>

      {notice && (
        <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${notice.tone === "ok" ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100" : "border-rose-500/30 bg-rose-500/10 text-rose-200"}`}>
          {notice.tone === "ok" ? <Check className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          <span className="flex-1">{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-current/60 cursor-pointer" aria-label="close">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ⏳ طلبات تنتظر موافقتك */}
      {pending.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-amber-400/20 bg-[#0D0C08]">
          <div className="flex flex-col gap-3 border-b border-amber-400/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold">{t("pendingTitle", { count: pending.length })}</h2>
                <p className="text-xs text-white/45">{t("pendingText")}</p>
              </div>
            </div>
            {pending.length > 1 && (
              <button type="button" onClick={approveAll} disabled={!!busy} className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/10 px-3.5 py-2 text-sm font-medium hover:bg-white/5 disabled:opacity-40 cursor-pointer sm:self-auto">
                <CheckCheck className="h-4 w-4" />
                {t("approveAll")}
              </button>
            )}
          </div>
          <div className="divide-y divide-white/[0.06]">
            {pending.map((r) => (
              <div key={r.id} className="px-5 py-4 sm:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)} className="flex min-w-0 items-center gap-3 text-start cursor-pointer">
                    <Avatar name={r.author} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{kindText(r.kind, r.label)}</span>
                      <span className="block text-xs text-white/45">
                        {r.author} · {ago(r.createdAt)}
                        {r.changes.length > 0 && ` · ${t("changesCount", { count: r.changes.length })}`}
                      </span>
                    </span>
                    {r.changes.length > 0 && <ChevronDown className={`h-4 w-4 shrink-0 text-white/40 transition ${open === r.id ? "rotate-180" : ""}`} />}
                  </button>
                  <div className="flex items-center gap-2">
                    <input
                      value={notes[r.id] ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                      placeholder={t("notePlaceholder")}
                      maxLength={500}
                      className="hidden w-48 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs outline-none placeholder:text-white/25 focus:border-amber-400/50 xl:block"
                    />
                    <button type="button" onClick={() => review(r, "reject")} disabled={busy === r.id} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3.5 py-2 text-sm font-medium text-white/75 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-200 disabled:opacity-40 cursor-pointer">
                      <X className="h-4 w-4" />
                      {t("reject")}
                    </button>
                    <button type="button" onClick={() => review(r, "approve")} disabled={busy === r.id} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-black hover:bg-white/85 disabled:opacity-40 cursor-pointer">
                      {busy === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      {t("approve")}
                    </button>
                  </div>
                </div>
                {open === r.id && (
                  <div className="mt-3 space-y-2">
                    <ChangesTable changes={r.changes} />
                    <input
                      value={notes[r.id] ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                      placeholder={t("notePlaceholder")}
                      maxLength={500}
                      className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs outline-none placeholder:text-white/25 focus:border-amber-400/50 xl:hidden"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ➕ دعوة عضو */}
      <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
        <div className="flex gap-4 p-5 sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-violet-300">
            <UserPlus className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">{t("inviteTitle")}</h2>
            <p className="mt-1 text-sm text-white/50">{t("inviteText")}</p>
            <form onSubmit={invite} className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto]">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailPlaceholder")} dir="ltr" className="rounded-lg border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm outline-none placeholder:text-white/25 focus:border-amber-400/60" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} maxLength={80} className="rounded-lg border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm outline-none placeholder:text-white/25 focus:border-amber-400/60" />
              <button type="submit" disabled={busy === "invite" || !email} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/85 disabled:opacity-40 cursor-pointer">
                {busy === "invite" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t("send")}
              </button>
            </form>
            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <Toggle checked={approval} onChange={setApproval} />
              <span>
                <span className="block text-sm font-medium">{t("approvalLabel")}</span>
                <span className="block text-xs text-white/45">{t("approvalHint")}</span>
              </span>
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-2 border-t border-white/[0.06] bg-white/[0.015] px-5 py-4 text-xs text-white/55 sm:px-6 md:grid-cols-2">
          <p className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />{t("can")}</p>
          <p className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />{t("cannot")}</p>
        </div>
      </section>

      {/* 👤 الأعضاء */}
      <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <h2 className="font-semibold">{t("membersTitle")}</h2>
          <Users className="h-4 w-4 text-white/35" />
        </div>
        {members.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-white/45">{t("noMembers")}</p>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {members.map((m) => (
              <div key={m.id} className="flex flex-col gap-3 px-5 py-4 sm:px-6 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={m.name || m.email} />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      <span className="truncate">{m.name || m.email}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClass(m)}`}>{statusLabel(m)}</span>
                    </p>
                    <p className="truncate text-xs text-white/40" dir="ltr">{m.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-white/45 sm:grid-cols-3 lg:w-[420px]">
                  <span>{m.lastActiveAt ? t("lastActive", { when: ago(m.lastActiveAt) }) : m.status === "pending" ? (m.inviteExpires && !m.expired ? t("expires", { when: ago(m.inviteExpires) }) : "—") : t("neverActive")}</span>
                  <span>{t("approvedCount", { count: m.approved })}</span>
                  {m.status !== "pending" && (
                    <label className="col-span-2 flex cursor-pointer items-center gap-2 sm:col-span-1">
                      <Toggle checked={m.requireApproval} onChange={(v) => patchMember(m.id, { requireApproval: v })} />
                      <span>{m.requireApproval ? t("needsApproval") : t("trusted")}</span>
                    </label>
                  )}
                </div>
                <div className="relative self-end lg:self-auto">
                  <button type="button" onClick={() => setMenu(menu === m.id ? null : m.id)} disabled={busy === m.id} className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white cursor-pointer" aria-label="actions">
                    {busy === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                  </button>
                  {menu === m.id && (
                    <div className="absolute end-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-lg border border-white/10 bg-[#0F131B] py-1 text-sm shadow-xl">
                      {m.status === "pending" && (
                        <MenuItem icon={RotateCw} onClick={() => patchMember(m.id, { resend: true })}>{t("resend")}</MenuItem>
                      )}
                      {m.status === "active" && <MenuItem icon={PauseCircle} onClick={() => patchMember(m.id, { status: "suspended" })}>{t("suspend")}</MenuItem>}
                      {m.status === "suspended" && <MenuItem icon={PlayCircle} onClick={() => patchMember(m.id, { status: "active" })}>{t("reactivate")}</MenuItem>}
                      <a href={`mailto:${m.email}`} className="flex items-center gap-2.5 px-3 py-2 text-white/75 hover:bg-white/5">
                        <Mail className="h-4 w-4" />
                        {t("emailMember")}
                      </a>
                      <MenuItem icon={Trash2} danger onClick={() => removeMember(m)}>{m.status === "pending" ? t("revoke") : t("remove")}</MenuItem>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🗂️ السجل */}
      {history.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
          <button type="button" onClick={() => setShowHistory((s) => !s)} className="flex w-full items-center justify-between px-5 py-4 text-start cursor-pointer sm:px-6">
            <h2 className="font-semibold">{t("historyTitle")}</h2>
            <ChevronDown className={`h-4 w-4 text-white/40 transition ${showHistory ? "rotate-180" : ""}`} />
          </button>
          {showHistory && (
            <div className="divide-y divide-white/[0.05] border-t border-white/[0.06]">
              {history.map((r) => (
                <div key={r.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{kindText(r.kind, r.label)}</p>
                    <p className="text-xs text-white/40">
                      {r.author} · {ago(r.createdAt)}
                      {r.note && ` · “${r.note}”`}
                      {r.error && ` · ${r.error}`}
                    </p>
                  </div>
                  <span className={`self-start rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:self-auto ${STATUS_PILL[r.status] ?? STATUS_PILL.cancelled}`}>{t(`reqStatus.${r.status}`)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400/30 to-amber-400/20 text-sm font-semibold text-white">
      {(name.trim()[0] || "?").toUpperCase()}
    </span>
  );
}

function MenuItem({ icon: Icon, onClick, danger, children }: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-2.5 px-3 py-2 text-start hover:bg-white/5 cursor-pointer ${danger ? "text-rose-300" : "text-white/75"}`}>
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}
