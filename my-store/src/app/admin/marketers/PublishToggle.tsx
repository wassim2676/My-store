"use client";

import { useState } from "react";

/** إخفاء/إظهار صفحة مسوّق من طرف الأدمن (للإشراف على المحتوى) */
export default function MarketerPublishToggle({ id, initial }: { id: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/landing-pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !on }),
      });
      if (res.ok) setOn(!on);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`relative inline-block h-6 w-11 rounded-full transition disabled:opacity-50 cursor-pointer ${on ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
      aria-label="toggle"
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "start-[22px]" : "start-0.5"}`} />
    </button>
  );
}
