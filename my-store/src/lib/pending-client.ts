// ==================== ⏳ تغيير بانتظار موافقة صاحب الصفحة (للواجهة) ====================
// الـ API يرد بـ 202 + { pending: true } عندما يكون المستخدم عضو فريق يحتاج موافقة.
export const PENDING_EVENT = "ps:pending";

/** يُظهر تنبيه "أُرسل للموافقة" (PendingToast داخل لوحة التحكم يستمع لهذا الحدث) */
export function announcePending() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(PENDING_EVENT));
}
