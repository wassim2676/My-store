"use client";

/**
 * ⚫ مؤشر نقاط احترافي (على طريقة Google/Amazon): كل النقاط دوائر،
 * والنشطة دائرة أكبر بلون التمييز مع هالة خفيفة — لا نقاط عريضة.
 * انتقال الحجم بـ transform فيبقى سلساً ولا يحرّك ما حوله.
 */
export default function Dots({
  count,
  active,
  onSelect,
  color = "#FBBF24",
  label,
}: {
  count: number;
  active: number;
  onSelect?: (i: number) => void;
  color?: string;
  /** وصف للوحة المفاتيح/قارئ الشاشة، مثل "الشريحة" */
  label?: string;
}) {
  if (count < 2) return null;
  return (
    <div className="flex items-center gap-0.5" role={onSelect ? "tablist" : undefined} aria-hidden={onSelect ? undefined : true}>
      {Array.from({ length: count }).map((_, i) => {
        const on = i === active;
        const dot = (
          <span
            className="block h-2 w-2 rounded-full transition-[transform,background-color,box-shadow] duration-300 ease-out"
            style={{
              transform: on ? "scale(1.25)" : "scale(0.78)",
              backgroundColor: on ? color : "rgba(255,255,255,0.28)",
              boxShadow: on ? `0 0 0 3px ${color}26` : "none",
            }}
          />
        );
        return onSelect ? (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={on}
            aria-label={label ? `${label} ${i + 1}` : String(i + 1)}
            onClick={() => onSelect(i)}
            className="group flex h-5 w-5 items-center justify-center rounded-full transition-opacity hover:opacity-80 cursor-pointer"
          >
            {dot}
          </button>
        ) : (
          <span key={i} className="flex h-5 w-5 items-center justify-center">
            {dot}
          </span>
        );
      })}
    </div>
  );
}
