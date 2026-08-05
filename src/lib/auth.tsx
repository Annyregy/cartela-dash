import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getRecoveryQuestion, resetPasswordWithAnswer } from "./account.functions";

type AuthState = {
  hydrated: boolean;
  current: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (data: { username: string; password: string; question: string; answer: string }) => Promise<void>;
  logout: () => Promise<void>;
  getQuestion: (username: string) => Promise<string | null>;
  resetPassword: (data: { username: string; answer: string; newPassword: string }) => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export const MIN_PASSWORD = 6;

async function sha(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const norm = (s: string) => s.trim().toLowerCase();

/** Deterministic, email-safe handle derived from the username. */
export const slugify = (s: string) =>
  norm(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]/g, "");

const emailFor = (username: string) => `${slugify(username)}@granja.app`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    const nameFrom = (user: { user_metadata?: Record<string, unknown>; email?: string } | null) => {
      if (!user) return null;
      const meta = user.user_metadata ?? {};
      return (
        (typeof meta['username'] === "string" && meta['username']) ||
        (user.email ? user.email.split("@")[0]! : "usuário")
      );
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setCurrent(nameFrom(session?.user ?? null));
      setHydrated(true);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setCurrent(nameFrom(data.session?.user ?? null));
      setHydrated(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login: AuthState["login"] = async (username, password) => {
    if (!slugify(username)) throw new Error("Informe o usuário.");
    const { error } = await supabase.auth.signInWithPassword({
      email: emailFor(username),
      password,
    });
    if (error) {
      if (error.message.toLowerCase().includes("invalid")) {
        throw new Error("Usuário ou senha incorretos.");
      }
      throw new Error(error.message);
    }
  };

  const signup: AuthState["signup"] = async ({ username, password, question, answer }) => {
    const handle = slugify(username);
    if (!handle) throw new Error("Use letras ou números no nome de usuário.");
    if (password.length < MIN_PASSWORD)
      throw new Error(`Senha deve ter ao menos ${MIN_PASSWORD} caracteres.`);
    if (!question.trim() || !answer.trim())
      throw new Error("Defina uma pergunta e resposta de recuperação.");

    const { error } = await supabase.auth.signUp({
      email: emailFor(username),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          username: username.trim(),
          username_norm: handle,
          question: question.trim(),
          answer_hash: await sha(norm(answer)),
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already")) throw new Error("Usuário já existe.");
      throw new Error(error.message);
    }
  };

  const logout: AuthState["logout"] = async () => {
    await supabase.auth.signOut();
    setCurrent(null);
  };

  const getQuestion: AuthState["getQuestion"] = async (username) => {
    const { question } = await getRecoveryQuestion({ data: { username } });
    return question;
  };

  const resetPassword: AuthState["resetPassword"] = async ({ username, answer, newPassword }) => {
    if (newPassword.length < MIN_PASSWORD)
      throw new Error(`Nova senha deve ter ao menos ${MIN_PASSWORD} caracteres.`);
    const res = await resetPasswordWithAnswer({
      data: { username, answerHash: await sha(norm(answer)), newPassword },
    });
    if (!res.ok) throw new Error(res.error);
  };

  return (
    <Ctx.Provider value={{ hydrated, current, login, signup, logout, getQuestion, resetPassword }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
