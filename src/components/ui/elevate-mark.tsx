/**
 * Marca de Elevate (isotipo naranja) reutilizable. Es el mismo trazo que usa el
 * splash. `color` permite recolorearla (ej. blanco sobre fondos de marca).
 */
export function ElevateMark({
  size = 40,
  color = "#FF4E00",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={(size * 102) / 139}
      viewBox="0 0 139 102"
      aria-label="Elevate"
      role="img"
      className={className}
      style={{ overflow: "visible" }}
    >
      <path d="M56 48.9999C36.8 48.9999 10.6667 63.3333 0 70.4999C35.2 27.2999 81.6667 19.8333 100.5 21.4999C90.9 27.0999 81.5 43.4999 78 50.9999L36.5 70.4999L35 65.4999L56 48.9999Z" fill={color} />
      <path d="M43 82.5001C47 89.3001 48.3333 98.3334 48.5 102C79.7 71.6001 121.5 57.0001 138.5 53.5001C103.7 49.5001 60.3333 71.1667 43 82.5001Z" fill={color} />
      <path d="M93.5 0L83.5 15.5H106L117 4.5L93.5 0Z" fill={color} />
    </svg>
  );
}

/** Lockup horizontal: isotipo + wordmark "ELEVATE" (para headers de marca). */
export function ElevateLockup({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <ElevateMark size={26} />
      <span
        className="text-foreground"
        style={{
          fontWeight: 800,
          fontStyle: "italic",
          letterSpacing: "0.28em",
          textIndent: "0.28em",
          fontSize: 15,
        }}
      >
        ELEVATE
      </span>
    </div>
  );
}
