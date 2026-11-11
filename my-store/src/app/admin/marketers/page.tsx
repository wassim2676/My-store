import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import MarketerPublishToggle from "./PublishToggle";

export const dynamic = "force-dynamic";

// ==================== 👥 الأدمن: قائمة المسوّقين وصفحاتهم ====================
export default async function AdminMarketersPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) redirect("/login");

  const pages = await prisma.landingPage.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
      _count: { select: { offers: true } },
      offers: { select: { clicks: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المسوّقون</h1>
        <p className="text-sm text-gray-500">{pages.length} صفحة هبوط</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-start font-medium">الصفحة</th>
              <th className="px-4 py-3 text-start font-medium">المسوّق</th>
              <th className="px-4 py-3 text-end font-medium">العروض</th>
              <th className="px-4 py-3 text-end font-medium">الزيارات</th>
              <th className="px-4 py-3 text-end font-medium">النقرات</th>
              <th className="px-4 py-3 text-center font-medium">منشورة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {pages.map((p) => (
              <tr key={p.id} className="text-gray-700 dark:text-gray-300">
                <td className="px-4 py-3">
                  <Link href={`/${p.slug}`} target="_blank" className="flex items-center gap-1.5 font-medium text-gray-900 hover:text-sky-600 dark:text-white">
                    {p.title} <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <span className="text-xs text-gray-400" dir="ltr">/{p.slug}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="block">{[p.user.firstName, p.user.lastName].filter(Boolean).join(" ") || "—"}</span>
                  <span className="text-xs text-gray-400">{p.user.email}</span>
                </td>
                <td className="px-4 py-3 text-end tabular-nums">{p._count.offers}</td>
                <td className="px-4 py-3 text-end tabular-nums">{p.views}</td>
                <td className="px-4 py-3 text-end tabular-nums">{p.offers.reduce((a, o) => a + o.clicks, 0)}</td>
                <td className="px-4 py-3 text-center">
                  <MarketerPublishToggle id={p.id} initial={p.isPublished} />
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">لا توجد صفحات بعد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
