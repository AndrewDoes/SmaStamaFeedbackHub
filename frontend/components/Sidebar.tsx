"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authService } from "@/services/auth";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string>("User");

  useEffect(() => {
    setRole(authService.getRole());
    setName(localStorage.getItem("user_name") || "User");
  }, []);

  if (pathname === "/login") return null;

  const isAdmin = role === "Administrator";

  const links = isAdmin
    ? [
      { name: "Antrean Admin", href: "/admin", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
      { name: "Pusat Moderasi", href: "/admin/moderation", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
      { name: "Daftar Siswa", href: "/admin/students", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
      { name: "Profil Saya", href: "/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    ]
    : [
      { name: "Pusat Umpan Balik", href: "/", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
      { name: "Umpan Balik Saya", href: "/my-feedback", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
      { name: "Profil", href: "/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-brand-text-main/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed top-0 lg:top-20 h-full lg:h-[calc(100vh-80px)] w-64 bg-brand-surface p-6 flex flex-col z-40 transition-transform duration-300 
        lg:left-0 lg:right-auto lg:border-r lg:translate-x-0 border-brand-primary/5
        ${isOpen
          ? "translate-x-0 right-0 border-l"
          : "translate-x-full right-0 border-l lg:translate-x-0"
        }`}>
        <div className="mb-4 px-2 lg:hidden">
          <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src={'https://stamayk.sch.id/icons/logostamayk.svg'} alt="Logo" width={32} height={32} className="rounded-lg" />
            <span className="font-black text-xl text-brand-text-main tracking-tighter">STAMA Listen</span>
          </Link>
        </div>

        <div className="hidden lg:block mb-8 px-4 pb-6 border-b border-brand-primary text-center">
          <Link href={isAdmin ? "/admin" : "/"} className="inline-block group">
            <h2 className="text-xl font-black text-brand-text-main tracking-tighter uppercase group-hover:text-brand-primary transition-colors">
              Stama<span className="text-brand-primary group-hover:text-brand-text-main"> </span>Listen
            </h2>
            <p className="text-[8px] font-black uppercase tracking-widest text-brand-text-body/20 mt-1">Pusat Umpan Balik v1.0</p>
          </Link>
        </div>


        <div className="mb-8 px-4 py-3 bg-brand-primary/5 rounded-2xl flex items-center gap-3 lg:hidden">
          <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center text-brand-background font-black text-xs">
            {name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-brand-text-main truncate">{name}</p>
            <p className="text-[9px] uppercase tracking-widest text-brand-text-body/40 font-black">{role}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                  ? "bg-brand-primary text-brand-background shadow-premium translate-x-1"
                  : "text-brand-text-body/60 hover:bg-brand-primary/5 hover:text-brand-primary"
                  }`}
              >
                <svg className={`w-5 h-5 transition-transform ${isActive ? "" : "group-hover:scale-110"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
                <span className="font-bold text-sm tracking-tight">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-brand-primary/5">
          <button
            onClick={() => authService.logout()}
            className="w-full flex items-center gap-3 px-4 py-3 text-brand-text-body/40 hover:text-brand-error transition-all rounded-2xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-bold text-sm">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
