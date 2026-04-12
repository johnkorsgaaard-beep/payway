"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";


type Role = "user" | "merchant" | "admin" | "account_manager" | null;
type AuthState = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  state: AuthState;
  user: User | null;
  role: Role;
  signIn: (email: string, password: string) => Promise<{ error: string | null; redirectTo: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/overview",
  account_manager: "/overview",
  merchant: "/shop",
};

const ERROR_MAP: Record<string, string> = {
  invalid_credentials: "Forkert e-mail eller adgangskode",
  email_not_confirmed: "Din e-mail er ikke bekræftet endnu",
  user_not_found: "Ingen bruger fundet med den e-mail",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>("unauthenticated");
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);

  const fetchRole = useCallback(async (userId: string): Promise<Role> => {
    try {
      const res = await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const { role } = await res.json();
      return (role as Role) ?? null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    supabase.auth.getUser().then(async ({ data: { user: u }, error }) => {
      if (cancelled) return;
      if (error || !u) {
        // Clear stale/invalid session tokens so the error doesn't recur
        await supabase.auth.signOut().catch(() => {});
        setState("unauthenticated");
        return;
      }
      const r = await fetchRole(u.id);
      if (cancelled) return;
      setUser(u);
      setRole(r);
      setState("authenticated");
    }).catch(() => {
      if (!cancelled) setState("unauthenticated");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const r = await fetchRole(session.user.id);
        setUser(session.user);
        setRole(r);
        setState("authenticated");
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setRole(null);
        setState("unauthenticated");
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchRole]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const msg =
          ERROR_MAP[error.message] ??
          ERROR_MAP[error.code ?? ""] ??
          error.message;
        return { error: msg, redirectTo: null };
      }

      if (!data.user) {
        return { error: "Ukendt fejl ved login", redirectTo: null };
      }

      const r = await fetchRole(data.user.id);
      setUser(data.user);
      setRole(r);
      setState("authenticated");

      if (r === "user") {
        return {
          error: "Denne konto er en privat bruger. Download PayWay-appen i stedet.",
          redirectTo: null,
        };
      }

      if (!r) {
        return {
          error: "Kunne ikke hente din rolle. Prøv igen eller kontakt support.",
          redirectTo: null,
        };
      }

      const redirectTo = ROLE_REDIRECTS[r] ?? "/overview";
      return { error: null, redirectTo };
    },
    [fetchRole]
  );

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setState("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ state, user, role, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
