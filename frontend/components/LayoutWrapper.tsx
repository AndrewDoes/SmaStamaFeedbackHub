'use client'
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Image from "next/image";
import Link from "next/link";
import { authService } from "@/services/auth";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const isLoginPage = pathname === "/login";
  const isForceChangePage = pathname === "/auth/force-change-password";

  // Close sidebar when navigating & Enforce password change
  useEffect(() => {
    setIsSidebarOpen(false);
    setRole(authService.getRole());

    // Enforce Password Change
    const mustChange = localStorage.getItem("must_change_password") === "true";
    if (mustChange && !isForceChangePage && !isLoginPage) {
      window.location.href = "/auth/force-change-password";
    }
  }, [pathname, isForceChangePage, isLoginPage]);

  return (
    <div className="flex min-h-screen bg-brand-background">
      {!isLoginPage && !isForceChangePage && (
        <>
          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-brand-surface/80 backdrop-blur-md border-b border-brand-primary/5 z-40 px-4 flex items-center justify-between">
            <Link href={role === "Administrator" ? "/admin" : "/"} className="flex items-center gap-2">
              <Image src={'https://stamayk.sch.id/icons/logostamayk.svg'} alt="Logo" width={32} height={32} className="rounded-lg" />
              <span className="font-black text-brand-text-main tracking-tighter">SMA Santa Maria Yogyakarta</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>

          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <Topbar />
        </>
      )}

      <main className={`flex-1 min-h-screen transition-all duration-300 ${isLoginPage || isForceChangePage ? "ml-0" : "ml-0 lg:ml-64 pt-16 lg:pt-20"
        }`}>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
