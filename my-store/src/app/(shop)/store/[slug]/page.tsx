import { notFound } from "next/navigation";
import Image from "next/image";
import { Store, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";
import ProductCard from "@/components/shared/ProductCard";

export default async function VendorStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const vendor = await prisma.vendor.findUnique({ where: { slug } });
  if (!vendor || vendor.status !== "APPROVED") notFound();

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: vendor.backgroundColor }}>
      <MegaNavbar />

      {/* غلاف المتجر المخصص بألوان البائع */}
      <section
        className="relative py-14 lg:py-20 px-4 sm:px-6 lg:px-8"
        style={{
          background: vendor.banner
            ? undefined
            : `linear-gradient(135deg, ${vendor.primaryColor}, ${vendor.secondaryColor})`,
        }}
      >
        {vendor.banner && (
          <div className="absolute inset-0">
            <Image src={vendor.banner} alt={vendor.storeName} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-start">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {vendor.logo ? (
              <Image src={vendor.logo} alt={vendor.storeName} width={96} height={96} className="object-cover w-full h-full" />
            ) : (
              <Store className="w-10 h-10" style={{ color: vendor.primaryColor }} />
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-md">
              {vendor.bannerTitle || vendor.storeName}
            </h1>
            {(vendor.bannerSubtitle || vendor.description) && (
              <p className="text-white/90 mt-1.5 max-w-lg text-sm sm:text-base drop-shadow-sm">
                {vendor.bannerSubtitle || vendor.description}
              </p>
            )}
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-white/80 text-xs sm:text-sm">
              {vendor.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {vendor.city}</span>}
              {vendor.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {vendor.phone}</span>}
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <h2 className="text-xl sm:text-2xl font-black mb-6" style={{ color: vendor.textColor }}>
          منتجات المتجر ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed" style={{ borderColor: vendor.secondaryColor + "33", color: vendor.textColor + "99" }}>
            لا توجد منتجات في هذا المتجر بعد
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {products.map((p: (typeof products)[number]) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id, slug: p.slug, name: p.name, price: Number(p.price),
                  compareAt: p.compareAt ? Number(p.compareAt) : null,
                  image: p.images?.[0] || "/placeholder-product.png",
                  rating: p.rating ?? 0, reviewCount: p.reviewCount, stock: p.stock,
                  vendorName: vendor.storeName,
                }}
              />
            ))}
          </div>
        )}
      </main>

      <MegaFooter />
    </div>
  );
}
