"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** اسم نطاق الموقع الحالي (مثال: mysite.com) — يُعرض في معاينة رابط صفحة الهبوط */
export function useSiteHost(fallback = "yoursite.com") {
  return useSyncExternalStore(
    subscribe,
    () => window.location.host,
    () => fallback
  );
}

/** الرابط الكامل للموقع (https://mysite.com) */
export function useSiteOrigin(fallback = "") {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => fallback
  );
}
