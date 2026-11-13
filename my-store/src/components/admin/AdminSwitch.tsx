"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * مفتاح تشغيل/إيقاف عام للأدمن: يرسل { [field]: قيمة } إلى url ثم يحدّث الصفحة.
 * يُستخدم لإظهار صفحة مسوّق، تعليق حساب، إلخ.
 */
export default function AdminSwitch({
  url,
  field,
  initial,
  method = "PATCH",
  label,
  tone = "emerald",
}: {
  url: string;
  field: string;
  initial: boolean;
  method?: "PATCH" | "PUT";
  label: string;
  tone?: "emerald" | "sky";
}) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();

  // تبديل فوري في الواجهة، ثم الطلب؛ نرجع للحالة السابقة إن فشل. تحديث الأرقام يتم في الخلفية.
  const toggle = async () => {
    const next = !on;
    setOn(next);
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: next }),
      });
      if (!res.ok) throw new Error();
      startTransition(() => router.refresh());
    } catch {
      setOn(!next);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const onCls = tone === "sky" ? "bg-sky-500" : "bg-emerald-500";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      onClick={toggle}
      disabled={busy}
      className={`relative inline-block h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 cursor-pointer ${on ? onCls : "bg-white/15"} ${failed ? "ring-2 ring-rose-500" : ""}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "start-[22px]" : "start-0.5"}`} />
    </button>
  );
}
