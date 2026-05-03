"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import toast from "react-hot-toast";

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateStudentModal({ isOpen, onClose }: CreateStudentModalProps) {
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [batchYear, setBatchYear] = useState<number>(new Date().getFullYear());
  const [error, setError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => userService.createStudent(code, fullName, batchYear),
    onSuccess: (password) => {
      setGeneratedPassword(password);
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      toast.success("Siswa berhasil ditambahkan!");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || "Gagal menambahkan siswa.");
    }
  });

  const handleClose = () => {
    setCode("");
    setFullName("");
    setBatchYear(new Date().getFullYear());
    setError("");
    setGeneratedPassword(null);
    onClose();
  };

  const copyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast.success("Password disalin!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-background/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-brand-surface rounded-2xl shadow-premium border border-brand-primary/10 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-text-main">
              {generatedPassword ? "Siswa Ditambahkan" : "Tambah Siswa Manual"}
            </h2>
            <button onClick={handleClose} className="text-brand-text-muted hover:text-brand-text-main transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!generatedPassword ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
              className="space-y-6"
            >
              {error && (
                <div className="p-4 bg-brand-error/10 border border-brand-error/20 text-brand-error text-xs rounded-xl animate-shake">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-brand-text-body/40 mb-2">Nomor Induk / Kode Siswa</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Contoh: 20240001"
                  className="w-full px-4 py-3 rounded-xl bg-brand-background/30 border border-brand-primary/10 focus:border-brand-primary outline-none transition-all text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-brand-text-body/40 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama sesuai raport"
                  className="w-full px-4 py-3 rounded-xl bg-brand-background/30 border border-brand-primary/10 focus:border-brand-primary outline-none transition-all text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-brand-text-body/40 mb-2">Tahun Angkatan</label>
                <input
                  type="number"
                  value={batchYear}
                  onChange={(e) => setBatchYear(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-brand-background/30 border border-brand-primary/10 focus:border-brand-primary outline-none transition-all text-sm font-medium"
                  required
                />
              </div>

              <div className="p-4 bg-brand-primary/5 rounded-xl flex gap-3 items-start">
                <svg className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[10px] text-brand-text-body/60 leading-relaxed font-medium">
                  Siswa akan mendapatkan password acak yang unik. Mereka akan diminta untuk menggantinya saat pertama kali login.
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border border-brand-primary/10 text-brand-text-main font-semibold rounded-xl hover:bg-brand-primary/5 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 px-6 py-3 bg-brand-primary text-brand-background font-bold rounded-xl hover:bg-brand-primary/90 transition-all disabled:opacity-50"
                >
                  {mutation.isPending ? "Menambahkan..." : "Tambah Siswa"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-brand-text-main">{fullName}</h3>
                <p className="text-sm text-brand-text-body/40 font-medium">{code}</p>
              </div>

              <div className="p-6 bg-brand-background rounded-2xl border border-brand-primary/10 flex flex-col items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-body/30">Password Awal Siswa</p>
                <p className="text-3xl font-black text-brand-primary tracking-wider">{generatedPassword}</p>
                <button 
                  onClick={copyPassword}
                  className="mt-2 px-4 py-2 bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Salin Password
                </button>
              </div>

              <p className="text-[10px] text-brand-text-body/40 text-center italic">
                Pastikan Anda memberikan password ini kepada siswa sebelum menutup jendela ini.
              </p>

              <button
                onClick={handleClose}
                className="w-full px-6 py-4 bg-brand-text-main text-brand-background font-bold rounded-xl hover:bg-brand-text-main/90 transition-all"
              >
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
