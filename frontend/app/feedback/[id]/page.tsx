"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { feedbackService, FeedbackDto } from "@/services/feedbackService";
import { authService } from "@/services/auth";
import toast from "react-hot-toast";

export default function FeedbackDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState("");
  const [isAdminRevealing, setIsAdminRevealing] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [resolutionText, setResolutionText] = useState("");
  const [isDenied, setIsDenied] = useState(false);
  const [isFlagPanelOpen, setIsFlagPanelOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  const { data: feedback, isLoading, error, refetch } = useQuery({
    queryKey: ["feedback", id],
    queryFn: () => feedbackService.getFeedbackDetail(id as string),
  });

  useEffect(() => {
    if (feedback) {
      setSelectedStatus(feedback.status);
      setResolutionText(feedback.resolution || "");
      setIsDenied(feedback.isDenied);
    }
  }, [feedback]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [feedback]);

  const replyMutation = useMutation({
    mutationFn: (content: string) => feedbackService.submitReply(id as string, content),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feedback", id] });
      await queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-queue"] });
      setReplyContent("");
      toast.success("Response posted");
    }
  });

  const revealMutation = useMutation({
    mutationFn: () => feedbackService.revealIdentity(id as string),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["feedback", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-queue"] });
      setAuditData(data);
      toast.success("Identity revealed");
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, resolution, isDenied }: { status: number, resolution?: string, isDenied?: boolean }) => {
      return feedbackService.updateFeedbackStatus(id as string, status, resolution, isDenied);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feedback", id] });
      await queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-queue"] });
      toast.success("Thread status updated");
    },
    onError: (err: any) => {
      toast.error("Failed to update status. Make sure you are logged in as an administrator.");
      console.error("Status update error:", err);
    }
  });

  const handleStatusUpdate = () => {
    if (selectedStatus === null) return;

    if (selectedStatus === 2 && !resolutionText.trim()) {
      toast.error("Please provide a resolution conclusion before resolving.");
      return;
    }

    statusMutation.mutate({
      status: selectedStatus,
      resolution: selectedStatus === 2 ? resolutionText : undefined,
      isDenied: selectedStatus === 2 ? isDenied : false
    });
  };

  const flagMutation = useMutation({
    mutationFn: (reason: string) => feedbackService.flagFeedback(id as string, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feedback", id] });
      await queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-queue"] });
      toast.success("Thread reported to administration");
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-background p-8">
        <h1 className="text-2xl text-brand-error mb-4">Feedback Not Found</h1>
        <button onClick={() => router.back()} className="text-brand-primary hover:underline">← Go Back</button>
      </div>
    );
  }

  const isStaff = authService.getRole() === "Administrator";

  return (
    <div className="py-8 px-4">
      <button onClick={() => router.back()} className="mb-8 text-brand-text-body/60 hover:text-brand-primary transition-colors flex items-center gap-2 font-bold text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="space-y-8">
        {/* Resolution Banner */}
        {feedback.status === 2 && feedback.resolution && (
          <section className={`p-8 rounded-[32px] shadow-lg animate-in fade-in slide-in-from-top-4 duration-700 border-2 
            ${feedback.isDenied
              ? "bg-brand-text-body/5 border-brand-text-body/20 shadow-brand-text-body/5"
              : "bg-brand-success/10 border-brand-success/30 shadow-brand-success/5"}`}>
            <div className="flex items-start gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0
                ${feedback.isDenied
                  ? "bg-brand-text-body/40 shadow-brand-text-body/10"
                  : "bg-brand-success shadow-brand-success/20"}`}>
                {feedback.isDenied ? (
                  <svg className="w-8 h-8 text-brand-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-brand-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-3">
                  <h2 className={`font-black uppercase tracking-[0.1em] text-sm ${feedback.isDenied ? "text-brand-text-body/60" : "text-brand-success"}`}>
                    Official Resolution: {feedback.isDenied ? "Denied" : "Fulfilled"}
                  </h2>
                  <span className={`text-[10px] font-bold ${feedback.isDenied ? "text-brand-text-body/40" : "text-brand-success/60"}`}>
                    {feedback.resolvedAt ? new Date(feedback.resolvedAt).toLocaleDateString(undefined, { dateStyle: 'full' }) : ""}
                  </span>
                </div>
                <div className={`p-5 rounded-2xl border ${feedback.isDenied ? "bg-brand-background/20 border-brand-text-body/10" : "bg-brand-background/40 border-brand-success/20"}`}>
                  <p className="text-brand-text-main font-bold leading-relaxed italic">
                    "{feedback.resolution}"
                  </p>
                </div>
                <p className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${feedback.isDenied ? "text-brand-text-body/30" : "text-brand-success/40"}`}>
                  This thread is now archived as a permanent record of school improvement.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <section className={`bg-brand-surface p-8 rounded-3xl shadow-premium border border-brand-primary/5 transition-all duration-700
          ${feedback.status === 2 ? "grayscale-[0.5] opacity-60 pointer-events-none" : ""}`}>
          <header className="mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-brand-text-main line-clamp-2">{feedback.title}</h1>
              <div className="flex flex-col gap-2 items-end">
                <div className="flex gap-2 items-center">
                  {isStaff && !feedback.isFlagged && feedback.status !== 2 && (
                    <button
                      onClick={() => setIsFlagPanelOpen(!isFlagPanelOpen)}
                      className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full border transition-all
                        ${isFlagPanelOpen 
                          ? "bg-brand-error text-brand-background border-brand-error shadow-lg shadow-brand-error/20" 
                          : "bg-brand-error/5 text-brand-error border-brand-error/20 hover:bg-brand-error/10"}`}
                    >
                      {isFlagPanelOpen ? "Cancel Flagging" : "Flag Thread"}
                    </button>
                  )}
                  {feedback.isFlagged && (
                    <span className="px-3 py-1 bg-brand-error/10 text-brand-error text-[10px] uppercase font-bold tracking-widest rounded-full border border-brand-error/20">
                      Flagged Thread
                    </span>
                  )}
                  <span className="px-3 py-1 bg-brand-primary/5 text-brand-primary text-[10px] uppercase font-bold tracking-widest rounded-full border border-brand-primary/10">
                    ID: {feedback.id.slice(0, 8)}
                  </span>
                </div>

                {isFlagPanelOpen && (
                  <div className="mt-2 w-full max-w-sm bg-brand-background p-4 rounded-2xl border border-brand-error/20 shadow-premium animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[9px] font-black uppercase tracking-widest text-brand-error mb-2 block">Administrative Flag Reason</label>
                    <textarea 
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      placeholder="Why is this thread being flagged? (Visible to HR only)"
                      className="w-full bg-brand-surface border border-brand-error/10 rounded-xl p-3 text-xs text-brand-text-main focus:ring-2 focus:ring-brand-error/10 outline-none min-h-[80px] transition-all mb-3"
                    />
                    <button
                      onClick={() => {
                        if (flagReason.trim()) {
                          flagMutation.mutate(flagReason);
                          setIsFlagPanelOpen(false);
                          setFlagReason("");
                        } else {
                          toast.error("Please provide a reason for flagging.");
                        }
                      }}
                      className="w-full py-2 bg-brand-error text-brand-background font-black uppercase tracking-widest text-[9px] rounded-lg shadow-sm hover:bg-brand-error/90 transition-all"
                    >
                      Confirm Thread Flag
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-text-body/50">
              <span className="font-bold">Original Post</span>
              <span>•</span>
              <span>{new Date(feedback.createdAt).toLocaleString()}</span>
            </div>
          </header>

          <div className="prose prose-brand max-w-none text-brand-text-body leading-relaxed text-lg mb-8">
            {feedback.content}
          </div>

          {/* Attachments Section */}
          {feedback.attachmentUrls && feedback.attachmentUrls.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold text-brand-text-main mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.415a6 6 0 108.486 8.486L20.5 13" /></svg>
                Submitted Proofs
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {feedback.attachmentUrls.map((url, index) => {
                  const isImage = url.match(/\.(jpg|jpeg|png|webp|gif)/i);
                  return (
                    <div key={index} className="group relative rounded-2xl overflow-hidden border border-brand-primary/10 bg-brand-surface shadow-sm hover:shadow-md transition-all">
                      {isImage ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square">
                          <img src={url} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/10 transition-colors" />
                        </a>
                      ) : (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="aspect-square flex flex-col items-center justify-center p-4 gap-2">
                          <svg className="w-10 h-10 text-brand-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider text-center">View Document</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin Audit Section */}
          {isStaff && (feedback.isFlagged || auditData) && (
            <div className="mt-8 p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-brand-primary font-bold mb-1">Administrative Audit</h3>
                  <p className="text-xs text-brand-text-body/60">Strictly for HR personnel. Identity revelation is logged.</p>
                </div>
                {!auditData ? (
                  <button
                    onClick={() => revealMutation.mutate()}
                    disabled={revealMutation.isPending}
                    className="px-6 py-2 bg-brand-primary text-brand-background font-bold rounded-xl hover:bg-brand-primary/90 transition-all text-sm"
                  >
                    {revealMutation.isPending ? "Revealing..." : "Reveal Identity"}
                  </button>
                ) : (
                  <div className="text-right">
                    <p className="text-brand-primary font-bold">{auditData.ownerFullName}</p>
                    <p className="text-xs text-brand-text-body/60">Student Code: {auditData.ownerCode}</p>
                  </div>
                )}
              </div>
              {auditData?.flagReason && (
                <div className="mt-4 p-3 bg-brand-error/5 text-brand-error text-xs rounded-lg border border-brand-error/10">
                  <strong>Flag Reason:</strong> {auditData.flagReason}
                </div>
              )}
            </div>
          )}

          {/* Admin Resolution Toolbar */}
          {isStaff && feedback.status !== 2 && (
            <div className="mt-8 pt-8 border-t border-brand-primary/10">
              <h3 className="text-brand-text-main font-bold mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Resolution Management
              </h3>

              <div className="bg-brand-background/50 p-6 rounded-2xl border border-brand-primary/5">
                <div className="flex gap-2 mb-6">
                  {[0, 1, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedStatus(s)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${selectedStatus === s
                        ? "bg-brand-primary text-brand-background border-brand-primary shadow-lg shadow-brand-primary/20"
                        : "bg-brand-surface text-brand-text-body/40 border-brand-primary/10 hover:border-brand-primary/30"
                        }`}
                    >
                      {s === 0 ? "Active" : s === 1 ? "In Progress" : "Resolved"}
                    </button>
                  ))}
                </div>

                {selectedStatus === 2 && (
                  <div className="space-y-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Resolution Type</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsDenied(false)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${!isDenied
                            ? "bg-brand-success/10 text-brand-success border-brand-success/40 shadow-sm"
                            : "bg-brand-surface text-brand-text-body/30 border-brand-primary/5"}`}
                        >
                          Fulfilled
                        </button>
                        <button
                          onClick={() => setIsDenied(true)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isDenied
                            ? "bg-brand-text-body/10 text-brand-text-body border-brand-text-body/40 shadow-sm"
                            : "bg-brand-surface text-brand-text-body/30 border-brand-primary/5"}`}
                        >
                          Denied
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Official Resolution Conclusion</label>
                      <textarea
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        placeholder={isDenied ? "Explain why this request was denied (e.g., misconduct or unfeasible)..." : "Briefly describe how this issue was addressed..."}
                        className="w-full bg-brand-surface border border-brand-primary/10 rounded-xl p-4 text-sm text-brand-text-main focus:ring-2 focus:ring-brand-primary/20 outline-none min-h-[100px] transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStatusUpdate}
                  disabled={statusMutation.isPending || (selectedStatus === feedback.status && (selectedStatus !== 2 || resolutionText === feedback.resolution))}
                  className="w-full py-4 bg-brand-primary text-brand-background font-black uppercase tracking-widest text-xs rounded-xl shadow-premium hover:bg-brand-primary/90 transition-all disabled:opacity-30"
                >
                  {statusMutation.isPending ? "Updating..." : "Commit Status Change"}
                </button>
              </div>

              <p className="mt-4 text-[10px] font-medium text-brand-text-body/40 italic">
                Note: Every status transition and resolution statement is permanent and auditable.
              </p>
            </div>
          )}
        </section>

        {/* Chatbox Discussion Stream */}
        <section className={`bg-brand-surface rounded-[40px] border border-brand-primary/5 shadow-premium overflow-hidden flex flex-col max-h-[800px] transition-all duration-700
          ${feedback.status === 2 ? "grayscale-[0.5] opacity-60" : ""}`}>
          <div className="p-6 border-b border-brand-primary/5 bg-brand-primary/5">
            <h2 className="text-lg font-black text-brand-text-main flex items-center gap-2 uppercase tracking-tight">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
              Conversation History
            </h2>
          </div>

          {/* Scrollable Message Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            style={{ maxHeight: '500px' }}
          >
            {feedback.replies.map((reply: any) => {
              const isMe = reply.isAuthor;
              const isStaff = reply.isStaffResponse;

              return (
                <div key={reply.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="relative max-w-[85%] md:max-w-[75%] group text-left">
                    {!isMe && (
                      <div className="flex items-center gap-2 mb-1.5 px-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-main/40">
                          {reply.authorName}
                        </span>
                        {isStaff && (
                          <span className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase rounded-md border border-brand-primary/10">
                            Staff
                          </span>
                        )}
                      </div>
                    )}

                    <div className={`p-4 rounded-[24px] shadow-sm transition-all duration-300
                      ${isMe
                        ? "bg-brand-primary text-brand-background rounded-tr-none shadow-premium"
                        : "bg-brand-surface border border-brand-primary/10 text-brand-text-body rounded-tl-none shadow-sm"
                      }`}>
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{reply.content}</p>

                      <div className={`mt-2 text-[10px] font-bold italic transition-opacity ${isMe ? "text-brand-background/60" : "text-brand-text-body/30"}`}>
                        {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {feedback.replies.length === 0 && (
              <div className="text-center py-20">
                <p className="text-brand-text-body/40 font-bold italic text-sm">Waiting for the conversation to begin...</p>
              </div>
            )}
          </div>

          {/* Fixed Reply Input at bottom of container */}
          {feedback.status !== 2 && (
            <div className="p-6 bg-brand-primary/5 border-t border-brand-primary/5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (replyContent.trim()) replyMutation.mutate(replyContent);
                }}
                className="flex gap-4 items-end"
              >
                <div className="flex-1 bg-brand-background rounded-2xl border border-brand-primary/10 p-4 focus-within:border-brand-primary/30 transition-all shadow-inner">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a message..."
                    className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none text-sm text-brand-text-main placeholder:text-brand-text-body/30"
                    rows={2}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!replyContent.trim() || replyMutation.isPending}
                  className="w-14 h-14 bg-brand-primary text-brand-background rounded-2xl hover:bg-brand-primary/90 transition-all disabled:opacity-30 shadow-premium flex items-center justify-center flex-shrink-0"
                >
                  {replyMutation.isPending ? (
                    <span className="w-5 h-5 border-2 border-brand-background border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          )}
        </section>

        {/* Permanent Audit History (Below Chatbox) */}
        {isStaff && (
          <section className="bg-brand-surface p-8 rounded-3xl border border-brand-primary/5 shadow-sm">
            <h3 className="text-brand-text-main font-black text-[10px] uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-primary shadow-[0_0_12px_rgba(26,75,93,0.4)]"></div>
              Administrative Audit Trail
            </h3>

            <div className="flex flex-col">
              {feedback.auditLogs && feedback.auditLogs.length > 0 ? (
                feedback.auditLogs.map((log: any, idx: number) => (
                  <div key={log.id} className="relative pl-12 pb-10 last:pb-0">
                    {/* Timeline Line */}
                    {idx !== (feedback.auditLogs?.length ?? 0) - 1 && (
                      <div className="absolute left-[11px] top-[24px] bottom-0 w-0.5 bg-brand-primary/10"></div>
                    )}

                    {/* Timeline Dot */}
                    <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-xl flex items-center justify-center border-2 transition-all shadow-sm
                      ${idx === 0
                        ? "bg-brand-primary border-brand-primary text-brand-background shadow-lg shadow-brand-primary/20"
                        : "bg-brand-surface border-brand-primary/20 text-brand-primary"
                      }`}>
                      {idx === 0 ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${idx === 0 ? "text-brand-primary" : "text-brand-text-body/40"}`}>
                          {log.action === "StatusUpdate" ? "Status Transition" : log.action}
                        </span>
                        <div className="h-px flex-1 bg-brand-primary/5"></div>
                        <span className="text-[9px] font-bold text-brand-text-body/20 italic">
                          {new Date(log.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-brand-background/50 px-3 py-1.5 rounded-xl border border-brand-primary/5">
                          <span className="text-[10px] font-bold text-brand-text-body/30 line-through">{log.oldValue || "Initial"}</span>
                          <svg className="w-3 h-3 text-brand-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                          <span className="text-[10px] font-black text-brand-primary">{log.newValue}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-lg bg-brand-primary/5 flex items-center justify-center text-[9px] font-black text-brand-primary uppercase">
                            {log.adminName.charAt(0)}
                          </div>
                          <p className="text-[9px] font-bold text-brand-text-body/40">Executed by <span className="text-brand-text-main">{log.adminName}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-brand-primary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-[10px] font-bold text-brand-text-body/20 uppercase tracking-widest italic">No transitions recorded yet</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
