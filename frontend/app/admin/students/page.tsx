"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService, StudentDto } from "@/services/userService";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import BulkImportModal from "@/components/BulkImportModal";
import CreateStudentModal from "@/components/CreateStudentModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function StudentDirectoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [studentToDelete, setStudentToDelete] = useState<StudentDto | null>(null);

  // Registry.Pro uses a large flat list (spreadsheet style) instead of traditional pagination
  const { data, isLoading } = useQuery({
    queryKey: ["admin-students", search],
    queryFn: () => userService.getStudentList(1, 1000, search),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteStudent(id),
    onSuccess: () => {
      toast.success("Siswa berhasil dihapus dari registri.");
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data || "Gagal menghapus siswa.");
    }
  });

  const handleDelete = (student: StudentDto) => {
    setStudentToDelete(student);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      deleteMutation.mutate(studentToDelete.id);
    }
  };

  return (
    <div className="w-full px-4 md:px-10 py-8 flex flex-col h-[calc(100vh-64px)]">
      {/* Breadcrumbs & Header */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-body/30 mb-4 shrink-0">
        <span className="hover:text-brand-primary cursor-pointer" onClick={() => router.push("/admin")}>Admin</span>
        <span>/</span>
        <span className="text-brand-primary">Daftar Siswa</span>
      </nav>

      <header className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-brand-text-main tracking-tighter">
            Registri<span className="text-brand-primary"> </span>Siswa <span className="text-[10px] text-brand-primary/40 font-normal">v1.1</span>
          </h1>
        </div>

        <div className="w-full lg:w-fit flex flex-col sm:flex-row gap-3">
          <div className="relative group min-w-[300px]">
            <input
              type="text"
              placeholder="Cari nama atau kode..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
              className="w-full bg-brand-surface pl-12 pr-4 py-4 rounded-[20px] border border-brand-primary/5 focus:border-brand-primary/20 outline-none transition-all shadow-premium text-sm font-medium"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-body/20 group-focus-within:text-brand-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex-1 sm:flex-none px-6 py-4 bg-brand-primary text-brand-background rounded-[20px] shadow-premium font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Tambah Siswa</span>
            </button>

            <button
              onClick={() => setIsImportOpen(true)}
              className="px-6 py-4 bg-brand-surface text-brand-primary border border-brand-primary/10 rounded-[20px] shadow-premium font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              title="Impor CSV"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="hidden xl:inline">Impor CSV</span>
            </button>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-brand-surface rounded-[32px] border border-brand-primary/5 shadow-premium flex flex-col overflow-hidden">
          {/* Scrollable Workspace */}
          <div className="flex-1 overflow-auto no-scrollbar relative">
            <table className="w-full text-left border-separate border-spacing-0 min-w-[700px] hidden md:table">
              <thead className="sticky top-0 z-20">
                <tr className="bg-brand-background/80 backdrop-blur-md">
                  <th className="pl-10 pr-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 border-b border-brand-primary/5">Kontributor</th>
                  <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 text-center border-b border-brand-primary/5">Angkatan</th>
                  <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 border-b border-brand-primary/5 text-right">Status</th>
                  <th className="pr-10 pl-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 border-b border-brand-primary/5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-primary/[0.03]">
                {data?.items.map((student) => (
                  <tr key={student.id} className="hover:bg-brand-primary/[0.01] transition-colors group">
                    <td className="pl-10 pr-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-[12px] bg-brand-primary/5 flex items-center justify-center font-black text-brand-primary text-xs shadow-sm group-hover:bg-brand-primary group-hover:text-brand-background transition-all duration-300">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-brand-text-main text-sm">{student.fullName}</p>
                          <p className="text-[9px] font-medium text-brand-text-body/30 tracking-tight">{student.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[10px] font-bold text-brand-text-body/60 px-2.5 py-1 bg-brand-background border border-brand-primary/5 rounded-lg">
                        {student.batchYear}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${student.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-brand-error"}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${student.isActive ? "text-green-600/80" : "text-brand-error/80"}`}>
                          {student.isActive ? "Aktif" : "Terkunci"}
                        </span>
                      </div>
                    </td>
                    <td className="pr-10 pl-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(student); }}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-brand-error/20 hover:text-brand-error hover:bg-brand-error/5 rounded-lg transition-all"
                        title="Hapus Siswa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-brand-primary/[0.03]">
              {data?.items.map((student) => (
                <div
                  key={student.id}
                  className="p-6 transition-colors"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-primary/5 flex items-center justify-center font-black text-brand-primary text-[10px]">
                        {student.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-brand-text-main text-xs">{student.fullName}</p>
                        <p className="text-[8px] font-medium text-brand-text-body/30 tracking-tight">{student.code}</p>
                      </div>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${student.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-brand-error"}`} />
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black uppercase text-brand-text-body/20 tracking-widest mb-1">Angkatan</span>
                        <span className="text-[9px] font-bold text-brand-text-body/60 px-2 py-0.5 bg-brand-background border border-brand-primary/5 rounded">
                          {student.batchYear}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(student); }}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-brand-error hover:bg-brand-error/5 rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {(!data?.items || data.items.length === 0) && (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-brand-primary/5 rounded-full flex items-center justify-center mb-4 opacity-20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-brand-text-body/30 font-black uppercase tracking-[0.2em] text-[10px]">Tidak ada entri registri ditemukan</p>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="p-4 border-t border-brand-primary/5 bg-brand-primary/[0.01] flex justify-between items-center shrink-0">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-body/30">Registri Sinkron</span>
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-text-body/20">Gulir untuk melihat semua {data?.totalCount} catatan</p>
          </div>
        </div>
      )}
      <BulkImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <CreateStudentModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <ConfirmModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={confirmDelete}
        title="Hapus Siswa"
        message={`Apakah Anda yakin ingin menghapus ${studentToDelete?.fullName} (${studentToDelete?.code})? Semua data terkait termasuk umpan balik akan dihapus permanen.`}
        confirmLabel={deleteMutation.isPending ? "Menghapus..." : "Hapus Permanen"}
        variant="danger"
      />
    </div>
  );
}
