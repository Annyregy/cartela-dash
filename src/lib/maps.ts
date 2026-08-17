const clean = (v: unknown) =>
  (v == null ? "" : String(v))
    .replace(/\s+/g, " ")
    .replace(/[;|]+/g, ",")
    .replace(/\s*,\s*/g, ", ")
    .replace(/(^[,\s]+)|([,\s]+$)/g, "")
    .trim();

/**
 * Remove trechos que atrapalham a geocodificação (referências, complementos)
 * mantendo rua + número.
 */
const stripNoise = (address: string) => {
  let out = address;
  // remove referências após "ref", "referencia", "prox", "próximo", "atrás", "em frente"
  out = out.replace(
    /\b(ref\.?|referencia|referência|prox\.?|próximo|proximo|atras|atrás|em frente|do lado|perto)\b.*$/i,
    ""
  );
  // remove complementos comuns
  out = out.replace(
    /\b(casa|cs|ap|apto|apartamento|bloco|bl|fundos|frente|lote|lt|quadra|qd)\s*\.?\s*[\w-]*\b/gi,
    " "
  );
  return clean(out);
};

/** Usa somente o endereço informado. Bairro é exclusivo para a organização das rotas. */
export function buildMapsQuery(address: unknown) {
  return stripNoise(clean(address));
}

export const mapsSearchUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const mapsDirectionsUrl = (query: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    query
  )}&travelmode=driving`;

/**
 * `search` (e não `place`) evita o mapa cair num ponto genérico quando o
 * endereço não bate exatamente com um place cadastrado.
 */
export const mapsEmbedUrl = (key: string, query: string) =>
  `https://www.google.com/maps/embed/v1/search?key=${key}&q=${encodeURIComponent(
    query
  )}&zoom=17`;
