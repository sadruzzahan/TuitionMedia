"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useSocket } from "@/hooks/use-socket";
import { formatDistanceToNow } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  applicationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  sender: { name: string | null; email: string };
};

interface ChatDrawerProps {
  applicationId: string;
  recipientName: string;
  onClose: () => void;
}

export function ChatDrawer({ applicationId, recipientName, onClose }: ChatDrawerProps) {
  const user = useAuthStore((s) => s.user);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("tuitionmedia_token") : null;
  const { joinRoom, sendMessage, markRead, on } = useSocket(token);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    apiGet<ChatMessage[]>(`/messages/${applicationId}`)
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [applicationId]);

  useEffect(() => {
    joinRoom(applicationId);
    markRead(applicationId);

    const unsubscribe = on<ChatMessage>("new_message", (msg) => {
      if (msg.applicationId === applicationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        markRead(applicationId);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [applicationId, joinRoom, markRead, on]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || sending) return;

    setSending(true);
    setInputValue("");
    sendMessage(applicationId, content);
    setSending(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 240 }}
          className="relative flex w-full max-w-md flex-col glass-card border-l border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              <div>
                <p className="text-sm font-semibold">{recipientName}</p>
                <p className="text-xs text-muted-foreground">Chat</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        isMe
                          ? "bg-cyan-500/20 text-cyan-100 rounded-tr-sm"
                          : "bg-white/10 text-foreground rounded-tl-sm",
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="px-1 text-[10px] text-muted-foreground/60">
                      {formatDistanceToNow(new Date(msg.createdAt))}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3">
            <div className="flex items-end gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send)"
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 max-h-24"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 disabled:opacity-40"
                onClick={handleSend}
                disabled={!inputValue.trim() || sending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground/40">
              Shift+Enter for newline
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
