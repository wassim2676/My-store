import type { Metadata } from "next";
import FacebookPixel from "@/components/shared/FacebookPixel";

// ⚠️ صورة مؤقتة — استبدلها بصورتك النهائية لاحقاً (نفس أسلوب صفحة erovia الأصلية)
const OG_IMAGE_URL = "https://images.unsplash.com/photo-1584308972272-9cf4b93c8c65?w=1200&h=630&fit=crop";

const PAGE_TITLE = "Erovia | تركيبة طبيعية 100%";
const PAGE_DESCRIPTION = "Erovia — تركيبة طبيعية مختارة لدعم الطاقة والثقة والحيوية اليومية. الدفع عند الاستلام.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: "website",
    locale: "ar_MA",
    images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Erovia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE_URL],
  },
};

export default function EroViaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FacebookPixel />
      {children}
    </>
  );
}
