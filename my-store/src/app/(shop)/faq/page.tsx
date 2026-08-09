import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">الأسئلة الشائعة</h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 prose prose-slate max-w-none leading-relaxed text-slate-600 space-y-4">
          <p><strong>كيف أتتبع طلبي؟</strong><br/>من خلال صفحة "طلباتي" في حسابك الشخصي.</p>
          <p><strong>ما هي طرق الدفع المتاحة؟</strong><br/>الدفع عند التوصيل، أو الدفع الإلكتروني بالبطاقة البنكية.</p>
          <p><strong>كيف أصبح بائعاً على المنصة؟</strong><br/>سجّل حساباً جديداً واختر "بائع" عند التسجيل، وسيتم مراجعة متجرك خلال 24 ساعة.</p>
        </div>
      </main>
      <MegaFooter />
    </div>
  );
}
