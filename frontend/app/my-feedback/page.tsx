"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { feedbackService, FeedbackDto } from "@/services/feedbackService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function MyFeedbackPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const { data, isLoading } = useQuery({
    queryKey: ["my-feedbacks"],
    queryFn: () => feedbackService.getFeedbacks(), // Backend already filters this to OWN feedback for students
    refetchInterval: 30000, // Poll every 30s
  });

  const filteredItems = data?.items.filter((item: FeedbackDto) => {
    if (activeTab === "active") {
      return item.status === 0 || item.status === 1; // Open or InProgress
    } else {
      return item.status === 2 || item.status === 3; // Resolved or Closed
    }
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-brand-text-main tracking-tight mb-2">Portal Suara Saya</h1>
        <p className="text-brand-text-body/60">Kelola dan lacak kemajuan saran pribadi Anda.</p>
      </header>

      <div className="flex gap-2 md:gap-4 mb-8 p-1 bg-brand-surface rounded-2xl border border-brand-primary/5 w-full sm:w-fit overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "active"
            ? "bg-brand-primary text-brand-background shadow-lg shadow-brand-primary/20"
            : "text-brand-text-body/60 hover:text-brand-primary"
            }`}
        >
          Diskusi Aktif
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "history"
            ? "bg-brand-primary text-brand-background shadow-lg shadow-brand-primary/20"
            : "text-brand-text-body/60 hover:text-brand-primary"
            }`}
        >
          Riwayat Resolusi
        </button>
      </div>

      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(`/feedback/${item.id}`)}
            className="group bg-brand-surface p-6 rounded-3xl border border-brand-primary/5 hover:border-brand-primary/20 transition-all cursor-pointer shadow-premium hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-brand-text-main group-hover:text-brand-primary transition-colors mb-1">{item.title}</h3>
                <p className="text-xs text-brand-text-body/40 font-medium">Dikirim pada {new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.status === 2 ? item.isDenied ? "bg-brand-error/10 text-brand-error border-brand-error/20" : "bg-brand-success/10 text-brand-success border-brand-success/20" :
                item.status === 1 ? "bg-brand-warning/10 text-brand-warning border-brand-warning/20" :
                  item.status === 3 ? "bg-brand-text-body/10 text-brand-text-body/40 border-brand-text-body/10" :
                    "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                }`}>
                {item.status === 2 ? (item.isDenied ? "Ditolak" : "Selesai") : item.status === 1 ? "Sedang Diproses" : item.status === 3 ? "Ditutup" : "Aktif"}
              </span>
            </div>
            <p className="text-brand-text-body/70 text-sm leading-relaxed line-clamp-2">
              {item.content}
            </p>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="py-24 text-center bg-brand-surface rounded-3xl border-2 border-dashed border-brand-primary/10">
            <h3 className="text-xl font-bold text-brand-text-main/50">Tidak ada catatan {activeTab === "active" ? "aktif" : "riwayat"} ditemukan</h3>
            <p className="text-sm text-brand-text-body/30 mt-1">
              {activeTab === "active"
                ? "Semua saran Anda sudah selesai atau Anda belum memulai satu pun!"
                : "Riwayat resolusi Anda saat ini kosong."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
