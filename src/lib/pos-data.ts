export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
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
  customerName: string;
  phone: string;
  address: string;
  neighborhood: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
};

export const NEIGHBORHOODS = [
  "Boiçucanga",
  "Camburi",
  "Baleia",
  "Juquehy",
  "Barra do Una",
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Maria Silva", phone: "5512999990001", address: "Rua das Flores, 123", neighborhood: "Boiçucanga" },
  { id: "c2", name: "João Pereira", phone: "5512999990002", address: "Av. do Mar, 45", neighborhood: "Camburi" },
  { id: "c3", name: "Ana Costa", phone: "5512999990003", address: "Rua da Praia, 78", neighborhood: "Baleia" },
  { id: "c4", name: "Carlos Souza", phone: "5512999990004", address: "Estrada do Sol, 12", neighborhood: "Juquehy" },
  { id: "c5", name: "Beatriz Lima", phone: "5512999990005", address: "Rua dos Pescadores, 9", neighborhood: "Barra do Una" },
  { id: "c6", name: "Rafael Mendes", phone: "5512999990006", address: "Alameda Verde, 200", neighborhood: "Boiçucanga" },
  { id: "c7", name: "Luiza Andrade", phone: "5512999990007", address: "Travessa da Lua, 33", neighborhood: "Camburi" },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: "p1", name: "Cartela Ovos Brancos Grande", unit: "Cartela 30 un", price: 22.0, stock: 50 },
  { id: "p2", name: "Cartela Ovos Vermelhos", unit: "Cartela 30 un", price: 25.0, stock: 40 },
  { id: "p3", name: "Cartela Ovos Caipira", unit: "Cartela 20 un", price: 28.0, stock: 30 },
  { id: "p4", name: "Dúzia de Ovos", unit: "12 un", price: 12.0, stock: 80 },
  { id: "p5", name: "Cartela Ovos Brancos Médio", unit: "Cartela 30 un", price: 20.0, stock: 60 },
  { id: "p6", name: "Meia Dúzia de Ovos", unit: "6 un", price: 7.0, stock: 100 },
];
