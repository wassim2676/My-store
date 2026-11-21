"use client";

import { useEffect } from "react";
import Script from "next/script";

// ==================== 📈 بكسلات المسوّق (Meta + TikTok) ====================
// يُحمَّل للزوار فقط (ليس لصاحب الصفحة). الأحداث:
//   PageView / page        : كل صفحة (وعند التنقل الداخلي)
//   ViewContent            : صفحة العرض (مع السعر والعملة)
//   InitiateCheckout / ClickButton : نقرة زر الشراء (/go) — إشارة نية شراء يمكن تحسين الإعلانات عليها
type Content = { id: string; name: string; value?: number | null; currency?: string | null };

type Fbq = (...args: unknown[]) => void;
type Ttq = { page: () => void; track: (event: string, data?: Record<string, unknown>) => void };
declare global {
  interface Window {
    fbq?: Fbq;
    ttq?: Ttq;
    __psPixels?: boolean;
  }
}

export default function LandingPixels({ meta, tiktok, content }: { meta?: string; tiktok?: string; content?: Content }) {
  useEffect(() => {
    if (!meta && !tiktok) return;
    // أول تحميل: كود البكسل نفسه يرسل PageView. التنقل الداخلي (صفحة جديدة بدون إعادة تحميل): نرسله نحن
    if (window.__psPixels) {
      window.fbq?.("track", "PageView");
      window.ttq?.page();
    }
    window.__psPixels = true;

    if (content) {
      const value = content.value ?? undefined;
      const currency = content.currency || "USD";
      window.fbq?.("track", "ViewContent", { content_ids: [content.id], content_name: content.name, content_type: "product", value, currency });
      window.ttq?.track("ViewContent", { content_id: content.id, content_name: content.name, content_type: "product", value, currency });
    }

    // نقرة أي زر شراء (رابط /go/{offerId})
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href*="/go/"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = /\/go\/([a-z0-9]+)/i.exec(a.getAttribute("href") || "")?.[1];
      if (!id) return;
      const data = content && content.id === id ? { value: content.value ?? undefined, currency: content.currency || "USD", content_name: content.name } : {};
      window.fbq?.("track", "InitiateCheckout", { content_ids: [id], content_type: "product", ...data });
      window.ttq?.track("ClickButton", { content_id: id, content_type: "product", ...data });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [meta, tiktok, content]);

  return (
    <>
      {meta && (
        <Script id="ps-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(meta)});fbq('track','PageView');`}
        </Script>
      )}
      {tiktok && (
        <Script id="ps-tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var s=d.createElement("script");s.type="text/javascript";s.async=!0;s.src=r+"?sdkid="+e+"&lib="+t;var f=d.getElementsByTagName("script")[0];f.parentNode.insertBefore(s,f)};ttq.load(${JSON.stringify(tiktok)});ttq.page();}(window,document,'ttq');`}
        </Script>
      )}
      {meta && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${meta}&ev=PageView&noscript=1`} />
        </noscript>
      )}
    </>
  );
}
