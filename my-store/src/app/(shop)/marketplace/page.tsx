import { Suspense } from "react";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";
import MarketplaceGrid from "@/components/shop/MarketplaceGrid";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Suspense fallback={<div className="py-24 text-center text-slate-400">جاري التحميل...</div>}>
          <MarketplaceGrid />
        </Suspense>
      </main>
      <MegaFooter />
    </div>
  );
}
