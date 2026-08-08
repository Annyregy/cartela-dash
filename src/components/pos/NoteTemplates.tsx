export const NOTE_TEMPLATES = [
  "Ligar ao chegar",
  "Deixar com o vizinho",
  "Deixar na portaria",
  "Portão azul",
  "Casa de esquina",
  "Não tocar a campainha",
  "Entregar somente à tarde",
  "Levar troco",
  "Cliente paga na entrega",
];

/** Chips de frases prontas: acrescenta a frase ao texto atual com um toque. */
export function NoteTemplates({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
}) {
  const append = (phrase: string) => {
    const current = String(value ?? "").trim();
    if (!current) return onChange(phrase);
    const parts = current.split(/\s*[.;]\s*|\s*\n\s*/).map((p) => p.trim().toLowerCase());
    if (parts.includes(phrase.toLowerCase())) return;
    onChange(`${current.replace(/[.;]\s*$/, "")}. ${phrase}`);
  };

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {NOTE_TEMPLATES.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => append(t)}
          className="px-2.5 py-1 rounded-full border border-border bg-muted/60 text-xs text-foreground/90 hover:border-gold hover:text-gold transition"
        >
          {t}
        </button>
      ))}
    </div>
  );
}
