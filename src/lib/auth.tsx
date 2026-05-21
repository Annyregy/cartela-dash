import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AuthUser = {
  username: string;
  passwordHash: string;
  question: string;
  answerHash: string;
  createdAt: string;
};

type AuthState = {
  hydrated: boolean;
  users: AuthUser[];
  current: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (data: { username: string; password: string; question: string; answer: string }) => Promise<void>;
  logout: () => void;
  getQuestion: (username: string) => string | null;
  resetPassword: (data: { username: string; answer: string; newPassword: string }) => Promise<void>;
};

const KEY_USERS = "pos-auth-users-v1";
const KEY_SESSION = "pos-auth-session-v1";

const Ctx = createContext<AuthState | null>(null);

async function sha(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
const norm = (s: string) => s.trim().toLowerCase();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY_USERS);
      if (raw) setUsers(JSON.parse(raw));
      const s = window.localStorage.getItem(KEY_SESSION);
      if (s) setCurrent(s);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(KEY_USERS, JSON.stringify(users));
  }, [users, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (current) window.localStorage.setItem(KEY_SESSION, current);
    else window.localStorage.removeItem(KEY_SESSION);
  }, [current, hydrated]);

  const findUser = (username: string) => users.find((u) => norm(u.username) === norm(username));

  const login: AuthState["login"] = async (username, password) => {
    const u = findUser(username);
    if (!u) throw new Error("Usuário não encontrado.");
    const h = await sha(password);
    if (h !== u.passwordHash) throw new Error("Senha incorreta.");
    setCurrent(u.username);
  };

  const signup: AuthState["signup"] = async ({ username, password, question, answer }) => {
    if (!username.trim() || !password) throw new Error("Preencha usuário e senha.");
    if (password.length < 4) throw new Error("Senha deve ter ao menos 4 caracteres.");
    if (!question.trim() || !answer.trim())
      throw new Error("Defina uma pergunta e resposta de recuperação.");
    if (findUser(username)) throw new Error("Usuário já existe.");
    const user: AuthUser = {
      username: username.trim(),
      passwordHash: await sha(password),
      question: question.trim(),
      answerHash: await sha(norm(answer)),
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, user]);
    setCurrent(user.username);
  };

  const logout = () => setCurrent(null);

  const getQuestion: AuthState["getQuestion"] = (username) => findUser(username)?.question ?? null;

  const resetPassword: AuthState["resetPassword"] = async ({ username, answer, newPassword }) => {
    const u = findUser(username);
    if (!u) throw new Error("Usuário não encontrado.");
    if (newPassword.length < 4) throw new Error("Nova senha deve ter ao menos 4 caracteres.");
    const ah = await sha(norm(answer));
    if (ah !== u.answerHash) throw new Error("Resposta incorreta.");
    const ph = await sha(newPassword);
    setUsers((prev) =>
      prev.map((x) => (x.username === u.username ? { ...x, passwordHash: ph } : x))
    );
  };

  return (
    <Ctx.Provider value={{ hydrated, users, current, login, signup, logout, getQuestion, resetPassword }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
