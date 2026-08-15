import type { Metadata } from "next";

// ==================== 🖼️ صورة وبيانات المعاينة عند مشاركة الرابط ====================
// ⚠️ هذه هي الصورة التي ستظهر عند مشاركة الرابط في واتساب/فيسبوك/تيليجرام إلخ.
// لتغييرها لاحقاً: ضع صورتك النهائية في /public (مثال: /public/og/erovia.jpg)
// ثم غيّر السطر أدناه من رابط الإنترنت إلى المسار المحلي: "/og/erovia.jpg"
const OG_IMAGE_URL = "https://images.unsplash.com/photo-1584308972272-9cf4b93c8c65?w=1200&h=630&fit=crop";

const PAGE_TITLE = "إيروفيا | تركيبة طبيعية 100% — عرض محدود";
const PAGE_DESCRIPTION = "إيروفيا — تركيبة مختارة للاستخدام اليومي. اكتشف المنتج والباقات المتاحة، والدفع عند الاستلام.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: "website",
    locale: "ar_MA",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "إيروفيا",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE_URL],
  },
};

export default function EroviaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
