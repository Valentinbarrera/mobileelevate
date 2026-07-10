/**
 * PageHeader — header de página unificado para toda la app.
 *
 * Resuelve de raíz el "queda muy arriba" en iOS: aplica `header-safe`
 * (padding-top = padding propio + env(safe-area-inset-top)) para que el
 * contenido nunca quede bajo la barra de estado / Dynamic Island.
 *
 * Además unifica el patrón visual (sticky + blur + borde + jerarquía de
 * título) que hoy está disperso e inconsistente entre pantallas.
 *
 * Composición:
 *  - `eyebrow`  → label de sección en mayúsculas (opcional)
 *  - `title`    → título de la página
 *  - `subtitle` → línea secundaria (opcional)
 *  - `left`     → slot izquierdo (ej. botón atrás o avatar)
 *  - `right`    → slot derecho (ej. acción / icono)
 */
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  /** Sticky con blur (default true). Si false, es un header estático. */
  sticky?: boolean;
  /** Borde inferior (default true). */
  border?: boolean;
  /** Ancho del contenido interno. Default alineado al resto de páginas. */
  maxWidth?: string;
  className?: string;
}

const PageHeader = ({
  title,
  eyebrow,
  subtitle,
  left,
  right,
  sticky = true,
  border = true,
  maxWidth = "max-w-2xl lg:max-w-3xl",
  className = "",
}: PageHeaderProps) => {
  return (
    <header
      className={[
        sticky ? "sticky top-0 z-40 bg-background/80 backdrop-blur-xl" : "bg-background",
        border ? "border-b border-white/[0.06]" : "",
        "header-safe-lg pb-3",
        className,
      ].join(" ")}
    >
      <div className={`${maxWidth} mx-auto px-5 lg:px-8 flex items-center gap-3`}>
        {left && <div className="shrink-0">{left}</div>}

        <div className="min-w-0 flex-1">
          {eyebrow && (
            <div className="text-[11px] font-bold text-primary uppercase tracking-[0.14em] leading-none mb-1 flex items-center gap-1.5">
              {eyebrow}
            </div>
          )}
          <h1 className="text-xl font-black tracking-tight text-foreground truncate leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
          )}
        </div>

        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
};

export default PageHeader;
