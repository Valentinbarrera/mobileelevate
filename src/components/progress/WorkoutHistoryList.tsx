/**
 * Historial de entrenos completados, agrupado por mes para escalar bien cuando
 * hay muchos días registrados.
 *
 * Cada entreno: tile de fecha (día + día de semana) + nombre + meta
 * (ejercicios · series · volumen). Al tocarlo se despliega el detalle con una
 * mini-tabla por ejercicio (SERIE · KG · REPS) para que no haya ambigüedad
 * sobre qué número es el peso y cuál las repeticiones.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronDown, Trophy } from "lucide-react";
import { SessionDetail } from "@/hooks/useWorkoutDetails";

interface WorkoutHistoryListProps {
  sessions: SessionDetail[];
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const dayNumber = (d: string) => new Date(d + "T00:00:00").getDate();
const weekdayShort = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "");
const monthLabel = (d: string) => {
  const dt = new Date(d + "T00:00:00");
  return `${cap(dt.toLocaleDateString("es-AR", { month: "long" }))} ${dt.getFullYear()}`;
};

const SessionRow = ({ session }: { session: SessionDetail }) => {
  const [open, setOpen] = useState(false);
  const hasDetail = session.exercises.length > 0;

  return (
    <div className="rounded-xl bg-secondary/30 border border-white/[0.05] overflow-hidden">
      <button
        onClick={() => hasDetail && setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 p-2.5 text-left ${
          hasDetail ? "active:scale-[0.99] transition-transform" : "cursor-default"
        }`}
      >
        {/* Tile de fecha */}
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0 leading-none">
          <span className="text-base font-black text-foreground tabular-nums">{dayNumber(session.date)}</span>
          <span className="text-[9px] font-bold text-primary uppercase tracking-wide mt-0.5">
            {weekdayShort(session.date)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{session.name}</p>
          <p className="text-xs text-muted-foreground">
            {session.exerciseCount > 0 ? `${session.exerciseCount} ejercicios` : "Entreno"}
            {session.setCount > 0 && ` · ${session.setCount} series`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {session.tonnage != null && session.tonnage > 0 && (
            <div className="text-right">
              <p className="text-sm font-bold text-foreground tabular-nums leading-none">
                {Math.round(session.tonnage).toLocaleString("es-AR")}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">kg vol.</p>
            </div>
          )}
          {hasDetail && (
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-2.5 pb-3 pt-0 space-y-3">
              {session.exercises.map((ex) => {
                const bodyweight = ex.topWeight == null; // ningún peso cargado → peso corporal
                return (
                  <div key={ex.name} className="rounded-lg bg-background/50 border border-white/[0.05] p-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-xs font-bold text-foreground truncate">{ex.name}</p>
                      {bodyweight ? (
                        <span className="shrink-0 text-[10px] font-bold text-sky-400 bg-sky-400/10 border border-sky-400/20 rounded-md px-1.5 py-0.5">
                          Peso corporal
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 shrink-0 text-[10px] font-bold text-amber-400">
                          <Trophy className="w-3 h-3" />
                          {ex.topWeight} kg
                        </span>
                      )}
                    </div>

                    {bodyweight ? (
                      // Sin peso → tabla SERIE · REPS
                      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Serie</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider text-right">Reps</span>
                        {ex.sets.map((set, i) => (
                          <BodyweightRow key={i} index={i + 1} reps={set.reps} />
                        ))}
                      </div>
                    ) : (
                      // Con peso → tabla SERIE · KG · REPS
                      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 text-[11px]">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Serie</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider text-right">Kg</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider text-right">Reps</span>
                        {ex.sets.map((set, i) => (
                          <FragmentRow key={i} index={i + 1} weight={set.weight} reps={set.reps} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Fila de la mini-tabla con peso (3 celdas del grid). */
const FragmentRow = ({ index, weight, reps }: { index: number; weight: number | null; reps: number }) => (
  <>
    <span className="text-muted-foreground tabular-nums">{index}</span>
    <span className="font-bold text-foreground tabular-nums text-right">
      {weight != null ? weight : <span className="text-muted-foreground/60">—</span>}
    </span>
    <span className="font-semibold text-foreground tabular-nums text-right">{reps}</span>
  </>
);

/** Fila de la mini-tabla a peso corporal (2 celdas del grid). */
const BodyweightRow = ({ index, reps }: { index: number; reps: number }) => (
  <>
    <span className="text-muted-foreground tabular-nums">{index}</span>
    <span className="font-semibold text-foreground tabular-nums text-right">{reps}</span>
  </>
);

const WorkoutHistoryList = ({ sessions }: WorkoutHistoryListProps) => {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? sessions : sessions.slice(0, 8);

  // Agrupar por mes (las sesiones ya vienen ordenadas de más reciente a más vieja)
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: SessionDetail[] }>();
    for (const s of visible) {
      const key = s.date.slice(0, 7);
      let g = map.get(key);
      if (!g) {
        g = { label: monthLabel(s.date), items: [] };
        map.set(key, g);
      }
      g.items.push(s);
    }
    return [...map.values()];
  }, [visible]);

  if (sessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="accent-bar" />
          <History className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-black tracking-tight text-foreground">Entrenos hechos</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-6">
          Cuando completes un entreno va a aparecer acá
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="accent-bar" />
        <History className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-black tracking-tight text-foreground">Entrenos hechos</h3>
        <span className="ml-auto text-xs font-bold text-muted-foreground tabular-nums">{sessions.length}</span>
      </div>

      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="flex items-center gap-2 mb-2 px-0.5">
              <span className="text-[11px] font-black text-foreground/80 uppercase tracking-wider">{g.label}</span>
              <span className="text-[11px] text-muted-foreground">
                {g.items.length} {g.items.length === 1 ? "entreno" : "entrenos"}
              </span>
              <span className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <div className="space-y-2">
              {g.items.map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {sessions.length > 8 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="w-full mt-4 py-2 rounded-xl text-xs font-bold text-primary bg-primary/10 border border-primary/20 active:scale-[0.99] transition-transform"
        >
          {showAll ? "Ver menos" : `Ver los ${sessions.length} entrenos`}
        </button>
      )}
    </motion.div>
  );
};

export default WorkoutHistoryList;
