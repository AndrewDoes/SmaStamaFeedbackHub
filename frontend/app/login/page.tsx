"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import Image from "next/image";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await authService.login(code, password);
      const role = user.role || user.Role;
      if (role === "Administrator") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Kredensial tidak valid. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden font-sans bg-brand-background">
      {/* Logo */}
      <Image src={'https://stamayk.sch.id/icons/logostamayk.svg'} alt="Logo" width={64} height={64} className="rounded-lg" />
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6 py-12 mx-auto">
        <div className="bg-brand-surface/80 dark:bg-brand-surface/90 backdrop-blur-xl rounded-2xl shadow-premium border border-brand-primary/10 p-8 md:p-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl mb-2 text-brand-text-main">
              Stama Listen
            </h1>
            <p className="text-brand-text-body/80 font-medium">
              SMA Santa Maria Yogyakarta
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-brand-text-main mb-2">
                ID Siswa / Kode
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-brand-surface/50 dark:bg-brand-background/20 border border-brand-primary/10 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none transition-all placeholder:text-brand-text-muted"
                placeholder="Masukkan ID Anda"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-text-main mb-2">
                Kata Sandi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-brand-surface/50 dark:bg-brand-background/20 border border-brand-primary/10 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none transition-all placeholder:text-brand-text-muted"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-brand-error text-sm font-medium bg-brand-error-bg p-3 rounded-lg border border-brand-error/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-brand-background font-bold rounded-xl shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-brand-background/30 border-t-brand-background rounded-full animate-spin"></div>
              ) : (
                <>
                  Masuk
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-brand-primary/10 text-center">
            <p className="text-sm text-brand-text-body/60">
              Masalah teknis? Hubungi Departemen IT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
