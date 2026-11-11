import { Star } from "lucide-react";

/** نجوم تقييم من 5 تدعم أنصاف النجوم */
export default function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} / 5`} dir="ltr">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-current opacity-25" style={{ width: size, height: size }} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="fill-amber-400 text-amber-400" style={{ width: size, height: size }} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
