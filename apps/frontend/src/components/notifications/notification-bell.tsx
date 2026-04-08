"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, BellRing, Zap, CreditCard, MessageSquare, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";
import { formatDistanceToNow } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/use-socket";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: { applicationId?: string; requestId?: string };
};

function NotifIcon({ type }: { type: string }) {
  if (type === "NEW_APPLICATION") return <BellRing className="h-4 w-4 text-cyan-400" />;
  if (type === "APPLICATION_ACCEPTED") return <CheckCheck className="h-4 w-4 text-emerald-400" />;
  if (type === "APPLICATION_REJECTED") return <CheckCheck className="h-4 w-4 text-red-400" />;
  if (type === "NEW_MESSAGE") return <MessageSquare className="h-4 w-4 text-violet-400" />;
  if (type === "PAYMENT_VERIFIED" || type === "PAYMENT_SUBMITTED") return <CreditCard className="h-4 w-4 text-amber-400" />;
  if (type === "PAYMENT_REJECTED") return <CreditCard className="h-4 w-4 text-red-400" />;
  return <Info className="h-4 w-4 text-muted-foreground" />;
}

interface NotificationBellProps {
  compact?: boolean;
}

export function NotificationBell({ compact = false }: NotificationBellProps) {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("tuitionmedia_token") : null;
  const { on } = useSocket(token);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await apiGet<{ count: number }>("/notifications/unread-count");
      setUnreadCount(data.count);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    const unsub = on<Notification>("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
    });
    return unsub;
  }, [on]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleOpen = async () => {
    if (!open) {
      setLoading(true);
      setOpen(true);
      try {
        const data = await apiGet<Notification[]>("/notifications");
        setNotifications(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    } else {
      setOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    await apiPost("/notifications/mark-all-read", {});
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await apiPost(`/notifications/${notif.id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);

    const { applicationId, requestId } = notif.data ?? {};
    if (notif.type === "NEW_APPLICATION" && requestId) {
      router.push(`/dashboard/student/${requestId}`);
    } else if (notif.type === "NEW_MESSAGE" && applicationId) {
      router.push(`/dashboard/tutor/applications`);
    } else if (
      (notif.type === "APPLICATION_ACCEPTED" || notif.type === "PAYMENT_VERIFIED") &&
      applicationId
    ) {
      router.push(`/dashboard/tutor/applications`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative", compact ? "h-8 w-8" : "h-8 w-8")}
        onClick={handleOpen}
        title="Notifications"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-background"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 mt-2 w-80 rounded-2xl border border-white/10 glass-card shadow-2xl overflow-hidden",
              compact ? "right-0" : "right-0",
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </Button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => void handleNotificationClick(notif)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors",
                      !notif.is_read && "bg-cyan-500/5",
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      <NotifIcon type={notif.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-medium leading-snug", !notif.is_read && "text-foreground")}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">
                        {formatDistanceToNow(new Date(notif.created_at))}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
