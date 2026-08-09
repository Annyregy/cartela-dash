import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Check, Download, Minus, Plus, Save, Search, Send, ShoppingCart, X } from "lucide-react";
import {
  buildReceipt,
  formatBRL,
  formatDateLabel,
  toDateKey,
  usePos,
  whatsappLink,
  type CartItem,
  type Customer,
  type Order,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/pos-store";
import { cn } from "@/lib/utils";
import { highlight } from "@/lib/highlight";
import { openExternalUrl } from "@/lib/browser-actions";
import { NoteTemplates } from "@/components/pos/NoteTemplates";

const safeText = (value: unknown) => (value == null ? "" : typeof value === "string" ? value : String(value));
const searchText = (value: unknown) => {
  const text = safeText(value);
  const normalized = typeof text.normalize === "function" ? text.normalize("NFD") : text;
  return normalized.replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export function NewOrder() {
  const { customers, products, addOrder, updateCustomer } = usePos();
  const [query, setQuery] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [openCustomer, setOpenCustomer] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [payment, setPayment] = useState<PaymentMethod>("Pix");
  const [status, setStatus] = useState<PaymentStatus>("Pendente");
  const [cartOpen, setCartOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [surchargePercent, setSurchargePercent] = useState("");
  const [surchargeValue, setSurchargeValue] = useState("");
  const [note, setNote] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 120);
    return () => clearTimeout(t);
  }, [query]);

  const filteredCustomers = useMemo(() => {
    const q = searchText(debouncedQuery.trim());
    if (!q) return customers;
    return customers.filter((c) => {
      const haystack = searchText(`${safeText(c.code)} ${safeText(c.name)} ${safeText(c.neighborhood)} ${safeText(c.address)} ${safeText(c.phone)}`);
      return haystack.includes(q);
    });
  }, [customers, debouncedQuery]);

  useEffect(() => {
    setHighlightIdx(0);
  }, [query, openCustomer]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${highlightIdx}"]`);
    if (!el) return;
    try {
      el.scrollIntoView({ block: "nearest" });
    } catch {
      el.scrollIntoView(false);
    }
  }, [highlightIdx]);

  const cartItems: CartItem[] = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, q]) => q > 0)
        .flatMap(([id, q]) => {
          const p = products.find((x) => x.id === id);
          if (!p) return [];
          return { productId: id, name: p.name, unit: p.unit, price: p.price, quantity: q };
        }),
    [cart, products]
  );

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const parseAmount = (v: string) => Number(v.replace(",", ".")) || 0;
  const discountPercentNumber = Math.max(0, parseAmount(discountPercent));
  const discountValueNumber = Math.max(0, parseAmount(discountValue));
  const surchargePercentNumber = Math.max(0, parseAmount(surchargePercent));
  const surchargeValueNumber = Math.max(0, parseAmount(surchargeValue));
  const discountTotal = subtotal * (discountPercentNumber / 100) + discountValueNumber;
  const surchargeTotal = subtotal * (surchargePercentNumber / 100) + surchargeValueNumber;
  const total = Math.max(0, subtotal - discountTotal + surchargeTotal);
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const setQty = (id: string, delta: number) =>
    setCart((c) => {
      const next = Math.max(0, (c[id] ?? 0) + delta);
      return { ...c, [id]: next };
    });

  const reset = useCallback(() => {
    setCart({});
    setCustomer(null);
    setNote("");
    setStatus("Pendente");
    setPayment("Pix");
    setDiscountPercent("");
    setDiscountValue("");
    setSurchargePercent("");
    setSurchargeValue("");
    setCartOpen(false);
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const confirm = useCallback((sendWhatsapp: boolean) => {
    if (submitting) return;
    if (!customer || cartItems.length === 0) return;
    setSubmitting(true);
    try {
      const order = addOrder({
        customerId: customer.id,
        customerCode: customer.code,
        customerName: customer.name,
        phone: customer.phone,
        address: customer.address,
        neighborhood: customer.neighborhood,
        items: cartItems,
        subtotal,
        discountPercent: discountPercentNumber,
        discountValue: discountValueNumber,
        surchargePercent: surchargePercentNumber,
        surchargeValue: surchargeValueNumber,
        total,
        paymentMethod: payment,
        paymentStatus: status,
        deliveryStatus: "ativo",
        deliveryNote: note.trim(),
      });
      if (note.trim() !== (customer.note ?? "")) {
        updateCustomer(customer.id, { note: note.trim() });
      }
      if (sendWhatsapp) {
        openExternalUrl(whatsappLink(customer.phone, buildReceipt(order)));
      }
      reset();
    } finally {
      setTimeout(() => setSubmitting(false), 300);
    }
  }, [
    addOrder,
    updateCustomer,
    note,
    cartItems,
    customer,
    discountPercentNumber,
    discountValueNumber,
    payment,
    reset,
    status,
    submitting,
    subtotal,
    surchargePercentNumber,
    surchargeValueNumber,
    total,
  ]);


  // Enter (globally) confirms the order — except inside the customer picker
  // or when typing into a multi-line field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
      if (openCustomer) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "TEXTAREA") return;
      if (!customer || cartItems.length === 0) return;
      e.preventDefault();
      confirm(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartItems.length, confirm, customer, openCustomer]);

  // PWA install prompt
  const [installEvt, setInstallEvt] = useState<any>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true);
  const installApp = async () => {
    if (!installEvt) {
      alert(
        "Para instalar no celular:\n\n• Android (Chrome): toque no menu ⋮ e escolha 'Instalar app' ou 'Adicionar à tela inicial'.\n• iPhone (Safari): toque em Compartilhar ⬆️ e depois 'Adicionar à Tela de Início'."
      );
      return;
    }
    installEvt.prompt();
    await installEvt.userChoice;
    setInstallEvt(null);
  };

  return (
    <div className="pb-32 md:pb-8 md:grid md:grid-cols-[1fr_380px] md:gap-6">
      <div className="space-y-5">
        {!isStandalone && (
          <button
            onClick={installApp}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/10 text-gold py-2.5 text-sm font-semibold hover:bg-gold/20 transition"
          >
            <Download className="size-4" />
            Instalar app no celular
          </button>
        )}
        {/* Customer */}
        <div className="rounded-xl bg-surface border border-border p-4">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Cliente
          </label>
          {customer ? (
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-foreground font-semibold truncate">
                  <span className="text-gold tabular-nums">{customer.code ?? "-"}</span> · {safeText(customer.name)}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {safeText(customer.neighborhood)} • {safeText(customer.address)}
                </div>
              </div>
              <button
                onClick={() => setCustomer(null)}
                className="p-2 rounded-md hover:bg-muted text-muted-foreground shrink-0"
                aria-label="Trocar cliente"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setOpenCustomer(true);
              }}
              className="mt-2 w-full flex items-center gap-2 px-3 py-3 rounded-lg bg-input text-muted-foreground border border-border hover:border-gold/50 transition text-left"
            >
              <Search className="size-4" />
              <span className="truncate">Buscar cliente por código, nome ou bairro...</span>
            </button>
          )}
        </div>

        {/* Delivery note (saved per customer) */}
        {customer && (
          <div className="rounded-xl bg-surface border border-border p-4">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Observação para o entregador
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ex.: portão azul, deixar com o vizinho, ligar ao chegar..."
              className="mt-2 w-full rounded-lg bg-input border border-border p-2.5 text-sm text-foreground outline-none focus:border-gold resize-none"
            />
            <NoteTemplates value={note} onChange={setNote} className="mt-2" />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Fica salva neste cliente e vem preenchida no próximo pedido.
            </p>
          </div>
        )}


        {/* Customer picker overlay (works on mobile + desktop) */}
        {openCustomer && (
          <div
            className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center bg-black/60"
            onClick={() => setOpenCustomer(false)}
          >
            <div
              className="relative w-full md:max-w-lg md:rounded-2xl rounded-t-2xl bg-surface border border-border flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-foreground">Selecionar cliente</h3>
                  <button
                    onClick={() => setOpenCustomer(false)}
                    className="p-2 rounded-md hover:bg-muted text-muted-foreground"
                    aria-label="Fechar"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setHighlightIdx((i) =>
                          filteredCustomers.length === 0 ? 0 : (i + 1) % filteredCustomers.length
                        );
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setHighlightIdx((i) =>
                          filteredCustomers.length === 0
                            ? 0
                            : (i - 1 + filteredCustomers.length) % filteredCustomers.length
                        );
                      } else if (e.key === "Home") {
                        e.preventDefault();
                        setHighlightIdx(0);
                      } else if (e.key === "End") {
                        e.preventDefault();
                        setHighlightIdx(Math.max(0, filteredCustomers.length - 1));
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        const c = filteredCustomers[highlightIdx];
                        if (c) {
                          setCustomer(c);
                          setNote(c.note ?? "");
                          setOpenCustomer(false);
                          setQuery("");
                        }
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        setOpenCustomer(false);
                      }
                    }}
                    placeholder="Código, nome ou bairro..."
                    aria-activedescendant={
                      filteredCustomers[highlightIdx]
                        ? `customer-opt-${filteredCustomers[highlightIdx].id}`
                        : undefined
                    }
                    aria-controls="customer-picker-list"
                    role="combobox"
                    aria-expanded
                    aria-autocomplete="list"
                    className="w-full pl-9 pr-3 py-3 rounded-lg bg-input text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>
              <div
                ref={listRef}
                id="customer-picker-list"
                role="listbox"
                className="overflow-y-auto overscroll-contain flex-1"
              >
                {filteredCustomers.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Nenhum cliente encontrado
                  </div>
                )}
                {filteredCustomers.map((c, idx) => {
                  const active = idx === highlightIdx;
                  return (
                    <button
                      key={c.id}
                      id={`customer-opt-${c.id}`}
                      role="option"
                      aria-selected={active}
                      data-idx={idx}
                      onMouseEnter={() => setHighlightIdx(idx)}
                      onClick={() => {
                        setCustomer(c);
                          setNote(c.note ?? "");
                        setOpenCustomer(false);
                        setQuery("");
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 border-b border-border last:border-0",
                        active ? "bg-muted" : "hover:bg-muted active:bg-muted"
                      )}
                    >
                      <div className="text-foreground font-medium">
                        <span className="text-gold tabular-nums">{highlight(String(c.code ?? "-"), debouncedQuery)}</span> · {highlight(safeText(c.name), debouncedQuery)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {highlight(safeText(c.neighborhood), debouncedQuery)}
                        {safeText(c.phone) ? <> • {highlight(safeText(c.phone), debouncedQuery)}</> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Produtos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.map((p) => {
              const qty = cart[p.id] ?? 0;
              const lowStock = p.stock <= 10;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "rounded-xl bg-surface border p-4 flex flex-col gap-3 transition",
                    qty > 0 ? "border-gold/60 shadow-[0_0_0_1px_var(--gold)]/20" : "border-border"
                  )}
                >
                  <div>
                    <div className="text-foreground font-semibold leading-tight">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.unit}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gold font-bold text-lg">{formatBRL(p.price)}</div>
                      <div
                        className={cn(
                          "text-xs",
                          lowStock ? "text-warning" : "text-muted-foreground"
                        )}
                      >
                        {p.stock} disponíveis
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQty(p.id, -1)}
                        disabled={qty === 0}
                        className="size-10 rounded-lg bg-muted text-foreground flex items-center justify-center disabled:opacity-40 active:scale-95 transition"
                        aria-label="Diminuir"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-foreground text-lg tabular-nums">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(p.id, 1)}
                        disabled={qty >= p.stock}
                        className="size-10 rounded-lg bg-gold text-gold-foreground flex items-center justify-center disabled:opacity-40 active:scale-95 transition shadow"
                        aria-label="Aumentar"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Summary — desktop sidebar */}
      <aside className="hidden md:block">
        <div className="sticky top-4 rounded-xl bg-surface border border-border p-5">
          <SummaryContent
            cartItems={cartItems}
            subtotal={subtotal}
            total={total}
            discountPercent={discountPercent}
            setDiscountPercent={setDiscountPercent}
            discountValue={discountValue}
            setDiscountValue={setDiscountValue}
            surchargePercent={surchargePercent}
            setSurchargePercent={setSurchargePercent}
            surchargeValue={surchargeValue}
            setSurchargeValue={setSurchargeValue}
            payment={payment}
            setPayment={setPayment}
            status={status}
            setStatus={setStatus}
            customer={customer}
            onConfirm={confirm}
          />
        </div>
      </aside>

      {/* Mobile floating cart bar */}
      <div className="md:hidden fixed bottom-16 inset-x-0 px-3 z-30">
        <button
          onClick={() => setCartOpen(true)}
          disabled={itemCount === 0}
          className="w-full rounded-xl bg-gold text-gold-foreground font-bold py-3.5 flex items-center justify-between px-4 shadow-2xl disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            <ShoppingCart className="size-5" />
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </span>
          <span>{formatBRL(total)}</span>
        </button>
      </div>

      {/* Mobile bottom sheet */}
      {cartOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex items-end" onClick={() => setCartOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-full rounded-t-2xl bg-surface border-t border-border p-5 max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-12 h-1.5 rounded-full bg-muted mb-4" />
            <SummaryContent
              cartItems={cartItems}
              subtotal={subtotal}
              total={total}
              discountPercent={discountPercent}
              setDiscountPercent={setDiscountPercent}
              discountValue={discountValue}
              setDiscountValue={setDiscountValue}
              surchargePercent={surchargePercent}
              setSurchargePercent={setSurchargePercent}
              surchargeValue={surchargeValue}
              setSurchargeValue={setSurchargeValue}
              payment={payment}
              setPayment={setPayment}
              status={status}
              setStatus={setStatus}
              customer={customer}
              onConfirm={confirm}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryContent({
  cartItems,
  subtotal,
  total,
  discountPercent,
  setDiscountPercent,
  discountValue,
  setDiscountValue,
  surchargePercent,
  setSurchargePercent,
  surchargeValue,
  setSurchargeValue,
  payment,
  setPayment,
  status,
  setStatus,
  customer,
  onConfirm,
}: {
  cartItems: CartItem[];
  subtotal: number;
  total: number;
  discountPercent: string;
  setDiscountPercent: (v: string) => void;
  discountValue: string;
  setDiscountValue: (v: string) => void;
  surchargePercent: string;
  setSurchargePercent: (v: string) => void;
  surchargeValue: string;
  setSurchargeValue: (v: string) => void;
  payment: PaymentMethod;
  setPayment: (p: PaymentMethod) => void;
  status: PaymentStatus;
  setStatus: (s: PaymentStatus) => void;
  customer: Customer | null;
  onConfirm: (sendWhatsapp: boolean) => void;
}) {
  const canConfirm = customer && cartItems.length > 0;

  return (
    <div className="space-y-5">
      <h3 className="text-foreground font-bold text-lg">Resumo do Pedido</h3>

      <div className="space-y-2 max-h-56 overflow-auto pr-1">
        {cartItems.length === 0 && (
          <div className="text-sm text-muted-foreground py-4 text-center">
            Adicione produtos para começar
          </div>
        )}
        {cartItems.map((i) => (
          <div key={i.productId} className="flex justify-between text-sm">
            <span className="text-foreground">
              <span className="text-gold font-semibold">{i.quantity}x</span> {i.name}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {formatBRL(i.price * i.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums">{formatBRL(subtotal)}</span>
        </div>
        <AdjustmentsGrid
          discountPercent={discountPercent}
          setDiscountPercent={setDiscountPercent}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          surchargePercent={surchargePercent}
          setSurchargePercent={setSurchargePercent}
          surchargeValue={surchargeValue}
          setSurchargeValue={setSurchargeValue}
        />
        <div className="flex justify-between items-baseline border-t border-border pt-3">
          <span className="text-muted-foreground text-sm uppercase tracking-wider">Total</span>
          <span className="text-gold font-bold text-2xl tabular-nums">{formatBRL(total)}</span>
        </div>
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
                "py-2.5 rounded-lg text-sm font-medium border transition",
                payment === m
                  ? "bg-gold text-gold-foreground border-gold"
                  : "bg-muted text-foreground border-border hover:border-gold/50"
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
                "py-2.5 rounded-lg text-sm font-medium border transition flex items-center justify-center gap-1.5",
                status === s
                  ? s === "Pago"
                    ? "bg-success text-success-foreground border-success"
                    : "bg-warning text-warning-foreground border-warning"
                  : "bg-muted text-foreground border-border"
              )}
            >
              {status === s && <Check className="size-4" />}
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() => onConfirm(false)}
          disabled={!canConfirm}
          className="w-full bg-muted text-foreground border border-border font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition"
        >
          <Save className="size-4" />
          Só salvar no sistema
        </button>
        <button
          onClick={() => onConfirm(true)}
          disabled={!canConfirm}
          className="w-full bg-gold text-gold-foreground font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition shadow-lg"
        >
          <Send className="size-4" />
          Salvar e enviar WhatsApp
        </button>
      </div>
      {!customer && (
        <div className="text-xs text-muted-foreground text-center">Selecione um cliente</div>
      )}
    </div>
  );
}

function AdjustmentsGrid({
  discountPercent,
  setDiscountPercent,
  discountValue,
  setDiscountValue,
  surchargePercent,
  setSurchargePercent,
  surchargeValue,
  setSurchargeValue,
}: {
  discountPercent: string;
  setDiscountPercent: (v: string) => void;
  discountValue: string;
  setDiscountValue: (v: string) => void;
  surchargePercent: string;
  setSurchargePercent: (v: string) => void;
  surchargeValue: string;
  setSurchargeValue: (v: string) => void;
}) {
  const field = "w-full bg-input border border-border rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="text-xs text-muted-foreground">
        Desc. %
        <input type="number" min="0" step="0.01" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} className={field} />
      </label>
      <label className="text-xs text-muted-foreground">
        Desc. R$
        <input type="number" min="0" step="0.01" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className={field} />
      </label>
      <label className="text-xs text-muted-foreground">
        Acrésc. %
        <input type="number" min="0" step="0.01" value={surchargePercent} onChange={(e) => setSurchargePercent(e.target.value)} className={field} />
      </label>
      <label className="text-xs text-muted-foreground">
        Acrésc. R$
        <input type="number" min="0" step="0.01" value={surchargeValue} onChange={(e) => setSurchargeValue(e.target.value)} className={field} />
      </label>
    </div>
  );
}
