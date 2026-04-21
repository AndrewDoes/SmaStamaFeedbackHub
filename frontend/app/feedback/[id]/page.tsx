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

  const { data: feedback, isLoading, error } = useQuery({
    queryKey: ["feedback", id],
    queryFn: () => feedbackService.getFeedbackDetail(id as string),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [feedback]);

  const replyMutation = useMutation({
    mutationFn: (content: string) => feedbackService.submitReply(id as string, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", id] });
      setReplyContent("");
      toast.success("Response posted");
    }
  });

  const revealMutation = useMutation({
    mutationFn: () => feedbackService.revealIdentity(id as string),
    onSuccess: (data) => {
      setAuditData(data);
      toast.success("Identity revealed");
    }
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: number) => {
      if (confirm("Change thread status? This will be visible to all contributors.")) {
        return feedbackService.updateFeedbackStatus(id as string, newStatus);
      }
      return Promise.reject("Cancelled");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", id] });
      toast.success("Thread status updated");
    }
  });

  const flagMutation = useMutation({
    mutationFn: (reason: string) => feedbackService.flagFeedback(id as string, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", id] });
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
        {/* Main Content */}
        <section className="bg-brand-surface p-8 rounded-3xl shadow-premium border border-brand-primary/5">
          <header className="mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-brand-text-main line-clamp-2">{feedback.title}</h1>
              <div className="flex gap-2 items-center">
                {isStaff && !feedback.isFlagged && (
                  <button
                    onClick={() => {
                      const reason = prompt("Administrative Flag Reason:");
                      if (reason) flagMutation.mutate(reason);
                    }}
                    className="px-3 py-1 bg-brand-error/5 text-brand-error text-[10px] uppercase font-bold tracking-widest rounded-full border border-brand-error/20 hover:bg-brand-error/10 transition-all"
                  >
                    Flag Thread
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
          {isStaff && feedback.isFlagged && (
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
          {isStaff && (
            <div className="mt-8 pt-8 border-t border-brand-primary/10">
              <h3 className="text-brand-text-main font-bold mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Resolution Management
              </h3>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => statusMutation.mutate(s)}
                    disabled={statusMutation.isPending || feedback.status === s}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${feedback.status === s
                      ? "bg-brand-primary text-brand-background border-brand-primary"
                      : "bg-transparent text-brand-text-body/60 border-brand-primary/10 hover:border-brand-primary/30"
                      }`}
                  >
                    {s === 0 ? "Open" : s === 1 ? "In Progress" : s === 2 ? "Resolved" : "Closed"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Chatbox Discussion Stream */}
        <section className="bg-brand-surface rounded-[40px] border border-brand-primary/5 shadow-premium overflow-hidden flex flex-col max-h-[800px]">
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
                <div key={reply.id} className={`flex flex-col ${isMe ? "items-end text-right" : "items-start text-left"}`}>
                  <div className="relative max-w-[85%] md:max-w-[75%] group">
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
        </section>
      </div>
    </div>
  );
}
