import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";
import { prisma } from "@/lib/prisma";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const order = orderId
    ? await prisma.order.findUnique({ where: { id: orderId } })
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">تم استلام طلبك بنجاح!</h1>
          {order && (
            <p className="text-slate-500 mb-1">
              رقم الطلب: <span className="font-bold text-slate-900">#{order.orderNumber}</span>
            </p>
          )}
          <p className="text-slate-500 mb-6 text-sm">
            سيصلك تأكيد على بريدك الإلكتروني، ويمكنك متابعة حالة طلبك من صفحة طلباتي.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/account/orders" className="flex-1 bg-slate-900 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors">
              طلباتي
            </Link>
            <Link href="/marketplace" className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-colors">
              متابعة التسوق
            </Link>
          </div>
        </div>
      </main>

      <MegaFooter />
    </div>
  );
}
