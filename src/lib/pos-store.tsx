import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  type CartItem,
  type Customer,
  type Order,
  type Product,
  type PaymentMethod,
  type PaymentStatus,
} from "./pos-data";

type State = {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  addOrder: (o: Omit<Order, "id" | "createdAt">) => Order;
  completeDelivery: (id: string) => void;
  markPaid: (id: string) => void;
  markUnpaid: (id: string) => void;
};

const KEY = "pos-store-v1";
const Ctx = createContext<State | null>(null);

type Persisted = { products: Product[]; orders: Order[] };

function load(): Persisted {
  if (typeof window === "undefined") return { products: INITIAL_PRODUCTS, orders: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { products: INITIAL_PRODUCTS, orders: [] };
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      products: parsed.products ?? INITIAL_PRODUCTS,
      orders: parsed.orders ?? [],
    };
  } catch {
    return { products: INITIAL_PRODUCTS, orders: [] };
  }
}

export function PosProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const p = load();
    setProducts(p.products);
    setOrders(p.orders);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(KEY, JSON.stringify({ products, orders }));
  }, [products, orders, hydrated]);

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

  const completeDelivery: State["completeDelivery"] = (id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, deliveryStatus: "concluido" } : o)));
  };

  const markPaid: State["markPaid"] = (id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paymentStatus: "Pago" } : o)));
  };

  const markUnpaid: State["markUnpaid"] = (id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paymentStatus: "Pendente" } : o)));
  };

  return (
    <Ctx.Provider
      value={{ customers: INITIAL_CUSTOMERS, products, orders, addOrder, completeDelivery, markPaid, markUnpaid }}
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
  return (
    `*Pedido Granja* 🥚\n\n` +
    `Cliente: ${order.customerName}\n` +
    `Bairro: ${order.neighborhood}\n` +
    `Endereço: ${order.address}\n\n` +
    `${lines}\n\n` +
    `*Total: ${formatBRL(order.total)}*\n` +
    `Pagamento: ${order.paymentMethod} (${order.paymentStatus})\n\n` +
    `Obrigado pela preferência!`
  );
};

export const whatsappLink = (phone: string, message: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

export type { CartItem, Customer, Order, Product, PaymentMethod, PaymentStatus };
