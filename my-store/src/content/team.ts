// ==================== 👥 فريق العمل (صفحة من نحن) ====================
// كل بطاقة تمثّل دوراً في الفريق. لإظهار شخص حقيقي: أضف الاسم والصورة (رابط أو ملف في public/team/).
// بدون اسم تعرض البطاقة اسم الدور فقط (لا نعرض أشخاصاً وهميين على الموقع).
// نصوص الأدوار مترجمة في messages/platform/*.json → pages.about.team.roles.{role}
export type TeamRole = "founder" | "product" | "design" | "partnerships" | "content" | "support";

export type TeamMember = {
  role: TeamRole;
  /** الاسم الكامل (اتركه فارغاً إلى أن تضيف الشخص الحقيقي) */
  name?: string;
  /** صورة مربعة، مثل "/team/ahmed.jpg" */
  photo?: string;
  /** رابط LinkedIn أو X اختياري */
  link?: string;
};

export const TEAM: TeamMember[] = [
  { role: "founder" },
  { role: "product" },
  { role: "design" },
  { role: "partnerships" },
  { role: "content" },
  { role: "support" },
];
