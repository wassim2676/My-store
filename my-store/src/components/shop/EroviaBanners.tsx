import Image from "next/image";

// ==================== 🖼️ بانر صورة بسيط — يعرض ملفات PNG حقيقية مُركَّبة مسبقاً ====================
// الصور مبنية فعلياً بصورة المنتج الحقيقية + نصوص مُصحَّحة (وليست أكواداً وهمية)
export function BannerImage({
  src,
  alt,
  background = "bg-white",
}: {
  src: string;
  alt: string;
  background?: string;
}) {
  return (
    <div className={`relative w-full ${background}`}>
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={900}
        sizes="100vw"
        className="w-full h-auto"
      />
    </div>
  );
}
