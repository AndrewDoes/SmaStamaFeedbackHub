"use client";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import toast from "react-hot-toast";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkImportModal({ isOpen, onClose }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ 
    importedCount: number; 
    skippedCount: number; 
    errors: string[];
    importedStudents: { code: string; fullName: string; initialPassword: string }[] 
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => userService.importStudents(file),
    onSuccess: (res) => {
      setResult(res);
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      toast.success("Impor selesai!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Gagal mengimpor data.");
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent = "Code,FullName,BatchYear\n20240001,Alya Putri,2024\n20240002,Bunga Lestari,2024";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_siswa.csv';
    a.click();
  };

  const downloadResults = () => {
    if (!result) return;
    const header = "Nama,NIM,Password_Awal\n";
    const rows = result.importedStudents.map(s => `"${s.fullName}","${s.code}","${s.initialPassword}"`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hasil_impor_${new Date().getTime()}.csv`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-background/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-brand-surface rounded-2xl shadow-premium border border-brand-primary/10 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-text-main">
              {result ? "Hasil Impor" : "Tambah Siswa (CSV)"}
            </h2>
            <button onClick={handleClose} className="text-brand-text-muted hover:text-brand-text-main transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!result ? (
            <div className="space-y-6">
              <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-xl">
                <p className="text-xs text-brand-text-body font-medium leading-relaxed">
                  Unggah file CSV yang berisi data siswa. Gunakan format kolom: <code className="bg-brand-background px-1 rounded font-bold">Code</code>, <code className="bg-brand-background px-1 rounded font-bold">FullName</code>, dan <code className="bg-brand-background px-1 rounded font-bold">BatchYear</code>.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline flex items-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Unduh Template CSV
                </button>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${file ? "border-brand-primary bg-brand-primary/5" : "border-brand-primary/20 hover:border-brand-primary/40 bg-brand-background/30"
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <svg className={`w-12 h-12 mb-4 ${file ? "text-brand-primary" : "text-brand-primary/20"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-bold text-brand-text-main">{file.name}</p>
                    <p className="text-[10px] text-brand-text-body/40">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-brand-text-body/40 uppercase tracking-widest">Klik untuk memilih file CSV</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border border-brand-primary/10 text-brand-text-main font-semibold rounded-xl hover:bg-brand-primary/5 transition-all"
                >
                  Batal
                </button>
                <button
                  disabled={!file || mutation.isPending}
                  onClick={() => file && mutation.mutate(file)}
                  className="flex-1 px-6 py-3 bg-brand-primary text-brand-background font-bold rounded-xl hover:bg-brand-primary/90 transition-all disabled:opacity-50"
                >
                  {mutation.isPending ? "Mengimpor..." : "Mulai Impor"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-brand-background rounded-xl border border-brand-primary/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-body/40 mb-1">Berhasil</p>
                  <p className="text-2xl font-black text-brand-primary">{result.importedCount}</p>
                </div>
                <div className="p-4 bg-brand-background rounded-xl border border-brand-primary/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-body/40 mb-1">Dilewati</p>
                  <p className="text-2xl font-black text-brand-text-body/40">{result.skippedCount}</p>
                </div>
              </div>

              {result.importedStudents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-body/40">Daftar Akun Baru</p>
                    <button 
                      onClick={downloadResults}
                      className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Unduh CSV Login
                    </button>
                  </div>
                  <div className="max-h-60 overflow-auto rounded-xl border border-brand-primary/5 bg-brand-background">
                    <table className="w-full text-left text-[11px]">
                      <thead className="sticky top-0 bg-brand-surface border-b border-brand-primary/10">
                        <tr>
                          <th className="px-4 py-3 font-black uppercase tracking-widest text-brand-text-body/40">Nama</th>
                          <th className="px-4 py-3 font-black uppercase tracking-widest text-brand-text-body/40">NIM</th>
                          <th className="px-4 py-3 font-black uppercase tracking-widest text-brand-text-body/40">Password Awal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-primary/5">
                        {result.importedStudents.map((s, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 font-bold text-brand-text-main">{s.fullName}</td>
                            <td className="px-4 py-3 text-brand-text-body/60">{s.code}</td>
                            <td className="px-4 py-3 font-mono font-bold text-brand-primary">{s.initialPassword}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="max-h-32 overflow-auto p-4 bg-brand-error/5 border border-brand-error/10 rounded-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-error mb-2 text-center">Log Masalah:</p>
                  <ul className="space-y-1">
                    {result.errors.map((err, i) => (
                      <li key={i} className="text-[9px] text-brand-error/80 font-medium">• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

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
