const CITY = "São Sebastião";
const STATE = "SP";
const COUNTRY = "Brasil";

const norm = (v: unknown) =>
  (v == null ? "" : String(v))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

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

/** Monta o endereço completo, sem repetir bairro/cidade. */
export function buildMapsQuery(address: unknown, neighborhood: unknown) {
  const addr = stripNoise(clean(address));
  const hood = clean(neighborhood);
  const parts: string[] = [];

  if (addr) parts.push(addr);

  const addrNorm = norm(addr);
  if (hood && !addrNorm.includes(norm(hood))) parts.push(hood);

  const base = norm(parts.join(", "));
  if (!base.includes(norm(CITY))) parts.push(`${CITY} - ${STATE}`);
  if (!base.includes("brasil") && !base.includes("brazil")) parts.push(COUNTRY);

  const query = parts.filter(Boolean).join(", ");
  // sem endereço útil: cai para o bairro/cidade
  return query || `${hood ? `${hood}, ` : ""}${CITY} - ${STATE}, ${COUNTRY}`;
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
