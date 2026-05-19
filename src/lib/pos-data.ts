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
  { id: "p1", name: "Cartela Ovos Brancos Grande", unit: "Cartela 30 un", price: 22.0, stock: 50 },
  { id: "p2", name: "Cartela Ovos Vermelhos", unit: "Cartela 30 un", price: 25.0, stock: 40 },
  { id: "p3", name: "Cartela Ovos Caipira", unit: "Cartela 20 un", price: 28.0, stock: 30 },
  { id: "p4", name: "Dúzia de Ovos", unit: "12 un", price: 12.0, stock: 80 },
  { id: "p5", name: "Cartela Ovos Brancos Médio", unit: "Cartela 30 un", price: 20.0, stock: 60 },
  { id: "p6", name: "Meia Dúzia de Ovos", unit: "6 un", price: 7.0, stock: 100 },
];
