import { useMemo, useState } from "react";
import { Edit2, Plus, Save, Search, Trash2, User, X, MessageCircle } from "lucide-react";
import { formatBRL, usePos, whatsappLink } from "@/lib/pos-store";
import type { Customer } from "@/lib/pos-data";
import { NEIGHBORHOODS } from "@/lib/pos-data";
import { cn } from "@/lib/utils";

type Draft = { name: string; phone: string; address: string; neighborhood: string };
const empty: Draft = { name: "", phone: "", address: "", neighborhood: "" };

export function Customers() {
  const { customers, orders, addCustomer, updateCustomer, deleteCustomer } = usePos();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(empty);

  const stats = useMemo(() => {
    const m = new Map<string, { count: number; total: number; pending: number }>();
    for (const o of orders) {
      const s = m.get(o.customerId) ?? { count: 0, total: 0, pending: 0 };
      s.count += 1;
      s.total += o.total;
      if (o.paymentStatus === "Pendente") s.pending += o.total;
      m.set(o.customerId, s);
    }
    return m;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...customers].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (!q) return sorted;
    return sorted.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.neighborhood.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [customers, query]);

  const submitNew = () => {
    if (!draft.name.trim()) return;
    addCustomer({
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
    setEditDraft({ name: c.name, phone: c.phone, address: c.address, neighborhood: c.neighborhood });
  };
  const submitEdit = () => {
    if (!editingId || !editDraft.name.trim()) return;
    updateCustomer(editingId, {
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

      <div className="relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, bairro, endereço ou telefone…"
          className="w-full bg-surface border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
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
                    <div className="font-semibold truncate">{c.name}</div>
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
    </div>
  );
}

function Fields({ value, onChange }: { value: Draft; onChange: (d: Draft) => void }) {
  const update = (k: keyof Draft, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
