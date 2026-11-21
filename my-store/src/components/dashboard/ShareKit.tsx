"use client";

/* eslint-disable @next/next/no-img-element -- معاينة صورة Open Graph المولّدة */
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { AlertTriangle, Check, Copy, Download, ExternalLink, Link2, QrCode, RefreshCw, Send, Share2 } from "lucide-react";

// ==================== 📤 عدة المشاركة: معاينة الرابط + روابط جاهزة لكل منصة + QR ====================
export type ShareTarget = { key: string; label: string; group: "page" | "offer" | "article"; path: string; title: string; description: string };

const CHANNELS = [
  { id: "instagram-bio", source: "instagram", medium: "bio", name: "Instagram", color: "#E1306C" },
  { id: "instagram-story", source: "instagram", medium: "story", name: "Instagram", color: "#E1306C" },
  { id: "tiktok-bio", source: "tiktok", medium: "bio", name: "TikTok", color: "#25F4EE" },
  { id: "facebook-post", source: "facebook", medium: "post", name: "Facebook", color: "#1877F2" },
  { id: "whatsapp", source: "whatsapp", medium: "message", name: "WhatsApp", color: "#25D366" },
  { id: "youtube", source: "youtube", medium: "description", name: "YouTube", color: "#FF0033" },
  { id: "pinterest", source: "pinterest", medium: "pin", name: "Pinterest", color: "#E60023" },
  { id: "x", source: "x", medium: "post", name: "X", color: "#E7E9EA" },
  { id: "telegram", source: "telegram", medium: "message", name: "Telegram", color: "#29B6F6" },
  { id: "email", source: "email", medium: "newsletter", name: "Email", color: "#A78BFA" },
] as const;

function withUtm(url: string, source: string, medium: string) {
  const u = new URL(url);
  u.searchParams.set("utm_source", source);
  u.searchParams.set("utm_medium", medium);
  return u.toString();
}

export default function ShareKit({ baseUrl, ogBase, targets }: { baseUrl: string; ogBase: string; targets: ShareTarget[] }) {
  const t = useTranslations("dash.share");
  const [key, setKey] = useState(targets[0]?.key ?? "home");
  const [tab, setTab] = useState<"facebook" | "whatsapp" | "x">("facebook");
  const [qr, setQr] = useState<string | null>(null);
  const target = targets.find((x) => x.key === key) ?? targets[0];
  const url = `${baseUrl}${target.path}`;
  const host = baseUrl.replace(/^https?:\/\//, "").split("/")[0];
  // صورة المعاينة من نفس موقع لوحة التحكم (بدون تحويل) + رقم يكسر الكاش بعد التعديلات
  const [stamp] = useState(() => Date.now());
  const ogImage = `${ogBase}${target.path}/opengraph-image?v=${stamp}`;
  const qrUrl = useMemo(() => withUtm(url, "qr", "print"), [url]);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(qrUrl, { width: 640, margin: 2, errorCorrectionLevel: "M", color: { dark: "#0B0E14", light: "#FFFFFF" } })
      .then((d) => alive && setQr(d))
      .catch(() => alive && setQr(null));
    return () => {
      alive = false;
    };
  }, [qrUrl]);

  const intents = [
    { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${target.title} ${withUtm(url, "whatsapp", "message")}`)}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(withUtm(url, "facebook", "post"))}` },
    { name: "X", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(withUtm(url, "x", "post"))}&text=${encodeURIComponent(target.title)}` },
    { name: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(withUtm(url, "telegram", "message"))}&text=${encodeURIComponent(target.title)}` },
    { name: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(withUtm(url, "pinterest", "pin"))}&description=${encodeURIComponent(target.title)}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(withUtm(url, "linkedin", "post"))}` },
  ];

  return (
    <div className="space-y-6">
      {/* 🔗 الرابط المختار */}
      <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
        <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-end">
          <label className="block min-w-0 lg:w-80">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">{t("whatToShare")}</span>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="mt-2 w-full cursor-pointer rounded-lg border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm outline-none focus:border-amber-400/60"
            >
              {(["page", "offer", "article"] as const).map((g) => {
                const items = targets.filter((x) => x.group === g);
                if (!items.length) return null;
                return (
                  <optgroup key={g} label={t(`groups.${g}`)}>
                    {items.map((x) => (
                      <option key={x.key} value={x.key}>
                        {x.label}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </label>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">{t("yourLink")}</span>
            <div className="mt-2 flex min-w-0 items-stretch overflow-hidden rounded-lg border border-white/10 bg-black/40" dir="ltr">
              <span className="flex min-w-0 flex-1 items-center gap-2 truncate px-3.5 py-2.5 font-mono text-[13px] text-white/85">
                <Link2 className="h-4 w-4 shrink-0 text-white/35" />
                <span className="truncate">{url}</span>
              </span>
              <CopyButton value={url} label={t("copy")} done={t("copied")} />
            </div>
          </div>
          <div className="flex gap-2">
            <a href={url} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium hover:bg-white/5">
              <ExternalLink className="h-4 w-4" />
              {t("open")}
            </a>
            <a
              href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener"
              title={t("refreshFbHint")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium hover:bg-white/5"
            >
              <RefreshCw className="h-4 w-4" />
              {t("refreshFb")}
            </a>
          </div>
        </div>
        <div className="flex items-start gap-2.5 border-t border-white/[0.06] bg-amber-400/[0.04] px-5 py-3 text-xs leading-relaxed text-amber-100/80 sm:px-6">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
          {t("goWarning")}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* 👁️ المعاينة */}
        <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold">{t("previewTitle")}</h2>
              <p className="mt-0.5 text-xs text-white/40">{t("previewText")}</p>
            </div>
            <div className="flex rounded-lg border border-white/10 p-0.5 text-xs">
              {(["facebook", "whatsapp", "x"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTab(k)}
                  className={`rounded-md px-3 py-1.5 font-medium transition cursor-pointer ${tab === k ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
                >
                  {k === "facebook" ? "Facebook" : k === "whatsapp" ? "WhatsApp" : "X"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04),transparent_70%)] p-5 sm:p-8" dir="ltr">
            {tab === "facebook" && (
              <div className="w-full max-w-[520px] overflow-hidden rounded-lg bg-[#242526] text-start shadow-2xl">
                <img src={ogImage} alt="" className="aspect-[1200/630] w-full bg-black/40 object-cover" />
                <div className="border-t border-white/5 bg-[#3A3B3C] px-3 py-2.5">
                  <p className="truncate text-[12px] uppercase text-[#B0B3B8]">{host}</p>
                  <p className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug text-[#E4E6EB]">{target.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-[13px] text-[#B0B3B8]">{target.description}</p>
                </div>
              </div>
            )}
            {tab === "whatsapp" && (
              <div className="w-full max-w-[420px] rounded-xl bg-[#0B141A] p-3">
                <div className="ms-auto max-w-[88%] rounded-lg rounded-tr-none bg-[#005C4B] p-1 text-start shadow">
                  <div className="overflow-hidden rounded-md bg-[#025144]">
                    <img src={ogImage} alt="" className="aspect-[1200/630] w-full object-cover" />
                    <div className="px-2.5 py-2">
                      <p className="line-clamp-2 text-[13px] font-semibold text-[#E9EDEF]">{target.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-[12px] text-[#E9EDEF]/70">{target.description}</p>
                      <p className="mt-1 truncate text-[11px] text-[#E9EDEF]/50">{host}</p>
                    </div>
                  </div>
                  <p className="break-all px-1.5 pb-1 pt-1.5 text-[13px] text-[#53BDEB]">{url}</p>
                </div>
              </div>
            )}
            {tab === "x" && (
              <div className="relative w-full max-w-[520px] overflow-hidden rounded-2xl border border-[#2F3336] bg-black text-start">
                <img src={ogImage} alt="" className="aspect-[1200/630] w-full object-cover" />
                <span className="absolute bottom-3 left-3 max-w-[80%] truncate rounded bg-black/70 px-1.5 py-0.5 text-[13px] text-white">{target.title}</span>
                <p className="border-t border-[#2F3336] px-3 py-2 text-[13px] text-[#71767B]">{host}</p>
              </div>
            )}
          </div>
        </section>

        {/* 📱 QR */}
        <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div>
              <h2 className="font-semibold">{t("qrTitle")}</h2>
              <p className="mt-0.5 text-xs text-white/40">{t("qrText")}</p>
            </div>
            <QrCode className="h-4 w-4 text-white/35" />
          </div>
          <div className="flex flex-col items-center gap-4 p-5">
            <div className="rounded-xl bg-white p-3">
              {qr ? <img src={qr} alt="QR" className="h-52 w-52" /> : <div className="h-52 w-52 animate-pulse rounded bg-neutral-200" />}
            </div>
            <a
              href={qr ?? undefined}
              download={`qr-${target.key}.png`}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/85 ${qr ? "" : "pointer-events-none opacity-40"}`}
            >
              <Download className="h-4 w-4" />
              {t("qrDownload")}
            </a>
          </div>
        </section>
      </div>

      {/* 🧭 روابط جاهزة لكل منصة */}
      <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0D12]">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-semibold">{t("linksTitle")}</h2>
            <p className="mt-0.5 max-w-3xl text-xs text-white/40">{t("linksText")}</p>
          </div>
          <Share2 className="hidden h-4 w-4 text-white/35 sm:block" />
        </div>
        <div className="divide-y divide-white/[0.05]">
          {CHANNELS.map((c) => {
            const link = withUtm(url, c.source, c.medium);
            return (
              <div key={c.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                <span className="flex w-52 shrink-0 items-center gap-2.5 text-sm font-medium">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                  {c.name}
                  <span className="text-xs font-normal text-white/40">· {t(`medium.${c.medium}`)}</span>
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-white/50" dir="ltr">
                  {link}
                </span>
                <span className="shrink-0">
                  <CopyButton value={link} label={t("copy")} done={t("copied")} small />
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-white/[0.015] px-5 py-4 sm:px-6">
          <span className="me-1 flex items-center gap-1.5 text-xs text-white/45">
            <Send className="h-3.5 w-3.5" />
            {t("shareNow")}
          </span>
          {intents.map((i) => (
            <a key={i.name} href={i.href} target="_blank" rel="noopener" className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-white/75 transition hover:border-white/30 hover:text-white">
              {i.name}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function CopyButton({ value, label, done, small }: { value: string; label: string; done: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className={
        small
          ? "inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/5 cursor-pointer"
          : "flex shrink-0 items-center gap-1.5 border-s border-white/10 px-4 text-sm font-medium hover:bg-white/5 cursor-pointer"
      }
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? done : label}
    </button>
  );
}
