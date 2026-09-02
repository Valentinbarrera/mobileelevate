/**
 * Accesos rápidos — atajos a las secciones más usadas.
 * Reutilizable: sin props usa los atajos del Home; con `actions` se
 * personaliza (ej: la fila de Progreso). `title` agrega un encabezado.
 *
 * Van en DOS columnas y no en cuatro: con cuatro por fila el ícono y el texto
 * quedaban del tamaño de una uña y los botones se tocaban entre sí. Acá cada
 * atajo es una tarjeta de verdad (112px de alto), con aire entre una y otra, y
 * el primero va en el naranja de la marca para que el ojo tenga dónde caer.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Scale, Ruler, Dumbbell, Apple, ScanBarcode, type LucideIcon } from "lucide-react";
import { fadeUp } from "@/lib/animations";

export type QuickAction = {
  icon: LucideIcon;
  label: string;
  to: string;
  /** Línea chica debajo del título. Opcional. */
  hint?: string;
  /**
   * Atajo secundario en la esquina de la baldosa. Sirve cuando una sección
   * tiene UNA acción que se repite todos los días y no vale una baldosa
   * propia — hoy sólo Nutrición, para escanear un envase sin pasar por la
   * pantalla. La baldosa entera sigue llevando a la sección.
   */
  corner?: { icon: LucideIcon; label: string; to: string };
};

const DEFAULT_ACTIONS: QuickAction[] = [
  // Nutrición primero: es lo que el alumno abre TODOS los días, incluso los que
  // no entrena. Que además sea una pestaña de abajo no alcanza — desde el Home
  // había que acordarse de en qué pestaña vivía.
  {
    icon: Apple,
    label: "Nutrición",
    to: "/nutrition",
    hint: "Tu plan de comidas",
    corner: { icon: ScanBarcode, label: "Escanear un producto", to: "/nutrition?escanear=1" },
  },
  { icon: Dumbbell, label: "Ejercicios", to: "/exercises", hint: "Biblioteca" },
  { icon: Scale, label: "Peso", to: "/progress", hint: "Tu registro" },
  { icon: Ruler, label: "Medidas", to: "/measurements", hint: "Circunferencias" },
];

type QuickActionsProps = {
  actions?: QuickAction[];
  title?: string;
};

const QuickActions = ({ actions = DEFAULT_ACTIONS, title }: QuickActionsProps) => {
  const navigate = useNavigate();
  return (
    <motion.div variants={fadeUp} className="space-y-3">
      {title && (
        <div className="flex items-center gap-2 px-0.5">
          <span className="accent-bar" />
          <h3 className="text-lg font-black text-foreground tracking-tight">{title}</h3>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ icon: Icon, label, to, hint, corner }, i) => {
          // El primero manda: fondo lleno de marca, como el bloque destacado de
          // la referencia. El resto son superficies neutras.
          const featured = i === 0;
          const Corner = corner?.icon;
          return (
            // La baldosa es un contenedor y no un botón: el atajo de la esquina
            // tiene que ser un botón propio, y un botón adentro de otro no es
            // HTML válido ni se puede alcanzar con el teclado.
            <div key={label} className="relative">
              {corner && Corner && (
                <button
                  onClick={() => navigate(corner.to)}
                  aria-label={corner.label}
                  className={`absolute top-1.5 right-1.5 z-10 w-11 h-11 rounded-2xl flex items-center justify-center active:scale-90 transition-transform ${
                    featured
                      ? "text-primary-foreground/80 active:bg-primary-foreground/15"
                      : "text-primary/70 active:bg-white/10"
                  }`}
                >
                  <Corner className="w-[22px] h-[22px]" />
                </button>
              )}
            <button
              onClick={() => navigate(to)}
              aria-label={label}
              className={`group w-full rounded-3xl min-h-[112px] p-4 flex flex-col items-start justify-between text-left active:scale-[0.97] transition-transform ${
                featured ? "glass-tile-accent" : "glass-tile"
              }`}
            >
              {/* El ícono repite el material de la baldosa una escala más
                  chica: vidrio sobre vidrio en las neutras, luz sobre luz en
                  la destacada. */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                  featured
                    ? "bg-primary-foreground/20 border border-primary-foreground/30 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.25)]"
                    : "bg-white/[0.07] border border-white/[0.14] shadow-[inset_0_1px_0_hsl(0_0%_100%/0.12)] group-active:bg-white/[0.12]"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${featured ? "text-primary-foreground" : "text-primary"}`}
                />
              </div>
              <div className="mt-3 w-full min-w-0">
                <p
                  className={`text-[15px] font-black tracking-tight leading-tight truncate ${
                    featured ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {label}
                </p>
                {hint && (
                  <p
                    className={`text-[11.5px] font-medium leading-tight truncate ${
                      /* Sobre vidrio el gris de `muted` se apaga: el fondo ya
                         está aclarado por la translucidez. Va blanco al 60%. */
                      featured ? "text-primary-foreground/80" : "text-white/60"
                    }`}
                  >
                    {hint}
                  </p>
                )}
              </div>
            </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default QuickActions;
