import StaticPage from "@/components/site/StaticPage";

export const metadata = { title: "من نحن" };

export default function Page() {
  return (
    <StaticPage title="من نحن">
      <p>نحن منصة مخصّصة للمسوّقين بالعمولة المحترفين. نمنحك صفحة هبوط أنيقة باسمك تجمع فيها أفضل عروضك من أكبر المتاجر العالمية، مع مراجعات مختصرة تبني الثقة وتزيد نسبة الشراء.</p>
      <p>هدفنا أن تركّز أنت على اختيار المنتجات وكتابة المراجعات، ونتكفّل نحن بالتصميم والسرعة وتتبّع النقرات.</p>
    </StaticPage>
  );
}
