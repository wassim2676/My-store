"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";

type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/** أزرار الإشراف على عرض واحد (نشر/إخفاء/أرشفة/حذف) */
export default function OfferModeration({
  id,
  status,
  labels,
}: {
  id: string;
  status: Status;
  labels: { publish: string; hide: string; archive: string; remove: string; confirmDelete: string; error: string };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, init: RequestInit) => {
    setBusy(key);
    try {
      const res = await fetch(`/api/admin/offers/${id}`, { headers: { "Content-Type": "application/json" }, ...init });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert(labels.error);
    } finally {
      setBusy(null);
    }
  };
  const setStatus = (s: Status) => run(s, { method: "PATCH", body: JSON.stringify({ status: s }) });

  const btn = "inline-flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-40 cursor-pointer";
  const spin = <Loader2 className="h-4 w-4 animate-spin" />;

  return (
    <div className="flex items-center justify-end gap-1">
      {status === "PUBLISHED" ? (
        <button type="button" title={labels.hide} aria-label={labels.hide} disabled={!!busy} onClick={() => setStatus("DRAFT")} className={`${btn} text-amber-300 hover:bg-amber-400/10`}>
          {busy === "DRAFT" ? spin : <EyeOff className="h-4 w-4" />}
        </button>
      ) : (
        <button type="button" title={labels.publish} aria-label={labels.publish} disabled={!!busy} onClick={() => setStatus("PUBLISHED")} className={`${btn} text-emerald-300 hover:bg-emerald-400/10`}>
          {busy === "PUBLISHED" ? spin : <Eye className="h-4 w-4" />}
        </button>
      )}
      {status !== "ARCHIVED" && (
        <button type="button" title={labels.archive} aria-label={labels.archive} disabled={!!busy} onClick={() => setStatus("ARCHIVED")} className={`${btn} text-white/55 hover:bg-white/5 hover:text-white`}>
          {busy === "ARCHIVED" ? spin : <Archive className="h-4 w-4" />}
        </button>
      )}
      <button
        type="button"
        title={labels.remove}
        aria-label={labels.remove}
        disabled={!!busy}
        onClick={() => confirm(labels.confirmDelete) && run("DELETE", { method: "DELETE" })}
        className={`${btn} text-rose-300 hover:bg-rose-500/10`}
      >
        {busy === "DELETE" ? spin : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
