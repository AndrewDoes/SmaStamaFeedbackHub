"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbackService, FeedbackDto } from "@/services/feedbackService";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ModerationHubPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const currentRole = authService.getRole();
    setRole(currentRole);
    setMounted(true);

    if (currentRole && currentRole !== "Administrator") {
      router.push("/");
    }
  }, [router]);

  const { data: flaggedItems, isLoading } = useQuery({
    queryKey: ["flagged-feedback"],
    queryFn: () => feedbackService.getFlaggedList(),
    enabled: mounted && role === "Administrator",
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => feedbackService.resolveFeedbackFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flagged-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["admin-queue"] });
      toast.success("Flag resolved and cleared successfully");
    }
  });

  const getCategoryName = (cat: number) => {
    switch (cat) {
      case 0: return "Facilities";
      case 1: return "Academic";
      case 2: return "Student Affairs";
      case 3: return "Canteen";
      case 4: return "Reporting";
      default: return "Other";
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-10 py-8 flex flex-col h-[calc(100vh-64px)]">
      {/* Breadcrumbs & Header */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-body/30 mb-4 shrink-0">
        <span className="hover:text-brand-primary cursor-pointer" onClick={() => router.push("/admin")}>Admin</span>
        <span>/</span>
        <span className="text-brand-error">Moderation Hub</span>
      </nav>

      <header className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-error/10 flex items-center justify-center text-brand-error shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-brand-text-main tracking-tighter italic">
              Moderation<span className="text-brand-error">.</span>Audit
            </h1>
          </div>
          <p className="text-brand-text-body/60 text-sm font-medium italic">Safety system active • {flaggedItems?.length || 0} priority flags pending review.</p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-brand-surface rounded-[32px] border border-brand-error/10 shadow-premium flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto no-scrollbar relative">
            {/* Desktop Table View */}
            <table className="w-full text-left border-separate border-spacing-0 min-w-[900px] hidden md:table">
              <thead className="sticky top-0 z-20">
                <tr className="bg-brand-background/80 backdrop-blur-md">
                  <th className="pl-10 pr-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 border-b border-brand-error/5">Flagged User</th>
                  <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 border-b border-brand-error/5">Violating Content</th>
                  <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 border-b border-brand-error/5 text-center">Category</th>
                  <th className="pl-6 pr-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 border-b border-brand-error/5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-error/[0.03]">
                {(!flaggedItems || flaggedItems.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="w-12 h-12 bg-brand-success/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-success">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-body/20 italic">No violations flags currently active</p>
                    </td>
                  </tr>
                ) : (
                  flaggedItems.map((item: FeedbackDto) => (
                    <tr
                      key={item.id}
                      className="hover:bg-brand-error/[0.01] transition-colors group"
                    >
                      <td className="pl-10 pr-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-xl bg-brand-error/5 flex items-center justify-center font-black text-brand-error text-xs shadow-sm group-hover:bg-brand-error group-hover:text-brand-background transition-all duration-300">
                            {item.authorName?.charAt(0) || "S"}
                          </div>
                          <div>
                            <p className="font-bold text-brand-text-main text-sm leading-tight">{item.authorName || "Contributor"}</p>
                            <p className="text-[9px] font-medium text-brand-text-body/30 tracking-tight italic">
                              {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[400px]">
                        <div className="p-3 bg-brand-background rounded-2xl border border-brand-error/5 group-hover:border-brand-error/20 transition-all">
                          <p className="text-xs font-bold text-brand-text-main truncate mb-1">{item.title}</p>
                          <p className="text-[10px] text-brand-text-body/60 line-clamp-1 italic italic">"{item.content}"</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-brand-background border border-brand-error/5 rounded-lg text-[9px] font-black uppercase text-brand-text-body/40">
                          {getCategoryName(item.category)}
                        </span>
                      </td>
                      <td className="pl-6 pr-10 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => router.push(`/feedback/${item.id}`)}
                            className="px-4 py-2 bg-brand-background border border-brand-primary/5 text-brand-primary text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary hover:text-brand-background transition-all"
                          >
                            Audit
                          </button>
                          <button
                            onClick={() => resolveMutation.mutate(item.id)}
                            disabled={resolveMutation.isPending}
                            className="px-4 py-2 bg-brand-error text-brand-background text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-error/90 transition-all shadow-lg shadow-brand-error/10 disabled:opacity-50"
                          >
                            Resolve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-brand-error/[0.03]">
               {(!flaggedItems || flaggedItems.length === 0) ? (
                  <div className="py-24 text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-body/20 italic">No violations flags active</p>
                  </div>
               ) : (
                  flaggedItems.map((item: FeedbackDto) => (
                    <div key={item.id} className="p-6 space-y-4 hover:bg-brand-error/[0.01]">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-brand-error/5 flex items-center justify-center font-black text-brand-error text-[10px]">
                                {item.authorName?.charAt(0) || "S"}
                             </div>
                             <div>
                                <p className="font-bold text-brand-text-main text-xs">{item.authorName || "Contributor"}</p>
                                <p className="text-[8px] font-medium text-brand-text-body/30 uppercase tracking-widest">
                                   {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                             </div>
                          </div>
                          <span className="px-2 py-0.5 bg-brand-error/10 text-brand-error text-[7px] font-black uppercase rounded">Flagged</span>
                       </div>

                       <div className="p-3 bg-brand-background rounded-xl border border-brand-error/5">
                          <p className="text-xs font-bold text-brand-text-main mb-1">{item.title}</p>
                          <p className="text-[10px] text-brand-text-body/60 italic line-clamp-2">"{item.content}"</p>
                       </div>

                       <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-brand-background border border-brand-error/5 rounded text-[8px] font-black uppercase text-brand-text-body/40">
                             {getCategoryName(item.category)}
                          </span>
                          <div className="flex gap-2">
                             <button
                                onClick={() => router.push(`/feedback/${item.id}`)}
                                className="px-3 py-1.5 bg-brand-background border border-brand-primary/5 text-brand-primary text-[8px] font-black uppercase tracking-widest rounded-lg"
                             >
                                Audit
                             </button>
                             <button
                                onClick={() => resolveMutation.mutate(item.id)}
                                disabled={resolveMutation.isPending}
                                className="px-3 py-1.5 bg-brand-error text-brand-background text-[8px] font-black uppercase tracking-widest rounded-lg"
                             >
                                Resolve
                             </button>
                          </div>
                       </div>
                    </div>
                  ))
               )}
            </div>
          </div>

          <div className="p-4 border-t border-brand-error/5 bg-brand-error/[0.01] flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-error animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-error/60">Priority Review Required</span>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-text-body/20 italic">Internal safety audit active</p>
          </div>
        </div>
      )}
    </div>
  );
}
