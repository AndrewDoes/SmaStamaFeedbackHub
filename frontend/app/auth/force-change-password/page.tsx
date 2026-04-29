"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth";
import api from "@/services/api";
import Image from "next/image";

export default function ForceChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const mutation = useMutation({
    mutationFn: async () => {
      const errors: { [key: string]: string } = {};
      
      if (!oldPassword) errors.oldPassword = "Current password is required.";
      if (!newPassword) errors.newPassword = "New password is required.";
      if (!confirmPassword) errors.confirmPassword = "Please confirm your new password.";
      
      if (newPassword && newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters long.";
      } else if (newPassword && !/[A-Z]/.test(newPassword)) {
        errors.newPassword = "Password must contain at least one uppercase letter.";
      } else if (newPassword && !/[0-9]/.test(newPassword)) {
        errors.newPassword = "Password must contain at least one number.";
      } else if (newPassword && !/[\W_]/.test(newPassword)) {
        errors.newPassword = "Password must contain at least one special character.";
      }
      
      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        errors.confirmPassword = "New passwords do not match.";
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        throw new Error("Validation failed");
      }

      setFieldErrors({});
      return api.post("/auth/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });
    },
    onSuccess: () => {
      localStorage.setItem("must_change_password", "false");
      window.location.href = "/";
    },
    onError: (err: any) => {
      if (err.message !== "Validation failed") {
        setFieldErrors({ general: err.response?.data?.message || err.message || "Failed to update password." });
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-background relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-md bg-brand-surface rounded-[40px] shadow-premium p-8 relative z-10 border border-brand-primary/5">
        <div className="text-center mb-10">
          <Image 
            src={'https://stamayk.sch.id/icons/logostamayk.svg'} 
            alt="Stama Logo" 
            width={64} 
            height={64} 
            className="mx-auto mb-6 drop-shadow-xl"
          />
          <h1 className="text-3xl font-black text-brand-text-main tracking-tighter mb-2">Secure Your Account</h1>
          <p className="text-brand-text-body/60 text-sm font-medium">Since this is your first login, please update your temporary password to continue.</p>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-6"
        >
          {fieldErrors.general && (
            <div className="p-4 bg-brand-error/10 border border-brand-error/20 text-brand-error text-xs font-bold rounded-2xl animate-in fade-in slide-in-from-top-2">
              {fieldErrors.general}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-text-main/60 uppercase tracking-widest ml-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                if (fieldErrors.oldPassword) setFieldErrors(prev => ({ ...prev, oldPassword: "" }));
              }}
              className={`w-full px-6 py-4 rounded-2xl bg-brand-background/30 border ${fieldErrors.oldPassword ? 'border-brand-error/50 focus:border-brand-error' : 'border-brand-primary/10 focus:border-brand-primary'} outline-none transition-all placeholder:text-brand-text-body/20 font-medium`}
              placeholder="••••••••"
            />
            {fieldErrors.oldPassword && <p className="text-[10px] font-bold text-brand-error ml-1">{fieldErrors.oldPassword}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-text-main/60 uppercase tracking-widest ml-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (fieldErrors.newPassword) setFieldErrors(prev => ({ ...prev, newPassword: "" }));
              }}
              className={`w-full px-6 py-4 rounded-2xl bg-brand-background/30 border ${fieldErrors.newPassword ? 'border-brand-error/50 focus:border-brand-error' : 'border-brand-primary/10 focus:border-brand-primary'} outline-none transition-all placeholder:text-brand-text-body/20 font-medium`}
              placeholder="••••••••"
            />
            {fieldErrors.newPassword && <p className="text-[10px] font-bold text-brand-error ml-1">{fieldErrors.newPassword}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-text-main/60 uppercase tracking-widest ml-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: "" }));
              }}
              className={`w-full px-6 py-4 rounded-2xl bg-brand-background/30 border ${fieldErrors.confirmPassword ? 'border-brand-error/50 focus:border-brand-error' : 'border-brand-primary/10 focus:border-brand-primary'} outline-none transition-all placeholder:text-brand-text-body/20 font-medium`}
              placeholder="••••••••"
            />
            {fieldErrors.confirmPassword && <p className="text-[10px] font-bold text-brand-error ml-1">{fieldErrors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-4 bg-brand-primary text-brand-background font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {mutation.isPending ? "UPDATING..." : "UPDATE & LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
