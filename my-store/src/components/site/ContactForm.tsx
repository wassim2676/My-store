"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import Select from "@/components/shared/Select";

// ==================== ✉️ نموذج التواصل ====================
export type ContactLabels = {
  title: string; name: string; email: string; topic: string; topics: Record<string, string>;
  message: string; messagePh: string; send: string; sending: string; success: string; error: string; invalid: string; privacy: string;
};

const field = "mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-amber-300/10";

export default function ContactForm({ labels, defaultTopic = "support" }: { labels: ContactLabels; defaultTopic?: string }) {
  const [topic, setTopic] = useState(defaultTopic);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "invalid">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = { name: String(fd.get("name") ?? ""), email: String(fd.get("email") ?? ""), message: String(fd.get("message") ?? ""), company: String(fd.get("company") ?? ""), topic };
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
      <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20"><CheckCircle2 className="h-8 w-8" /></span>
        <p className="mt-6 max-w-sm text-lg leading-relaxed text-white/80">{labels.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <h2 className="font-serif text-2xl font-semibold">{labels.title}</h2>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-white/70">
          {labels.name}
          <input name="name" autoComplete="name" required maxLength={100} className={field} />
        </label>
        <label className="block text-sm font-medium text-white/70">
          {labels.email}
          <input name="email" type="email" autoComplete="email" required maxLength={200} dir="ltr" className={field} />
        </label>
      </div>
      <div className="mt-5">
        <span className="block text-sm font-medium text-white/70">{labels.topic}</span>
        <div className="mt-2">
          <Select value={topic} onChange={setTopic} options={Object.entries(labels.topics).map(([value, label]) => ({ value, label }))} ariaLabel={labels.topic} />
        </div>
      </div>
      <label className="mt-5 block text-sm font-medium text-white/70">
        {labels.message}
        <textarea name="message" required rows={6} maxLength={5000} placeholder={labels.messagePh} className={`${field} resize-y`} />
      </label>
      {/* حقل فخّ للروبوتات (مخفي عن البشر) */}
      <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      {(state === "invalid" || state === "error") && (
        <p role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">{state === "invalid" ? labels.invalid : labels.error}</p>
      )}

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-white/40">{labels.privacy}</p>
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-semibold text-black shadow-[0_10px_30px_-10px_rgba(245,184,0,0.6)] transition hover:bg-amber-300 disabled:opacity-60"
        >
          {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:-scale-x-100" />}
          {state === "sending" ? labels.sending : labels.send}
        </button>
      </div>
    </form>
  );
}
