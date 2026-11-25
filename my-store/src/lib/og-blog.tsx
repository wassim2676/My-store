/* eslint-disable @next/next/no-img-element -- عناصر صور داخل مولّد Open Graph (Satori) وليست صفحة */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { NETWORK_BY_SLUG, type Network, type NetworkSlug } from "@/content/blog";
import { clip, hexToRgba, OG_SIZE, ogFonts } from "@/lib/og";
import { ensureContrast } from "@/lib/landing";

/** لون توهّج مرئي على الخلفية الداكنة (سيفورا سوداء مثلاً) */
const glow = (hex: string) => ensureContrast(hex, ["#07090D"], 3);

// ==================== 🖼️ أغلفة المدونة (1200×630) ====================
// تُستعمل كصورة مشاركة (Open Graph/X) وكغلاف ظاهر داخل الموقع. تُولَّد أثناء البناء (ثابتة وسريعة).

const logoCache = new Map<string, Promise<string | null>>();

/** شعار المتجر من public/brands → PNG data URI (Satori لا يعرض كل ملفات SVG بشكل موثوق) */
function brandLogo(slug: NetworkSlug): Promise<string | null> {
  if (!logoCache.has(slug)) {
    logoCache.set(
      slug,
      (async () => {
        try {
          const svg = await readFile(path.join(process.cwd(), "public", "brands", `${slug}.svg`));
          const sharp = (await import("sharp")).default;
          const png = await sharp(svg, { density: 300 }).resize(360, 160, { fit: "inside" }).png().toBuffer();
          return `data:image/png;base64,${png.toString("base64")}`;
        } catch {
          return null;
        }
      })(),
    );
  }
  return logoCache.get(slug)!;
}

let markCache: Promise<string | null> | null = null;
function primeshelfMark() {
  markCache ??= (async () => {
    try {
      const svg = await readFile(path.join(process.cwd(), "public", "brand", "primeshelf-mark.svg"));
      const sharp = (await import("sharp")).default;
      const png = await sharp(svg, { density: 300 }).resize(96, 96, { fit: "inside" }).png().toBuffer();
      return `data:image/png;base64,${png.toString("base64")}`;
    } catch {
      return null;
    }
  })();
  return markCache;
}

const cache = { headers: { "Cache-Control": "public, max-age=3600, s-maxage=604800, stale-while-revalidate=2592000" } };

function Brand({ mark }: { mark: string | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {mark && <img alt="" src={mark} width={44} height={44} style={{ width: 44, height: 44 }} />}
      <div style={{ display: "flex", fontSize: 30, fontWeight: 800, letterSpacing: -0.5, color: "#FFFFFF" }}>
        Prime<span style={{ color: "#F5B800" }}>shelf</span>
      </div>
      <div style={{ display: "flex", width: 2, height: 26, background: "rgba(255,255,255,0.18)", margin: "0 6px" }} />
      <div style={{ display: "flex", fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.6)", letterSpacing: 3, textTransform: "uppercase" }}>
        Affiliate Academy
      </div>
    </div>
  );
}

/** خلفية داكنة بتوهّج بلون الشبكة + شبكة خطوط خفيفة */
function Backdrop({ color: raw }: { color: string }) {
  const color = glow(raw);
  return (
    <>
            <div
        style={{
          position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex",
          backgroundImage: `radial-gradient(circle at 82% 38%, ${hexToRgba(color, 0.55)} 0%, ${hexToRgba(color, 0.12)} 34%, rgba(7,9,13,0) 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex", opacity: 0.5,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, display: "flex", background: color }} />
    </>
  );
}

/** بطاقة الشعار مع بطاقتين مائلتين خلفها (إحساس "رف" منتجات) */
function LogoStack({ net, logo }: { net: Network; logo: string | null }) {
  const g = glow(net.color);
  return (
    <div style={{ position: "relative", display: "flex", width: 380, height: 380, alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", display: "flex", width: 300, height: 300, borderRadius: 44, background: hexToRgba(g, 0.28), transform: "rotate(-14deg)", border: `2px solid ${hexToRgba(g, 0.5)}` }} />
      <div style={{ position: "absolute", display: "flex", width: 300, height: 300, borderRadius: 44, background: "rgba(255,255,255,0.06)", transform: "rotate(8deg)", border: "2px solid rgba(255,255,255,0.12)" }} />
      <div
        style={{
          position: "relative", display: "flex", flexDirection: "column", width: 300, height: 300, borderRadius: 44, background: "#FFFFFF",
          alignItems: "center", justifyContent: "center", gap: 22, boxShadow: `0 40px 80px ${hexToRgba(g, 0.35)}`,
        }}
      >
        {logo ? (
          <img alt="" src={logo} style={{ maxWidth: 220, maxHeight: 110, objectFit: "contain" }} />
        ) : (
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: "#111" }}>{net.name}</div>
        )}
        <div style={{ display: "flex", padding: "8px 18px", borderRadius: 999, background: net.color, color: net.ink, fontSize: 18, fontWeight: 700 }}>
          {clip(net.program, 26)}
        </div>
      </div>
    </div>
  );
}

async function render(node: React.ReactElement) {
  return new ImageResponse(node, { ...OG_SIZE, fonts: await ogFonts(false), ...cache });
}

/** غلاف مقال من الشبكات */
export async function blogArticleImage(opts: { title: string; kind: string; network: NetworkSlug; minutes?: number }) {
  const net = NETWORK_BY_SLUG[opts.network];
  const [logo, mark] = await Promise.all([brandLogo(net.slug), primeshelfMark()]);
  const size = opts.title.length > 64 ? 50 : opts.title.length > 44 ? 58 : 66;
  return render(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Inter", color: "#FFFFFF", background: "#07090D" }}>
      <Backdrop color={net.color} />
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", padding: "56px 56px 52px 74px" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700 }}>
          <Brand mark={mark} />
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", padding: "9px 20px", borderRadius: 999, background: net.color, color: net.ink, fontSize: 20, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                {opts.kind}
              </div>
              <div style={{ display: "flex", padding: "9px 20px", borderRadius: 999, border: "2px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)", fontSize: 20, fontWeight: 600 }}>
                {net.name}
              </div>
            </div>
            <div style={{ display: "flex", fontFamily: "Playfair", fontSize: size, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1 }}>
              {clip(opts.title, 96)}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, color: "rgba(255,255,255,0.6)" }}>
            <span>primeshelf.store/blog</span>
            {opts.minutes ? (
              <>
                <span style={{ display: "flex", width: 6, height: 6, borderRadius: 6, background: glow(net.color) }} />
                <span>{opts.minutes} min read</span>
              </>
            ) : null}
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
          <LogoStack net={net} logo={logo} />
        </div>
      </div>
    </div>,
  );
}

/** غلاف صفحة الشبكة */
export async function blogNetworkImage(network: NetworkSlug, count: number) {
  const net = NETWORK_BY_SLUG[network];
  return blogArticleImage({ title: `${net.program}: the complete affiliate guide`, kind: `${count} guides`, network });
}

/** غلاف عام للمدونة / مقال من قاعدة البيانات */
export async function blogGenericImage(title: string, kind = "Affiliate Academy") {
  const mark = await primeshelfMark();
  const nets = Object.values(NETWORK_BY_SLUG);
  return render(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Inter", color: "#FFFFFF", background: "#07090D" }}>
      <Backdrop color="#F5B800" />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "56px 64px 52px 74px" }}>
        <Brand mark={mark} />
        <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 900 }}>
          <div style={{ display: "flex", padding: "9px 20px", borderRadius: 999, background: "#F5B800", color: "#111", fontSize: 20, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", alignSelf: "flex-start" }}>
            {kind}
          </div>
          <div style={{ display: "flex", fontFamily: "Playfair", fontSize: title.length > 60 ? 56 : 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1 }}>{clip(title, 100)}</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {nets.map((n) => (
            <div key={n.slug} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 17, color: "rgba(255,255,255,0.8)" }}>
              <span style={{ display: "flex", width: 10, height: 10, borderRadius: 10, background: n.color }} />
              {n.name}
            </div>
          ))}
        </div>
      </div>
    </div>,
  );
}
