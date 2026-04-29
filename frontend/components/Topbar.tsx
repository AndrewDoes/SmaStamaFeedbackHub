"use client";

import { useEffect, useState } from "react";
import { authService } from "@/services/auth";
import Image from "next/image";
import Link from "next/link";
import NotificationBell from "./NotificationBell";

export default function Topbar() {
  const [name, setName] = useState<string>("User");
  const [role, setRole] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem("user_name") || "User");
    setRole(authService.getRole());
  }, []);

  return (
    <header className="hidden lg:flex fixed top-0 left-0 right-0 h-20 bg-brand-surface/80 backdrop-blur-md border-b border-brand-primary/5 z-50 items-center justify-between px-8 shadow-sm">
      <Link href={role === "Administrator" ? "/admin" : "/"} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
        <Image src={'https://stamayk.sch.id/icons/logostamayk.svg'} alt="Logo" width={32} height={32} className="rounded-lg" />
        <div className="flex flex-col">
          <span className="font-black text-brand-text-main tracking-tighter leading-none">SMA Santa Maria Yogyakarta</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-secondary mt-1">Wanita Mandiri Berprestasi Berpribadi</span>
        </div>
      </Link>

      <div className="flex items-center gap-4 relative">
        <NotificationBell />

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 hover:bg-brand-primary/5 p-2 rounded-2xl transition-all group"
          >
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-brand-text-main group-hover:text-brand-primary transition-colors">{name}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-body/30">{role}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center font-black text-brand-primary text-sm border border-brand-primary/10 group-hover:bg-brand-primary group-hover:text-brand-background transition-all shadow-sm">
              {name.charAt(0)}
            </div>
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-brand-surface border border-brand-primary/10 rounded-[24px] shadow-premium z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-brand-primary/5 mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-body/20 mb-1">Akun Saya</p>
                  <p className="text-xs font-bold text-brand-text-main truncate">{name}</p>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-brand-text-body/60 hover:bg-brand-primary/5 hover:text-brand-primary transition-all mx-2 rounded-xl group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-bold tracking-tight">Profil Saya</span>
                </Link>

                <div className="h-px bg-brand-primary/5 my-2 mx-4" />

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    authService.logout();
                  }}
                  className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-3 text-brand-text-body/40 hover:bg-brand-error/5 hover:text-brand-error transition-all mx-2 rounded-xl group"
                >
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-bold tracking-tight">Keluar Sesi</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
