"use client";

import { useEffect } from "react";
import { fontHref } from "@/lib/fonts";

// ==================== 🔤 تحميل الخطوط في المتصفح دون تعليق الواجهة ====================
// <link precedence> في React 19 "يُعلّق" العرض حتى يكتمل تحميل الخط. هذا مناسب للصفحة العامة (خادم)،
// لكن داخل لوحة التحكم يجعل الصفحة تعود لشاشة التحميل كلما تغيّر الخط (فتنغلق قائمة الخطوط وتختفي المعاينة).
// هنا نضيف الروابط إلى <head> مباشرة: الخط يظهر فور تحميله والواجهة لا تتوقف.

const loaded = new Set<string>();

export function loadStylesheet(href: string) {
  if (typeof document === "undefined" || loaded.has(href)) return;
  loaded.add(href);
  if (document.querySelector(`link[rel="stylesheet"][href="${CSS.escape(href)}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/** يحمّل خطوط Google المحددة (للمعاينات داخل لوحة التحكم) */
export default function ClientFonts({ fonts }: { fonts: string[] }) {
  const key = fonts.join("|");
  useEffect(() => {
    for (const f of key.split("|")) {
      const href = fontHref(f);
      if (href) loadStylesheet(href);
    }
  }, [key]);
  return null;
}
