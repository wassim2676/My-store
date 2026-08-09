import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">الإرجاع والاستبدال</h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 prose prose-slate max-w-none leading-relaxed text-slate-600 space-y-4">
          <p>يمكنك إرجاع أو استبدال أي منتج خلال 14 يوماً من تاريخ الاستلام، بشرط أن يكون بحالته الأصلية.</p>
          <p>لطلب إرجاع، توجه إلى صفحة "طلباتي" واختر الطلب المعني، أو تواصل مع خدمة العملاء.</p>
        </div>
      </main>
      <MegaFooter />
    </div>
  );
}
