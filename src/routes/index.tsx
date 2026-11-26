import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Egg,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Package,
  Route as RouteIcon,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { PosProvider } from "@/lib/pos-store";
import { AuthProvider, useAuth } from "@/lib/auth";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { NewOrder } from "@/components/pos/NewOrder";
import { RoutesLogistics } from "@/components/pos/RoutesLogistics";
import { Dashboard } from "@/components/pos/Dashboard";
import { Products } from "@/components/pos/Products";
import { Suppliers } from "@/components/pos/Suppliers";
import { Customers } from "@/components/pos/Customers";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { TabErrorBoundary } from "@/components/TabErrorBoundary";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Granja POS — Pedidos e Logística" },
      {
        name: "description",
        content: "Sistema interno de vendas e entregas para granja: pedidos rápidos e rotas.",
      },
      { property: "og:title", content: "Granja POS — Pedidos e Logística" },
      {
        property: "og:description",
        content: "Sistema interno de vendas e entregas para granja: pedidos rápidos e rotas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Tab = "painel" | "pedido" | "clientes" | "produtos" | "fornecedor" | "rotas" | "backup";

function Index() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { hydrated, current } = useAuth();
  if (!hydrated) return <div className="min-h-screen bg-background" />;
  if (!current) return <LoginScreen />;
  return (
    <PosProvider>
      <App />
    </PosProvider>
  );
}

function App() {
  const { current, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("painel");

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-9 rounded-lg bg-gold text-gold-foreground flex items-center justify-center shrink-0">
              <Egg className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold leading-tight truncate">Granja POS</div>
              <div className="text-xs text-muted-foreground leading-tight truncate">
                {current}
              </div>
            </div>
          </div>
          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
            <TabButton active={tab === "painel"} onClick={() => setTab("painel")} icon={<LayoutDashboard className="size-4" />}>
              Painel
            </TabButton>
            <TabButton active={tab === "pedido"} onClick={() => setTab("pedido")} icon={<ShoppingBag className="size-4" />}>
              Pedido
            </TabButton>
            <TabButton active={tab === "clientes"} onClick={() => setTab("clientes")} icon={<Users className="size-4" />}>
              Clientes
            </TabButton>
            <TabButton active={tab === "produtos"} onClick={() => setTab("produtos")} icon={<Package className="size-4" />}>
              Produtos
            </TabButton>
            <TabButton active={tab === "fornecedor"} onClick={() => setTab("fornecedor")} icon={<Truck className="size-4" />}>
              Fornec.
            </TabButton>
            <TabButton active={tab === "rotas"} onClick={() => setTab("rotas")} icon={<RouteIcon className="size-4" />}>
              Rotas
            </TabButton>
            <TabButton active={tab === "backup"} onClick={() => setTab("backup")} icon={<ShieldCheck className="size-4" />}>Backup</TabButton>
          </nav>
          <button
            onClick={logout}
            title="Sair"
            className="shrink-0 p-2 rounded-md bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5">
        {tab === "painel" && <TabErrorBoundary label="o painel"><Dashboard /></TabErrorBoundary>}
        {tab === "pedido" && <TabErrorBoundary label="Nova Venda"><NewOrder /></TabErrorBoundary>}
        {tab === "clientes" && <TabErrorBoundary label="Clientes"><Customers /></TabErrorBoundary>}
        {tab === "produtos" && <TabErrorBoundary label="Produtos"><Products /></TabErrorBoundary>}
        {tab === "fornecedor" && <TabErrorBoundary label="Fornecedores"><Suppliers /></TabErrorBoundary>}
        {tab === "rotas" && <TabErrorBoundary label="Rotas"><RoutesLogistics /></TabErrorBoundary>}
        {tab === "backup" && <TabErrorBoundary label="Backup e Segurança"><BackupPanel /></TabErrorBoundary>}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-border">
        <div className="grid grid-cols-7">
          <BottomTab active={tab === "painel"} onClick={() => setTab("painel")} icon={<LayoutDashboard className="size-5" />} label="Painel" />
          <BottomTab active={tab === "pedido"} onClick={() => setTab("pedido")} icon={<ShoppingBag className="size-5" />} label="Pedido" />
          <BottomTab active={tab === "clientes"} onClick={() => setTab("clientes")} icon={<Users className="size-5" />} label="Clientes" />
          <BottomTab active={tab === "produtos"} onClick={() => setTab("produtos")} icon={<Package className="size-5" />} label="Produtos" />
          <BottomTab active={tab === "fornecedor"} onClick={() => setTab("fornecedor")} icon={<Truck className="size-5" />} label="Fornec." />
          <BottomTab active={tab === "rotas"} onClick={() => setTab("rotas")} icon={<RouteIcon className="size-5" />} label="Rotas" />
          <BottomTab active={tab === "backup"} onClick={() => setTab("backup")} icon={<ShieldCheck className="size-5" />} label="Backup" />
        </div>
      </nav>
    </div>
  );
}

function TabButton({
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
      onClick={onClick}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition",
        active ? "bg-gold text-gold-foreground" : "text-foreground hover:bg-muted"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function BottomTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
        active ? "text-gold" : "text-muted-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function BackupPanel() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function download() {
    setBusy(true);
    setMessage("");
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || auth.user?.app_metadata?.cartela_access !== true) throw new Error("Acesso não autorizado.");
      const tables = ["customers", "orders", "products", "purchases", "suppliers"] as const;
      const result = [];
      for (const table of tables) {
        const rows: unknown[] = [];
        const pageSize = 200;
        let expected: number | null = null;
        for (let start = 0; ; start += pageSize) {
          const { data, error, count } = await supabase.from(table).select("*", { count: "exact" }).order("id").range(start, start + pageSize - 1);
          if (error || !data || count === null) throw new Error("Falha ao consultar " + table);
          if (expected !== null && expected !== count) throw new Error("Dados alterados durante a exportação. Tente novamente.");
          expected = count;
          rows.push(...data);
          if (rows.length >= expected || data.length === 0) break;
        }
        if (rows.length !== expected || new Set(rows.map(row => (row as { id: string }).id)).size !== expected) throw new Error("Exportação incompleta de " + table);
        result.push({ table, count: rows.length, rows });
      }
      const createdAt = new Date().toISOString();
      const blob = new Blob([JSON.stringify({ format: "cartela-dash-manual-v1", createdAt, tables: result }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cartela-dash-" + createdAt.replace(/[:.]/g, "-") + ".json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      setMessage("Arquivo preparado para download. Confira a pasta de downloads do seu dispositivo.");
    } catch {
      setMessage("Não foi possível concluir a exportação. Verifique a conexão e tente novamente.");
    } finally { setBusy(false); }
  }
  return (
    <section className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="size-6" /> Backup e Segurança</h1>
      <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
        <h2 className="font-semibold">Backups automáticos</h2>
        <p className="text-sm text-muted-foreground">Rotina externa ao site, programada diariamente às 03h (Brasília), com retenção prevista de 30 dias. Consulte o Drive para conferir as cópias disponíveis. O site não monitora a execução.</p>
        <a href="https://drive.google.com/drive/folders/1z4nDbpxRyshQHI_DEUnb-qGGLrBytyf2" target="_blank" rel="noopener noreferrer" className="inline-flex rounded-md bg-gold text-gold-foreground px-4 py-2 font-medium">Abrir histórico no Google Drive</a>
      </div>
      <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
        <h2 className="font-semibold">Exportação manual</h2>
        <p className="text-sm text-muted-foreground">Baixe os dados comerciais em JSON. Evite realizar vendas durante a exportação. O arquivo contém informações de clientes e deve ser guardado em local privado. Esta exportação não é uma cópia transacional nem inclui credenciais.</p>
        <button type="button" disabled={busy} onClick={() => void download()} className="rounded-md bg-gold text-gold-foreground px-4 py-2 font-medium disabled:opacity-50">{busy ? "Exportando..." : "Baixar backup manual"}</button>
        {message && <p role="status" className="text-sm">{message}</p>}
      </div>
      <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
        <h2 className="font-semibold">Restauração</h2>
        <p className="text-sm text-muted-foreground">Restauração pelo site indisponível. Preserve o banco atual e solicite recuperação técnica para evitar perda de vendas recentes.</p>
      </div>
    </section>
  );
}
