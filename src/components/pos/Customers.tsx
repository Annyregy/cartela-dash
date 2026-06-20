import { useMemo, useState } from "react";
import { ArrowUpDown, Eye, MessageCircle, Plus, Save, Search, Trash2, User, X, Edit2 } from "lucide-react";
import { formatBRL, usePos, whatsappLink } from "@/lib/pos-store";
import type { Customer, Order } from "@/lib/pos-data";
import { NEIGHBORHOODS } from "@/lib/pos-data";
import { cn } from "@/lib/utils";

type Draft = { code: string; name: string; phone: string; address: string; neighborhood: string };
type SortMode = "name-asc" | "name-desc" | "pending-desc" | "pending-asc";
const empty: Draft = { code: "", name: "", phone: "", address: "", neighborhood: "" };

export function Customers() {
  const { customers, orders, addCustomer, updateCustomer, deleteCustomer } = usePos();
  const [query, setQuery] = useState("");
  const [neighborhood, setNeighborhood] = useState("todos");
  const [sort, setSort] = useState<SortMode>("name-asc");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(empty);

  const stats = useMemo(() => {
    const m = new Map<string, { count: number; total: number; paid: number; pending: number }>();
    for (const o of orders) {
      const s = m.get(o.customerId) ?? { count: 0, total: 0, paid: 0, pending: 0 };
      s.count += 1;
      s.total += o.total;
      if (o.paymentStatus === "Pendente") s.pending += o.total;
      if (o.paymentStatus === "Pago") s.paid += o.total;
      m.set(o.customerId, s);
    }
    return m;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = customers.filter(
      (c) =>
        (neighborhood === "todos" || c.neighborhood === neighborhood) &&
        (!q ||
          String(c.code ?? "").includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.neighborhood.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.phone.includes(q))
    );
    return list.sort((a, b) => {
      const pa = stats.get(a.id)?.pending ?? 0;
      const pb = stats.get(b.id)?.pending ?? 0;
      if (sort === "pending-desc") return pb - pa || a.name.localeCompare(b.name, "pt-BR");
      if (sort === "pending-asc") return pa - pb || a.name.localeCompare(b.name, "pt-BR");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "pt-BR");
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [customers, neighborhood, query, sort, stats]);

  const selected = customers.find((c) => c.id === detailId) ?? null;
  const selectedOrders = useMemo(
    () => orders.filter((o) => o.customerId === detailId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [orders, detailId]
  );

  const submitNew = () => {
    if (!draft.name.trim()) return;
    addCustomer({
      code: Number(draft.code) || undefined,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      address: draft.address.trim() || "-",
      neighborhood: draft.neighborhood.trim() || "-",
    });
    setDraft(empty);
    setAdding(false);
  };

  const startEdit = (c: Customer) => {
    setEditingId(c.id);
    setEditDraft({ code: String(c.code ?? ""), name: c.name, phone: c.phone, address: c.address, neighborhood: c.neighborhood });
  };
  const submitEdit = () => {
    if (!editingId || !editDraft.name.trim()) return;
    updateCustomer(editingId, {
      code: Number(editDraft.code) || undefined,
      name: editDraft.name.trim(),
      phone: editDraft.phone.trim(),
      address: editDraft.address.trim() || "-",
      neighborhood: editDraft.neighborhood.trim() || "-",
    });
    setEditingId(null);
  };

  const remove = (c: Customer) => {
    if (window.confirm(`Excluir cliente "${c.name}"?`)) deleteCustomer(c.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="size-6 text-gold" /> Clientes
          </h1>
          <p className="text-sm text-muted-foreground">{customers.length} cadastrados</p>
        </div>
        <button
          onClick={() => {
            setAdding((v) => !v);
            setDraft(empty);
          }}
          className="bg-gold text-gold-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="size-4" /> Novo cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_240px] gap-2">
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código, nome, bairro, endereço ou telefone…"
            className="w-full bg-surface border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="todos">Todos os bairros/rotas</option>
          {NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <label className="relative">
          <ArrowUpDown className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="w-full bg-surface border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="name-asc">Nome A-Z</option>
            <option value="name-desc">Nome Z-A</option>
            <option value="pending-desc">Maior saldo a pagar</option>
            <option value="pending-asc">Menor saldo a pagar</option>
          </select>
        </label>
      </div>

      {adding && (
        <div className="bg-surface-elevated border border-border rounded-lg p-4 space-y-3">
          <div className="font-semibold">Cadastrar cliente</div>
          <Fields value={draft} onChange={setDraft} />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setAdding(false);
                setDraft(empty);
              }}
              className="px-3 py-2 rounded-md text-sm bg-muted hover:bg-muted/70 flex items-center gap-1"
            >
              <X className="size-4" /> Cancelar
            </button>
            <button
              onClick={submitNew}
              className="px-3 py-2 rounded-md text-sm bg-gold text-gold-foreground font-semibold hover:opacity-90 flex items-center gap-1"
            >
              <Save className="size-4" /> Salvar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((c) => {
          const isEdit = editingId === c.id;
          const s = stats.get(c.id);
          return (
            <div
              key={c.id}
              className={cn(
                "bg-surface border border-border rounded-lg p-3",
                isEdit && "border-gold"
              )}
            >
              {isEdit ? (
                <div className="space-y-3">
                  <Fields value={editDraft} onChange={setEditDraft} />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-md text-sm bg-muted hover:bg-muted/70 flex items-center gap-1"
                    >
                      <X className="size-4" /> Cancelar
                    </button>
                    <button
                      onClick={submitEdit}
                      className="px-3 py-1.5 rounded-md text-sm bg-gold text-gold-foreground font-semibold hover:opacity-90 flex items-center gap-1"
                    >
                      <Save className="size-4" /> Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">
                      <span className="text-gold tabular-nums">{c.code ?? "-"}</span> · {c.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.neighborhood}
                      {c.address && c.address !== c.neighborhood ? ` · ${c.address}` : ""}
                      {c.phone ? ` · ${c.phone}` : ""}
                    </div>
                    {s && (
                      <div className="text-xs mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span className="text-muted-foreground">
                          {s.count} pedido{s.count > 1 ? "s" : ""}
                        </span>
                        <span className="text-success">Total: {formatBRL(s.total)}</span>
                        {s.pending > 0 && (
                          <span className="text-destructive">A pagar: {formatBRL(s.pending)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => setDetailId(c.id)}
                      className="p-2 rounded-md bg-dull-blue/15 text-dull-blue hover:bg-dull-blue/25"
                      title="Detalhes"
                    >
                      <Eye className="size-4" />
                    </button>
                    {c.phone && (
                      <a
                        href={whatsappLink(c.phone, `Olá ${c.name}!`)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-md bg-success/15 text-success hover:bg-success/25"
                        title="WhatsApp"
                      >
                        <MessageCircle className="size-4" />
                      </a>
                    )}
                    <button
                      onClick={() => startEdit(c)}
                      className="p-2 rounded-md bg-muted hover:bg-muted/70"
                      title="Editar"
                    >
                      <Edit2 className="size-4" />
                    </button>
                    <button
                      onClick={() => remove(c)}
                      className="p-2 rounded-md bg-destructive/15 text-destructive hover:bg-destructive/25"
                      title="Excluir"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      {selected && (
        <CustomerDetails
          customer={selected}
          orders={selectedOrders}
          stats={stats.get(selected.id) ?? { count: 0, total: 0, paid: 0, pending: 0 }}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}

function Fields({ value, onChange }: { value: Draft; onChange: (d: Draft) => void }) {
  const update = (k: keyof Draft, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label className="text-xs font-medium">
        Código numérico
        <input
          type="number"
          min="1"
          value={value.code}
          onChange={(e) => update("code", e.target.value)}
          placeholder="Automático se vazio"
          className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </label>
      <label className="text-xs font-medium">
        Nome
        <input
          value={value.name}
          onChange={(e) => update("name", e.target.value)}
          className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </label>
      <label className="text-xs font-medium">
        Telefone
        <input
          value={value.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="Ex.: 11 9 9999 0000"
          className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </label>
      <label className="text-xs font-medium">
        Endereço
        <input
          value={value.address}
          onChange={(e) => update("address", e.target.value)}
          className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </label>
      <label className="text-xs font-medium">
        Bairro
        <input
          value={value.neighborhood}
          onChange={(e) => update("neighborhood", e.target.value)}
          list="neighborhoods-list"
          className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <datalist id="neighborhoods-list">
          {NEIGHBORHOODS.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </label>
    </div>
  );
}

function CustomerDetails({ customer, orders, stats, onClose }: { customer: Customer; orders: Order[]; stats: { count: number; total: number; paid: number; pending: number }; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-3 md:p-6 overflow-auto" onClick={onClose}>
      <div className="mx-auto max-w-3xl bg-surface border border-border rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-gold font-bold tabular-nums">Cliente {customer.code ?? "-"}</div>
            <h2 className="text-xl font-bold">{customer.name}</h2>
            <p className="text-sm text-muted-foreground">{customer.neighborhood} · {customer.address}{customer.phone ? ` · ${customer.phone}` : ""}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md bg-muted hover:bg-muted/70" aria-label="Fechar">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-3 gap-2 border-b border-border">
          <Metric label="Total vendido" value={formatBRL(stats.total)} />
          <Metric label="Total pago" value={formatBRL(stats.paid)} tone="success" />
          <Metric label="Em aberto" value={formatBRL(stats.pending)} tone="danger" />
        </div>
        <div className="p-4 space-y-3">
          <div className="font-semibold">Histórico de pedidos</div>
          {orders.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Nenhum pedido para este cliente.</div>}
          {orders.map((o) => (
            <div key={o.id} className="rounded-lg border border-border bg-background/40 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">{new Date(o.createdAt).toLocaleDateString("pt-BR")}</div>
                <div className={cn("text-xs font-bold px-2 py-1 rounded-full", o.paymentStatus === "Pago" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground")}>{o.paymentStatus}</div>
              </div>
              <div className="space-y-1">
                {o.items.map((i) => (
                  <div key={`${o.id}-${i.productId}`} className="flex justify-between gap-2 text-sm">
                    <span><span className="text-gold font-semibold">{i.quantity}x</span> {i.name}</span>
                    <span className="tabular-nums text-muted-foreground">{formatBRL(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <span>Total</span>
                <span className="text-gold tabular-nums">{formatBRL(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
  return (
    <div className="rounded-lg bg-background/40 border border-border p-3 min-w-0">
      <div className="text-xs text-muted-foreground truncate">{label}</div>
      <div className={cn("font-bold tabular-nums text-sm md:text-base", tone === "success" && "text-success", tone === "danger" && "text-destructive")}>{value}</div>
    </div>
  );
}
