"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbackService, FeedbackDto } from "@/services/feedbackService";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"Open" | "InProgress" | "History">("Open");

  useEffect(() => {
    const currentRole = authService.getRole();
    setRole(currentRole);
    setMounted(true);

    if (currentRole && currentRole !== "Administrator") {
      router.push("/");
    }
  }, [router]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-queue", activeTab],
    queryFn: () => feedbackService.getFeedbacks({
      status: activeTab === "Open" ? 0 : activeTab === "InProgress" ? 1 : undefined,
      isHistory: activeTab === "History",
      pageSize: 1000
    }),
    enabled: mounted && role === "Administrator",
  });

  const getCategoryTheme = (cat: number) => {
    switch (cat) {
      case 0: return { name: "Facilities", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
      case 1: return { name: "Academic", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" };
      case 2: return { name: "Student Affairs", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" };
      case 3: return { name: "Canteen", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" };
      case 4: return { name: "Safety/Reporting", color: "bg-red-500/10 text-red-500 border-red-500/20" };
      default: return { name: "Other", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" };
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
      <header className="relative border-b border-brand-primary/10 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-brand-text-main tracking-tighter mb-2 italic">
            Dashboard<span className="text-brand-primary"> </span>Admin
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-body/40 italic">Live Feed Active • {data?.totalCount || 0} Threads</span>
            </div>
          </div>
        </div>

        {/* Tab System */}
        <div className="bg-brand-surface border border-brand-primary/5 p-1 rounded-2xl flex justify-evenly gap-1 shadow-premium">
          {(["Open", "InProgress", "History"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                ? "bg-brand-primary text-brand-background shadow-lg"
                : "text-brand-text-body/40 hover:text-brand-primary hover:bg-brand-primary/5"
                }`}
            >
              {tab === "InProgress" ? "In Progress" : tab}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 min-h-0 bg-brand-surface rounded-[32px] border border-brand-primary/5 shadow-premium mt-8 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto no-scrollbar relative">
          {/* Desktop Table View */}
          <table className="w-full text-left border-separate border-spacing-0 min-w-[900px] hidden md:table">
            <thead className="sticky top-0 z-20">
              <tr className="bg-brand-background/80 backdrop-blur-md">
                <th className="pl-10 pr-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 border-b border-brand-primary/5">Contributor</th>
                <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 border-b border-brand-primary/5">Thread Content</th>
                <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 border-b border-brand-primary/5 text-center">Status</th>
                <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-brand-text-body/40 border-b border-brand-primary/5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-primary/[0.03]">
              {data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="w-12 h-12 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-body/20">No items in {activeTab} queue</p>
                  </td>
                </tr>
              ) : (
                data?.items?.map((item: FeedbackDto) => (
                  <tr
                    key={item.id}
                    onClick={() => router.push(`/feedback/${item.id}`)}
                    className="hover:bg-brand-primary/[0.01] transition-colors group cursor-pointer"
                  >
                    <td className="pl-10 pr-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-brand-primary/5 flex items-center justify-center font-black text-brand-primary text-xs shadow-sm group-hover:bg-brand-primary group-hover:text-brand-background transition-all duration-300">
                          {item.authorName?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-bold text-brand-text-main text-sm leading-tight">{item.authorName || "Anonymous"}</p>
                          <p className="text-[9px] font-medium text-brand-text-body/30 tracking-tight">
                            {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border ${getCategoryTheme(item.category).color}`}>
                          {getCategoryTheme(item.category).name}
                        </span>
                        {item.isFlagged && (
                          <span className="bg-brand-error text-brand-background text-[7px] font-black uppercase px-1.5 py-0.5 rounded animate-pulse">
                            Flagged
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-brand-text-main truncate max-w-[300px]">{item.title}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 2 ? (item.isDenied ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]") :
                          item.status === 1 ? "bg-brand-warning shadow-[0_0_8px_rgba(245,158,11,0.4)]" :
                            "bg-brand-primary shadow-[0_0_8px_rgba(26,75,93,0.4)]"
                          }`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 2 ? (item.isDenied ? "text-red-500/80" : "text-green-500/80") :
                          item.status === 1 ? "text-brand-warning/80" :
                            "text-brand-primary/80"
                          }`}>
                          {item.status === 2 ? (item.isDenied ? "Denied" : "Fulfilled") : item.status === 1 ? "In Progress" : "Queue"}
                        </span>
                      </div>
                    </td>
                    <td className="pl-6 pr-10 py-4 text-right">
                      <button className="p-2.5 bg-brand-primary/5 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-brand-background transition-all shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col divide-y divide-brand-primary/[0.03]">
            {data?.items?.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-body/20">No items in {activeTab} queue</p>
              </div>
            ) : (
              data?.items?.map((item: FeedbackDto) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/feedback/${item.id}`)}
                  className="p-6 hover:bg-brand-primary/[0.01] active:bg-brand-primary/5 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-primary/5 flex items-center justify-center font-black text-brand-primary text-[10px]">
                        {item.authorName?.charAt(0) || "S"}
                      </div>
                      <div>
                        <p className="font-bold text-brand-text-main text-xs">{item.authorName || "Anonymous"}</p>
                        <p className="text-[8px] font-medium text-brand-text-body/30 uppercase tracking-widest">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.status === 2 ? (item.isDenied ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]") :
                      item.status === 1 ? "bg-brand-warning shadow-[0_0_8px_rgba(245,158,11,0.4)]" :
                        "bg-brand-primary shadow-[0_0_8px_rgba(26,75,93,0.4)]"
                      }`} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter border ${getCategoryTheme(item.category).color}`}>
                        {getCategoryTheme(item.category).name}
                      </span>
                      {item.isFlagged && (
                        <span className="bg-brand-error text-brand-background text-[6px] font-black uppercase px-1 py-0.5 rounded">
                          Flagged
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-brand-text-main leading-tight">{item.title}</p>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${item.status === 2 ? (item.isDenied ? "text-red-500" : "text-green-500") :
                      item.status === 1 ? "text-brand-warning" :
                        "text-brand-primary"
                      }`}>
                      {item.status === 2 ? (item.isDenied ? "Denied" : "Fulfilled") : item.status === 1 ? "In Progress" : "Queue"}
                    </span>
                    <div className="text-brand-primary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
