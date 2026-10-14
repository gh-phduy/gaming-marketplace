"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { Subscription } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUser = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name:
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      supabaseUser.email?.split("@")[0] ||
      "User",
    picture:
      supabaseUser.user_metadata?.avatar_url ||
      supabaseUser.user_metadata?.picture ||
      "/avt-placeholder.jpg",
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let started = false;
    let subscription: Subscription | undefined;
    const storageKey = `sb-${
      new URL(
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
          "https://placeholder-project.supabase.co",
      ).hostname.split(".")[0]
    }-auth-token`;
    const initializeAuth = async () => {
      if (started || !active) return;
      started = true;
      removeListeners();
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!active) return;
        subscription = supabase.auth.onAuthStateChange((event, session) => {
          if (!active) return;
          if (session?.user) {
            setUser(mapSupabaseUser(session.user));
            localStorage.removeItem("auth_token");
          } else if (!localStorage.getItem("auth_token")) {
            setUser(null);
          }
          setIsLoading(false);
        }).data.subscription;
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!active) return;
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          // Fallback to legacy local token if present (for testing/compatibility)
          const legacyToken = localStorage.getItem("auth_token");
          if (legacyToken) {
            try {
              const payload = JSON.parse(atob(legacyToken.split(".")[1]));
              setUser(payload);
            } catch (e) {
              localStorage.removeItem("auth_token");
            }
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    const interaction = () => {
      void initializeAuth();
    };
    const storage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === "auth_token") interaction();
    };
    const removeListeners = () => {
      window.removeEventListener("pointerdown", interaction);
      window.removeEventListener("click", interaction);
      window.removeEventListener("keydown", interaction);
      window.removeEventListener("storage", storage);
      window.removeEventListener("difmark:auth-client-ready", interaction);
    };

    // Returning buyers restore immediately. New visitors load the SDK only
    // when they interact, or another part of the app starts using Supabase.
    let hasSession = true;
    try {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const search = new URLSearchParams(window.location.search);
      hasSession = Boolean(
        hash.has("access_token") ||
        search.has("code") ||
        localStorage.getItem(storageKey) ||
        localStorage.getItem("auth_token"),
      );
    } catch {
      // Let the SDK handle browsers where storage is unavailable.
    }
    if (hasSession) {
      void initializeAuth();
    } else {
      setIsLoading(false);
      window.addEventListener("pointerdown", interaction, { passive: true });
      window.addEventListener("click", interaction);
      window.addEventListener("keydown", interaction);
      window.addEventListener("storage", storage);
      window.addEventListener("difmark:auth-client-ready", interaction);
    }

    return () => {
      active = false;
      removeListeners();
      subscription?.unsubscribe();
    };
  }, []);

  const login = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
      localStorage.setItem("auth_token", token);
    } catch (error) {
      console.error("Failed to login:", error);
    }
  };

  const logout = async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Failed to sign out from Supabase:", error);
    }
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
