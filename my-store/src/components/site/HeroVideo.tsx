"use client";

import { useEffect, useRef, useState } from "react";

// ==================== 🎬 خلفية فيديو للواجهة الرئيسية (عدة لقطات تتبدّل بانتقال ناعم) ====================
// • اللقطة الأولى تُحمَّل فوراً، والتالية تُجهَّز أثناء عرض الحالية فقط (لا تحميل كل الملفات دفعة واحدة)
// • من يفضّل تقليل الحركة (prefers-reduced-motion) يرى صورة ثابتة
// • فيديوهات Mixkit (رخصة مجانية للاستخدام التجاري) مستضافة في public/hero
export type HeroClip = { src: string; poster: string };

const FADE_MS = 1200;

export default function HeroVideo({ clips }: { clips: HeroClip[] }) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState<Record<number, boolean>>({});
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    const id = setTimeout(update, 0);
    mq.addEventListener("change", update);
    return () => {
      clearTimeout(id);
      mq.removeEventListener("change", update);
    };
  }, []);

  // تشغيل اللقطة النشطة من البداية + تجهيز التالية
  useEffect(() => {
    if (reduced) return;
    const v = refs.current[active];
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => null);
    const next = refs.current[(active + 1) % clips.length];
    if (next && next.preload !== "auto") {
      next.preload = "auto";
      next.load();
    }
  }, [active, reduced, clips.length]);

  // الانتقال للقطة التالية قبل نهاية الحالية بقليل (تداخل ناعم بدل وميض أسود)
  const onTime = (i: number) => {
    const v = refs.current[i];
    if (!v || i !== active || clips.length < 2 || !v.duration) return;
    if (v.duration - v.currentTime < FADE_MS / 1000) setActive((a) => (a === i ? (i + 1) % clips.length : a));
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#07090D]" aria-hidden>
      {clips.map((c, i) => (
        <div key={c.src} className="absolute inset-0 transition-opacity ease-in-out" style={{ opacity: i === active ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.poster} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready[i] && !reduced ? "opacity-0" : "opacity-100"}`} />
          {!reduced && (
            <video
              ref={(el) => {
                refs.current[i] = el;
              }}
              src={c.src}
              muted
              playsInline
              loop={clips.length === 1}
              preload={i === 0 ? "auto" : "none"}
              autoPlay={i === 0}
              onPlaying={() => setReady((r) => (r[i] ? r : { ...r, [i]: true }))}
              onTimeUpdate={() => onTime(i)}
              onEnded={() => clips.length > 1 && setActive((a) => (a === i ? (i + 1) % clips.length : a))}
              className="absolute inset-0 h-full w-full scale-[1.02] object-cover"
            />
          )}
        </div>
      ))}
      {/* تظليل احترافي يضمن وضوح النص فوق أي لقطة */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,13,0.92)_0%,rgba(7,9,13,0.72)_38%,rgba(7,9,13,0.25)_70%,rgba(7,9,13,0.35)_100%)] rtl:bg-[linear-gradient(270deg,rgba(7,9,13,0.92)_0%,rgba(7,9,13,0.72)_38%,rgba(7,9,13,0.25)_70%,rgba(7,9,13,0.35)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#07090D] to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
    </div>
  );
}
