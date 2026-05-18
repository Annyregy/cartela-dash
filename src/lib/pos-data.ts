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
  "Camburizinho",
  "Baleia",
  "Baleia Verde",
  "Juquehy",
  "Barra do Una",
  "Vila Débora",
  "Piavu",
  "Vila Piavu",
  "Lobo Guará",
  "Barreirinha",
  "Boracéia",
  "Sertão Do Cacau",
  "Areião",
  "Barreira",
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Ana Flávia", phone: "", address: "Barreirinha", neighborhood: "Barreirinha" },
  { id: "c7", name: "Arlete", phone: "", address: "Barreira", neighborhood: "Barreira" },
  { id: "c11", name: "Alex", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c19", name: "Cris", phone: "", address: "Rua Manacá", neighborhood: "Camburizinho" },
  { id: "c20", name: "Bianca", phone: "", address: "Baleia Verde", neighborhood: "Baleia Verde" },
  { id: "c22", name: "Edran", phone: "", address: "Baleia Verde", neighborhood: "Baleia Verde" },
  { id: "c24", name: "Erika", phone: "", address: "Areião", neighborhood: "Areião" },
  { id: "c25", name: "Claudia", phone: "", address: "Areião", neighborhood: "Areião" },
  { id: "c26", name: "Daia/Edvan", phone: "", address: "Vila Piavu", neighborhood: "Vila Piavu" },
  { id: "c27", name: "Antônia", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c28", name: "Dulcineia", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c32", name: "Ana Neta Antônia", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c36", name: "Alice", phone: "", address: "Vila Débora", neighborhood: "Vila Débora" },
  { id: "c47", name: "Enoque", phone: "", address: "Piavu", neighborhood: "Piavu" },
  { id: "c48", name: "Ana", phone: "", address: "Piavu", neighborhood: "Piavu" },
  { id: "c49", name: "Gabriela", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c54", name: "Cicera", phone: "", address: "Rua Manaca", neighborhood: "Camburizinho" },
  { id: "c55", name: "Fabio", phone: "", address: "Areião", neighborhood: "Areião" },
  { id: "c57", name: "Ana", phone: "", address: "Lobo Guará", neighborhood: "Lobo Guará" },
  { id: "c59", name: "Cosma", phone: "", address: "Barreira", neighborhood: "Barreira" },
  { id: "c60", name: "Claudete", phone: "", address: "Sertão Do Cacau", neighborhood: "Sertão Do Cacau" },
  { id: "c66", name: "Alemão", phone: "", address: "Rua Manaca", neighborhood: "Camburizinho" },
  { id: "c68", name: "Eline", phone: "", address: "Lobo Guará", neighborhood: "Lobo Guará" },
  { id: "c77", name: "Boratec", phone: "", address: "Boracéia", neighborhood: "Boracéia" },
  { id: "c79", name: "Geilson", phone: "", address: "Juquehy", neighborhood: "Juquehy" },
  { id: "c89", name: "Gerson", phone: "", address: "-", neighborhood: "-" },
  { id: "c0", name: "Diversos", phone: "", address: "-", neighborhood: "-" },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: "p1", name: "Cartela Ovos Brancos Grande", unit: "Cartela 30 un", price: 22.0, stock: 50 },
  { id: "p2", name: "Cartela Ovos Vermelhos", unit: "Cartela 30 un", price: 25.0, stock: 40 },
  { id: "p3", name: "Cartela Ovos Caipira", unit: "Cartela 20 un", price: 28.0, stock: 30 },
  { id: "p4", name: "Dúzia de Ovos", unit: "12 un", price: 12.0, stock: 80 },
  { id: "p5", name: "Cartela Ovos Brancos Médio", unit: "Cartela 30 un", price: 20.0, stock: 60 },
  { id: "p6", name: "Meia Dúzia de Ovos", unit: "6 un", price: 7.0, stock: 100 },
];
