import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Egg, Route as RouteIcon, ShoppingBag } from "lucide-react";
import { PosProvider } from "@/lib/pos-store";
import { NewOrder } from "@/components/pos/NewOrder";
import { RoutesLogistics } from "@/components/pos/RoutesLogistics";
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

type Tab = "pedido" | "rotas";

function Index() {
  const [tab, setTab] = useState<Tab>("pedido");

  return (
    <PosProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-lg bg-gold text-gold-foreground flex items-center justify-center">
                <Egg className="size-5" />
              </div>
              <div>
                <div className="font-bold leading-tight">Granja POS</div>
                <div className="text-xs text-muted-foreground leading-tight">
                  Gestão interna
                </div>
              </div>
            </div>
            {/* Desktop tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
              <TabButton active={tab === "pedido"} onClick={() => setTab("pedido")} icon={<ShoppingBag className="size-4" />}>
                Novo Pedido
              </TabButton>
              <TabButton active={tab === "rotas"} onClick={() => setTab("rotas")} icon={<RouteIcon className="size-4" />}>
                Rotas e Logística
              </TabButton>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-5">
          {tab === "pedido" ? <NewOrder /> : <RoutesLogistics />}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-border">
          <div className="grid grid-cols-2">
            <BottomTab active={tab === "pedido"} onClick={() => setTab("pedido")} icon={<ShoppingBag className="size-5" />} label="Novo Pedido" />
            <BottomTab active={tab === "rotas"} onClick={() => setTab("rotas")} icon={<RouteIcon className="size-5" />} label="Rotas" />
          </div>
        </nav>
      </div>
    </PosProvider>
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
        "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition",
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
        "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition",
        active ? "text-gold" : "text-muted-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
