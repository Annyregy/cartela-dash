import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Egg,
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Granja POS — Pedidos e Logística" },
      {
        name: "description",
        content: "Sistema interno de vendas e entregas para granja: pedidos rápidos e rotas.",
      },
    ],
  }),
  component: Index,
});

type Tab = "painel" | "pedido" | "clientes" | "produtos" | "fornecedor" | "rotas";

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
        {tab === "painel" && <Dashboard />}
        {tab === "pedido" && <NewOrder />}
        {tab === "clientes" && <Customers />}
        {tab === "produtos" && <Products />}
        {tab === "fornecedor" && <Suppliers />}
        {tab === "rotas" && <RoutesLogistics />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-border">
        <div className="grid grid-cols-6">
          <BottomTab active={tab === "painel"} onClick={() => setTab("painel")} icon={<LayoutDashboard className="size-5" />} label="Painel" />
          <BottomTab active={tab === "pedido"} onClick={() => setTab("pedido")} icon={<ShoppingBag className="size-5" />} label="Pedido" />
          <BottomTab active={tab === "clientes"} onClick={() => setTab("clientes")} icon={<Users className="size-5" />} label="Clientes" />
          <BottomTab active={tab === "produtos"} onClick={() => setTab("produtos")} icon={<Package className="size-5" />} label="Produtos" />
          <BottomTab active={tab === "fornecedor"} onClick={() => setTab("fornecedor")} icon={<Truck className="size-5" />} label="Fornec." />
          <BottomTab active={tab === "rotas"} onClick={() => setTab("rotas")} icon={<RouteIcon className="size-5" />} label="Rotas" />
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
