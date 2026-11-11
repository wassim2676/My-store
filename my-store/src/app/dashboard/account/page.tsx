import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import AccountForm from "@/components/dashboard/AccountForm";

export default async function AccountPage() {
  const ctx = await getMarketerSession();
  const user = await prisma.user.findUnique({
    where: { id: ctx!.userId },
    select: { firstName: true, lastName: true, email: true },
  });
  return <AccountForm initial={{ firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", email: user?.email ?? "" }} />;
}
