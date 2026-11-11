// ==================== 📊 رسم أعمدة يومي (سلسلة واحدة لكل رسم — لا محاور مزدوجة) ====================
export default function DailyBars({
  title,
  total,
  data,
  color,
  locale,
  emptyLabel,
}: {
  title: string;
  total: string;
  data: { date: string; value: number }[];
  color: string;
  locale: string;
  emptyLabel: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const fmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" });
  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium text-white/70">{title}</h3>
        <span className="text-xl font-semibold tabular-nums">{total}</span>
      </div>
      <div className="relative h-40" dir="ltr">
        {/* خطوط الشبكة الخافتة */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-t border-white/[0.05]" />
          ))}
        </div>
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-white/35">{emptyLabel}</div>
        )}
        <div className="relative flex h-full items-end gap-[2px]">
          {data.map((d) => {
            const label = fmt.format(new Date(d.date));
            return (
              <div key={d.date} className="group relative flex h-full flex-1 items-end">
                <div
                  className="w-full rounded-t-[4px] transition-opacity group-hover:opacity-100"
                  style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 3 : 0, backgroundColor: color, opacity: 0.8 }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#11151D] px-2.5 py-1.5 text-xs shadow-xl group-hover:block">
                  <span className="text-white/55">{label}</span> <span className="font-semibold tabular-nums text-white">{d.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-white/35" dir="ltr">
        <span>{data[0] ? fmt.format(new Date(data[0].date)) : ""}</span>
        <span>{data.at(-1) ? fmt.format(new Date(data.at(-1)!.date)) : ""}</span>
      </div>
    </div>
  );
}
