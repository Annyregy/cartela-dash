import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  SEED_ORDERS,
  SEED_PURCHASES,
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
  customers: Customer[];
  products: Product[];
  orders: Order[];
  suppliers: Supplier[];
  purchases: Purchase[];
  addOrder: (o: Omit<Order, "id" | "createdAt">) => Order;
  updateOrder: (id: string, patch: Partial<Omit<Order, "id" | "createdAt" | "customerId">>) => void;
  deleteOrder: (id: string) => void;
  completeDelivery: (id: string) => void;
  markPaid: (id: string) => void;
  markUnpaid: (id: string) => void;
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

const KEY = "pos-store-v2";
const Ctx = createContext<State | null>(null);

type Persisted = {
  products: Product[];
  orders: Order[];
  suppliers: Supplier[];
  purchases: Purchase[];
  customers: Customer[];
};

const numberFromId = (id: string, fallback: number) => {
  const n = Number(id.replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const toStr = (v: unknown) => (v == null ? "" : typeof v === "string" ? v : String(v));

const normalizeCustomers = (list: Customer[]) => {
  const used = new Set<number>();
  return (Array.isArray(list) ? list : []).map((raw, index) => {
    const c = (raw ?? {}) as Customer;
    let code = Number(c.code ?? numberFromId(c.id, index + 1));
    if (!Number.isFinite(code) || code <= 0) code = index + 1;
    while (used.has(code)) code += 1;
    used.add(code);
    return {
      ...c,
      id: toStr(c.id) || `c_${index}`,
      code,
      name: toStr(c.name),
      neighborhood: toStr(c.neighborhood),
      address: toStr(c.address),
      phone: toStr(c.phone),
    };
  });
};

const nextCustomerCode = (list: Customer[]) =>
  Math.max(0, ...list.map((c, i) => Number(c.code ?? numberFromId(c.id, i + 1)))) + 1;

function load(): Persisted {
  const fallback: Persisted = {
    products: INITIAL_PRODUCTS,
    orders: SEED_ORDERS,
    suppliers: INITIAL_SUPPLIERS,
    purchases: SEED_PURCHASES,
    customers: normalizeCustomers(INITIAL_CUSTOMERS),
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      products: parsed.products ?? INITIAL_PRODUCTS,
      orders: parsed.orders ?? SEED_ORDERS,
      suppliers: parsed.suppliers ?? INITIAL_SUPPLIERS,
      purchases: parsed.purchases ?? SEED_PURCHASES,
      customers: normalizeCustomers(parsed.customers ?? INITIAL_CUSTOMERS),
    };
  } catch {
    return fallback;
  }
}

export function PosProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(() => normalizeCustomers(INITIAL_CUSTOMERS));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const p = load();
    setProducts(p.products);
    setOrders(p.orders);
    setSuppliers(p.suppliers);
    setPurchases(p.purchases);
    setCustomers(p.customers);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(KEY, JSON.stringify({ products, orders, suppliers, purchases, customers }));
  }, [products, orders, suppliers, purchases, customers, hydrated]);


  const addOrder: State["addOrder"] = (o) => {
    const order: Order = { ...o, id: `o_${Date.now()}`, createdAt: new Date().toISOString() };
    setProducts((prev) =>
      prev.map((p) => {
        const item = o.items.find((i) => i.productId === p.id);
        return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
      })
    );
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  const updateOrder: State["updateOrder"] = (id, patch) => {
    setOrders((prev) => {
      const current = prev.find((o) => o.id === id);
      if (!current) return prev;
      const nextItems = patch.items ?? current.items;
      // stock diff: return old items, deduct new items
      if (patch.items) {
        setProducts((prods) =>
          prods.map((p) => {
            const oldQty = current.items.find((i) => i.productId === p.id)?.quantity ?? 0;
            const newQty = nextItems.find((i) => i.productId === p.id)?.quantity ?? 0;
            const delta = oldQty - newQty; // positive => restore stock
            return delta !== 0 ? { ...p, stock: Math.max(0, p.stock + delta) } : p;
          })
        );
      }
      return prev.map((o) => (o.id === id ? { ...o, ...patch, items: nextItems } : o));
    });
  };

  const deleteOrder: State["deleteOrder"] = (id) => {
    setOrders((prev) => {
      const target = prev.find((o) => o.id === id);
      if (target) {
        setProducts((prods) =>
          prods.map((p) => {
            const item = target.items.find((i) => i.productId === p.id);
            return item ? { ...p, stock: p.stock + item.quantity } : p;
          })
        );
      }
      return prev.filter((o) => o.id !== id);
    });
  };



  const completeDelivery: State["completeDelivery"] = (id) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, deliveryStatus: "concluido" } : o)));

  const markPaid: State["markPaid"] = (id) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paymentStatus: "Pago" } : o)));

  const markUnpaid: State["markUnpaid"] = (id) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paymentStatus: "Pendente" } : o)));

  const addProduct: State["addProduct"] = (p) =>
    setProducts((prev) => [...prev, { ...p, id: `p_${Date.now()}` }]);

  const updateProduct: State["updateProduct"] = (id, patch) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const deleteProduct: State["deleteProduct"] = (id) =>
    setProducts((prev) => prev.filter((p) => p.id !== id));

  const addSupplier: State["addSupplier"] = (s) =>
    setSuppliers((prev) => [...prev, { ...s, id: `s_${Date.now()}` }]);

  const updateSupplier: State["updateSupplier"] = (id, patch) =>
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const deleteSupplier: State["deleteSupplier"] = (id) =>
    setSuppliers((prev) => prev.filter((s) => s.id !== id));

  const addPurchase: State["addPurchase"] = (p) => {
    const purchase: Purchase = {
      ...p,
      id: `buy_${Date.now()}`,
      createdAt: p.createdAt ?? new Date().toISOString(),
    };
    // Atualiza estoque ao registrar a compra
    setProducts((prev) =>
      prev.map((pr) => {
        const item = p.items.find((i) => i.productId === pr.id);
        return item ? { ...pr, stock: pr.stock + item.quantity } : pr;
      })
    );
    setPurchases((prev) => [purchase, ...prev]);
    return purchase;
  };

  const deletePurchase: State["deletePurchase"] = (id) =>
    setPurchases((prev) => prev.filter((p) => p.id !== id));

  const addCustomer: State["addCustomer"] = (c) => {
    const code = Number(c.code);
    const customer: Customer = {
      ...c,
      code: Number.isFinite(code) && code > 0 ? code : nextCustomerCode(customers),
      id: `c_${Date.now()}`,
    };
    setCustomers((prev) => [customer, ...prev]);
    return customer;
  };

  const updateCustomer: State["updateCustomer"] = (id, patch) =>
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const deleteCustomer: State["deleteCustomer"] = (id) =>
    setCustomers((prev) => prev.filter((c) => c.id !== id));

  return (
    <Ctx.Provider
      value={{
        customers,
        products,
        orders,
        suppliers,
        purchases,
        addOrder,
        updateOrder,
        deleteOrder,
        completeDelivery,
        markPaid,
        markUnpaid,
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
