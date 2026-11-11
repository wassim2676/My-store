import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getMarketerSession } from "@/lib/marketer";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Onboarding from "@/components/dashboard/Onboarding";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getMarketerSession();
  if (!ctx) redirect("/login?callbackUrl=/dashboard");

  // حساب قديم لا يملك صفحة هبوط بعد → نطلب منه اختيار اسم صفحته أولاً
  if (!ctx.landingPage) {
    return <Onboarding firstName={ctx.session.user.firstName ?? null} />;
  }

  const user = ctx.session.user;
  return (
    <DashboardShell
      page={{ slug: ctx.landingPage.slug, title: ctx.landingPage.title, isPublished: ctx.landingPage.isPublished }}
      user={{ name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "", email: user.email ?? "", role: user.role }}
    >
      {children}
    </DashboardShell>
  );
}
