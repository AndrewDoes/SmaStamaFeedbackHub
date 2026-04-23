"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService, NotificationDto } from "@/services/notificationService";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.getNotifications,
    enabled: isOpen,
    refetchInterval: 30000, // Poll every 30s when open
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-count"],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 15000, // Check count every 15s
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (n: NotificationDto) => {
    if (!n.isRead) {
      markReadMutation.mutate(n.id);
    }
    if (n.link) {
      router.push(n.link);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-brand-text-main/60 hover:text-brand-primary transition-all rounded-xl hover:bg-brand-primary/5 group"
      >
        <svg
          className={`w-6 h-6 transition-transform ${isOpen ? "scale-110" : "group-hover:rotate-12"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount !== undefined && unreadCount > 0 ? (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-error opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-error text-[8px] font-black text-brand-background items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        ) : null}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-brand-surface rounded-2xl shadow-premium border border-brand-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="p-4 border-b border-brand-primary/5 flex justify-between items-center bg-brand-primary/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary">Notifications</h3>
            {unreadCount !== undefined && unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-[9px] font-bold text-brand-text-body/40 hover:text-brand-primary uppercase tracking-tighter transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto no-scrollbar">
            {notifications && notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 border-b border-brand-primary/5 last:border-0 hover:bg-brand-primary/5 cursor-pointer transition-colors relative ${
                    !n.isRead ? "bg-brand-primary/[0.02]" : ""
                  }`}
                >
                  {!n.isRead && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(26,75,93,0.4)]" />
                  )}
                  <div className="flex flex-col gap-1 pl-2">
                    <p className={`text-xs font-bold ${!n.isRead ? "text-brand-text-main" : "text-brand-text-body/60"}`}>
                      {n.title}
                    </p>
                    <p className="text-[10px] text-brand-text-body/80 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[8px] font-medium text-brand-text-body/30 mt-1 uppercase tracking-tight">
                      {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-full flex items-center justify-center opacity-30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-body/20">No new alerts</p>
              </div>
            )}
          </div>
          
          <div className="p-3 bg-brand-background text-center border-t border-brand-primary/5">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-body/20">Recent 50 alerts</span>
          </div>
        </div>
      )}
    </div>
  );
}
