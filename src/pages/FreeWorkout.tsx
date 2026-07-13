/**
 * Entreno libre — el alumno arma su propio entrenamiento (fuera del plan del
 * coach): agrega ejercicios escribiendo el nombre (o desde recientes), carga
 * series con peso × reps y se guarda LOCAL (alimenta historial, PRs y "la vez
 * pasada"). Estilo "empty workout" de Hevy.
 */
import { useState, useEffect, useRef, useMemo, type FocusEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Check, X, Dumbbell, Clock, Search, Info, Play } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";
import { logSet, getLastPerformance } from "@/lib/workoutLog";
import { getRecentFreeExercises, recordFreeExercise } from "@/lib/freeExercises";
import { saveCheckIn, type CheckInData } from "@/lib/checkins";
import WorkoutCheckIn from "@/components/workout/WorkoutCheckIn";
import ExerciseDetailModal from "@/components/workout/ExerciseDetailModal";
import { useExerciseLibrary, type LibraryExercise } from "@/hooks/useExerciseLibrary";
import { getLocalDateString } from "@/lib/date";

interface SetEntry {
  setNumber: number;
  weight: number;
  reps: number;
}
interface FreeExercise {
  id: string;
  name: string;
  sets: SetEntry[];
  /** Grupo muscular, si vino de la biblioteca real. */
  muscle?: string | null;
  /** Ejercicio de la biblioteca (para ver su detalle/video). Ausente si es texto libre. */
  library?: LibraryExercise;
}

const slugify = (name: string) => "free:" + name.trim().toLowerCase().replace(/\s+/g, "-");
const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

/* ── Card de un ejercicio del entreno libre ── */
const FreeExerciseCard = ({
  ex,
  studentId,
  onAddSet,
  onRemove,
  onInfo,
}: {
  ex: FreeExercise;
  studentId: string;
  onAddSet: (weight: number, reps: number) => void;
  onRemove: () => void;
  onInfo?: () => void;
}) => {
  const today = getLocalDateString();
  const last = getLastPerformance(studentId, ex.id, today);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const weightRef = useRef<HTMLInputElement>(null);
  const repsRef = useRef<HTMLInputElement>(null);

  // Trae el input enfocado por encima del teclado y de la barra fija
  const focusScroll = (e: FocusEvent<HTMLInputElement>) => {
    e.target.select();
    setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
  };

  // Precargar con la serie anterior de la sesión o la última vez
  useEffect(() => {
    const prev = ex.sets.length ? ex.sets[ex.sets.length - 1] : null;
    const w = prev?.weight ?? last?.weight;
    const r = prev?.reps ?? last?.reps;
    setWeight(w != null ? String(w) : "");
    setReps(r != null ? String(r) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex.sets.length]);

  const add = () => {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || 0;
    if (r <= 0) {
      toast.error("Ingresá las repeticiones");
      return;
    }
    onAddSet(w, r);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
            <Dumbbell className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-foreground truncate">{ex.name}</h3>
            {ex.muscle && (
              <p className="text-[11px] font-semibold text-primary capitalize truncate">{ex.muscle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onInfo && (
            <button onClick={onInfo} aria-label="Ver detalle del ejercicio" className="text-muted-foreground p-1 active:text-foreground">
              <Info className="w-4 h-4" />
            </button>
          )}
          <button onClick={onRemove} aria-label="Quitar ejercicio" className="text-muted-foreground p-1 active:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Series cargadas */}
      {ex.sets.length > 0 && (
        <div className="space-y-1 mb-2.5">
          {ex.sets.map((s) => (
            <div
              key={s.setNumber}
              className="grid grid-cols-[1.75rem_1fr_1fr_1.75rem] gap-2 items-center rounded-lg bg-emerald-500/10 px-1 py-1.5"
            >
              <span className="text-center text-xs font-bold text-emerald-500">{s.setNumber}</span>
              <span className="text-center text-base font-bold text-foreground tabular-nums">{s.weight} kg</span>
              <span className="text-center text-base font-bold text-foreground tabular-nums">{s.reps} reps</span>
              <Check className="w-4 h-4 text-emerald-500 mx-auto" strokeWidth={3} />
            </div>
          ))}
        </div>
      )}

      {/* Fila de carga */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.75rem] gap-2 items-end">
        <label className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Peso (kg)</span>
          <input
            ref={weightRef}
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onFocus={focusScroll}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                repsRef.current?.focus();
              }
            }}
            enterKeyHint="next"
            placeholder="0"
            className="w-full min-w-0 h-11 rounded-lg bg-secondary border border-border text-center text-base font-bold text-foreground focus:border-primary focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Reps</span>
          <input
            ref={repsRef}
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            onFocus={focusScroll}
            onKeyDown={(e) => e.key === "Enter" && add()}
            enterKeyHint="done"
            placeholder="0"
            className="w-full min-w-0 h-11 rounded-lg bg-secondary border border-border text-center text-base font-bold text-foreground focus:border-primary focus:outline-none"
          />
        </label>
        <button
          onClick={add}
          aria-label="Registrar serie"
          className="h-11 rounded-lg bg-primary flex items-center justify-center active:scale-95 transition-transform"
        >
          <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
        </button>
      </div>

      {last && (
        <p className="text-xs text-muted-foreground mt-1.5 tabular-nums">
          Anterior: {last.weight}kg × {last.reps}
        </p>
      )}
    </motion.div>
  );
};

const FreeWorkout = () => {
  const navigate = useNavigate();
  const { student, isAdminMode } = useAuthContext();
  const studentId = student?.id || (isAdminMode ? "admin" : "anon");

  // Biblioteca real de ejercicios (degrada suave: si no hay datos, sigue el texto libre)
  const { exercises: library, loading: libraryLoading } = useExerciseLibrary();

  const [exercises, setExercises] = useState<FreeExercise[]>([]);
  const [newName, setNewName] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [detail, setDetail] = useState<LibraryExercise | null>(null);
  const [recent] = useState<string[]>(() => getRecentFreeExercises(studentId));

  // Cronómetro
  useEffect(() => {
    const id = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Resultados de la biblioteca filtrados por lo que escribe el alumno
  const query = newName.trim().toLowerCase();
  const results = useMemo(() => {
    if (!query) return [];
    return library
      .filter(
        (e) => e.name.toLowerCase().includes(query) || (e.muscle || "").toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [library, query]);
  // ¿El texto coincide EXACTO con un ejercicio de la biblioteca? (define si ofrecemos el custom)
  const hasExact = query.length > 0 && library.some((e) => e.name.toLowerCase() === query);

  // Agrega un ejercicio de la biblioteca real (con su músculo/detalle)
  const addFromLibrary = (lib: LibraryExercise) => {
    if (exercises.some((e) => e.id === lib.id)) {
      toast.info("Ese ejercicio ya está en el entreno");
      setNewName("");
      return;
    }
    recordFreeExercise(studentId, lib.name);
    setExercises((prev) => [...prev, { id: lib.id, name: lib.name, sets: [], muscle: lib.muscle, library: lib }]);
    setNewName("");
  };

  // Fallback texto libre: agrega un ejercicio custom que no está en la biblioteca
  const addFreeText = (rawName: string) => {
    const name = rawName.trim();
    if (!name) return;
    const id = slugify(name);
    if (exercises.some((e) => e.id === id)) {
      toast.info("Ese ejercicio ya está en el entreno");
      setNewName("");
      return;
    }
    recordFreeExercise(studentId, name);
    setExercises((prev) => [...prev, { id, name, sets: [] }]);
    setNewName("");
  };

  // Agrega por nombre (recientes / Enter): prioriza la biblioteca si hay match exacto
  const addByName = (rawName: string) => {
    const name = rawName.trim();
    if (!name) return;
    const lib = library.find((e) => e.name.toLowerCase() === name.toLowerCase());
    if (lib) return addFromLibrary(lib);
    addFreeText(name);
  };

  // Enter en el buscador: primer resultado de biblioteca, o texto libre
  const submitSearch = () => {
    if (results.length > 0) return addFromLibrary(results[0]);
    addByName(newName);
  };

  const addSet = (exIndex: number, weight: number, reps: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex;
        const setNumber = ex.sets.length + 1;
        logSet(studentId, { exerciseId: ex.id, date: getLocalDateString(), setNumber, weight, reps });
        return { ...ex, sets: [...ex.sets, { setNumber, weight, reps }] };
      })
    );
  };

  const removeExercise = (exIndex: number) =>
    setExercises((prev) => prev.filter((_, i) => i !== exIndex));

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);

  const finish = () => {
    if (totalSets === 0) {
      toast.error("Cargá al menos una serie para terminar");
      return;
    }
    setShowCheckIn(true);
  };

  const completeWorkout = (checkIn: CheckInData | null) => {
    setShowCheckIn(false);
    if (checkIn) {
      saveCheckIn(studentId, { date: getLocalDateString(), workoutName: "Entreno libre", ...checkIn });
    }
    const volume = exercises.reduce(
      (a, e) => a + e.sets.reduce((s, x) => s + x.weight * x.reps, 0),
      0
    );
    navigate("/workout-summary", {
      state: {
        summaryData: {
          workoutName: "Entreno libre",
          duration: elapsed,
          exercisesCompleted: exercises.filter((e) => e.sets.length > 0).length,
          totalExercises: exercises.length,
          setsCompleted: totalSets,
          totalSets,
          caloriesBurned: Math.round((elapsed / 60) * 7.5),
          totalVolume: volume,
        },
      },
    });
  };

  const recentToShow = recent
    .filter((n) => !exercises.some((e) => e.id === slugify(n) || e.name.toLowerCase() === n.toLowerCase()))
    .slice(0, 6);

  return (
    <motion.div className="min-h-screen bg-background pb-44" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-white/[0.06]">
        {/* header-safe-lg suma env(safe-area-inset-top) para no quedar bajo la isla */}
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-5 pb-3 header-safe-lg">
          <button onClick={() => navigate(-1)} className="text-muted-foreground" aria-label="Volver">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Entreno libre</p>
            <h1 className="text-lg font-black text-foreground leading-tight">Tu sesión</h1>
          </div>
          <div className="flex items-center gap-1.5 text-foreground font-black tabular-nums">
            <Clock className="w-4 h-4 text-primary" />
            {fmt(elapsed)}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pt-5 space-y-4">
        {/* Agregar ejercicio — buscá en la biblioteca real o cargá uno custom */}
        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="accent-bar" />
            <h2 className="text-sm font-black text-foreground tracking-tight">Agregar ejercicio</h2>
          </div>

          {/* Buscador de la biblioteca */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              enterKeyHint="done"
              placeholder="Buscá en la biblioteca…"
              className="w-full min-w-0 h-11 pl-11 pr-10 rounded-xl bg-secondary border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
            />
            {newName && (
              <button
                onClick={() => setNewName("")}
                aria-label="Limpiar"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground active:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Resultados de la biblioteca */}
          {query && (
            <div className="mt-3 space-y-1.5">
              {results.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-2 rounded-xl bg-secondary/60 border border-white/[0.06] pr-1.5"
                >
                  <button
                    onClick={() => addFromLibrary(ex)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 p-2 text-left active:opacity-70"
                  >
                    <div className="w-9 h-9 rounded-lg bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                      {ex.thumbnailUrl ? (
                        <img src={ex.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Dumbbell className="w-4 h-4 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{ex.name}</p>
                      {ex.muscle && (
                        <p className="text-[11px] font-semibold text-primary capitalize truncate">{ex.muscle}</p>
                      )}
                    </div>
                    {ex.videoUrl && <Play className="w-3.5 h-3.5 text-muted-foreground fill-current shrink-0 ml-auto" />}
                  </button>
                  <button
                    onClick={() => setDetail(ex)}
                    aria-label="Ver detalle"
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground active:text-foreground"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {libraryLoading && results.length === 0 && (
                <p className="text-xs text-muted-foreground px-1 py-1">Buscando en la biblioteca…</p>
              )}

              {/* Fallback texto libre: agregar como custom lo que no está en la biblioteca */}
              {!hasExact && (
                <button
                  onClick={() => addByName(newName)}
                  className="flex items-center gap-2.5 w-full rounded-xl border border-dashed border-border p-2 text-left active:opacity-70"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">Agregar “{newName.trim()}”</p>
                    <p className="text-[11px] font-semibold text-muted-foreground">Ejercicio custom</p>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Recientes — solo cuando no estás buscando */}
          {!query && recentToShow.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {recentToShow.map((n) => (
                <button
                  key={n}
                  onClick={() => addByName(n)}
                  className="px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-white/[0.06] text-xs font-semibold text-muted-foreground active:text-foreground"
                >
                  + {n}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ejercicios */}
        <AnimatePresence>
          {exercises.map((ex, i) => (
            <FreeExerciseCard
              key={ex.id}
              ex={ex}
              studentId={studentId}
              onAddSet={(w, r) => addSet(i, w, r)}
              onRemove={() => removeExercise(i)}
              onInfo={ex.library ? () => setDetail(ex.library!) : undefined}
            />
          ))}
        </AnimatePresence>

        {exercises.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <Dumbbell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Agregá tu primer ejercicio para empezar</p>
          </div>
        )}
      </div>

      {/* Botón finalizar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-5 pt-10 bg-gradient-to-t from-background via-background to-transparent pointer-events-none"
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <motion.button
            onClick={finish}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-black uppercase tracking-wide shadow-lg glow-primary flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={totalSets === 0}
          >
            <Check className="w-5 h-5" />
            Finalizar ({totalSets} {totalSets === 1 ? "serie" : "series"})
          </motion.button>
        </div>
      </div>

      {/* Detalle del ejercicio de la biblioteca (video / técnica) */}
      <ExerciseDetailModal exercise={detail} onClose={() => setDetail(null)} />

      {/* Check-in post-entreno */}
      <WorkoutCheckIn
        open={showCheckIn}
        onComplete={completeWorkout}
        onSkip={() => completeWorkout(null)}
      />
    </motion.div>
  );
};

export default FreeWorkout;
