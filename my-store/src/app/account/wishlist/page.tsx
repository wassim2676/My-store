"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, ShoppingCart, Trash2, ArrowUpRight, Store, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ==================== 📦 تعريف الأنواع محلياً ====================
interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  compareAt?: number | null;
  images: string[];
  stock: number;
  isActive: boolean;
}

interface WishlistItem {
  id: string;
  productId: string;
  note?: string | null;
  addedAt: string;
  product: WishlistProduct;
}

// ==================== 🔤 الترجمات الشاملة ====================
type Language = "ar" | "fr" | "en";

const translations: Record<Language, any> = {
  ar: {
    title: "قائمة الأمنيات ❤️",
    subtitle: (count: number) => `${count} منتجات محفوظة • راجعها قبل نفاد الكمية`,
    addToCartAll: "إضافة الكل للسلة",
    empty: {
      title: "قائمتك فارغة",
      desc: "لم تقم بحفظ أي منتجات بعد. تصفح المتجر وأضف ما يعجبك للعودة إليه لاحقاً.",
      browse: "تصفح المنتجات",
    },
    product: {
      inStock: "متوفر",
      outOfStock: "نفذت الكمية",
      addToCart: "أضف للسلة",
      added: "تمت الإضافة",
      removeFromWishlist: "إزالة من الأمنيات",
    },
    actions: {
      remove: "إزالة",
      confirmRemove: "هل تريد إزالة هذا المنتج من قائمة الأمنيات؟",
    },
    loading: "جاري تحميل قائمة الأمنيات...",
    error: {
      load: "فشل جلب قائمة الأمنيات",
      remove: "فشل إزالة المنتج",
      retry: "إعادة المحاولة",
    },
    toast: {
      added: "تمت الإضافة للسلة!",
      removed: "تمت الإزالة من القائمة",
    },
  },
  fr: {
    title: "Favoris ❤️",
    subtitle: (count: number) => `${count} produits sauvegardés • Vérifiez avant rupture de stock`,
    addToCartAll: "Ajouter tout au panier",
    empty: {
      title: "Votre liste est vide",
      desc: "Vous n'avez pas encore sauvegardé de produits. Parcourez la boutique et ajoutez ce qui vous plaît.",
      browse: "Parcourir les produits",
    },
    product: {
      inStock: "En stock",
      outOfStock: "Rupture de stock",
      addToCart: "Ajouter au panier",
      added: "Ajouté",
      removeFromWishlist: "Retirer des favoris",
    },
    actions: {
      remove: "Retirer",
      confirmRemove: "Voulez-vous retirer ce produit de vos favoris?",
    },
    loading: "Chargement des favoris...",
    error: {
      load: "Échec du chargement des favoris",
      remove: "Échec de la suppression",
      retry: "Réessayer",
    },
    toast: {
      added: "Ajouté au panier!",
      removed: "Retiré de la liste",
    },
  },
  en: {
    title: "Wishlist ❤️",
    subtitle: (count: number) => `${count} items saved • Check before they run out`,
    addToCartAll: "Add All to Cart",
    empty: {
      title: "Your List is Empty",
      desc: "You haven't saved any products yet. Browse the store and add what you like to return later.",
      browse: "Browse Products",
    },
    product: {
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      addToCart: "Add to Cart",
      added: "Added",
      removeFromWishlist: "Remove from wishlist",
    },
    actions: {
      remove: "Remove",
      confirmRemove: "Do you want to remove this product from your wishlist?",
    },
    loading: "Loading wishlist...",
    error: {
      load: "Failed to load wishlist",
      remove: "Failed to remove item",
      retry: "Retry",
    },
    toast: {
      added: "Added to cart!",
      removed: "Removed from list",
    },
  },
};

// ==================== 🎨 مكون بطاقة المنتج ====================
function WishlistCard({ 
  item, 
  t, 
  lang,
  onRemove, 
  onAddToCart 
}: { 
  item: WishlistItem; 
  t: any; 
  lang: Language;
  onRemove: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}) {
  const product = item.product;
  const inStock = product.stock > 0 && product.isActive;
  const imageUrl = product.images?.[0] || "https://via.placeholder.com/400x400?text=No+Image";

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-US", {
      style: "currency", currency: "MAD", minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
      
      {/* Remove Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(product.id); }}
        className="absolute top-3 start-3 z-10 w-8 h-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm cursor-pointer"
        title={t.actions.remove}
        aria-label={t.product.removeFromWishlist}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full">
              {t.product.outOfStock}
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 h-12 leading-relaxed">
            {product.name}
          </h3>
          <p className={`text-xs mt-1 flex items-center gap-1 ${inStock ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
            <Store className="w-3 h-3" />
            {inStock ? t.product.inStock : t.product.outOfStock}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
            {formatPrice(product.price)}
          </span>
          {product.compareAt && product.compareAt > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAt)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
          disabled={!inStock}
          className={`w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            inStock
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-sky-600 dark:hover:bg-sky-500 hover:text-white dark:hover:text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {inStock ? t.product.addToCart : t.product.outOfStock}
        </button>
      </div>
    </div>
  );
}

// ==================== 🏠 المكون الرئيسي ====================
export default function WishlistPage() {
  const [lang, setLang] = useState<Language>("ar");
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());

  const t = translations[lang];

  // 🔹 تحميل اللغة
  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Language;
    if (savedLang && ["ar", "fr", "en"].includes(savedLang)) {
      setLang(savedLang);
    }
  }, []);

  // 🔹 جلب قائمة الأمنيات
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/wishlist");
      const result = await response.json();
      
      if (response.ok && result.success && Array.isArray(result.data)) {
        setItems(result.data);
      } else {
        setError(result.error || t.error.load);
      }
    } catch (err) {
      console.error("Fetch wishlist error:", err);
      setError(t.error.load);
    } finally {
      setLoading(false);
    }
  }, [t.error.load]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // 🔹 إزالة منتج من الأمنيات
  const handleRemove = async (productId: string) => {
    if (!confirm(t.actions.confirmRemove)) return;
    
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      
      if (response.ok) {
        setItems(prev => prev.filter(item => item.product.id !== productId));
      } else {
        setError(t.error.remove);
      }
    } catch (err) {
      console.error("Remove from wishlist error:", err);
      setError(t.error.remove);
    }
  };

  // 🔹 إضافة منتج للسلة (محاكاة)
  const handleAddToCart = async (productId: string) => {
    setAddingToCart(prev => new Set(prev).add(productId));
    
    try {
      // 🔹 هنا يتم ربط الـ API الحقيقي للسلة
      // await fetch("/api/cart", { method: "POST", body: JSON.stringify({ productId, quantity: 1 }) });
      
      // محاكاة نجاح الإضافة
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // يمكن إضافة Toast Notification هنا
      console.log(`Added ${productId} to cart`);
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setAddingToCart(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // 🔹 إضافة الكل للسلة
  const handleAddAllToCart = async () => {
    const inStockItems = items.filter(item => item.product.stock > 0 && item.product.isActive);
    
    for (const item of inStockItems) {
      await handleAddToCart(item.product.id);
    }
  };

  // 🔹 حالة التحميل (Skeleton)
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t.subtitle(items.length)}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleAddAllToCart}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-sky-600 hover:to-blue-700 transition-all shadow-sm cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            {t.addToCartAll}
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={fetchWishlist}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            {t.error.retry}
          </button>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
          <div className="w-20 h-20 bg-sky-50 dark:bg-sky-900/20 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-sky-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t.empty.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            {t.empty.desc}
          </p>
          <Link
            href="/marketplace"
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t.empty.browse} <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              t={t}
              lang={lang}
              onRemove={handleRemove}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}