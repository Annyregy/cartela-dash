import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Building2, ChevronDown, Eye, History, Minus, Plus, Trash2, TrendingUp, X } from "lucide-react";
import { formatBRL, usePos, type Purchase, type PurchaseItem } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

type View = "fornecedores" | "compras" | "historico";

export function Suppliers() {
  const [view, setView] = useState<View>("fornecedores");

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      <div className="grid grid-cols-3 gap-2 bg-surface border border-border rounded-xl p-1">
        <TabBtn active={view === "fornecedores"} onClick={() => setView("fornecedores")} icon={<Building2 className="size-4" />}>
          Fornecedores
        </TabBtn>
        <TabBtn active={view === "compras"} onClick={() => setView("compras")} icon={<Plus className="size-4" />}>
          Nova Compra
        </TabBtn>
        <TabBtn active={view === "historico"} onClick={() => setView("historico")} icon={<History className="size-4" />}>
          Histórico
        </TabBtn>
      </div>

      {view === "fornecedores" && <SupplierList />}
      {view === "compras" && <NewPurchase onDone={() => setView("historico")} />}
      {view === "historico" && <PriceHistory />}
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
      onClick={onClick}
      className={cn(
        "py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5",
        active ? "bg-gold text-gold-foreground" : "text-foreground hover:bg-muted"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/* ---------------- Supplier list ---------------- */

function SupplierList() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, purchases } = usePos();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const totalsBySupplier = useMemo(() => {
    const m = new Map<string, { total: number; count: number }>();
    for (const p of purchases) {
      const cur = m.get(p.supplierId) ?? { total: 0, count: 0 };
      cur.total += p.total;
      cur.count += 1;
      m.set(p.supplierId, cur);
    }
    return m;
  }, [purchases]);

  const submit = () => {
    if (!name.trim()) return;
    addSupplier({ name: name.trim(), phone: phone.trim(), contact: contact.trim(), notes: notes.trim() });
    setName("");
    setPhone("");
    setContact("");
    setNotes("");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-surface border border-border p-4 space-y-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Novo fornecedor
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Nome" value={name} onChange={setName} placeholder="Granja São José" />
          <Field label="Telefone" value={phone} onChange={setPhone} placeholder="(12) 99999-0000" />
          <Field label="Contato" value={contact} onChange={setContact} placeholder="Pessoa de contato" />
          <Field label="Observações" value={notes} onChange={setNotes} placeholder="Forma de pagamento, etc" />
        </div>
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gold text-gold-foreground font-semibold hover:opacity-90 disabled:opacity-40 transition"
        >
          Adicionar fornecedor
        </button>
      </div>

      <div className="space-y-3">
        {suppliers.length === 0 && (
          <div className="rounded-xl bg-surface border border-border p-8 text-center text-muted-foreground">
            Nenhum fornecedor cadastrado.
          </div>
        )}
        {suppliers.map((s) => {
          const t = totalsBySupplier.get(s.id);
          const isEdit = editing === s.id;
          return (
            <div key={s.id} className="rounded-xl bg-surface border border-border p-4 space-y-3">
              {isEdit ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Nome"
                      value={s.name}
                      onChange={(v) => updateSupplier(s.id, { name: v })}
                    />
                    <Field
                      label="Telefone"
                      value={s.phone}
                      onChange={(v) => updateSupplier(s.id, { phone: v })}
                    />
                    <Field
                      label="Contato"
                      value={s.contact}
                      onChange={(v) => updateSupplier(s.id, { contact: v })}
                    />
                    <Field
                      label="Observações"
                      value={s.notes}
                      onChange={(v) => updateSupplier(s.id, { notes: v })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditing(null)}
                      className="px-3 py-2 rounded-lg text-sm bg-muted text-foreground hover:bg-muted/70"
                    >
                      Concluir
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-foreground font-bold leading-tight">{s.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        {s.phone && <div>📞 {s.phone}</div>}
                        {s.contact && <div>👤 {s.contact}</div>}
                        {s.notes && <div className="text-foreground/70">{s.notes}</div>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Comprado
                      </div>
                      <div className="text-gold font-bold tabular-nums">
                        {formatBRL(t?.total ?? 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">{t?.count ?? 0} compras</div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => setEditing(s.id)}
                      className="flex-1 py-2 rounded-lg text-sm bg-muted text-foreground hover:bg-muted/70"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remover fornecedor "${s.name}"?`)) deleteSupplier(s.id);
                      }}
                      className="px-3 py-2 rounded-lg text-sm bg-destructive/15 text-destructive hover:bg-destructive/25"
                      aria-label="Excluir"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- New Purchase ---------------- */

function NewPurchase({ onDone }: { onDone: () => void }) {
  const { suppliers, products, addPurchase } = usePos();
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);

  const supplier = suppliers.find((s) => s.id === supplierId);

  const addItem = (productId: string) => {
    if (items.some((i) => i.productId === productId)) return;
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setItems((prev) => [
      ...prev,
      { productId, productName: p.name, unit: p.unit, quantity: 1, unitCost: 0 },
    ]);
  };

  const updateItem = (productId: string, patch: Partial<PurchaseItem>) =>
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, ...patch } : i)));

  const removeItem = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const total = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);

  const submit = () => {
    if (!supplier || items.length === 0) return;
    addPurchase({
      supplierId: supplier.id,
      supplierName: supplier.name,
      items,
      total,
      notes,
      createdAt: new Date(`${date}T12:00:00`).toISOString(),
    });
    setItems([]);
    setNotes("");
    onDone();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-surface border border-border p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Fornecedor
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="mt-2 w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
            >
              {suppliers.length === 0 && <option value="">Cadastre um fornecedor</option>}
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Data da compra
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Observações
          </label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nota fiscal, condição de pagamento..."
            className="mt-2 w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
      </div>

      <div className="rounded-xl bg-surface border border-border p-4 space-y-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Adicionar produto
        </div>
        <div className="flex flex-wrap gap-2">
          {products.map((p) => {
            const added = items.some((i) => i.productId === p.id);
            return (
              <button
                key={p.id}
                onClick={() => addItem(p.id)}
                disabled={added}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium border transition",
                  added
                    ? "bg-muted text-muted-foreground border-border opacity-60"
                    : "bg-input text-foreground border-border hover:border-gold/60"
                )}
              >
                {p.name} <span className="text-xs text-muted-foreground">{p.unit}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 && (
          <div className="rounded-xl bg-surface border border-dashed border-border p-6 text-center text-muted-foreground text-sm">
            Nenhum item. Clique nos produtos acima para adicionar.
          </div>
        )}
        {items.map((it) => (
          <div key={it.productId} className="rounded-xl bg-surface border border-border p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold text-foreground truncate">
                {it.productName} <span className="text-xs text-muted-foreground">{it.unit}</span>
              </div>
              <button
                onClick={() => removeItem(it.productId)}
                className="p-1.5 rounded-md bg-destructive/15 text-destructive hover:bg-destructive/25"
                aria-label="Remover"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Qtd
                </label>
                <div className="mt-1 flex items-center bg-input border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateItem(it.productId, { quantity: Math.max(1, it.quantity - 1) })}
                    className="px-2 py-2 text-foreground hover:bg-muted"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) =>
                      updateItem(it.productId, { quantity: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="flex-1 bg-transparent text-center text-foreground focus:outline-none py-2 tabular-nums"
                  />
                  <button
                    onClick={() => updateItem(it.productId, { quantity: it.quantity + 1 })}
                    className="px-2 py-2 text-foreground hover:bg-muted"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Custo unit. (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={it.unitCost}
                  onChange={(e) =>
                    updateItem(it.productId, { unitCost: Math.max(0, parseFloat(e.target.value) || 0) })
                  }
                  className="mt-1 w-full px-2 py-2 rounded-lg bg-input border border-border text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Subtotal
                </label>
                <div className="mt-1 py-2 px-2 text-right font-bold text-gold tabular-nums">
                  {formatBRL(it.quantity * it.unitCost)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-surface border border-gold/40 p-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Total da compra
        </span>
        <span className="text-2xl font-bold text-gold tabular-nums">{formatBRL(total)}</span>
      </div>

      <button
        onClick={submit}
        disabled={items.length === 0 || !supplier}
        className="w-full py-3 rounded-lg bg-gold text-gold-foreground font-bold hover:opacity-90 disabled:opacity-40 transition"
      >
        Registrar compra
      </button>
    </div>
  );
}

/* ---------------- Price history ---------------- */

function PriceHistory() {
  const { products, purchases, deletePurchase } = usePos();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [detailPurchaseId, setDetailPurchaseId] = useState<string | null>(null);

  const detailPurchase = useMemo(
    () => purchases.find((p) => p.id === detailPurchaseId) ?? null,
    [purchases, detailPurchaseId]
  );

  // Linhas planas por produto: { date, qty, unitCost, supplier, purchaseId, monthKey }
  type Row = {
    date: Date;
    qty: number;
    unitCost: number;
    supplier: string;
    purchaseId: string;
    monthKey: string;
  };

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    for (const p of purchases) {
      for (const it of p.items) {
        if (it.productId !== productId) continue;
        const d = new Date(p.createdAt);
        out.push({
          date: d,
          qty: it.quantity,
          unitCost: it.unitCost,
          supplier: p.supplierName,
          purchaseId: p.id,
          monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        });
      }
    }
    return out.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [purchases, productId]);

  type MonthAgg = {
    monthKey: string;
    label: string;
    avg: number;
    min: number;
    max: number;
    qty: number;
    total: number;
    count: number;
  };

  const months: MonthAgg[] = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of rows) {
      const arr = map.get(r.monthKey) ?? [];
      arr.push(r);
      map.set(r.monthKey, arr);
    }
    const arr: MonthAgg[] = Array.from(map.entries()).map(([k, list]) => {
      const totalQty = list.reduce((s, r) => s + r.qty, 0);
      const totalCost = list.reduce((s, r) => s + r.qty * r.unitCost, 0);
      const avg = totalQty > 0 ? totalCost / totalQty : 0;
      const prices = list.map((r) => r.unitCost);
      const [y, m] = k.split("-").map(Number);
      const label = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      });
      return {
        monthKey: k,
        label,
        avg,
        min: Math.min(...prices),
        max: Math.max(...prices),
        qty: totalQty,
        total: totalCost,
        count: list.length,
      };
    });
    return arr.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [rows]);

  const maxAvg = Math.max(...months.map((m) => m.avg), 0.0001);
  const overallAvg = useMemo(() => {
    const totalQty = rows.reduce((s, r) => s + r.qty, 0);
    const totalCost = rows.reduce((s, r) => s + r.qty * r.unitCost, 0);
    return totalQty > 0 ? totalCost / totalQty : 0;
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-surface border border-border p-3">
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Produto
        </label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="mt-2 w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.unit})
            </option>
          ))}
        </select>
      </div>

      {months.length === 0 ? (
        <div className="rounded-xl bg-surface border border-border p-8 text-center">
          <div className="text-foreground font-semibold">Sem histórico ainda</div>
          <div className="text-sm text-muted-foreground mt-1">
            Registre uma compra deste produto para começar o histórico.
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Preço médio" value={formatBRL(overallAvg)} accent="gold" />
            <Stat label="Compras" value={String(rows.length)} />
            <Stat
              label="Variação"
              value={
                months.length >= 2
                  ? `${(((months[months.length - 1].avg - months[0].avg) / months[0].avg) * 100).toFixed(1)}%`
                  : "—"
              }
              accent={
                months.length >= 2 && months[months.length - 1].avg > months[0].avg
                  ? "warning"
                  : "success"
              }
            />
          </div>

          {/* Chart */}
          <div className="rounded-xl bg-surface border border-border p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-4 text-gold" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Evolução mensal do preço médio
              </span>
            </div>
            <div className="flex items-end gap-2 h-40">
              {months.map((m, idx) => {
                const h = Math.max(6, (m.avg / maxAvg) * 100);
                const prev = idx > 0 ? months[idx - 1].avg : null;
                const up = prev !== null && m.avg > prev;
                const down = prev !== null && m.avg < prev;
                return (
                  <div key={m.monthKey} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                    <div className="text-[10px] font-bold text-foreground tabular-nums whitespace-nowrap">
                      {formatBRL(m.avg)}
                    </div>
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-all",
                        up ? "bg-warning" : down ? "bg-success" : "bg-gold"
                      )}
                      style={{ height: `${h}%` }}
                    />
                    <div className="text-[10px] text-muted-foreground capitalize truncate w-full text-center">
                      {m.label.replace(".", "")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly table */}
          <div className="rounded-xl bg-surface border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Resumo mensal
            </div>
            <div className="divide-y divide-border">
              {[...months].reverse().map((m, i, arr) => {
                const nextOlder = arr[i + 1];
                const delta = nextOlder ? m.avg - nextOlder.avg : 0;
                return (
                <button
                  key={m.monthKey}
                  onClick={() => {
                    const ids = new Set(
                      rows.filter((r) => r.monthKey === m.monthKey).map((r) => r.purchaseId)
                    );
                    const idsArr = Array.from(ids);
                    if (idsArr.length === 1) setDetailPurchaseId(idsArr[0]);
                  }}
                  className={cn(
                    "w-full px-4 py-3 flex items-center justify-between gap-3 text-left",
                    rows.some((r) => r.monthKey === m.monthKey) ? "hover:bg-muted/30 cursor-pointer" : ""
                  )}
                >
                  <div>
                    <div className="font-bold capitalize text-foreground">{m.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.count} {m.count === 1 ? "compra" : "compras"} • {m.qty} un.
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gold font-bold tabular-nums">{formatBRL(m.avg)}</div>
                    {nextOlder && (
                      <div
                        className={cn(
                          "text-xs flex items-center justify-end gap-0.5 tabular-nums",
                          delta > 0 ? "text-warning" : delta < 0 ? "text-success" : "text-muted-foreground"
                        )}
                      >
                        {delta > 0 ? (
                          <ArrowUpRight className="size-3" />
                        ) : delta < 0 ? (
                          <ArrowDownRight className="size-3" />
                        ) : null}
                        {delta === 0 ? "estável" : formatBRL(Math.abs(delta))}
                      </div>
                    )}
                  </div>
                </button>
                );
              })}
            </div>
          </div>

          {/* Detail rows */}
          <div className="rounded-xl bg-surface border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Atualizações de preço ({rows.length})
            </div>
            <div className="divide-y divide-border">
              {rows.map((r, i) => (
                <PurchaseRow
                  key={`${r.purchaseId}-${i}`}
                  row={r}
                  onDelete={() => deletePurchase(r.purchaseId)}
                  onView={() => setDetailPurchaseId(r.purchaseId)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PurchaseRow({
  row,
  onDelete,
}: {
  row: { date: Date; qty: number; unitCost: number; supplier: string; purchaseId: string };
  onDelete: () => void;
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">
          {row.date.toLocaleDateString("pt-BR")}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {row.supplier} • {row.qty} un.
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="text-gold font-bold tabular-nums">{formatBRL(row.unitCost)}</div>
          <div className="text-[10px] text-muted-foreground">por unidade</div>
        </div>
        <button
          onClick={() => {
            if (confirm("Remover esta compra do histórico?")) onDelete();
          }}
          className="p-1.5 rounded-md bg-destructive/15 text-destructive hover:bg-destructive/25"
          aria-label="Remover"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "gold" | "success" | "warning";
}) {
  const cls =
    accent === "gold"
      ? "text-gold"
      : accent === "success"
        ? "text-success"
        : accent === "warning"
          ? "text-warning"
          : "text-foreground";
  return (
    <div className="rounded-xl bg-surface border border-border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
      <div className={cn("mt-1 font-bold tabular-nums text-base sm:text-lg", cls)}>{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </div>
  );
}


