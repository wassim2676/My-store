"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Palette, Store } from "lucide-react";

const links = [
  { href: "/vendor/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/vendor/products", label: "منتجاتي", icon: Package },
  { href: "/vendor/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/vendor/settings", label: "تخصيص المتجر", icon: Palette },
];

export default function VendorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-60 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sticky top-24">
        <div className="flex items-center gap-2 px-3 py-3 mb-2 border-b border-slate-100">
          <Store className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-slate-900 text-sm">لوحة البائع</span>
        </div>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  active ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
