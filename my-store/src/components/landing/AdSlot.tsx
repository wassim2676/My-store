// ==================== 💰 مكان إعلان (جاهز لـ Google AdSense لاحقاً) ====================
// لا يظهر شيء ولا يُحمَّل أي سكربت حتى يُضبط NEXT_PUBLIC_ADSENSE_CLIENT (مثل ca-pub-123…) في Vercel.
// الأماكن مختارة حسب إرشادات AdSense: بعد المقدمة، وسط المحتوى، ونهاية المقال — بعيداً عن الأزرار والروابط.

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
// قيم ثابتة (Next يستبدل process.env.NEXT_PUBLIC_* حرفياً فقط، لا بالوصول الديناميكي)
const SLOTS = {
  top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP,
  middle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE,
  bottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM,
};

export const adsEnabled = !!CLIENT;

export default function AdSlot({ slot, className = "" }: { slot: "top" | "middle" | "bottom"; className?: string }) {
  if (!CLIENT) return null;
  const slotId = SLOTS[slot];
  return (
    <aside aria-label="Advertisement" className={`my-10 flex min-h-[120px] flex-col items-center ${className}`}>
      <span className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[var(--lp-muted)]">Advertisement</span>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <script dangerouslySetInnerHTML={{ __html: "(adsbygoogle=window.adsbygoogle||[]).push({});" }} />
    </aside>
  );
}

/** سكربت AdSense (مرة واحدة في الصفحة) — لا شيء قبل التفعيل */
export function AdSenseScript() {
  if (!CLIENT) return null;
  return <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`} crossOrigin="anonymous" />;
}
