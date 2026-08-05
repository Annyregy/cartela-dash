import { useState } from "react";
import { Egg, Eye, EyeOff, KeyRound, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup" | "reset";

export function LoginScreen() {
  const { login, signup, getQuestion, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("login");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // shared
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // signup
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  // reset
  const [resetQuestion, setResetQuestion] = useState<string | null>(null);
  const [resetAnswer, setResetAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const reset = () => {
    setError(null);
    setNotice(null);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    reset();
    setPassword("");
    setAnswer("");
    setResetAnswer("");
    setNewPassword("");
    setResetQuestion(null);
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setBusy(true);
    try {
      await login(username, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setBusy(true);
    try {
      await signup({ username, password, question, answer });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const lookupQuestion = async () => {
    reset();
    setBusy(true);
    try {
      const q = await getQuestion(username);
      if (!q) {
        setError("Usuário não encontrado.");
        setResetQuestion(null);
        return;
      }
      setResetQuestion(q);
    } catch {
      setError("Não foi possível buscar a pergunta. Tente de novo.");
    } finally {
      setBusy(false);
    }
  };


  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setBusy(true);
    try {
      await resetPassword({ username, answer: resetAnswer, newPassword });
      setNotice("Senha redefinida. Faça login com a nova senha.");
      setMode("login");
      setPassword("");
      setResetAnswer("");
      setNewPassword("");
      setResetQuestion(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="size-14 rounded-xl bg-gold text-gold-foreground flex items-center justify-center">
            <Egg className="size-7" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">Granja POS</div>
            <div className="text-sm text-muted-foreground">Acesse seu painel de vendas</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-1 mb-4 grid grid-cols-3 text-sm">
          <TabBtn active={mode === "login"} onClick={() => switchMode("login")} icon={<LogIn className="size-4" />}>
            Entrar
          </TabBtn>
          <TabBtn active={mode === "signup"} onClick={() => switchMode("signup")} icon={<UserPlus className="size-4" />}>
            Criar
          </TabBtn>
          <TabBtn active={mode === "reset"} onClick={() => switchMode("reset")} icon={<KeyRound className="size-4" />}>
            Senha
          </TabBtn>
        </div>

        {notice && (
          <div className="mb-3 text-sm bg-success/15 text-success border border-success/30 rounded-md px-3 py-2">
            {notice}
          </div>
        )}
        {error && (
          <div className="mb-3 text-sm bg-destructive/15 text-destructive border border-destructive/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {mode === "login" && (
          <form onSubmit={onLogin} className="bg-surface-elevated border border-border rounded-xl p-5 space-y-3">
            <Field label="Usuário" value={username} onChange={setUsername} autoFocus />
            <Field label="Senha" value={password} onChange={setPassword} type="password" />
            <button
              type="submit"
              disabled={busy}
              className="w-full mt-1 bg-gold text-gold-foreground font-semibold rounded-md py-2.5 text-sm hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Entrando…" : "Entrar"}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Sua conta funciona em qualquer celular. Ainda não tem? Crie na aba <b>Criar</b>.
            </p>

          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={onSignup} className="bg-surface-elevated border border-border rounded-xl p-5 space-y-3">
            <Field label="Usuário" value={username} onChange={setUsername} autoFocus />
            <Field label="Senha (mín. 6 caracteres)" value={password} onChange={setPassword} type="password" />
            <Field
              label="Pergunta de recuperação"
              value={question}
              onChange={setQuestion}
              placeholder="Ex.: Nome do meu cachorro"
            />
            <Field label="Resposta" value={answer} onChange={setAnswer} />
            <button
              type="submit"
              disabled={busy}
              className="w-full mt-1 bg-gold text-gold-foreground font-semibold rounded-md py-2.5 text-sm hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Criando…" : "Criar usuário"}
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={onReset} className="bg-surface-elevated border border-border rounded-xl p-5 space-y-3">
            <Field label="Usuário" value={username} onChange={setUsername} autoFocus />
            {!resetQuestion ? (
              <button
                type="button"
                onClick={lookupQuestion}
                disabled={busy || !username.trim()}
                className="w-full bg-dull-blue text-dull-blue-foreground font-semibold rounded-md py-2.5 text-sm hover:opacity-90 disabled:opacity-60"
              >
                Buscar pergunta
              </button>
            ) : (
              <>
                <div className="text-xs text-muted-foreground">
                  Pergunta: <span className="text-foreground font-medium">{resetQuestion}</span>
                </div>
                <Field label="Resposta" value={resetAnswer} onChange={setResetAnswer} />
                <Field label="Nova senha" value={newPassword} onChange={setNewPassword} type="password" />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-gold text-gold-foreground font-semibold rounded-md py-2.5 text-sm hover:opacity-90 disabled:opacity-60"
                >
                  {busy ? "Salvando…" : "Redefinir senha"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition",
        active ? "bg-gold text-gold-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && reveal ? "text" : type;
  return (
    <label className="block text-xs font-medium">
      {label}
      <div className="relative mt-1">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground hover:text-foreground"
            aria-label={reveal ? "Ocultar senha" : "Mostrar senha"}
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </label>
  );
}
