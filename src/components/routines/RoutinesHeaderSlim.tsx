/**
 * RoutinesHeaderSlim — encabezado liviano de la pantalla Rutinas.
 * Sin botón "atrás" (es una pantalla raíz del bottom-nav) ni búsqueda fija.
 * Prioriza saludo + fecha + un guiño motivacional (racha semanal).
 */
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface RoutinesHeaderSlimProps {
  fullName?: string | null;
  /** entrenos planificados/realizados esta semana, para el chip de racha */
  weeklyCount?: number;
}

const RoutinesHeaderSlim = ({ fullName, weeklyCount = 0 }: RoutinesHeaderSlimProps) => {
  const firstName = fullName?.trim().split(" ")[0] || "Atleta";
  const formattedDate = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <motion.header
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/30"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-2xl mx-auto px-5 pt-safe">
        <div className="flex items-center justify-between py-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-foreground tracking-tight truncate">
              Hola, {firstName} <span aria-hidden>👋</span>
            </h1>
            <p className="text-sm text-muted-foreground capitalize mt-0.5">
              {formattedDate}
            </p>
          </div>

          {weeklyCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex-shrink-0">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary">{weeklyCount}</span>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default RoutinesHeaderSlim;
