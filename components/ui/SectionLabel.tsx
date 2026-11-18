type Props = { index: string; es: string; en?: string; className?: string; align?: "left" | "center" };

/** "01 — NOSOTROS / About": the editorial section marker used everywhere. */
export default function SectionLabel({ index, es, en, className = "", align = "left" }: Props) {
  return (
    <div
      data-fade
      className={`flex items-center gap-4 ${align === "center" ? "justify-center" : ""} ${className}`}
    >
      <span className="font-display text-lg leading-none tracking-wider text-gold">{index}</span>
      <span className="block h-px w-10 bg-gold/60" />
      <span className="label text-bone/80">{es}</span>
      {en && <span className="label hidden text-mute/60 sm:inline">/ {en}</span>}
    </div>
  );
}
