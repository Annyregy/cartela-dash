import { useMemo, useState } from "react";
import { CheckCircle2, MapPin, MessageCircle, Navigation, Phone, StickyNote, Truck } from "lucide-react";
import { NEIGHBORHOODS } from "@/lib/pos-data";
import { formatBRL, usePos, whatsappLink, type Order } from "@/lib/pos-store";
import { openExternalUrl } from "@/lib/browser-actions";
import { NoteTemplates } from "@/components/pos/NoteTemplates";
import { cn } from "@/lib/utils";

const ALL = "Todos";

export function RoutesLogistics() {
  const { orders, completeDelivery, setDeliveryNote } = usePos();
  const [neighborhood, setNeighborhood] = useState<string>(ALL);

  const active = useMemo(
    () => orders.filter((o) => o.deliveryStatus === "ativo"),
    [orders]
  );

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const o of active) m[o.neighborhood] = (m[o.neighborhood] ?? 0) + 1;
    return m;
  }, [active]);

  const today = useMemo(() => {
    const isToday = (iso: string) => {
      const d = new Date(iso);
      const n = new Date();
      return (
        d.getFullYear() === n.getFullYear() &&
        d.getMonth() === n.getMonth() &&
        d.getDate() === n.getDate()
      );
    };
    const list = orders.filter((o) => isToday(o.createdAt));
    const done = list.filter((o) => o.deliveryStatus === "concluido").length;
    const byRoute: Record<string, RouteStat> = {};
    for (const o of list) {
      const name = o.neighborhood || "Sem rota";
      const row = (byRoute[name] ??= { name, pendentes: 0, concluidas: 0 });
      if (o.deliveryStatus === "concluido") row.concluidas += 1;
      else row.pendentes += 1;
    }
    return {
      total: list.length,
      done,
      pending: list.length - done,
      value: list.reduce((s, o) => s + (o.total || 0), 0),
      byRoute: Object.values(byRoute).sort(
        (a, b) => b.pendentes + b.concluidas - (a.pendentes + a.concluidas)
      ),
    };
  }, [orders]);

  const filtered =
    neighborhood === ALL ? active : active.filter((o) => o.neighborhood === neighborhood);

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      <div className="rounded-xl bg-surface border border-border p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Truck className="size-3.5" />
          Entregas de hoje
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-gold font-bold text-xl tabular-nums">{today.total}</div>
            <div className="text-[11px] text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-foreground font-bold text-xl tabular-nums">{today.pending}</div>
            <div className="text-[11px] text-muted-foreground">Pendentes</div>
          </div>
          <div>
            <div className="text-foreground font-bold text-xl tabular-nums">{today.done}</div>
            <div className="text-[11px] text-muted-foreground">Concluídas</div>
          </div>
          <div>
            <div className="text-gold font-bold text-sm tabular-nums pt-1.5">
              {formatBRL(today.value)}
            </div>
            <div className="text-[11px] text-muted-foreground">Valor</div>
          </div>
        </div>
      </div>

      <div className="-mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {[ALL, ...NEIGHBORHOODS].map((n) => {
            const isActive = neighborhood === n;
            const count = n === ALL ? active.length : counts[n] ?? 0;
            return (
              <button
                key={n}
                onClick={() => setNeighborhood(n)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition flex items-center gap-2 whitespace-nowrap",
                  isActive
                    ? "bg-gold text-gold-foreground border-gold"
                    : "bg-surface text-foreground border-border hover:border-gold/50"
                )}
              >
                <MapPin className="size-3.5" />
                {n}
                {count > 0 && (
                  <span
                    className={cn(
                      "text-xs rounded-full px-1.5 py-0.5 min-w-5 text-center font-bold",
                      isActive ? "bg-gold-foreground/20" : "bg-dull-blue text-dull-blue-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>


      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl bg-surface border border-border p-8 text-center">
            <div className="text-foreground font-semibold">Nenhum pedido ativo</div>
            <div className="text-sm text-muted-foreground mt-1">
              {neighborhood === ALL
                ? "Não há entregas pendentes."
                : `Não há entregas pendentes em ${neighborhood}.`}
            </div>
          </div>
        )}
        {filtered.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            onComplete={() => completeDelivery(o.id)}
            onSaveNote={(note) => setDeliveryNote(o.id, note)}
          />
        ))}
      </div>
    </div>
  );
}

const EMBED_KEY = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY'] as
  | string
  | undefined;

function OrderCard({
  order,
  onComplete,
  onSaveNote,
}: {
  order: Order;
  onComplete: () => void;
  onSaveNote: (note: string) => void;
}) {
  const summary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
  const waMsg = `Olá ${order.customerName}, seu pedido de ovos já está na rota de entrega e chega em breve!`;
  const isPaid = order.paymentStatus === "Pago";
  const mapsQuery = [order.address, order.neighborhood, "São Sebastião, SP"]
    .filter(Boolean)
    .join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
  const embedUrl = EMBED_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${EMBED_KEY}&q=${encodeURIComponent(mapsQuery)}&zoom=16`
    : null;
  const [showMap, setShowMap] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(order.deliveryNote ?? "");
  const note = order.deliveryNote ?? "";





  return (
    <div className="rounded-xl bg-surface border border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-foreground font-bold text-lg leading-tight">
            {order.customerName}
          </div>
          <button
            type="button"
            onClick={() => openExternalUrl(mapsUrl)}
            className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1 hover:text-gold text-left max-w-full"
          >
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate underline decoration-dotted">{order.address}</span>
          </button>
          <a
            href={`tel:${order.phone}`}
            className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5 hover:text-foreground"
          >
            <Phone className="size-3.5 shrink-0" />
            {order.phone}
          </a>
        </div>
        <span
          className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full shrink-0",
            isPaid
              ? "bg-success text-success-foreground"
              : "bg-warning text-warning-foreground"
          )}
        >
          {order.paymentStatus}
        </span>
      </div>

      <div className="text-sm text-foreground/90 border-t border-border pt-3">{summary}</div>

      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Total</span>
        <span className="text-gold font-bold text-xl tabular-nums">{formatBRL(order.total)}</span>
      </div>

      <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <StickyNote className="size-3.5" />
          Observação para o entregador
        </div>
        {editingNote ? (
          <>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={3}
              placeholder="Ex.: portão azul, deixar com o vizinho, ligar ao chegar..."
              className="w-full rounded-md bg-background border border-border p-2 text-sm text-foreground outline-none focus:border-gold resize-none"
            />
            <NoteTemplates value={noteDraft} onChange={setNoteDraft} />
            <div className="grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={() => {
                  setNoteDraft(note);
                  setEditingNote(false);
                }}
                className="py-2 rounded-md bg-muted text-foreground text-sm font-medium border border-border"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSaveNote(noteDraft.trim());
                  setEditingNote(false);
                }}
                className="py-2 rounded-md bg-gold text-gold-foreground text-sm font-semibold"
              >
                Salvar
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setNoteDraft(note);
              setEditingNote(true);
            }}
            className="w-full text-left text-sm text-foreground/90 hover:text-gold transition"
          >
            {note || (
              <span className="text-muted-foreground italic">Adicionar comentário…</span>
            )}
          </button>
        )}
      </div>


      {showMap && (
        <div className="rounded-lg overflow-hidden border border-border">
          {embedUrl ? (
            <iframe
              title={`Mapa de ${order.customerName}`}
              src={embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-56 border-0"
              allowFullScreen
            />
          ) : (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Mapa indisponível no momento.
            </div>
          )}
          <button
            type="button"
            onClick={() => openExternalUrl(mapsUrl)}
            className="w-full py-2 text-sm font-medium text-gold bg-muted hover:bg-muted/70 transition"
          >
            Abrir no Google Maps
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          type="button"
          onClick={() => setShowMap((v) => !v)}
          className={cn(
            "flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-medium border transition text-sm",
            showMap
              ? "bg-gold text-gold-foreground border-gold"
              : "bg-muted text-foreground border-border hover:border-gold/50"
          )}
        >
          <Navigation className="size-4" />
          {showMap ? "Ocultar" : "Mapa"}
        </button>
        <a
          href={whatsappLink(order.phone, waMsg)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-muted text-foreground font-medium border border-border hover:border-gold/50 transition text-sm"
        >
          <MessageCircle className="size-4" />
          WhatsApp
        </a>
        <button
          onClick={onComplete}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-dull-blue text-dull-blue-foreground font-semibold hover:opacity-90 transition text-sm"
        >
          <CheckCircle2 className="size-4" />
          Concluir
        </button>
      </div>
    </div>
  );
}
