import { supabase } from "@/integrations/supabase/client";

/**
 * Importa para a nuvem os dados que ficaram salvos apenas neste aparelho
 * (versão antiga do app, que usava armazenamento local).
 */

const LOCAL_KEYS = ["pos-store-v2", "pos-store-v1", "pos-store"];
const DONE_KEY = "pos-local-migrated-v1";

type AnyRow = Record<string, unknown>;

type LocalData = {
  customers?: AnyRow[];
  products?: AnyRow[];
  suppliers?: AnyRow[];
  orders?: AnyRow[];
  purchases?: AnyRow[];
};

export type MigrationResult = {
  migrated: boolean;
  counts: { customers: number; products: number; suppliers: number; orders: number; purchases: number };
};

const str = (v: unknown) => (v == null ? "" : typeof v === "string" ? v : String(v));
const num = (v: unknown) => (v == null ? 0 : Number(v) || 0);
const optNum = (v: unknown) => (v == null || v === "" ? null : Number(v) || 0);

function readLocal(): LocalData | null {
  if (typeof window === "undefined") return null;
  for (const key of LOCAL_KEYS) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as LocalData;
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      /* ignora conteúdo inválido */
    }
  }
  return null;
}

const customerRow = (c: AnyRow) => ({
  id: str(c['id']),
  code: optNum(c['code']),
  name: str(c['name']),
  phone: str(c['phone']),
  address: str(c['address']),
  neighborhood: str(c['neighborhood']),
});

const productRow = (p: AnyRow) => ({
  id: str(p['id']),
  name: str(p['name']),
  unit: str(p['unit']),
  price: num(p['price']),
  stock: num(p['stock']),
});

const supplierRow = (s: AnyRow) => ({
  id: str(s['id']),
  name: str(s['name']),
  phone: str(s['phone']),
  contact: str(s['contact']),
  notes: str(s['notes']),
});

const orderRow = (o: AnyRow) => ({
  id: str(o['id']),
  customer_id: str(o['customerId']),
  customer_code: optNum(o['customerCode']),
  customer_name: str(o['customerName']),
  phone: str(o['phone']),
  address: str(o['address']),
  neighborhood: str(o['neighborhood']),
  items: Array.isArray(o['items']) ? o['items'] : [],
  subtotal: optNum(o['subtotal']),
  discount_percent: optNum(o['discountPercent']),
  discount_value: optNum(o['discountValue']),
  surcharge_percent: optNum(o['surchargePercent']),
  surcharge_value: optNum(o['surchargeValue']),
  total: num(o['total']),
  payment_method: str(o['paymentMethod']) || "Dinheiro",
  payment_status: str(o['paymentStatus']) || "Pendente",
  paid_amount: num(o['paidAmount']),
  delivery_status: str(o['deliveryStatus']) || "ativo",
  created_at: str(o['createdAt']) || new Date().toISOString(),
});

const purchaseRow = (p: AnyRow) => ({
  id: str(p['id']),
  supplier_id: str(p['supplierId']),
  supplier_name: str(p['supplierName']),
  items: Array.isArray(p['items']) ? p['items'] : [],
  total: num(p['total']),
  notes: str(p['notes']),
  created_at: str(p['createdAt']) || new Date().toISOString(),
});

async function pushMissing(
  table: "customers" | "products" | "suppliers" | "orders" | "purchases",
  rows: AnyRow[],
  existingIds: Set<string>,
): Promise<number> {
  const pending = rows.filter((r) => {
    const id = str(r['id']);
    return id !== "" && !existingIds.has(id);
  });
  if (pending.length === 0) return 0;
  const { error } = await supabase.from(table).upsert(pending as never, { onConflict: "id" });
  if (error) {
    console.error(`[migração] falha ao enviar ${table}`, error);
    return 0;
  }
  return pending.length;
}

/**
 * Envia para a nuvem tudo que existe só neste aparelho e ainda não está no banco.
 * Roda uma única vez por aparelho (marca no armazenamento local ao concluir).
 */
export async function migrateLocalDataToCloud(cloud: {
  customerIds: Set<string>;
  productIds: Set<string>;
  supplierIds: Set<string>;
  orderIds: Set<string>;
  purchaseIds: Set<string>;
}): Promise<MigrationResult> {
  const empty: MigrationResult = {
    migrated: false,
    counts: { customers: 0, products: 0, suppliers: 0, orders: 0, purchases: 0 },
  };

  if (typeof window === "undefined") return empty;
  if (window.localStorage.getItem(DONE_KEY)) return empty;

  const local = readLocal();
  if (!local) {
    window.localStorage.setItem(DONE_KEY, new Date().toISOString());
    return empty;
  }

  const counts = {
    customers: await pushMissing("customers", (local.customers ?? []).map(customerRow), cloud.customerIds),
    products: await pushMissing("products", (local.products ?? []).map(productRow), cloud.productIds),
    suppliers: await pushMissing("suppliers", (local.suppliers ?? []).map(supplierRow), cloud.supplierIds),
    orders: await pushMissing("orders", (local.orders ?? []).map(orderRow), cloud.orderIds),
    purchases: await pushMissing("purchases", (local.purchases ?? []).map(purchaseRow), cloud.purchaseIds),
  };

  window.localStorage.setItem(DONE_KEY, new Date().toISOString());

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { migrated: total > 0, counts };
}
