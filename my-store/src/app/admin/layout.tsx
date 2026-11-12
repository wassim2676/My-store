import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

// حماية مزدوجة: proxy.ts يمنع غير الأدمن، وهذا الفحص على الخادم احتياطاً
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/dashboard");
  if (!ADMIN_ROLES.has(session.user.role)) redirect("/dashboard");

  const u = session.user;
  return (
    <AdminShell user={{ name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "Admin", email: u.email ?? "" }}>
      {children}
    </AdminShell>
  );
}
