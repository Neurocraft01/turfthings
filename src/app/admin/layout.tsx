"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  CreditCard, 
  BarChart3, 
  Image as ImageIcon, 
  MessageSquare,
  LogOut,
  Menu,
  X,
  Mail,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    // Simple mock auth check
    if (pathname !== "/admin/login" && typeof window !== "undefined") {
      const isAuth = localStorage.getItem("adminAuth") === "true";
      if (!isAuth) {
        router.push("/admin/login");
      }
    }
  }, [pathname, router]);



  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Content", href: "/admin/content", icon: ImageIcon },
    { name: "Contacts", href: "/admin/contacts", icon: MessageSquare },
    { name: "Reports", href: "/admin/reports", icon: Mail },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-card border-b border-card-border p-4 flex justify-between items-center sticky top-0 z-50">
        <span className="font-display text-2xl text-brand uppercase tracking-wider">
          Turf<span className="text-foreground">Admin</span>
        </span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-foreground">
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-card-border transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-16 hidden md:flex items-center px-6 border-b border-card-border">
            <span className="font-display text-2xl text-brand uppercase tracking-wider">
              Turf<span className="text-foreground">Admin</span>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pt-20 md:pt-6 pb-6 px-4">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                      isActive 
                        ? "bg-brand/10 text-brand border-l-2 border-brand" 
                        : "text-gray-500 hover:bg-gray-100 hover:text-foreground"
                    }`}
                  >
                    <item.icon size={20} className="mr-3 flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-card-border">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        {children}
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
