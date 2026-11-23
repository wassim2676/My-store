import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { isTeamOnlyAccount } from "@/lib/team";
import AccountForm from "@/components/dashboard/AccountForm";

export default async function AccountPage() {
  const ctx = await getMarketerSession();
  const [user, locked] = await Promise.all([
    prisma.user.findUnique({ where: { id: ctx!.userId }, select: { firstName: true, lastName: true, email: true } }),
    isTeamOnlyAccount(ctx!.userId),
  ]);
  return <AccountForm initial={{ firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", email: user?.email ?? "" }} credentialsLocked={locked} />;
}
