"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, Search } from "lucide-react";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Booking Analytics", href: "/admin/analytics/booking", icon: BarChart3 },
    { name: "Payment Analytics", href: "/admin/analytics/payment", icon: CreditCard },
    { name: "Booking Search", href: "/admin/analytics/visitors", icon: Search },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-foreground uppercase tracking-wider">Analytics & Reports</h1>
        <p className="text-gray-500 mt-1">Detailed insights into your turf's performance</p>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-2 mb-6 inline-flex flex-wrap gap-2 shadow-sm">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (pathname === "/admin/analytics" && tab.href === "/admin/analytics/booking");
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                isActive
                  ? "bg-brand text-white shadow-md"
                  : "text-gray-500 hover:text-foreground hover:bg-gray-50"
              }`}
            >
              <tab.icon size={18} className="mr-2" />
              {tab.name}
            </Link>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-card-border shadow-sm p-6">
        {children}
      </div>
    </div>
  );
}
