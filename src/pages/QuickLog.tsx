/**
 * Anotador — anotar kilos y repeticiones sueltos, sin abrir un entreno.
 *
 * El entreno libre ya guardaba series, pero obliga a montar una sesión: si
 * estás en el gimnasio y querés dejar asentado "sentadilla 100 × 8" y seguir,
 * es demasiada ceremonia. Acá se anota en tres campos y queda.
 *
 * Escribe en el MISMO registro local que el resto de la app (`workoutLog`), así
 * que lo que anotás también alimenta "la vez pasada" y los PRs del ejercicio.
 * Todo local: la base está congelada.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, NotebookPen, Trash2, History } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  logSet,
  deleteLoggedSet,
  getLoggedHistory,
  getLastPerformance,
  countSetsOn,
  freeExerciseId,
} from "@/lib/workoutLog";
import { getRecentFreeExercises, recordFreeExercise } from "@/lib/freeExercises";
import { getLocalDateString, parseLocalDateString } from "@/lib/date";
import { staggerContainer, fadeUp } from "@/lib/animations";

/** "Hoy" / "Ayer" / "lun 25 ago" — leer una fecha ISO cuesta más que reconocerla. */
const dayLabel = (date: string, today: string) => {
  if (date === today) return "Hoy";
  const ayer = parseLocalDateString(today);
  ayer.setDate(ayer.getDate() - 1);
  if (date === getLocalDateString(ayer)) return "Ayer";
  return parseLocalDateString(date).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

export default function QuickLog() {
  const navigate = useNavigate();
  const { student, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");
  const today = getLocalDateString();

  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  // El historial se re-lee en cada render en vez de vivir en estado: la fuente
  // es localStorage y así no puede quedar desincronizado con lo que se anota.
  // `refrescar` sólo existe para provocar ese render.
  const [, bump] = useState(0);
  const refrescar = () => bump((v) => v + 1);

  const history = getLoggedHistory(sid);
  const recientes = getRecentFreeExercises(sid);

  const trimmed = name.trim();
  const lastTime = trimmed ? getLastPerformance(sid, freeExerciseId(trimmed)) : null;

  const anotar = () => {
    if (!trimmed) {
      toast.error("¿Qué ejercicio hiciste?");
      return;
    }
    const kg = Number(weight);
    const rp = Math.round(Number(reps));
    if (weight.trim() === "" || !Number.isFinite(kg) || kg < 0) {
      toast.error("Poné los kilos");
      return;
    }
    if (!Number.isFinite(rp) || rp < 1) {
      toast.error("Poné cuántas repeticiones");
      return;
    }

    const exerciseId = freeExerciseId(trimmed);
    logSet(sid, {
      exerciseId,
      date: today,
      setNumber: countSetsOn(sid, exerciseId, today) + 1,
      weight: kg,
      reps: rp,
      name: trimmed,
    });
    recordFreeExercise(sid, trimmed);
    refrescar();
    if (navigator.vibrate) navigator.vibrate(10);
    toast.success(`${trimmed} · ${kg} kg × ${rp}`);
    // El ejercicio y el peso quedan puestos: lo normal es anotar la serie
    // siguiente del mismo ejercicio, no empezar de cero.
    setReps("");
  };

  const borrar = (exerciseId: string, date: string, setNumber: number, label: string) => {
    deleteLoggedSet(sid, exerciseId, date, setNumber);
    refrescar();
    toast(`${label} borrada`);
  };

  const campo =
    "w-full min-h-12 rounded-xl bg-background border border-white/10 px-4 text-lg font-black text-foreground tabular-nums focus:border-primary/60 focus:outline-none";

  return (
    <AppShell>
      <PageHeader
        eyebrow={
          <>
            <NotebookPen className="w-3.5 h-3.5" />
            Registro libre
          </>
        }
        title="Anotador"
        subtitle="Anotá una serie y seguí entrenando"
        left={
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground -ml-2 w-11 h-11 flex items-center justify-center"
            aria-label="Volver"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        }
      />

      <motion.div
        className="min-h-screen bg-background pb-nav lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-2xl mx-auto px-5 pt-5 space-y-4">
          {/* Anotar */}
          <motion.div variants={fadeUp} className="card-hero rounded-3xl p-5 space-y-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Ejercicio
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sentadilla"
                className="w-full min-h-12 rounded-xl bg-background border border-white/10 px-4 text-lg font-bold text-foreground focus:border-primary/60 focus:outline-none"
              />
            </label>

            {recientes.length > 0 && (
              <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-0.5">
                {recientes.map((r) => (
                  <button
                    key={r}
                    onClick={() => setName(r)}
                    className={`shrink-0 min-h-11 px-3 rounded-xl border text-sm font-bold transition-colors ${
                      trimmed.toLowerCase() === r.toLowerCase()
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-secondary/40 border-white/[0.06] text-foreground/70"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {lastTime && (
              <p className="text-sm text-foreground/70 tabular-nums">
                La vez pasada:{" "}
                <span className="font-bold text-foreground">
                  {lastTime.weight} kg × {lastTime.reps}
                </span>
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Kilos
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="100"
                  className={campo}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Repeticiones
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => e.key === "Enter" && anotar()}
                  placeholder="8"
                  className={campo}
                />
              </label>
            </div>

            <button
              onClick={anotar}
              className="w-full min-h-12 rounded-2xl bg-gradient-primary text-primary-foreground font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <NotebookPen className="w-5 h-5" /> Anotar serie
            </button>
          </motion.div>

          {/* Historial */}
          {history.length === 0 ? (
            <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary/60 border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                <History className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-base font-black text-foreground mb-1">Todavía no anotaste nada</p>
              <p className="text-sm text-foreground/70 max-w-xs mx-auto">
                Lo que anotes queda acá, y también cuenta como "la vez pasada" del ejercicio.
              </p>
            </motion.div>
          ) : (
            history.map((day) => (
              <motion.div key={day.date} variants={fadeUp} className="space-y-2">
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="accent-bar" />
                    <h3 className="text-sm font-black text-foreground tracking-tight capitalize">
                      {dayLabel(day.date, today)}
                    </h3>
                  </div>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {day.sets.length} {day.sets.length === 1 ? "serie" : "series"}
                  </span>
                </div>

                <div className="card-elevated rounded-2xl divide-y divide-white/[0.06]">
                  {day.sets.map((s) => (
                    <div
                      key={`${s.exerciseId}-${s.setNumber}`}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-foreground truncate">{s.name}</p>
                        <p className="text-sm text-foreground/70 tabular-nums">
                          {s.weight} kg × {s.reps}
                        </p>
                      </div>
                      <button
                        onClick={() => borrar(s.exerciseId, s.date, s.setNumber, s.name)}
                        aria-label={`Borrar ${s.name}`}
                        className="shrink-0 w-11 h-11 flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}

          {/* Para una sesión entera, el entreno libre sigue siendo el lugar. */}
          <motion.button
            variants={fadeUp}
            onClick={() => navigate("/free-workout")}
            className="w-full text-left rounded-2xl card-elevated p-4 flex items-center gap-3.5 active:scale-[0.99] hover:bg-secondary/30 transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
                ¿Entrenás entero?
              </p>
              <p className="text-base font-semibold text-foreground">Abrir un entreno suelto</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </motion.button>
        </div>
      </motion.div>
    </AppShell>
  );
}
