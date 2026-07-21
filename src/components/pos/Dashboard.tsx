import { useMemo, useState } from "react";
import { Calendar, CheckCircle2, DollarSign, MessageCircle, Minus, Pencil, Plus, Search, Trash2, TrendingUp, Wallet } from "lucide-react";
import { buildReceipt, formatBRL, usePos, whatsappLink, type CartItem, type Order, type PaymentMethod, type PaymentStatus } from "@/lib/pos-store";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Period = "dia" | "semana" | "mes" | "ano" | "tudo";

const PERIODS: { key: Period; label: string }[] = [
  { key: "dia", label: "Dia" },
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mês" },
  { key: "ano", label: "Ano" },
  { key: "tudo", label: "Tudo" },
];

function startOf(period: Period): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === "dia") return d.getTime();
  if (period === "semana") {
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d.getTime();
  }
  if (period === "mes") {
    d.setDate(1);
    return d.getTime();
  }
  if (period === "ano") {
    d.setMonth(0, 1);
    return d.getTime();
  }
  return 0;
}

export function Dashboard() {
  const { orders, customers, markPaid, markUnpaid, updateOrder, deleteOrder } = usePos();
  const [period, setPeriod] = useState<Period>("mes");
  const [customerId, setCustomerId] = useState<string>("todos");
  const [view, setView] = useState<"compras" | "devendo">("compras");
  const [query, setQuery] = useState("");

  const periodStart = startOf(period);

  const inPeriod = useMemo(
    () => orders.filter((o) => new Date(o.createdAt).getTime() >= periodStart),
    [orders, periodStart]
  );

  const filtered = useMemo(
    () => (customerId === "todos" ? inPeriod : inPeriod.filter((o) => o.customerId === customerId)),
    [inPeriod, customerId]
  );

  const totals = useMemo(() => {
    const total = filtered.reduce((s, o) => s + o.total, 0);
    const pago = filtered.filter((o) => o.paymentStatus === "Pago").reduce((s, o) => s + o.total, 0);
    const pendente = filtered.filter((o) => o.paymentStatus === "Pendente").reduce((s, o) => s + o.total, 0);
    return { total, pago, pendente, count: filtered.length };
  }, [filtered]);

  const receivables = useMemo(() => {
    const map = new Map<string, { customerId: string; name: string; phone: string; total: number; orders: Order[] }>();
    for (const o of orders) {
      if (o.paymentStatus !== "Pendente") continue;
      const entry = map.get(o.customerId) ?? {
        customerId: o.customerId,
        name: o.customerName,
        phone: o.phone,
        total: 0,
        orders: [],
      };
      entry.total += o.total;
      entry.orders.push(o);
      map.set(o.customerId, entry);
    }
    const arr = Array.from(map.values()).sort((a, b) => b.total - a.total);
    if (!query) return arr;
    const q = query.toLowerCase();
    return arr.filter((r) => r.name.toLowerCase().includes(q));
  }, [orders, query]);

  const totalReceivable = receivables.reduce((s, r) => s + r.total, 0);

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      <div className="grid grid-cols-2 gap-2 bg-surface border border-border rounded-xl p-1">
        <button
          onClick={() => setView("compras")}
          className={cn(
            "py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2",
            view === "compras" ? "bg-gold text-gold-foreground" : "text-foreground hover:bg-muted"
          )}
        >
          <TrendingUp className="size-4" />
          Compras
        </button>
        <button
          onClick={() => setView("devendo")}
          className={cn(
            "py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2",
            view === "devendo" ? "bg-gold text-gold-foreground" : "text-foreground hover:bg-muted"
          )}
        >
          <Wallet className="size-4" />
          A Receber
          {totalReceivable > 0 && (
            <span className="text-xs bg-warning text-warning-foreground rounded-full px-2 py-0.5">
              {formatBRL(totalReceivable)}
            </span>
          )}
        </button>
      </div>

      {view === "compras" ? (
        <>
          <div className="-mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition flex items-center gap-2 whitespace-nowrap",
                    period === p.key
                      ? "bg-gold text-gold-foreground border-gold"
                      : "bg-surface text-foreground border-border hover:border-gold/50"
                  )}
                >
                  <Calendar className="size-3.5" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-surface border border-border p-3">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Cliente
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-2 w-full px-3 py-2.5 rounded-lg bg-input text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="todos">Todos os clientes</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.neighborhood !== "-" ? `— ${c.neighborhood}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Faturamento" value={formatBRL(totals.total)} icon={<DollarSign className="size-4" />} accent="gold" />
            <StatCard label="Pedidos" value={String(totals.count)} icon={<TrendingUp className="size-4" />} />
            <StatCard label="Recebido" value={formatBRL(totals.pago)} icon={<CheckCircle2 className="size-4" />} accent="success" />
            <StatCard label="A Receber" value={formatBRL(totals.pendente)} icon={<Wallet className="size-4" />} accent="warning" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Compras ({filtered.length})
            </h3>
            {filtered.length === 0 && (
              <div className="rounded-xl bg-surface border border-border p-8 text-center">
                <div className="text-foreground font-semibold">Nenhuma compra</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Nenhum pedido no período selecionado.
                </div>
              </div>
            )}
            {filtered.map((o) => (
              <OrderRow
                key={o.id}
                order={o}
                onTogglePaid={() => (o.paymentStatus === "Pago" ? markUnpaid(o.id) : markPaid(o.id))}
                onSave={(patch) => updateOrder(o.id, patch)}
                onDelete={() => deleteOrder(o.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cliente devedor..."
              className="w-full pl-9 pr-3 py-3 rounded-lg bg-input text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <div className="rounded-xl bg-surface border border-gold/40 p-5 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Total a Receber
              </div>
              <div className="text-3xl font-bold text-gold tabular-nums mt-1">
                {formatBRL(totalReceivable)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Clientes
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">{receivables.length}</div>
            </div>
          </div>

          <div className="space-y-3">
            {receivables.length === 0 && (
              <div className="rounded-xl bg-surface border border-border p-8 text-center">
                <div className="text-foreground font-semibold">Tudo em dia! 🎉</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Nenhum cliente com pagamento pendente.
                </div>
              </div>
            )}
            {receivables.map((r) => (
              <DebtorCard
                key={r.customerId}
                name={r.name}
                phone={r.phone}
                total={r.total}
                orders={r.orders}
                onMarkAllPaid={() => r.orders.forEach((o) => markPaid(o.id))}
                onMarkOrderPaid={(id) => markPaid(id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: "gold" | "success" | "warning";
}) {
  const accentClass =
    accent === "gold"
      ? "text-gold"
      : accent === "success"
        ? "text-success"
        : accent === "warning"
          ? "text-warning"
          : "text-foreground";
  return (
    <div className="rounded-xl bg-surface border border-border p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
        {icon}
        {label}
      </div>
      <div className={cn("mt-2 text-xl font-bold tabular-nums", accentClass)}>{value}</div>
    </div>
  );
}

function OrderRow({
  order,
  onTogglePaid,
  onSave,
  onDelete,
}: {
  order: Order;
  onTogglePaid: () => void;
  onSave: (patch: Partial<Omit<Order, "id" | "createdAt" | "customerId">>) => void;
  onDelete: () => void;
}) {
  const isPaid = order.paymentStatus === "Pago";
  const date = new Date(order.createdAt);
  const summary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div className="rounded-xl bg-surface border border-border p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-foreground font-bold leading-tight">{order.customerName}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {date.toLocaleDateString("pt-BR")} • {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} • {order.paymentMethod}
          </div>
        </div>
        <button
          onClick={onTogglePaid}
          className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full shrink-0 transition",
            isPaid
              ? "bg-success text-success-foreground hover:opacity-80"
              : "bg-warning text-warning-foreground hover:opacity-80"
          )}
        >
          {order.paymentStatus}
        </button>
      </div>
      <div className="text-sm text-foreground/80 truncate">{summary}</div>
      <div className="flex items-center justify-between border-t border-border pt-2 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-muted text-foreground hover:bg-muted/70 transition"
          >
            <Pencil className="size-3.5" />
            Editar
          </button>
          <button
            onClick={() => setConfirmDel(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-destructive/15 text-destructive hover:bg-destructive/25 transition"
          >
            <Trash2 className="size-3.5" />
            Excluir
          </button>
        </div>
        <span className="text-gold font-bold text-lg tabular-nums">{formatBRL(order.total)}</span>
      </div>

      {editing && (
        <EditOrderModal
          order={order}
          onClose={() => setEditing(false)}
          onSave={(patch) => {
            onSave(patch);
            setEditing(false);
          }}
        />
      )}

      {confirmDel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setConfirmDel(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface border border-border p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="font-bold text-foreground">Excluir pedido?</div>
              <div className="text-sm text-muted-foreground mt-1">
                O estoque dos itens será restaurado. Esta ação não pode ser desfeita.
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmDel(false)}
                className="py-2.5 rounded-lg bg-muted text-foreground font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setConfirmDel(false);
                  onDelete();
                }}
                className="py-2.5 rounded-lg bg-destructive text-destructive-foreground font-semibold"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditOrderModal({
  order,
  onClose,
  onSave,
}: {
  order: Order;
  onClose: () => void;
  onSave: (patch: Partial<Omit<Order, "id" | "createdAt" | "customerId">>) => void;
}) {
  const [items, setItems] = useState<CartItem[]>(order.items.map((i) => ({ ...i })));
  const [payment, setPayment] = useState<PaymentMethod>(order.paymentMethod);
  const [status, setStatus] = useState<PaymentStatus>(order.paymentStatus);
  const [discountPercent, setDiscountPercent] = useState(String(order.discountPercent ?? ""));
  const [discountValue, setDiscountValue] = useState(String(order.discountValue ?? ""));
  const [surchargePercent, setSurchargePercent] = useState(String(order.surchargePercent ?? ""));
  const [surchargeValue, setSurchargeValue] = useState(String(order.surchargeValue ?? ""));

  const parseAmount = (v: string) => Number(v.replace(",", ".")) || 0;
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const dP = Math.max(0, parseAmount(discountPercent));
  const dV = Math.max(0, parseAmount(discountValue));
  const sP = Math.max(0, parseAmount(surchargePercent));
  const sV = Math.max(0, parseAmount(surchargeValue));
  const total = Math.max(0, subtotal - (subtotal * dP) / 100 - dV + (subtotal * sP) / 100 + sV);

  const setQty = (id: string, delta: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.productId === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
      )
    );

  const save = () => {
    const cleaned = items.filter((i) => i.quantity > 0);
    onSave({
      items: cleaned,
      subtotal,
      discountPercent: dP,
      discountValue: dV,
      surchargePercent: sP,
      surchargeValue: sV,
      total,
      paymentMethod: payment,
      paymentStatus: status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-lg md:rounded-2xl rounded-t-2xl bg-surface border border-border flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="font-bold text-foreground">Editar pedido</div>
            <div className="text-xs text-muted-foreground">{order.customerName}</div>
          </div>
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground px-2 py-1"
          >
            Fechar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Itens
            </div>
            {items.map((i) => (
              <div
                key={i.productId}
                className="flex items-center justify-between gap-2 rounded-lg border border-border p-2"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{i.name}</div>
                  <div className="text-xs text-muted-foreground">{formatBRL(i.price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty(i.productId, -1)}
                    className="size-8 rounded-md bg-muted flex items-center justify-center"
                    aria-label="Diminuir"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center tabular-nums">{i.quantity}</span>
                  <button
                    onClick={() => setQty(i.productId, 1)}
                    className="size-8 rounded-md bg-gold text-gold-foreground flex items-center justify-center"
                    aria-label="Aumentar"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-muted-foreground">
              Desc. %
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="mt-1 w-full bg-input border border-border rounded-md px-2 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Desc. R$
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="mt-1 w-full bg-input border border-border rounded-md px-2 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Acrésc. %
              <input
                type="number"
                min="0"
                step="0.01"
                value={surchargePercent}
                onChange={(e) => setSurchargePercent(e.target.value)}
                className="mt-1 w-full bg-input border border-border rounded-md px-2 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Acrésc. R$
              <input
                type="number"
                min="0"
                step="0.01"
                value={surchargeValue}
                onChange={(e) => setSurchargeValue(e.target.value)}
                className="mt-1 w-full bg-input border border-border rounded-md px-2 py-2 text-sm"
              />
            </label>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Pagamento
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["Pix", "Dinheiro", "Cartão"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setPayment(m)}
                  className={cn(
                    "py-2 rounded-lg text-sm font-medium border transition",
                    payment === m
                      ? "bg-gold text-gold-foreground border-gold"
                      : "bg-muted text-foreground border-border"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Status
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["Pendente", "Pago"] as PaymentStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    "py-2 rounded-lg text-sm font-medium border transition",
                    status === s
                      ? s === "Pago"
                        ? "bg-success text-success-foreground border-success"
                        : "bg-warning text-warning-foreground border-warning"
                      : "bg-muted text-foreground border-border"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-baseline border-t border-border pt-3">
            <span className="text-muted-foreground text-sm uppercase tracking-wider">Total</span>
            <span className="text-gold font-bold text-2xl tabular-nums">{formatBRL(total)}</span>
          </div>
        </div>

        <div className="p-4 border-t border-border grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="py-2.5 rounded-lg bg-muted text-foreground font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            className="py-2.5 rounded-lg bg-gold text-gold-foreground font-bold"
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}


function DebtorCard({
  name,
  phone,
  total,
  orders,
  onMarkAllPaid,
  onMarkOrderPaid,
}: {
  name: string;
  phone: string;
  total: number;
  orders: Order[];
  onMarkAllPaid: () => void;
  onMarkOrderPaid: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const orderBlocks = orders
    .map((o) => {
      const date = new Date(o.createdAt).toLocaleDateString("pt-BR");
      const items = o.items
        .map(
          (i) =>
            `   - ${i.quantity}x ${i.name} — ${formatBRL(i.price)} un = ${formatBRL(
              i.price * i.quantity
            )}`
        )
        .join("\n");
      return `📅 *${date}*\n${items}\n   Subtotal do pedido: *${formatBRL(o.total)}*`;
    })
    .join("\n\n");
  const waMsg =
    `Olá ${name}, tudo bem? 🐣\n\n` +
    `Segue o resumo dos pedidos em aberto:\n\n` +
    `${orderBlocks}\n\n` +
    `━━━━━━━━━━━━━━━\n` +
    `*Total pendente: ${formatBRL(total)}*\n\n` +
    `Quando puder acertar, ficaremos muito gratos. Obrigado! 🙏`;

  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-muted/30 transition"
      >
        <div className="min-w-0">
          <div className="text-foreground font-bold leading-tight">{name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} pendente{orders.length === 1 ? "" : "s"}
          </div>
        </div>
        <div className="text-warning font-bold text-lg tabular-nums shrink-0">{formatBRL(total)}</div>
      </button>

      {open && (
        <div className="border-t border-border p-4 space-y-3 bg-background/40">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <div className="text-foreground truncate">
                  {new Date(o.createdAt).toLocaleDateString("pt-BR")} — {o.paymentMethod}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-gold font-semibold tabular-nums">{formatBRL(o.total)}</span>
                <button
                  onClick={() => onMarkOrderPaid(o.id)}
                  className="p-1.5 rounded-md bg-success text-success-foreground hover:opacity-80"
                  aria-label="Marcar como pago"
                  title="Marcar como pago"
                >
                  <CheckCircle2 className="size-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            {phone && (
              <button
                type="button"
                onClick={() => setConfirmSend(true)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-muted text-foreground font-medium border border-border hover:border-gold/50 transition text-sm"
              >
                <MessageCircle className="size-4" />
                Cobrar
              </button>
            )}
            <button
              onClick={onMarkAllPaid}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-lg bg-success text-success-foreground font-semibold hover:opacity-90 transition text-sm",
                !phone && "col-span-2"
              )}
            >
              <CheckCircle2 className="size-4" />
              Quitar tudo
            </button>
          </div>
        </div>
      )}

      <AlertDialog open={confirmSend} onOpenChange={setConfirmSend}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar cobrança pelo WhatsApp?</AlertDialogTitle>
            <AlertDialogDescription>
              Você vai enviar para <strong>{name}</strong> o resumo de{" "}
              {orders.length} {orders.length === 1 ? "pedido pendente" : "pedidos pendentes"} no total de{" "}
              <strong>{formatBRL(total)}</strong>. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const a = document.createElement("a");
                a.href = whatsappLink(phone, waMsg);
                a.target = "_blank";
                a.rel = "noreferrer";
                a.click();
                setConfirmSend(false);
              }}
            >
              Enviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

void buildReceipt;
