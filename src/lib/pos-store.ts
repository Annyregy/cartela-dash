import { create } from "zustand";
import { persist } from "zustand/middleware";
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
};

export const usePosStore = create<State>()(
  persist(
    (set, get) => ({
      customers: INITIAL_CUSTOMERS,
      products: INITIAL_PRODUCTS,
      orders: [],
      addOrder: (o) => {
        const order: Order = {
          ...o,
          id: `o_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        // deduct stock
        const products = get().products.map((p) => {
          const item = o.items.find((i) => i.productId === p.id);
          return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
        });
        set({ orders: [order, ...get().orders], products });
        return order;
      },
      completeDelivery: (id) =>
        set({
          orders: get().orders.map((o) =>
            o.id === id ? { ...o, deliveryStatus: "concluido" } : o
          ),
        }),
    }),
    { name: "pos-store-v1" }
  )
);

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
