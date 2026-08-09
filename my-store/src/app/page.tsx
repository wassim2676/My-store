import MegaNavbar from "@/components/home/MegaNavbar";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import TrustBadges from "@/components/home/TrustBadges";
import SellerCtaBanner from "@/components/home/SellerCtaBanner";
import BlogSection from "@/components/home/BlogSection";
import MegaFooter from "@/components/home/MegaFooter";
import HomeSections from "@/components/home/HomeSections";
import { getFeaturedProducts, getDealProducts, getNewArrivals } from "@/lib/products";

// الصفحة الرئيسية Server Component تجلب بيانات حقيقية من قاعدة البيانات
// وتُركّب كل السيكشنز الاحترافية بترتيب مدروس لإبراز قوة المنصة
export default async function Home() {
  const [featured, deals, newArrivals] = await Promise.all([
    getFeaturedProducts(8),
    getDealProducts(8),
    getNewArrivals(8),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <MegaNavbar />

      <main>
        <HeroBanner />
        <CategoryGrid />
        <HomeSections featured={featured} deals={deals} newArrivals={newArrivals} />
        <WhyChooseUs />
        <BlogSection />
        <SellerCtaBanner />
        <TrustBadges />
      </main>

      <MegaFooter />
    </div>
  );
}
