"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

function getSocketUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (explicit) return explicit;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  if (apiUrl.startsWith("http")) return apiUrl;

  return "http://localhost:3001";
}

const SOCKET_URL = getSocketUrl();

let sharedSocket: Socket | null = null;
let connectionCount = 0;

export function useSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    if (!sharedSocket || !sharedSocket.connected) {
      sharedSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    socketRef.current = sharedSocket;
    connectionCount++;

    return () => {
      connectionCount--;
      if (connectionCount === 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
      }
    };
  }, [token]);

  const joinRoom = useCallback((applicationId: string) => {
    socketRef.current?.emit("join_room", { applicationId });
  }, []);

  const sendMessage = useCallback(
    (applicationId: string, content: string) => {
      socketRef.current?.emit("send_message", { applicationId, content });
    },
    [],
  );

  const markRead = useCallback((applicationId: string) => {
    socketRef.current?.emit("mark_read", { applicationId });
  }, []);

  const on = useCallback(
    <T>(event: string, handler: (data: T) => void) => {
      socketRef.current?.on(event, handler);
      return () => {
        socketRef.current?.off(event, handler);
      };
    },
    [],
  );

  const off = useCallback((event: string, handler?: (...args: unknown[]) => void) => {
    if (handler) {
      socketRef.current?.off(event, handler);
    } else {
      socketRef.current?.off(event);
    }
  }, []);

  return { socket: socketRef.current, joinRoom, sendMessage, markRead, on, off };
}
