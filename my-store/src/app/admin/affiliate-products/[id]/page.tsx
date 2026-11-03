import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AffiliateProductForm from "@/components/admin/AffiliateProductForm";

export default async function EditAffiliateProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.affiliateProduct.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <AffiliateProductForm
      productId={product.id}
      initialValues={{
        title: product.title,
        shortReview: product.shortReview,
        description: product.description || "",
        images: product.images,
        price: product.price != null ? String(product.price) : "",
        compareAt: product.compareAt != null ? String(product.compareAt) : "",
        currency: product.currency,
        category: product.category,
        tags: product.tags,
        affiliateUrl: product.affiliateUrl,
        rating: product.rating ? String(product.rating) : "",
        reviewCount: product.reviewCount ? String(product.reviewCount) : "",
        isFeatured: product.isFeatured,
        status: product.status,
        brandId: product.brandId,
      }}
    />
  );
}
