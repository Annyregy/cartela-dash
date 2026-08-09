import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { migrateLocalDataToCloud } from "./local-migration";
import {
  toDateKey,
  type CartItem,
  type Customer,
  type Order,
  type Product,
  type PaymentMethod,
  type PaymentStatus,
  type Purchase,
  type Supplier,
} from "./pos-data";

type State = {
  loading: boolean;
  customers: Customer[];
  products: Product[];
  orders: Order[];
  suppliers: Supplier[];
  purchases: Purchase[];
  refresh: () => Promise<unknown>;
  addOrder: (o: Omit<Order, "id" | "createdAt">) => Order;
  appendToOrder: (id: string, items: CartItem[]) => void;
  updateOrder: (id: string, patch: Partial<Omit<Order, "id" | "createdAt" | "customerId">>) => void;
  deleteOrder: (id: string) => void;
  completeDelivery: (id: string) => void;
  setScheduledFor: (id: string, date: string) => void;
  setDeliveryNote: (id: string, note: string, saveToCustomer?: boolean) => void;
  markPaid: (id: string) => void;
  markUnpaid: (id: string) => void;
  addPartialPayment: (id: string, amount: number) => void;
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (c: Omit<Customer, "id" | "code"> & { code?: number }) => Customer;
  updateCustomer: (id: string, c: Partial<Omit<Customer, "id">>) => void;
  deleteCustomer: (id: string) => void;
  addSupplier: (s: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, s: Partial<Omit<Supplier, "id">>) => void;
  deleteSupplier: (id: string) => void;
  addPurchase: (p: Omit<Purchase, "id" | "createdAt"> & { createdAt?: string }) => Purchase;
  deletePurchase: (id: string) => void;
};

const Ctx = createContext<State | null>(null);

const num = (v: unknown) => (v == null ? 0 : Number(v) || 0);
const optNum = (v: unknown) => (v == null ? undefined : Number(v) || 0);
const str = (v: unknown) => (v == null ? "" : typeof v === "string" ? v : String(v));

/* ---------- row <-> app mappers ---------- */

type Row = Record<string, unknown>;

const toCustomer = (r: Row): Customer => ({
  id: str(r['id']),
  code: r['code'] == null ? undefined : Number(r['code']),
  name: str(r['name']),
  phone: str(r['phone']),
  address: str(r['address']),
  neighborhood: str(r['neighborhood']),
  note: str(r['note']),
});

const customerRow = (c: Partial<Customer> & { id?: string }) => ({
  ...(c.id !== undefined ? { id: c.id } : {}),
  ...(c.code !== undefined ? { code: c.code } : {}),
  ...(c.name !== undefined ? { name: c.name } : {}),
  ...(c.phone !== undefined ? { phone: c.phone } : {}),
  ...(c.address !== undefined ? { address: c.address } : {}),
  ...(c.neighborhood !== undefined ? { neighborhood: c.neighborhood } : {}),
  ...(c.note !== undefined ? { note: c.note } : {}),
});

const toProduct = (r: Row): Product => ({
  id: str(r['id']),
  name: str(r['name']),
  unit: str(r['unit']),
  price: num(r['price']),
  stock: num(r['stock']),
});

const productRow = (p: Partial<Product> & { id?: string }) => ({
  ...(p.id !== undefined ? { id: p.id } : {}),
  ...(p.name !== undefined ? { name: p.name } : {}),
  ...(p.unit !== undefined ? { unit: p.unit } : {}),
  ...(p.price !== undefined ? { price: p.price } : {}),
  ...(p.stock !== undefined ? { stock: p.stock } : {}),
});

const toSupplier = (r: Row): Supplier => ({
  id: str(r['id']),
  name: str(r['name']),
  phone: str(r['phone']),
  contact: str(r['contact']),
  notes: str(r['notes']),
});

const supplierRow = (s: Partial<Supplier> & { id?: string }) => ({
  ...(s.id !== undefined ? { id: s.id } : {}),
  ...(s.name !== undefined ? { name: s.name } : {}),
  ...(s.phone !== undefined ? { phone: s.phone } : {}),
  ...(s.contact !== undefined ? { contact: s.contact } : {}),
  ...(s.notes !== undefined ? { notes: s.notes } : {}),
});

const toOrder = (r: Row): Order => ({
  id: str(r['id']),
  customerId: str(r['customer_id']),
  customerCode: r['customer_code'] == null ? undefined : Number(r['customer_code']),
  customerName: str(r['customer_name']),
  phone: str(r['phone']),
  address: str(r['address']),
  neighborhood: str(r['neighborhood']),
  items: (Array.isArray(r['items']) ? r['items'] : []) as CartItem[],
  subtotal: optNum(r['subtotal']),
  discountPercent: optNum(r['discount_percent']),
  discountValue: optNum(r['discount_value']),
  surchargePercent: optNum(r['surcharge_percent']),
  surchargeValue: optNum(r['surcharge_value']),
  total: num(r['total']),
  paymentMethod: (str(r['payment_method']) || "Dinheiro") as PaymentMethod,
  paymentStatus: (str(r['payment_status']) || "Pendente") as PaymentStatus,
  paidAmount: num(r['paid_amount']),
  deliveryStatus: (str(r['delivery_status']) || "ativo") as Order["deliveryStatus"],
  deliveryNote: str(r['delivery_note']),
  scheduledFor: str(r['scheduled_for']) || toDateKey(str(r['created_at'])),
  createdAt: str(r['created_at']),
});

const orderRow = (o: Partial<Order> & { id?: string }) => ({
  ...(o.id !== undefined ? { id: o.id } : {}),
  ...(o.customerId !== undefined ? { customer_id: o.customerId } : {}),
  ...(o.customerCode !== undefined ? { customer_code: o.customerCode } : {}),
  ...(o.customerName !== undefined ? { customer_name: o.customerName } : {}),
  ...(o.phone !== undefined ? { phone: o.phone } : {}),
  ...(o.address !== undefined ? { address: o.address } : {}),
  ...(o.neighborhood !== undefined ? { neighborhood: o.neighborhood } : {}),
  ...(o.items !== undefined ? { items: o.items } : {}),
  ...(o.subtotal !== undefined ? { subtotal: o.subtotal } : {}),
  ...(o.discountPercent !== undefined ? { discount_percent: o.discountPercent } : {}),
  ...(o.discountValue !== undefined ? { discount_value: o.discountValue } : {}),
  ...(o.surchargePercent !== undefined ? { surcharge_percent: o.surchargePercent } : {}),
  ...(o.surchargeValue !== undefined ? { surcharge_value: o.surchargeValue } : {}),
  ...(o.total !== undefined ? { total: o.total } : {}),
  ...(o.paymentMethod !== undefined ? { payment_method: o.paymentMethod } : {}),
  ...(o.paymentStatus !== undefined ? { payment_status: o.paymentStatus } : {}),
  ...(o.paidAmount !== undefined ? { paid_amount: o.paidAmount } : {}),
  ...(o.deliveryStatus !== undefined ? { delivery_status: o.deliveryStatus } : {}),
  ...(o.deliveryNote !== undefined ? { delivery_note: o.deliveryNote } : {}),
  ...(o.scheduledFor !== undefined ? { scheduled_for: o.scheduledFor || null } : {}),
  ...(o.createdAt !== undefined ? { created_at: o.createdAt } : {}),
});

const toPurchase = (r: Row): Purchase => ({
  id: str(r['id']),
  supplierId: str(r['supplier_id']),
  supplierName: str(r['supplier_name']),
  items: (Array.isArray(r['items']) ? r['items'] : []) as Purchase["items"],
  total: num(r['total']),
  notes: str(r['notes']),
  createdAt: str(r['created_at']),
});

const purchaseRow = (p: Purchase) => ({
  id: p.id,
  supplier_id: p.supplierId,
  supplier_name: p.supplierName,
  items: p.items,
  total: p.total,
  notes: p.notes,
  created_at: p.createdAt,
});

/* ---------- write helpers (fire and forget, logged on failure) ---------- */

type TableName = "customers" | "products" | "suppliers" | "orders" | "purchases";

const save = (table: TableName, row: Record<string, unknown>) => {
  void supabase
    .from(table)
    .upsert(row as never)
    .then(({ error }) => {
      if (error) console.error(`[cloud] falha ao salvar em ${table}`, error);
    });
};

const patch = (table: TableName, id: string, row: Record<string, unknown>) => {
  if (Object.keys(row).length === 0) return;
  void supabase
    .from(table)
    .update(row as never)
    .eq("id", id)
    .then(({ error }) => {
      if (error) console.error(`[cloud] falha ao atualizar ${table}`, error);
    });
};

const remove = (table: TableName, id: string) => {
  void supabase
    .from(table)
    .delete()
    .eq("id", id)
    .then(({ error }) => {
      if (error) console.error(`[cloud] falha ao excluir de ${table}`, error);
    });
};

const nextCustomerCode = (list: Customer[]) =>
  Math.max(0, ...list.map((c) => Number(c.code) || 0)) + 1;

export function PosProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [c, p, s, o, b] = await Promise.all([
      supabase.from("customers").select("*").order("code", { ascending: true }),
      supabase.from("products").select("*").order("created_at", { ascending: true }),
      supabase.from("suppliers").select("*").order("created_at", { ascending: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("purchases").select("*").order("created_at", { ascending: false }),
    ]);
    if (c.data) setCustomers((c.data as Row[]).map(toCustomer));
    if (p.data) setProducts((p.data as Row[]).map(toProduct));
    if (s.data) setSuppliers((s.data as Row[]).map(toSupplier));
    if (o.data) setOrders((o.data as Row[]).map(toOrder));
    if (b.data) setPurchases((b.data as Row[]).map(toPurchase));
    setLoading(false);
    return {
      customerIds: new Set((c.data as Row[] | null)?.map((r) => str(r['id'])) ?? []),
      productIds: new Set((p.data as Row[] | null)?.map((r) => str(r['id'])) ?? []),
      supplierIds: new Set((s.data as Row[] | null)?.map((r) => str(r['id'])) ?? []),
      orderIds: new Set((o.data as Row[] | null)?.map((r) => str(r['id'])) ?? []),
      purchaseIds: new Set((b.data as Row[] | null)?.map((r) => str(r['id'])) ?? []),
    };
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const cloudIds = await refresh();
      if (cancelled) return;
      try {
        const { migrated, counts } = await migrateLocalDataToCloud(cloudIds);
        if (cancelled || !migrated) return;
        await refresh();
        const parts = [
          counts.orders ? `${counts.orders} pedido(s)` : "",
          counts.customers ? `${counts.customers} cliente(s)` : "",
          counts.products ? `${counts.products} produto(s)` : "",
          counts.suppliers ? `${counts.suppliers} fornecedor(es)` : "",
          counts.purchases ? `${counts.purchases} compra(s)` : "",
        ].filter(Boolean);
        toast.success("Dados deste aparelho enviados para a nuvem", {
          description: parts.join(", "),
        });
      } catch (e) {
        console.error("[migração] falha", e);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- orders ---------- */

  const applyStock = (deltas: Map<string, number>) => {
    if (deltas.size === 0) return;
    setProducts((prev) =>
      prev.map((p) => {
        const d = deltas.get(p.id);
        if (!d) return p;
        const stock = Math.max(0, p.stock + d);
        patch("products", p.id, { stock });
        return { ...p, stock };
      })
    );
  };

  const addOrder: State["addOrder"] = (o) => {
    const order: Order = {
      ...o,
      scheduledFor: o.scheduledFor || toDateKey(),
      id: `o_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const deltas = new Map<string, number>();
    o.items.forEach((i) => deltas.set(i.productId, -(i.quantity ?? 0)));
    applyStock(deltas);
    setOrders((prev) => [order, ...prev]);
    save("orders", orderRow(order));
    return order;
  };

  /** Acrescenta itens a um pedido existente, recalculando totais e estoque. */
  const appendToOrder: State["appendToOrder"] = (id, items) => {
    if (!items.length) return;
    const deltas = new Map<string, number>();
    items.forEach((i) => deltas.set(i.productId, (deltas.get(i.productId) ?? 0) - i.quantity));
    applyStock(deltas);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const merged = [...o.items];
        items.forEach((i) => {
          const found = merged.find((x) => x.productId === i.productId);
          if (found) found.quantity += i.quantity;
          else merged.push({ ...i });
        });
        const subtotal = merged.reduce((s, i) => s + i.price * i.quantity, 0);
        const discount = subtotal * ((o.discountPercent ?? 0) / 100) + (o.discountValue ?? 0);
        const surcharge = subtotal * ((o.surchargePercent ?? 0) / 100) + (o.surchargeValue ?? 0);
        const total = Math.max(0, subtotal - discount + surcharge);
        const paid = Math.min(o.paidAmount ?? 0, total);
        const paymentStatus: PaymentStatus = paid >= total - 0.005 && paid > 0 ? "Pago" : "Pendente";
        const next: Order = { ...o, items: merged, subtotal, total, paidAmount: paid, paymentStatus };
        patch("orders", id, {
          items: merged,
          subtotal,
          total,
          paid_amount: paid,
          payment_status: paymentStatus,
        });
        return next;
      })
    );
  };

  const updateOrder: State["updateOrder"] = (id, p) => {
    setOrders((prev) => {
      const current = prev.find((o) => o.id === id);
      if (!current) return prev;
      const nextItems = p.items ?? current.items;
      if (p.items) {
        const deltas = new Map<string, number>();
        current.items.forEach((i) => deltas.set(i.productId, (deltas.get(i.productId) ?? 0) + i.quantity));
        nextItems.forEach((i) => deltas.set(i.productId, (deltas.get(i.productId) ?? 0) - i.quantity));
        applyStock(deltas);
      }
      patch("orders", id, orderRow({ ...p, items: nextItems }));
      return prev.map((o) => (o.id === id ? { ...o, ...p, items: nextItems } : o));
    });
  };

  const deleteOrder: State["deleteOrder"] = (id) => {
    setOrders((prev) => {
      const target = prev.find((o) => o.id === id);
      if (target) {
        const deltas = new Map<string, number>();
        target.items.forEach((i) => deltas.set(i.productId, (deltas.get(i.productId) ?? 0) + i.quantity));
        applyStock(deltas);
      }
      remove("orders", id);
      return prev.filter((o) => o.id !== id);
    });
  };

  const completeDelivery: State["completeDelivery"] = (id) => {
    patch("orders", id, { delivery_status: "concluido" });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, deliveryStatus: "concluido" } : o)));
  };

  const setScheduledFor: State["setScheduledFor"] = (id, date) => {
    const value = String(date ?? "");
    patch("orders", id, { scheduled_for: value || null });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, scheduledFor: value } : o)));
  };

  const setDeliveryNote: State["setDeliveryNote"] = (id, note, saveToCustomer = true) => {
    const value = String(note ?? "");
    patch("orders", id, { delivery_note: value });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, deliveryNote: value } : o)));
    if (saveToCustomer) {
      const order = orders.find((o) => o.id === id);
      const customerId = order?.customerId;
      if (customerId) {
        patch("customers", customerId, { note: value });
        setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, note: value } : c)));
      }
    }
  };


  const markPaid: State["markPaid"] = (id) =>
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        patch("orders", id, { payment_status: "Pago", paid_amount: o.total });
        return { ...o, paymentStatus: "Pago", paidAmount: o.total };
      })
    );

  const markUnpaid: State["markUnpaid"] = (id) => {
    patch("orders", id, { payment_status: "Pendente", paid_amount: 0 });
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, paymentStatus: "Pendente", paidAmount: 0 } : o))
    );
  };

  const addPartialPayment: State["addPartialPayment"] = (id, amount) =>
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const paid = Math.min(o.total, Math.max(0, (o.paidAmount ?? 0) + (Number(amount) || 0)));
        const status: PaymentStatus = paid >= o.total - 0.005 ? "Pago" : "Pendente";
        patch("orders", id, { paid_amount: paid, payment_status: status });
        return { ...o, paidAmount: paid, paymentStatus: status };
      })
    );

  /* ---------- products ---------- */

  const addProduct: State["addProduct"] = (p) => {
    const product: Product = { ...p, id: `p_${Date.now()}` };
    setProducts((prev) => [...prev, product]);
    save("products", productRow(product));
  };

  const updateProduct: State["updateProduct"] = (id, p) => {
    patch("products", id, productRow(p));
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  };

  const deleteProduct: State["deleteProduct"] = (id) => {
    remove("products", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  /* ---------- suppliers ---------- */

  const addSupplier: State["addSupplier"] = (s) => {
    const supplier: Supplier = { ...s, id: `s_${Date.now()}` };
    setSuppliers((prev) => [...prev, supplier]);
    save("suppliers", supplierRow(supplier));
  };

  const updateSupplier: State["updateSupplier"] = (id, s) => {
    patch("suppliers", id, supplierRow(s));
    setSuppliers((prev) => prev.map((x) => (x.id === id ? { ...x, ...s } : x)));
  };

  const deleteSupplier: State["deleteSupplier"] = (id) => {
    remove("suppliers", id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  /* ---------- purchases ---------- */

  const addPurchase: State["addPurchase"] = (p) => {
    const purchase: Purchase = {
      ...p,
      id: `buy_${Date.now()}`,
      createdAt: p.createdAt ?? new Date().toISOString(),
    };
    const deltas = new Map<string, number>();
    purchase.items.forEach((i) => deltas.set(i.productId, (deltas.get(i.productId) ?? 0) + i.quantity));
    applyStock(deltas);
    setPurchases((prev) => [purchase, ...prev]);
    save("purchases", purchaseRow(purchase));
    return purchase;
  };

  const deletePurchase: State["deletePurchase"] = (id) => {
    remove("purchases", id);
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  /* ---------- customers ---------- */

  const addCustomer: State["addCustomer"] = (c) => {
    const code = Number(c.code);
    const customer: Customer = {
      ...c,
      code: Number.isFinite(code) && code > 0 ? code : nextCustomerCode(customers),
      id: `c_${Date.now()}`,
    };
    setCustomers((prev) => [customer, ...prev]);
    save("customers", customerRow(customer));
    return customer;
  };

  const updateCustomer: State["updateCustomer"] = (id, c) => {
    patch("customers", id, customerRow(c));
    setCustomers((prev) => prev.map((x) => (x.id === id ? { ...x, ...c } : x)));

    // propaga os dados do cliente para os pedidos já existentes
    const orderPatch: Record<string, unknown> = {};
    if (c.name !== undefined) orderPatch['customer_name'] = str(c.name);
    if (c.phone !== undefined) orderPatch['phone'] = str(c.phone);
    if (c.address !== undefined) orderPatch['address'] = str(c.address);
    if (c.neighborhood !== undefined) orderPatch['neighborhood'] = str(c.neighborhood);
    if (c.code !== undefined) orderPatch['customer_code'] = c.code ?? null;
    if (Object.keys(orderPatch).length === 0) return;

    void supabase
      .from("orders")
      .update(orderPatch as never)
      .eq("customer_id", id)
      .then(({ error }) => {
        if (error) console.error("[cloud] falha ao atualizar pedidos do cliente", error);
      });

    setOrders((prev) =>
      prev.map((o) =>
        o.customerId === id
          ? {
              ...o,
              ...(c.name !== undefined ? { customerName: str(c.name) } : {}),
              ...(c.phone !== undefined ? { phone: str(c.phone) } : {}),
              ...(c.address !== undefined ? { address: str(c.address) } : {}),
              ...(c.neighborhood !== undefined ? { neighborhood: str(c.neighborhood) } : {}),
              ...(c.code !== undefined ? { customerCode: c.code } : {}),
            }
          : o
      )
    );
  };


  const deleteCustomer: State["deleteCustomer"] = (id) => {
    remove("customers", id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <Ctx.Provider
      value={{
        loading,
        customers,
        products,
        orders,
        suppliers,
        purchases,
        refresh,
        addOrder,
        appendToOrder,
        updateOrder,
        deleteOrder,
        completeDelivery,
        setScheduledFor,
        setDeliveryNote,
        markPaid,
        markUnpaid,
        addPartialPayment,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addPurchase,
        deletePurchase,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePos() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePos must be used within PosProvider");
  return v;
}

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const buildReceipt = (order: Order) => {
  const lines = order.items
    .map((i) => `• ${i.quantity}x ${i.name} — ${formatBRL(i.price * i.quantity)}`)
    .join("\n");
  const adjustments = [
    order.discountPercent ? `Desconto %: ${order.discountPercent}%` : "",
    order.discountValue ? `Desconto R$: ${formatBRL(order.discountValue)}` : "",
    order.surchargePercent ? `Acréscimo %: ${order.surchargePercent}%` : "",
    order.surchargeValue ? `Acréscimo R$: ${formatBRL(order.surchargeValue)}` : "",
  ].filter(Boolean).join("\n");
  return (
    `*Pedido Granja* 🥚\n\n` +
    `Cliente: ${order.customerCode ? `${order.customerCode} - ` : ""}${order.customerName}\n` +
    `Bairro: ${order.neighborhood}\n` +
    `Endereço: ${order.address}\n\n` +
    `${lines}\n\n` +
    (adjustments ? `Subtotal: ${formatBRL(order.subtotal ?? order.total)}\n${adjustments}\n` : "") +
    `*Total: ${formatBRL(order.total)}*\n` +
    `Pagamento: ${order.paymentMethod} (${order.paymentStatus})\n\n` +
    `Obrigado pela preferência!`
  );
};

export const whatsappLink = (phone: string, message: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

export type { CartItem, Customer, Order, Product, PaymentMethod, PaymentStatus, Supplier, Purchase, PurchaseItem } from "./pos-data";
