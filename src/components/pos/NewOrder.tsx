import { useMemo, useState } from "react";
import { Check, Minus, Plus, Search, Send, ShoppingCart, X } from "lucide-react";
import {
  buildReceipt,
  formatBRL,
  usePos,
  whatsappLink,
  type CartItem,
  type Customer,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export function NewOrder() {
  const { customers, products, addOrder } = usePos();
  const [query, setQuery] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [openCustomer, setOpenCustomer] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [payment, setPayment] = useState<PaymentMethod>("Pix");
  const [status, setStatus] = useState<PaymentStatus>("Pendente");
  const [cartOpen, setCartOpen] = useState(false);

  const filteredCustomers = useMemo(
    () =>
      customers.filter((c) =>
        `${c.name} ${c.neighborhood}`.toLowerCase().includes(query.toLowerCase())
      ),
    [customers, query]
  );

  const cartItems: CartItem[] = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, q]) => q > 0)
        .map(([id, q]) => {
          const p = products.find((x) => x.id === id)!;
          return { productId: id, name: p.name, unit: p.unit, price: p.price, quantity: q };
        }),
    [cart, products]
  );

  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const setQty = (id: string, delta: number) =>
    setCart((c) => {
      const next = Math.max(0, (c[id] ?? 0) + delta);
      return { ...c, [id]: next };
    });

  const reset = () => {
    setCart({});
    setCustomer(null);
    setStatus("Pendente");
    setPayment("Pix");
    setCartOpen(false);
  };

  const confirm = () => {
    if (!customer || cartItems.length === 0) return;
    const order = addOrder({
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      address: customer.address,
      neighborhood: customer.neighborhood,
      items: cartItems,
      total,
      paymentMethod: payment,
      paymentStatus: status,
      deliveryStatus: "ativo",
    });
    const url = whatsappLink(customer.phone, buildReceipt(order));
    window.open(url, "_blank");
    reset();
  };

  return (
    <div className="pb-32 md:pb-8 md:grid md:grid-cols-[1fr_380px] md:gap-6">
      <div className="space-y-5">
        {/* Customer */}
        <div className="rounded-xl bg-surface border border-border p-4">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Cliente
          </label>
          {customer ? (
            <div className="mt-2 flex items-center justify-between">
              <div>
                <div className="text-foreground font-semibold">{customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {customer.neighborhood} • {customer.address}
                </div>
              </div>
              <button
                onClick={() => setCustomer(null)}
                className="p-2 rounded-md hover:bg-muted text-muted-foreground"
                aria-label="Trocar cliente"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="mt-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpenCustomer(true);
                }}
                onFocus={() => setOpenCustomer(true)}
                placeholder="Buscar cliente por nome ou bairro..."
                className="w-full pl-9 pr-3 py-3 rounded-lg bg-input text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-gold"
              />
              {openCustomer && (
                <div className="absolute z-20 mt-1 w-full rounded-lg bg-surface-elevated border border-border max-h-64 overflow-auto shadow-xl">
                  {filteredCustomers.length === 0 && (
                    <div className="p-3 text-sm text-muted-foreground">Nenhum cliente</div>
                  )}
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCustomer(c);
                        setOpenCustomer(false);
                        setQuery("");
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-muted border-b border-border last:border-0"
                    >
                      <div className="text-foreground font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.neighborhood}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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
            total={total}
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
              total={total}
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
  total,
  payment,
  setPayment,
  status,
  setStatus,
  customer,
  onConfirm,
}: {
  cartItems: CartItem[];
  total: number;
  payment: PaymentMethod;
  setPayment: (p: PaymentMethod) => void;
  status: PaymentStatus;
  setStatus: (s: PaymentStatus) => void;
  customer: Customer | null;
  onConfirm: () => void;
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

      <div className="border-t border-border pt-3 flex justify-between items-baseline">
        <span className="text-muted-foreground text-sm uppercase tracking-wider">Total</span>
        <span className="text-gold font-bold text-2xl tabular-nums">{formatBRL(total)}</span>
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

      <button
        onClick={onConfirm}
        disabled={!canConfirm}
        className="w-full bg-gold text-gold-foreground font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition shadow-lg"
      >
        <Send className="size-4" />
        Confirmar e Enviar Pedido
      </button>
      {!customer && (
        <div className="text-xs text-muted-foreground text-center">Selecione um cliente</div>
      )}
    </div>
  );
}
