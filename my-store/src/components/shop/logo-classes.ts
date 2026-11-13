// ==================== 🎨 أصناف تلوين الشعارات فوق الخلفيات الداكنة ====================
// تُطبَّق على <img> و<svg> داخل BrandLogo، وتتجاهل الشعارات "الشارة" الممتلئة (data-badge)
// مثل مربع Home Depot أو بطاقة Best Buy — هذه تبقى بألوانها الأصلية وإلا صارت مربعاً رمادياً.

/** أبيض دائماً (الصفحة الرئيسية، صفحة المتاجر — خلفيات داكنة ثابتة) */
export const WHITE_LOGO =
  "[&_img:not([data-badge])]:brightness-0 [&_img:not([data-badge])]:invert [&_svg]:brightness-0 [&_svg]:invert";

/** حسب ثيم صفحة الهبوط: أبيض في الثيمات الداكنة، أصلي في الفاتحة (--lp-logo-filter) */
export const THEME_LOGO =
  "[&_img:not([data-badge])]:[filter:var(--lp-logo-filter)] [&_svg]:[filter:var(--lp-logo-filter)]";
