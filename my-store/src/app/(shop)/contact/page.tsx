import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">اتصل بنا</h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 prose prose-slate max-w-none leading-relaxed text-slate-600 space-y-4">
          <p>يسعدنا تواصلك معنا لأي استفسار أو ملاحظة:</p>
          <ul>
            <li>البريد الإلكتروني: support@mystore.ma</li>
            <li>الهاتف: 212 5XX-XXXXXX+</li>
            <li>العنوان: الدار البيضاء، المغرب</li>
          </ul>
          <p>فريق الدعم متواجد يومياً للرد على استفساراتكم في أسرع وقت ممكن.</p>
        </div>
      </main>
      <MegaFooter />
    </div>
  );
}
