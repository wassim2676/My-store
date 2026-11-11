import StaticPage from "@/components/site/StaticPage";

export const metadata = { title: "شروط الاستخدام" };

export default function Page() {
  return (
    <StaticPage title="شروط الاستخدام">
      <p>باستخدامك للمنصة فإنك توافق على الالتزام بالشروط التالية.</p>
      <p>يلتزم المسوّق بنشر معلومات صادقة عن المنتجات، وباحترام شروط برامج الأفلييت التي يشارك فيها (مثل Amazon Associates وWalmart Affiliates وTarget Partners)، وبإظهار إفصاح التسويق بالعمولة.</p>
      <p>يُمنع استخدام علامات تجارية أو صور دون حق، أو نشر محتوى مضلّل أو مخالف للقانون.</p>
      <p>تحتفظ المنصة بحق تعليق أو إغلاق أي صفحة أو حساب يخالف هذه الشروط.</p>
    </StaticPage>
  );
}
