"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [userData, setUserData] = useState({ name: "", role: "", code: "" });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setUserData({
      name: localStorage.getItem("user_name") || "User",
      role: localStorage.getItem("user_role") || "Student",
      code: localStorage.getItem("user_code") || "N/A"
    });
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match.");
      }
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }
      return api.post("/auth/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });
    },
    onSuccess: () => {
      toast.success("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || "Failed to update password.");
      toast.error("Failed to update password.");
    },
  });

  return (
    <div className="w-full px-4 md:px-8 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Refined Header */}
      <header className="relative pb-6 border-b border-brand-primary/10">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-brand-text-main tracking-tighter mb-2 italic">
            Dashboard<span className="text-brand-primary">.</span>Profile
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-primary/10">
              {userData.role} Account
            </div>
            <div className="flex items-center gap-2 text-brand-text-body/40 text-[10px] font-bold uppercase tracking-wider">
              <div className="w-1 h-1 rounded-full bg-brand-secondary animate-pulse"></div>
              Portal Secure
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[80px] z-0"></div>
      </header>

      {/* Balanced 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Column 1: Identity & Overview */}
        <section className="space-y-6">
          <div className="bg-brand-surface p-8 rounded-[32px] border border-brand-primary/5 shadow-premium relative overflow-hidden group">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-colors duration-700"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-brand-background rounded-2xl border border-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-text-main tracking-tight leading-none mb-1">{userData.name}</h3>
                  <p className="text-xs font-bold text-brand-text-body/40 uppercase tracking-wider">{userData.role} • {userData.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-8 border-t border-brand-primary/5">
                <div className="p-4 bg-brand-background/30 rounded-2xl border border-brand-primary/5">
                  <p className="text-[9px] font-black text-brand-text-body/30 uppercase tracking-widest mb-1">Account Status</p>
                  <p className="text-brand-secondary text-xs font-black uppercase">Authorized</p>
                </div>
                <div className="p-4 bg-brand-background/30 rounded-2xl border border-brand-primary/5">
                  <p className="text-[9px] font-black text-brand-text-body/30 uppercase tracking-widest mb-1">Privacy Level</p>
                  <p className="text-brand-text-main text-xs font-black uppercase italic">Secured</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                <p className="text-[10px] text-brand-primary/70 font-bold flex items-center gap-2 italic">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Internal student identity remains anonymous within feedback clusters.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => authService.logout()}
            className="group w-full py-4 px-6 bg-brand-error/5 text-brand-error text-xs font-bold rounded-2xl border border-brand-error/10 hover:bg-brand-error/10 transition-all flex items-center justify-between"
          >
            <span className="tracking-widest uppercase">Terminate Session</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </section>

        {/* Column 2: Security Controls */}
        <section className="bg-brand-surface p-8 rounded-[32px] border border-brand-primary/5 shadow-premium flex flex-col justify-between">
          <div className="mb-8">
            <h3 className="text-lg font-black text-brand-text-main tracking-tight uppercase mb-1">Security Dashboard</h3>
            <p className="text-brand-text-body/40 text-[10px] font-bold italic">Credentials should be updated periodically.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="space-y-5"
          >
            {error && (
              <div className="p-3 bg-brand-error/10 border border-brand-error/20 text-brand-error text-[10px] font-black rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-brand-text-main/40 uppercase tracking-[0.2em] ml-1">Current Key</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-brand-background/30 border border-brand-primary/5 focus:border-brand-primary/20 outline-none transition-all placeholder:text-brand-text-body/20 text-sm font-bold"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-brand-text-main/40 uppercase tracking-[0.2em] ml-1">New Key</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-brand-background/30 border border-brand-primary/5 focus:border-brand-primary/20 outline-none transition-all placeholder:text-brand-text-body/20 text-sm font-bold"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-brand-text-main/40 uppercase tracking-[0.2em] ml-1">Repeat</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-brand-background/30 border border-brand-primary/5 focus:border-brand-primary/20 outline-none transition-all placeholder:text-brand-text-body/20 text-sm font-bold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full mt-2 py-4 bg-brand-primary text-brand-background font-black rounded-2xl shadow-lg hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 tracking-widest uppercase text-[10px]"
            >
              {mutation.isPending ? "Syncing..." : "Update Security Credentials"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
