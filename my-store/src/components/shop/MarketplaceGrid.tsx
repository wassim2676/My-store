"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, PackageSearch } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard";
import type { HomeProduct } from "@/lib/products";

interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAt: number | null;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  vendor: { name: string } | null;
}

export default function MarketplaceGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const sort = searchParams.get("sort") || "newest";
  const category = searchParams.get("cat") || "";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchParams.get("q")) params.set("q", searchParams.get("q")!);
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);
      params.set("limit", "24");

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      const mapped: HomeProduct[] = (data.items || []).map((p: ApiProduct) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        compareAt: p.compareAt,
        image: p.images?.[0] || "/placeholder-product.png",
        rating: p.rating,
        reviewCount: p.reviewCount,
        stock: p.stock,
        vendorName: p.vendor?.name ?? null,
      }));

      setProducts(mapped);
      setTotal(data.pagination?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchParams, category, sort]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- إعادة التحميل عند تغيّر معاملات البحث
    load();
  }, [load]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/marketplace?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", search);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex-1 flex rounded-xl overflow-hidden border border-slate-200 bg-white">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="flex-1 px-4 py-2.5 outline-none text-sm"
          />
          <button type="submit" className="px-4 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
            <Search className="w-4 h-4 text-slate-500" />
          </button>
        </form>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="py-2.5 outline-none text-sm bg-transparent cursor-pointer"
          >
            <option value="newest">الأحدث</option>
            <option value="price_asc">السعر: الأقل أولاً</option>
            <option value="price_desc">السعر: الأعلى أولاً</option>
            <option value="rating">الأعلى تقييماً</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-5">{total} منتج{category ? ` في "${category}"` : ""}</p>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          <PackageSearch className="w-10 h-10" />
          <p className="text-sm font-medium">لا توجد منتجات مطابقة</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
