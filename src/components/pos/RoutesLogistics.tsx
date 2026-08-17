import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Navigation,
  Pencil,
  Phone,
  StickyNote,
  Truck,
} from "lucide-react";
import { NEIGHBORHOODS } from "@/lib/pos-data";
import {
  formatBRL,
  formatDateLabel,
  toDateKey,
  usePos,
  whatsappLink,
  type Order,
} from "@/lib/pos-store";
import { openExternalUrl } from "@/lib/browser-actions";
import { buildMapsQuery, mapsDirectionsUrl, mapsEmbedUrl, mapsSearchUrl } from "@/lib/maps";
import { NoteTemplates } from "@/components/pos/NoteTemplates";
import { DeliveriesChart, type RouteStat } from "@/components/pos/DeliveriesChart";
import { cn } from "@/lib/utils";

const ALL = "Todos";

const orderDate = (o: Order) => o.scheduledFor || toDateKey(o.createdAt);

export function RoutesLogistics() {
  const { orders, customers, completeDelivery, setDeliveryNote, setScheduledFor, updateCustomer, updateOrder } =
    usePos();
  const [neighborhood, setNeighborhood] = useState<string>(ALL);
  const [date, setDate] = useState<string>(() => toDateKey());

  const dayOrders = useMemo(
    () => orders.filter((o) => orderDate(o) === date),
    [orders, date]
  );

  const active = useMemo(
    () => dayOrders.filter((o) => o.deliveryStatus === "ativo"),
    [dayOrders]
  );

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const o of active) m[o.neighborhood] = (m[o.neighborhood] ?? 0) + 1;
    return m;
  }, [active]);

  const today = useMemo(() => {
    const list = dayOrders;
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
  }, [dayOrders]);

  const filtered =
    neighborhood === ALL ? active : active.filter((o) => o.neighborhood === neighborhood);


  return (
    <div className="space-y-5 pb-24 md:pb-8">
      <div className="rounded-xl bg-surface border border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Truck className="size-3.5" />
            Entregas de {formatDateLabel(date).toLowerCase()}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground shrink-0" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value || toDateKey())}
            className="flex-1 rounded-lg bg-input border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => setDate(toDateKey())}
            className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setDate(toDateKey(new Date(Date.now() + 86400000)))}
            className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border"
          >
            Amanhã
          </button>
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

      <DeliveriesChart data={today.byRoute} />



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
                ? `Não há entregas pendentes em ${formatDateLabel(date).toLowerCase()}.`
                : `Não há entregas pendentes em ${neighborhood} nesta data.`}
            </div>
          </div>
        )}
        {filtered.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            customer={customers.find((c) => c.id === o.customerId)}
            onSavePlace={(v) => {
              if (o.customerId) updateCustomer(o.customerId, v);
              if (v.neighborhood !== undefined) updateOrder(o.id, { neighborhood: v.neighborhood });
            }}
            onComplete={() => completeDelivery(o.id)}
            onSaveNote={(note) => setDeliveryNote(o.id, note)}
            onReschedule={(d) => setScheduledFor(o.id, d)}
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
  customer,
  onComplete,
  onSaveNote,
  onReschedule,
  onSavePlace,
}: {
  order: Order;
  customer?: { place?: string; mapAddress?: string; neighborhood?: string };
  onComplete: () => void;
  onSaveNote: (note: string) => void;
  onReschedule: (date: string) => void;
  onSavePlace: (v: { place?: string; mapAddress?: string; neighborhood?: string }) => void;
}) {
  const summary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
  const waMsg = `Olá ${order.customerName}, seu pedido de ovos já está na rota de entrega e chega em breve!`;
  const isPaid = order.paymentStatus === "Pago";
  const place = customer?.place ?? "";
  const mapAddress = customer?.mapAddress ?? "";
  const [editingPlace, setEditingPlace] = useState(false);
  const [placeDraft, setPlaceDraft] = useState(place);
  const [mapDraft, setMapDraft] = useState(mapAddress);
  const [hoodDraft, setHoodDraft] = useState(order.neighborhood || "");
  // O bairro organiza a rota, mas nunca é acrescentado automaticamente ao Maps.
  const mapsQuery = buildMapsQuery(mapAddress || order.address);
  const mapsUrl = mapsSearchUrl(mapsQuery);
  const routeUrl = mapsDirectionsUrl(mapsQuery);
  const embedUrl = EMBED_KEY ? mapsEmbedUrl(EMBED_KEY, mapsQuery) : null;
  const scheduled = order.scheduledFor || toDateKey(order.createdAt);
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
          {place && (
            <div className="text-sm text-gold font-medium mt-0.5 truncate">{place}</div>
          )}
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

      <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 border border-border px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
          <CalendarDays className="size-3.5" />
          Entrega agendada
        </span>
        <input
          type="date"
          value={scheduled}
          onChange={(e) => onReschedule(e.target.value)}
          className="rounded-md bg-input border border-border px-2 py-1 text-sm text-foreground outline-none focus:border-gold"
        />
      </div>


      <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <MapPin className="size-3.5" />
            Local do entregador
          </span>
          {!editingPlace && (
            <button
              type="button"
              onClick={() => {
                setPlaceDraft(place);
                setMapDraft(mapAddress);
                setHoodDraft(order.neighborhood || "");
                setEditingPlace(true);
              }}
              className="flex items-center gap-1 text-xs text-gold"
            >
              <Pencil className="size-3" />
              Editar
            </button>
          )}
        </div>
        {editingPlace ? (
          <>
            <input
              value={placeDraft}
              onChange={(e) => setPlaceDraft(e.target.value)}
              placeholder="Ex.: Mercado do Zé, Pousada Maré, Chácara do Tião"
              className="w-full rounded-md bg-background border border-border p-2 text-sm text-foreground outline-none focus:border-gold"
            />
            <input
              value={mapDraft}
              onChange={(e) => setMapDraft(e.target.value)}
              placeholder="Endereço exato do Google Maps"
              className="w-full rounded-md bg-background border border-border p-2 text-sm text-foreground outline-none focus:border-gold"
            />
            <select
              value={hoodDraft}
              onChange={(e) => setHoodDraft(e.target.value)}
              className="w-full rounded-md bg-background border border-border p-2 text-sm text-foreground outline-none focus:border-gold"
            >
              <option value="">Sem rota</option>
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEditingPlace(false)}
                className="py-2 rounded-md bg-muted text-foreground text-sm font-medium border border-border"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSavePlace({
                    place: placeDraft.trim(),
                    mapAddress: mapDraft.trim(),
                    neighborhood: hoodDraft,
                  });
                  setEditingPlace(false);
                }}
                className="py-2 rounded-md bg-gold text-gold-foreground text-sm font-semibold"
              >
                Salvar
              </button>
            </div>
          </>
        ) : (
          <div className="text-sm text-foreground/90">
            {place || <span className="text-muted-foreground italic">Sem referência salva</span>}
            <div className="text-xs text-muted-foreground mt-0.5">
              Rota: {order.neighborhood || "Sem rota"}
              {mapAddress ? ` • Maps: ${mapAddress}` : ""}
            </div>
          </div>
        )}
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
          <div className="px-3 py-2 text-[11px] text-muted-foreground bg-muted/40 border-t border-border">
            {mapsQuery}
          </div>
          <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
            <button
              type="button"
              onClick={() => openExternalUrl(mapsUrl)}
              className="py-2 text-sm font-medium text-gold bg-muted hover:bg-muted/70 transition"
            >
              Abrir no Maps
            </button>
            <button
              type="button"
              onClick={() => openExternalUrl(routeUrl)}
              className="py-2 text-sm font-medium text-gold bg-muted hover:bg-muted/70 transition"
            >
              Traçar rota
            </button>
          </div>
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
