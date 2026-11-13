/** هيكل تحميل فوري يظهر لحظة النقر على أي رابط داخل اللوحة (بدل الانتظار بلا أي إشارة) */
export default function PageSkeleton({ accent = "amber" }: { accent?: "amber" | "sky" }) {
  const bar = accent === "sky" ? "bg-sky-400/70" : "bg-amber-400/70";
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-live="polite">
      {/* شريط تقدّم علوي */}
      <div className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden">
        <div className={`h-full w-1/3 ${bar} animate-[skeleton-bar_1.1s_ease-in-out_infinite]`} />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-white/[0.06]" />
        <div className="h-4 w-80 max-w-full rounded bg-white/[0.04]" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-white/[0.05] bg-white/[0.03]" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-2xl border border-white/[0.05] bg-white/[0.03]" />
        <div className="h-64 rounded-2xl border border-white/[0.05] bg-white/[0.03]" />
      </div>
    </div>
  );
}
