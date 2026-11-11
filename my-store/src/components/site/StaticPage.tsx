import SiteNavbar from "./SiteNavbar";
import SiteFooter from "./SiteFooter";

/** قالب الصفحات النصية (من نحن، الشروط، الخصوصية...) */
export default function StaticPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#07090D] text-white">
      <SiteNavbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:py-20">
        <h1 className="mb-8 font-serif text-3xl font-semibold sm:text-4xl">{title}</h1>
        <div className="space-y-5 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 leading-relaxed text-white/70 sm:p-8 [&_strong]:text-white [&_a]:text-amber-300">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
