import { Fragment, type ReactNode } from "react";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Highlight substrings of `text` that match any whitespace-separated token in `query`.
 * Case- and diacritics-insensitive. Returns the original text when query is empty.
 */
export function highlight(text: unknown, query: string): ReactNode {
  // Coerce anything (numbers, null, undefined, etc.) to a safe string.
  const safe = text == null ? "" : typeof text === "string" ? text : String(text);
  if (!safe) return safe;
  const q = (query ?? "").trim();
  if (!q) return safe;

  const tokens = Array.from(new Set(q.split(/\s+/).filter(Boolean).map(escapeRegExp)));
  if (tokens.length === 0) return safe;

  const norm = (s: string) => {
    const normalized = typeof s.normalize === "function" ? s.normalize("NFD") : s;
    return normalized.replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const normText = norm(safe);
  const re = new RegExp(`(${tokens.map((t) => norm(t)).join("|")})`, "gi");

  const ranges: Array<[number, number]> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(normText)) !== null) {
    if (m[0].length === 0) {
      re.lastIndex++;
      continue;
    }
    ranges.push([m.index, m.index + m[0].length]);
  }
  if (ranges.length === 0) return safe;

  // Merge overlapping
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1]);
    else merged.push(ranges[i]);
  }

  const parts: ReactNode[] = [];
  let cursor = 0;
  merged.forEach(([s, e], idx) => {
    if (s > cursor) parts.push(<Fragment key={`t-${idx}`}>{safe.slice(cursor, s)}</Fragment>);
    parts.push(
      <mark
        key={`m-${idx}`}
        className="bg-gold/30 text-foreground rounded px-0.5"
      >
        {safe.slice(s, e)}
      </mark>
    );
    cursor = e;
  });
  if (cursor < safe.length) parts.push(<Fragment key="t-end">{safe.slice(cursor)}</Fragment>);
  return <>{parts}</>;
}
