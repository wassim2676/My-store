import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getMarketerSession } from "@/lib/marketer";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Onboarding from "@/components/dashboard/Onboarding";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getMarketerSession();
  if (!ctx) redirect("/login?callbackUrl=/dashboard");

  // حساب قديم لا يملك صفحة هبوط بعد → نطلب منه اختيار اسم صفحته أولاً
  if (!ctx.landingPage) {
    return (
      <Onboarding
        firstName={ctx.session.user.firstName ?? null}
        isAdmin={ctx.session.user.role === "ADMIN" || ctx.session.user.role === "SUPER_ADMIN"}
      />
    );
  }

  const user = ctx.session.user;
  const account = await prisma.user.findUnique({ where: { id: ctx.userId }, select: { email: true, emailVerified: true } });
  return (
    <DashboardShell
      page={{ slug: ctx.landingPage.slug, title: ctx.landingPage.title, isPublished: ctx.landingPage.isPublished, liveDomain: ctx.landingPage.customDomainVerifiedAt ? ctx.landingPage.customDomain : null }}
      user={{ name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "", email: user.email ?? "", role: user.role }}
      unverifiedEmail={account && !account.emailVerified ? account.email : null}
    >
      {children}
    </DashboardShell>
  );
}
