"use client";

import { useEffect, useState } from "react";
import { authService } from "@/services/auth";
import Image from "next/image";
import NotificationBell from "./NotificationBell";

export default function Topbar() {
  const [name, setName] = useState<string>("User");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setName(localStorage.getItem("user_name") || "User");
    setRole(authService.getRole());
  }, []);

  return (
    <header className="hidden lg:flex fixed top-0 left-0 right-0 h-20 bg-brand-surface/80 backdrop-blur-md border-b border-brand-primary/5 z-50 items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <Image src={'https://stamayk.sch.id/icons/logostamayk.svg'} alt="Logo" width={32} height={32} className="rounded-lg" />
        <div className="flex flex-col">
          <span className="font-black text-brand-text-main tracking-tighter leading-none">SMA Santa Maria Yogyakarta</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-secondary mt-1">Wanita Mandiri Berprestasi Berpribadi</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell />
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-brand-text-main">{name}</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-body/30">{role}</span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-brand-primary/5 flex items-center justify-center font-black text-brand-primary text-xs border border-brand-primary/10">
          {name.charAt(0)}
        </div>
      </div>
    </header>
  );
}
