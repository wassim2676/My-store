"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, Send } from "lucide-react";

// ==================== ✉️ نموذج التواصل (حقول رفيعة بأسلوب SaaS) ====================
export type ContactLabels = {
  title: string; name: string; email: string; topic: string; topics: Record<string, string>;
  message: string; messagePh: string; send: string; sending: string; success: string; error: string; invalid: string; privacy: string;
};

const field =
  "mt-1.5 block w-full rounded-lg border border-white/[0.09] bg-white/[0.03] px-3.5 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/[0.16] focus:border-amber-300/60 focus:bg-white/[0.05] focus:ring-[3px] focus:ring-amber-300/10";
const label = "block text-[13px] font-medium text-white/60";

export default function ContactForm({ labels, defaultTopic = "support" }: { labels: ContactLabels; defaultTopic?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "invalid">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name") ?? ""), email: String(fd.get("email") ?? ""), message: String(fd.get("message") ?? ""),
      topic: String(fd.get("topic") ?? defaultTopic), company: String(fd.get("company") ?? ""),
    };
    if (data.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim()) || data.message.trim().length < 10) {
      setState("invalid");
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      setState(res.ok ? "sent" : res.status === 400 ? "invalid" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="flex h-full min-h-[380px] flex-col items-center justify-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20"><CheckCircle2 className="h-7 w-7" /></span>
        <p className="mt-5 max-w-sm leading-relaxed text-white/80">{labels.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex h-full flex-col">
      <h2 className="text-lg font-semibold tracking-tight">{labels.title}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className={label}>
          {labels.name}
          <input name="name" autoComplete="name" required maxLength={100} className={`${field} h-10`} />
        </label>
        <label className={label}>
          {labels.email}
          <input name="email" type="email" autoComplete="email" required maxLength={200} dir="ltr" className={`${field} h-10`} />
        </label>
      </div>
      <label className={`${label} mt-4`}>
        {labels.topic}
        <span className="relative mt-1.5 block">
          <select name="topic" defaultValue={defaultTopic} className={`${field} mt-0 h-10 cursor-pointer appearance-none pe-10 [&>option]:bg-[#161A21]`}>
            {Object.entries(labels.topics).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        </span>
      </label>
      <label className={`${label} mt-4 flex flex-1 flex-col`}>
        {labels.message}
        <textarea name="message" required rows={5} maxLength={5000} placeholder={labels.messagePh} className={`${field} min-h-[128px] flex-1 resize-none py-2.5 leading-relaxed`} />
      </label>
      {/* حقل فخّ للروبوتات (مخفي عن البشر) */}
      <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      {(state === "invalid" || state === "error") && (
        <p role="alert" className="mt-4 rounded-lg border border-red-400/20 bg-red-400/[0.06] px-3.5 py-2.5 text-[13px] text-red-200">{state === "invalid" ? labels.invalid : labels.error}</p>
      )}

      <div className="mt-5 flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-white/40">{labels.privacy}</p>
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-60"
        >
          {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:-scale-x-100" />}
          {state === "sending" ? labels.sending : labels.send}
        </button>
      </div>
    </form>
  );
}
