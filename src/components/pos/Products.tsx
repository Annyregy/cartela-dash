import { useState } from "react";
import { Edit2, Package, Plus, Save, Trash2, X } from "lucide-react";
import { formatBRL, usePos } from "@/lib/pos-store";
import type { Product } from "@/lib/pos-data";
import { cn } from "@/lib/utils";

type Draft = { name: string; unit: string; price: string; stock: string };

const emptyDraft: Draft = { name: "", unit: "1/30", price: "", stock: "" };

export function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = usePos();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft);

  const submitNew = () => {
    if (!draft.name.trim()) return;
    addProduct({
      name: draft.name.trim(),
      unit: draft.unit.trim() || "un",
      price: parseFloat(draft.price.replace(",", ".")) || 0,
      stock: parseInt(draft.stock) || 0,
    });
    setDraft(emptyDraft);
    setAdding(false);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditDraft({
      name: p.name,
      unit: p.unit,
      price: String(p.price),
      stock: String(p.stock),
    });
  };

  const submitEdit = () => {
    if (!editingId || !editDraft.name.trim()) return;
    updateProduct(editingId, {
      name: editDraft.name.trim(),
      unit: editDraft.unit.trim() || "un",
      price: parseFloat(editDraft.price.replace(",", ".")) || 0,
      stock: parseInt(editDraft.stock) || 0,
    });
    setEditingId(null);
  };

  const remove = (id: string) => {
    if (confirm("Remover este produto?")) deleteProduct(id);
  };

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-foreground font-bold text-lg">Produtos</h2>
          <p className="text-xs text-muted-foreground">
            {products.length} {products.length === 1 ? "produto cadastrado" : "produtos cadastrados"}
          </p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-gold text-gold-foreground font-semibold px-4 py-2.5 rounded-lg shadow active:scale-95 transition"
          >
            <Plus className="size-4" />
            Novo
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl bg-surface border border-gold/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground font-bold">Novo Produto</h3>
            <button
              onClick={() => {
                setAdding(false);
                setDraft(emptyDraft);
              }}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <Fields draft={draft} setDraft={setDraft} />
          <button
            onClick={submitNew}
            disabled={!draft.name.trim()}
            className="w-full bg-gold text-gold-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition"
          >
            <Save className="size-4" />
            Salvar Produto
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.length === 0 && (
          <div className="sm:col-span-2 rounded-xl bg-surface border border-border p-8 text-center">
            <Package className="size-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-foreground font-semibold">Nenhum produto</div>
            <div className="text-sm text-muted-foreground mt-1">
              Toque em "Novo" para cadastrar.
            </div>
          </div>
        )}

        {products.map((p) =>
          editingId === p.id ? (
            <div key={p.id} className="rounded-xl bg-surface border border-gold/40 p-4 space-y-3">
              <Fields draft={editDraft} setDraft={setEditDraft} />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEditingId(null)}
                  className="py-2.5 rounded-lg bg-muted text-foreground font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitEdit}
                  className="py-2.5 rounded-lg bg-gold text-gold-foreground font-bold flex items-center justify-center gap-2"
                >
                  <Save className="size-4" />
                  Salvar
                </button>
              </div>
            </div>
          ) : (
            <div
              key={p.id}
              className="rounded-xl bg-surface border border-border p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-foreground font-semibold leading-tight">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{p.unit}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-2 rounded-md hover:bg-muted text-muted-foreground"
                    aria-label="Editar"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="p-2 rounded-md hover:bg-destructive/10 text-destructive"
                    aria-label="Remover"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-end justify-between border-t border-border pt-2">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Estoque
                  </div>
                  <div
                    className={cn(
                      "font-bold tabular-nums",
                      p.stock <= 10 ? "text-warning" : "text-foreground"
                    )}
                  >
                    {p.stock} un
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Preço
                  </div>
                  <div className="text-gold font-bold text-lg tabular-nums">
                    {formatBRL(p.price)}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function Fields({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Nome
        </label>
        <input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Ex: Ovos Brancos"
          className="mt-1 w-full px-3 py-2.5 rounded-lg bg-input text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Unidade
          </label>
          <input
            value={draft.unit}
            onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
            placeholder="1/30"
            className="mt-1 w-full px-3 py-2.5 rounded-lg bg-input text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Preço
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            placeholder="21.00"
            className="mt-1 w-full px-3 py-2.5 rounded-lg bg-input text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Estoque
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={draft.stock}
            onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
            placeholder="50"
            className="mt-1 w-full px-3 py-2.5 rounded-lg bg-input text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
      </div>
    </div>
  );
}
