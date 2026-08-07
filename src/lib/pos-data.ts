export type Customer = {
  id: string;
  code?: number;
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  note?: string;
};

export type Product = {
  id: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
};

export type CartItem = {
  productId: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
};

export type PaymentMethod = "Pix" | "Dinheiro" | "Cartão";
export type PaymentStatus = "Pago" | "Pendente";
export type DeliveryStatus = "ativo" | "concluido";

export type Order = {
  id: string;
  customerId: string;
  customerCode?: number;
  customerName: string;
  phone: string;
  address: string;
  neighborhood: string;
  items: CartItem[];
  subtotal?: number;
  discountPercent?: number;
  discountValue?: number;
  surchargePercent?: number;
  surchargeValue?: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAmount?: number;
  deliveryStatus: DeliveryStatus;
  deliveryNote?: string;
  createdAt: string;
};

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  contact: string;
  notes: string;
};

export type PurchaseItem = {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitCost: number;
};

export type Purchase = {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  total: number;
  notes: string;
  createdAt: string; // ISO
};

export const NEIGHBORHOODS = [
  "Boiçucanga",
  "Camburi",
  "Camburizinho",
  "Baleia",
  "Baleia Verde",
  "Juquehy",
  "Barra do Una",
  "Vila Débora",
  "Vila Sahy",
  "Piavu",
  "Vila Piavu",
  "Lobo Guará",
  "Barreirinha",
  "Boracéia",
  "Sertão Do Cacau",
  "Areião",
  "Barreira",
  "Sítio Velho",
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Ana Flávia", phone: "", address: "Barreirinha", neighborhood: "Barreirinha" },
  { id: "c2", name: "Jaqueline", phone: "", address: "Barreirinha", neighborhood: "Barreirinha" },
  { id: "c3", name: "Nely", phone: "", address: "Barreira", neighborhood: "Barreira" },
  { id: "c4", name: "Isabel", phone: "", address: "Barreira", neighborhood: "Barreira" },
  { id: "c5", name: "Vanubia", phone: "", address: "Barreira", neighborhood: "Barreira" },
  { id: "c6", name: "Val", phone: "", address: "Barreira", neighborhood: "Barreira" },
  { id: "c7", name: "Arlete", phone: "", address: "Barreira", neighborhood: "Barreira" },
  { id: "c8", name: "Neide", phone: "", address: "Barreira", neighborhood: "Barreira" },
  { id: "c9", name: "Marlene", phone: "", address: "Sítio Velho", neighborhood: "Sítio Velho" },
  { id: "c10", name: "Silmara", phone: "", address: "Vila Débora", neighborhood: "Vila Débora" },
  { id: "c11", name: "Alex", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c12", name: "Naina", phone: "", address: "Boiçucanga", neighborhood: "Boiçucanga" },
  { id: "c13", name: "João Paulo", phone: "", address: "Boiçucanga", neighborhood: "Boiçucanga" },
  { id: "c14", name: "Lucas", phone: "", address: "Barra Do Una", neighborhood: "Barra do Una" },
  { id: "c15", name: "Miriã", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c16", name: "Irene", phone: "", address: "Barra Do Una", neighborhood: "Barra do Una" },
  { id: "c17", name: "Rai", phone: "", address: "Sítio Velho", neighborhood: "Sítio Velho" },
  { id: "c18", name: "Tamires", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c19", name: "Cris", phone: "", address: "Rua Manacá", neighborhood: "Camburizinho" },
  { id: "c20", name: "Bianca", phone: "", address: "Baleia Verde", neighborhood: "Baleia Verde" },
  { id: "c21", name: "Maely", phone: "", address: "Sertão Do Cacau", neighborhood: "Sertão Do Cacau" },
  { id: "c22", name: "Edran", phone: "", address: "Baleia Verde", neighborhood: "Baleia Verde" },
  { id: "c23", name: "Jafferson", phone: "", address: "Vila Débora", neighborhood: "Vila Débora" },
  { id: "c24", name: "Erika", phone: "", address: "Areião", neighborhood: "Areião" },
  { id: "c25", name: "Claudia", phone: "", address: "Areião", neighborhood: "Areião" },
  { id: "c26", name: "Daia/Edvan", phone: "", address: "Vila Piavu", neighborhood: "Vila Piavu" },
  { id: "c27", name: "Antônia", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c28", name: "Dulcineia", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c31", name: "Marcos Ninja", phone: "", address: "Sítio Velho", neighborhood: "Sítio Velho" },
  { id: "c32", name: "Ana Neta Antônia", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c33", name: "Monica", phone: "", address: "Baleia Verde", neighborhood: "Baleia Verde" },
  { id: "c34", name: "Marli", phone: "", address: "Boiçucanga", neighborhood: "Boiçucanga" },
  { id: "c36", name: "Alice", phone: "", address: "Vila Débora", neighborhood: "Vila Débora" },
  { id: "c37", name: "Maria", phone: "", address: "Lobo Guará", neighborhood: "Lobo Guará" },
  { id: "c40", name: "Paula", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c44", name: "Império Dos Sabores", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c47", name: "Enoque", phone: "", address: "Piavu", neighborhood: "Piavu" },
  { id: "c48", name: "Ana", phone: "", address: "Piavu", neighborhood: "Piavu" },
  { id: "c49", name: "Gabriela", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c54", name: "Cicera", phone: "", address: "Rua Manaca", neighborhood: "Camburizinho" },
  { id: "c55", name: "Fabio", phone: "", address: "Areião", neighborhood: "Areião" },
  { id: "c56", name: "Leia", phone: "", address: "Sertão Do Cacau", neighborhood: "Sertão Do Cacau" },
  { id: "c57", name: "Ana", phone: "", address: "Lobo Guará", neighborhood: "Lobo Guará" },
  { id: "c58", name: "Sandra", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c59", name: "Cosma", phone: "", address: "Barreira", neighborhood: "Barreira" },
  { id: "c60", name: "Claudete", phone: "", address: "Sertão Do Cacau", neighborhood: "Sertão Do Cacau" },
  { id: "c63", name: "Vanessa", phone: "", address: "Sítio Velho", neighborhood: "Sítio Velho" },
  { id: "c64", name: "Jailza", phone: "", address: "Barreirinha", neighborhood: "Barreirinha" },
  { id: "c66", name: "Alemão", phone: "", address: "Rua Manaca", neighborhood: "Camburizinho" },
  { id: "c67", name: "Rozilane", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c68", name: "Eline", phone: "", address: "Lobo Guará", neighborhood: "Lobo Guará" },
  { id: "c69", name: "Rosa", phone: "", address: "Areião", neighborhood: "Areião" },
  { id: "c70", name: "Restaurante Lia", phone: "", address: "Areião", neighborhood: "Areião" },
  { id: "c71", name: "Lua", phone: "", address: "Sertão Do Cacau", neighborhood: "Sertão Do Cacau" },
  { id: "c72", name: "Romário", phone: "", address: "Sertão Do Cacau", neighborhood: "Sertão Do Cacau" },
  { id: "c73", name: "Pedrina", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c75", name: "Renato", phone: "", address: "Sertão Do Cacau", neighborhood: "Sertão Do Cacau" },
  { id: "c76", name: "Neto", phone: "", address: "Trabalho Baleia - Vila Sahy", neighborhood: "Vila Sahy" },
  { id: "c77", name: "Boratec", phone: "", address: "Boracéia", neighborhood: "Boracéia" },
  { id: "c79", name: "Geilson", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c80", name: "Moises", phone: "", address: "Vila Sahy", neighborhood: "Vila Sahy" },
  { id: "c82", name: "Sther", phone: "", address: "Barreirinha", neighborhood: "Barreirinha" },
  { id: "c83", name: "Jefferson William", phone: "", address: "Baleia Verde", neighborhood: "Baleia Verde" },
  { id: "c84", name: "Luciana", phone: "", address: "Boiçucanga", neighborhood: "Boiçucanga" },
  { id: "c85", name: "Wellington", phone: "", address: "Barreira", neighborhood: "Barreira" },
  { id: "c86", name: "Marcia", phone: "", address: "Lobo Guará", neighborhood: "Lobo Guará" },
  { id: "c87", name: "Tassia", phone: "", address: "Piavu", neighborhood: "Piavu" },
  { id: "c88", name: "Rosimeyre", phone: "", address: "-", neighborhood: "-" },
  { id: "c89", name: "Gerson", phone: "", address: "-", neighborhood: "-" },
  { id: "c92", name: "Renato", phone: "", address: "Vila Débora", neighborhood: "Vila Débora" },
  { id: "c0", name: "Diversos", phone: "", address: "-", neighborhood: "-" },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: "p1", name: "Ovos Brancos", unit: "1/30", price: 21.0, stock: 50 },
  { id: "p2", name: "Ovos Vermelhos/Marrons", unit: "1/30", price: 25.0, stock: 50 },
  { id: "p3", name: "Ovos Extra", unit: "1/30", price: 23.0, stock: 40 },
  { id: "p4", name: "Meia Cartela Brancos", unit: "1/15", price: 12.0, stock: 60 },
  { id: "p5", name: "Ovos Vermelhos Fracionado", unit: "1/20", price: 17.0, stock: 40 },
  { id: "p6", name: "Ovos De Codorna", unit: "1/30", price: 10.0, stock: 30 },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: "s1", name: "Granja Principal", phone: "", contact: "", notes: "Fornecedor padrão de ovos brancos e vermelhos" },
];

// Seed purchases: histórico para visualizar evolução mensal de preços
const iso = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12).toISOString();

export const SEED_PURCHASES: Purchase[] = [
  {
    id: "buy_2026_03_a",
    supplierId: "s1",
    supplierName: "Granja Principal",
    items: [
      { productId: "p1", productName: "Ovos Brancos", unit: "1/30", quantity: 30, unitCost: 14.0 },
      { productId: "p2", productName: "Ovos Vermelhos/Marrons", unit: "1/30", quantity: 20, unitCost: 17.5 },
      { productId: "p3", productName: "Ovos Extra", unit: "1/30", quantity: 15, unitCost: 16.0 },
    ],
    total: 30 * 14 + 20 * 17.5 + 15 * 16,
    notes: "",
    createdAt: iso(2026, 3, 5),
  },
  {
    id: "buy_2026_03_b",
    supplierId: "s1",
    supplierName: "Granja Principal",
    items: [
      { productId: "p4", productName: "Meia Cartela Brancos", unit: "1/15", quantity: 20, unitCost: 7.5 },
    ],
    total: 20 * 7.5,
    notes: "",
    createdAt: iso(2026, 3, 20),
  },
  {
    id: "buy_2026_04_a",
    supplierId: "s1",
    supplierName: "Granja Principal",
    items: [
      { productId: "p1", productName: "Ovos Brancos", unit: "1/30", quantity: 40, unitCost: 14.5 },
      { productId: "p2", productName: "Ovos Vermelhos/Marrons", unit: "1/30", quantity: 25, unitCost: 18.0 },
      { productId: "p3", productName: "Ovos Extra", unit: "1/30", quantity: 18, unitCost: 16.5 },
    ],
    total: 40 * 14.5 + 25 * 18 + 18 * 16.5,
    notes: "",
    createdAt: iso(2026, 4, 10),
  },
  {
    id: "buy_2026_05_a",
    supplierId: "s1",
    supplierName: "Granja Principal",
    items: [
      { productId: "p1", productName: "Ovos Brancos", unit: "1/30", quantity: 50, unitCost: 15.0 },
      { productId: "p2", productName: "Ovos Vermelhos/Marrons", unit: "1/30", quantity: 30, unitCost: 18.5 },
      { productId: "p3", productName: "Ovos Extra", unit: "1/30", quantity: 20, unitCost: 17.0 },
      { productId: "p4", productName: "Meia Cartela Brancos", unit: "1/15", quantity: 25, unitCost: 8.0 },
    ],
    total: 50 * 15 + 30 * 18.5 + 20 * 17 + 25 * 8,
    notes: "",
    createdAt: iso(2026, 5, 8),
  },
];

// Helpers to build seed orders compactly
const C = Object.fromEntries(INITIAL_CUSTOMERS.map((c) => [c.id, c])) as Record<string, Customer>;
const P = Object.fromEntries(INITIAL_PRODUCTS.map((p) => [p.id, p])) as Record<string, Product>;

type SeedItem = [string, number, number?]; // productId, qty, optional override unit price
function mkOrder(num: number, y: number, m: number, d: number, custId: string, items: SeedItem[], status: PaymentStatus = "Pago"): Order {
  const cust = C[custId];
  const cartItems: CartItem[] = items.map(([pid, qty, override]) => {
    const pr = P[pid];
    return { productId: pid, name: pr.name, unit: pr.unit, price: override ?? pr.price, quantity: qty };
  });
  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  return {
    id: `seed_${num}`,
    customerId: custId,
    customerName: cust.name,
    phone: cust.phone,
    address: cust.address,
    neighborhood: cust.neighborhood,
    items: cartItems,
    total,
    paymentMethod: "Dinheiro",
    paymentStatus: status,
    deliveryStatus: "concluido",
    createdAt: iso(y, m, d),
  };
}

export const SEED_ORDERS: Order[] = [
  // 05/05/26
  // (no detail rows shown for total 67,00 — skip)
  // 04/05/26
  mkOrder(55, 2026, 5, 4, "c72", [["p3", 1]]),
  mkOrder(54, 2026, 5, 4, "c71", [["p1", 1]]),
  mkOrder(53, 2026, 5, 4, "c40", [["p1", 3]]),
  mkOrder(52, 2026, 5, 4, "c63", [["p1", 2]]),
  mkOrder(51, 2026, 5, 4, "c49", [["p1", 2]]),
  mkOrder(50, 2026, 5, 4, "c28", [["p2", 1]]),
  mkOrder(49, 2026, 5, 4, "c70", [["p1", 1]]),
  mkOrder(48, 2026, 5, 4, "c69", [["p1", 1]]),
  mkOrder(47, 2026, 5, 4, "c68", [["p1", 1]]),
  // 03/05/26
  mkOrder(46, 2026, 5, 3, "c44", [["p3", 3]]),
  mkOrder(45, 2026, 5, 3, "c67", [["p1", 4]]),
  mkOrder(44, 2026, 5, 3, "c0", [["p1", 2], ["p2", 1]]),
  mkOrder(43, 2026, 5, 3, "c60", [["p1", 1]]),
  mkOrder(42, 2026, 5, 3, "c9", [["p1", 1]]),
  mkOrder(41, 2026, 5, 3, "c17", [["p3", 4]]),
  mkOrder(40, 2026, 5, 3, "c66", [["p2", 1]]),
  mkOrder(39, 2026, 5, 3, "c66", [["p1", 1]]),
  // 02/05/26
  mkOrder(38, 2026, 5, 2, "c26", [["p3", 1], ["p2", 3]]),
  mkOrder(37, 2026, 5, 2, "c59", [["p1", 1], ["p2", 1]]),
  mkOrder(36, 2026, 5, 2, "c16", [["p1", 7]]),
  mkOrder(35, 2026, 5, 2, "c58", [["p1", 2]]),
  // 01/05/26
  mkOrder(34, 2026, 5, 1, "c0", [["p1", 1], ["p2", 2]]),
  mkOrder(33, 2026, 5, 1, "c0", [["p1", 2, 20]]),
  mkOrder(32, 2026, 5, 1, "c47", [["p1", 2]]),
  mkOrder(31, 2026, 5, 1, "c34", [["p1", 2]]),
  mkOrder(30, 2026, 5, 1, "c57", [["p1", 2]]),
  mkOrder(29, 2026, 5, 1, "c56", [["p1", 3]]),
  // 29/04/26
  mkOrder(28, 2026, 4, 29, "c0", [["p1", 5]]),
  mkOrder(27, 2026, 4, 29, "c48", [["p1", 2]]),
  mkOrder(26, 2026, 4, 29, "c55", [["p4", 1, 11], ["p1", 1]]),
  // 28/04/26
  mkOrder(25, 2026, 4, 28, "c2", [["p1", 2]]),
  mkOrder(24, 2026, 4, 28, "c1", [["p1", 2]]),
  mkOrder(23, 2026, 4, 28, "c0", [["p1", 1]]),
  mkOrder(22, 2026, 4, 28, "c23", [["p1", 2]]),
  mkOrder(21, 2026, 4, 28, "c18", [["p1", 2]]),
  mkOrder(20, 2026, 4, 28, "c22", [["p1", 1, 23]]),
  mkOrder(19, 2026, 4, 28, "c20", [["p1", 1, 23]]),
  mkOrder(18, 2026, 4, 28, "c16", [["p1", 3]]),
  mkOrder(16, 2026, 4, 28, "c0", [["p3", 1]]),
  mkOrder(15, 2026, 4, 28, "c31", [["p3", 1]]),
  mkOrder(14, 2026, 4, 28, "c32", [["p3", 1]]),
  mkOrder(11, 2026, 4, 28, "c0", [["p1", 1]]),
  // 27/04/26
  mkOrder(117, 2026, 4, 27, "c15", [["p1", 2], ["p2", 1]]),
  mkOrder(109, 2026, 4, 27, "c26", [["p2", 2]]),
  mkOrder(102, 2026, 4, 27, "c7", [["p1", 3, 20]]),
  // 26/04/26
  mkOrder(13, 2026, 4, 26, "c0", [["p1", 1], ["p3", 2]]),
  mkOrder(12, 2026, 4, 26, "c0", [["p1", 1, 20]]),
  mkOrder(10, 2026, 4, 26, "c27", [["p3", 1], ["p2", 1]]),
  mkOrder(8, 2026, 4, 26, "c26", [["p2", 2]]),
  mkOrder(7, 2026, 4, 26, "c21", [["p3", 2]]),
  mkOrder(6, 2026, 4, 26, "c17", [["p1", 4], ["p3", 2]]),
  mkOrder(3, 2026, 4, 26, "c33", [["p3", 2]]),
  mkOrder(1, 2026, 4, 26, "c24", [["p2", 1]]),
  // 25/04/26
  mkOrder(5, 2026, 4, 25, "c19", [["p1", 3]]),
  mkOrder(4, 2026, 4, 25, "c54", [["p1", 3, 20]]),
];
