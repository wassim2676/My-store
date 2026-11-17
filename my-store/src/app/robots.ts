import type { MetadataRoute } from "next";

// 🤖 الزواحف المحترمة لا تفتح روابط التحويل (/go) ولا لوحات التحكم.
// الزواحف التي تتجاهل هذا الملف تُعالَج في /go نفسه (رابط نظيف بدون معرّف الأفلييت).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/go/", "/dashboard", "/admin", "/api/", "/login", "/register"],
    },
  };
}
