import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "STUDENT" | "TUTOR" | "ADMIN";

interface User {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("tuitionmedia_token", token);
        }
        set({ user, token });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("tuitionmedia_token");
        }
        set({ user: null, token: null });
      },
      hydrate: () => {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("tuitionmedia_token")
            : null;
        if (!token) set({ user: null, token: null });
      },
    }),
    { name: "tuitionmedia-auth", partialize: (s) => ({ user: s.user, token: s.token }) },
  ),
);
