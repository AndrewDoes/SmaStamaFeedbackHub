"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService, StudentDto } from "@/services/userService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function StudentDirectoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  // Registry.Pro uses a large flat list (spreadsheet style) instead of traditional pagination
  const { data, isLoading } = useQuery({
    queryKey: ["admin-students", search],
    queryFn: () => userService.getStudentList(1, 1000, search),
  });

  return (
    <div className="w-full px-4 md:px-10 py-8 flex flex-col h-[calc(100vh-64px)]">
      {/* Breadcrumbs & Header */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-body/30 mb-4 shrink-0">
        <span className="hover:text-brand-primary cursor-pointer" onClick={() => router.push("/admin")}>Admin</span>
        <span>/</span>
        <span className="text-brand-primary">Student Registry</span>
      </nav>

      <header className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-brand-text-main tracking-tighter italic">
            Registry<span className="text-brand-primary">.</span>Pro
          </h1>
          <p className="text-brand-text-body/60 text-sm font-medium">Unified management system • {data?.totalCount || 0} entries</p>
        </div>

        <div className="w-full lg:w-96">
          <div className="relative group">
            <input
              type="text"
              placeholder="Live search by name or code..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
              className="w-full bg-brand-surface pl-12 pr-4 py-4 rounded-[20px] border border-brand-primary/5 focus:border-brand-primary/20 outline-none transition-all shadow-premium text-sm font-medium"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-body/20 group-focus-within:text-brand-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
            <table className="w-full text-left border-separate border-spacing-0 min-w-[700px]">
              <thead className="sticky top-0 z-20">
                <tr className="bg-brand-background/80 backdrop-blur-md">
                  <th className="pl-10 pr-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 border-b border-brand-primary/5">Contributor</th>
                  <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 text-center border-b border-brand-primary/5">Batch</th>
                  <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 text-center border-b border-brand-primary/5">Stats</th>
                  <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 border-b border-brand-primary/5">Status</th>
                  <th className="pl-6 pr-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 text-right border-b border-brand-primary/5">Action</th>
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
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xs font-black text-brand-primary leading-none">{student.feedbackCount}</span>
                        <span className="text-[7px] font-black uppercase text-brand-text-body/20 tracking-tighter">Threads</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${student.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-brand-error"}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${student.isActive ? "text-green-600/80" : "text-brand-error/80"}`}>
                          {student.isActive ? "Active" : "Locked"}
                        </span>
                      </div>
                    </td>
                    <td className="pl-6 pr-10 py-4 text-right">
                      <button
                        onClick={() => router.push(`/admin/students/${student.id}`)}
                        className="p-2.5 bg-brand-primary/5 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-brand-background transition-all shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!data?.items || data.items.length === 0) && (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-brand-primary/5 rounded-full flex items-center justify-center mb-4 opacity-20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-brand-text-body/30 font-black uppercase tracking-[0.2em] text-[10px]">No registry entries found</p>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="p-4 border-t border-brand-primary/5 bg-brand-primary/[0.01] flex justify-between items-center shrink-0">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-body/30">Registry Synchronized</span>
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-text-body/20">Scroll to view all {data?.totalCount} records</p>
          </div>
        </div>
      )}
    </div>
  );
}
