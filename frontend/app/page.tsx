"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth";
import { feedbackService } from "@/services/feedbackService";
import CreateFeedbackModal from "@/components/CreateFeedbackModal";

export default function LandingPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [activeFilter, setActiveFilter] = useState<number>(0);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
    } else {
      const role = authService.getRole();
      if (role === "Administrator") {
        router.push("/admin");
      } else {
        setUserName(localStorage.getItem("user_name") || "Student");
        setIsChecking(false);
      }
    }
  }, [router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["feedbacks", activeFilter],
    queryFn: () => feedbackService.getFeedbacks({
      status: activeFilter,
      isHistory: activeFilter === 2,
      pageSize: 100
    }),
    enabled: !isChecking,
  });

  const getCategoryDetails = (cat: number) => {
    switch (cat) {
      case 0: return { label: "Facilities", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" };
      case 1: return { label: "Academic", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" };
      case 2: return { label: "Student Affairs", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
      case 3: return { label: "Canteen", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" };
      case 4: return { label: "Reporting", color: "bg-brand-error/10 text-brand-error border-brand-error/20" };
      default: return { label: "Other", color: "bg-brand-text-body/10 text-brand-text-body/60 border-brand-text-body/20" };
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className=" py-4 md:py-8 px-4">
      <div className="mb-8 md:mb-12 header-section flex flex-col justify-center lg:flex-row lg:justify-between">
        <header className="flex flex-col justify-center mb-4 lg:mb-0">
          <h1 className="text-3xl md:text-4xl font-black text-brand-text-main tracking-tight mb-2">School Feed</h1>
          <p className="text-brand-text-body/60 text-base md:text-lg">Explore and contribute to the SMA Santa Maria Yogyakarta community.</p>
        </header>
        {authService.getRole() !== "Administrator" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-6 right-6 lg:static z-30 flex items-center justify-center lg:h-15 gap-2 px-5 py-5 md:px-6 md:py-4 lg:px-4 lg:py-2 bg-brand-primary text-brand-background rounded-full lg:rounded-xl shadow-[0_10px_40px_rgba(26,75,93,0.3)] lg:shadow-none hover:bg-brand-primary/90 hover:scale-105 active:scale-95 transition-all duration-300 group"
          >
            <span className="w-8 text-2xl lg:text-base font-bold">+</span>
            <span className="inline font-bold">Create Feedback</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1">
        {/* Main Feedback List */}
        <div className="bg-brand-surface p-5 md:p-8 rounded-2xl shadow-premium border border-brand-primary/5 col-span-1 lg:col-span-2 min-h-[500px] flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-xl md:text-2xl text-brand-text-main font-bold flex items-center gap-2">
              Recent Activity
              {isLoading && <span className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></span>}
            </h2>
            <div className="flex gap-1 bg-brand-background p-1 rounded-xl border border-brand-primary/5 w-full sm:w-auto overflow-x-auto no-scrollbar">
              {[0, 1, 2].map((f) => (
                <button
                  key={String(f)}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${activeFilter === f
                    ? "bg-brand-primary text-brand-background shadow-lg shadow-brand-primary/20"
                    : "text-brand-text-body/40 hover:text-brand-text-body/60"
                    }`}
                >
                  {f === 0 ? "Active" : f === 1 ? "In Progress" : "Resolved"}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex flex-col justify-center items-center opacity-50 space-y-4">
              <div className="w-full h-24 bg-brand-primary/5 rounded-xl animate-pulse"></div>
              <div className="w-full h-24 bg-brand-primary/5 rounded-xl animate-pulse"></div>
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <div className="space-y-4">
              {data.items
                .filter(fb => activeFilter === null || fb.status === activeFilter)
                .map((fb) => (
                  <div
                    key={fb.id}
                    onClick={() => router.push(`/feedback/${fb.id}`)}
                    className="p-4 border-b border-brand-primary/5 last:border-0 hover:bg-brand-primary/5 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-brand-text-main group-hover:text-brand-primary transition-colors">{fb.title}</h3>
                      <div className="flex gap-2 items-center">
                        {fb.isFlagged && (
                          <span className="w-2 h-2 bg-brand-error rounded-full" title="Flagged content" />
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter border ${getCategoryDetails(fb.category).color}`}>
                          {getCategoryDetails(fb.category).label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter border ${fb.status === 2 ? (fb.isDenied ? "bg-brand-text-body/10 text-brand-text-body/60 border-brand-text-body/20" : "bg-brand-success/10 text-brand-success border-brand-success/20") :
                          fb.status === 1 ? "bg-brand-warning/10 text-brand-warning border-brand-warning/20" :
                            "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                          }`}>
                          {fb.status === 2 ? (fb.isDenied ? "Denied" : "Resolved") : fb.status === 1 ? "In Progress" : "Active"}
                        </span>
                        <span className="text-xs text-brand-text-body/50">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-brand-text-body/80 line-clamp-2">
                      {fb.content}
                    </p>
                    {fb.isFlagged && (
                      <div className="mt-2 text-[10px] uppercase tracking-wider font-bold text-brand-error flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-brand-error rounded-full animate-pulse"></span>
                        Under Review
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-12">
              <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-brand-primary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-text-main mb-2">No feedback yet</h3>
              <p className="text-brand-text-body/60 max-w-xs">Your voice matters. Start a new thread to share your suggestions with the administration.</p>
            </div>
          )}
        </div>
      </div>

      <CreateFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
