/**
 * Selector de ejercicios de la biblioteca para el alumno, en dos modos:
 * "replace" (cambia uno del día por otro, respetando la prescripción del coach)
 * y "add" (suma uno extra al final, y ahí sí el alumno define series/reps/descanso).
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Dumbbell, Minus, Plus, Check } from "lucide-react";
import { useExerciseLibrary } from "@/hooks/useExerciseLibrary";
import type { LibraryExercise } from "@/hooks/useExerciseLibrary";
import LoadingSpinner from "@/components/ui/loading-spinner";

export interface ExercisePickerResult {
  exercise: LibraryExercise;
  /** solo en mode="add": prescripción elegida por el alumno */
  sets: number;
  reps: string;
  restSeconds: number;
}

interface ExercisePickerSheetProps {
  open: boolean;
  mode: "replace" | "add";
  /** nombre del ejercicio que se está cambiando (solo mode="replace", para el subtítulo) */
  currentName?: string;
  /** músculo del ejercicio actual: si viene, el sheet arranca filtrado por ese músculo (mode="replace") */
  suggestedMuscle?: string | null;
  /**
   * id de biblioteca del ejercicio que se está haciendo ahora: se saca de la
   * lista. Si no, al cambiar por segunda vez aparece primero el que ya tenés
   * puesto, lo tocás y no pasa nada — parece que el cambio no funciona.
   */
  excludeExerciseId?: string | null;
  onSelect: (result: ExercisePickerResult) => void;
  onClose: () => void;
}

// Defaults conservadores: si el alumno agrega algo por su cuenta, que sea un bloque estándar
const DEFAULT_SETS = 3;
const DEFAULT_REPS = "8-12";
const DEFAULT_REST = 90;
const REST_STEP = 15;

const fmtRest = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// Sin acentos ni mayúsculas: el alumno escribe "biceps" y tiene que encontrar "Bíceps"
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

const ExercisePickerSheet = ({
  open,
  mode,
  currentName,
  suggestedMuscle,
  excludeExerciseId,
  onSelect,
  onClose,
}: ExercisePickerSheetProps) => {
  const { exercises, loading, error } = useExerciseLibrary();

  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [presuggested, setPresuggested] = useState(false);
  const [selected, setSelected] = useState<LibraryExercise | null>(null);
  const [sets, setSets] = useState(DEFAULT_SETS);
  const [reps, setReps] = useState(DEFAULT_REPS);
  const [restSeconds, setRestSeconds] = useState(DEFAULT_REST);

  const muscles = useMemo(
    () =>
      [...new Set(exercises.map((e) => e.muscle).filter((m): m is string => !!m))].sort((a, b) =>
        a.localeCompare(b, "es")
      ),
    [exercises]
  );

  // Reset al abrir: el sheet se reusa entre ejercicios, no queremos arrastrar la selección anterior
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelected(null);
    setMuscleFilter(null);
    setPresuggested(false);
    setSets(DEFAULT_SETS);
    setReps(DEFAULT_REPS);
    setRestSeconds(DEFAULT_REST);
  }, [open]);

  // Prefiltro por el músculo del ejercicio a reemplazar = alternativas útiles de una.
  // Va aparte del reset porque la biblioteca puede llegar después de abierto el sheet.
  useEffect(() => {
    if (!open || !suggestedMuscle || muscles.length === 0) return;
    const match = muscles.find((m) => norm(m) === norm(suggestedMuscle));
    if (!match) return;
    setMuscleFilter((cur) => cur ?? match);
    setPresuggested(true);
  }, [open, suggestedMuscle, muscles]);

  const results = useMemo(() => {
    const q = norm(query.trim());
    const filtered = exercises.filter((e) => {
      if (excludeExerciseId && e.id === excludeExerciseId) return false;
      if (muscleFilter && e.muscle !== muscleFilter) return false;
      if (q && !norm(e.name).includes(q)) return false;
      return true;
    });
    // Sin filtros la lista completa marea: mostramos una muestra corta hasta que busque
    const hasFilter = !!q || !!muscleFilter;
    return filtered.slice(0, hasFilter ? 40 : 12);
  }, [exercises, query, muscleFilter, excludeExerciseId]);

  const handleRowClick = (ex: LibraryExercise) => {
    // En "replace" la prescripción la manda el coach, así que resolvemos en un solo toque
    if (mode === "replace") {
      onSelect({ exercise: ex, sets: 0, reps: "", restSeconds: 0 });
      onClose();
      return;
    }
    setSelected((cur) => (cur?.id === ex.id ? null : ex));
  };

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md card-elevated rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h2 className="text-xl font-black text-foreground leading-tight">
                  {mode === "replace" ? "Cambiar ejercicio" : "Agregar ejercicio"}
                </h2>
                <p className="text-sm text-muted-foreground leading-snug mt-0.5">
                  {mode === "replace"
                    ? `En lugar de "${currentName ?? ""}". Se mantienen las series y reps que puso tu coach.`
                    : "Se suma al final del día, solo por hoy."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="text-muted-foreground p-1 -mr-1 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                enterKeyHint="search"
                placeholder="Buscá en la biblioteca…"
                className="w-full min-w-0 h-11 pl-11 pr-10 rounded-xl bg-secondary border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground active:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Chips por grupo muscular — explorar sin saber el nombre exacto */}
            {muscles.length > 0 && (
              <div className="-mx-1 px-1 mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  type="button"
                  onClick={() => {
                    setMuscleFilter(null);
                    setPresuggested(false);
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${
                    !muscleFilter
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/60 text-muted-foreground border-white/[0.06]"
                  }`}
                >
                  Todos
                </button>
                {muscles.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMuscleFilter((cur) => (cur === m ? null : m));
                      setPresuggested(false);
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap capitalize border transition-colors ${
                      muscleFilter === m
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/60 text-muted-foreground border-white/[0.06]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {/* Aviso de que el filtro no lo puso el alumno, sino nosotros */}
            {presuggested && muscleFilter && (
              <p className="mt-2 text-[11px] font-semibold text-primary capitalize">
                Alternativas de {muscleFilter}
              </p>
            )}

            {/* Resultados */}
            <div className="mt-3 space-y-1.5">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              )}

              {!loading && error && (
                <p className="text-xs text-muted-foreground px-1 py-6 text-center">
                  No pudimos cargar la biblioteca. Probá de nuevo en un rato.
                </p>
              )}

              {!loading && !error && results.length === 0 && (
                <p className="text-xs text-muted-foreground px-1 py-6 text-center">
                  No encontramos ejercicios con ese nombre
                </p>
              )}

              {!loading &&
                !error &&
                results.map((ex) => {
                  const isSelected = selected?.id === ex.id;
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => handleRowClick(ex)}
                      className={`flex items-center gap-2.5 w-full rounded-xl border p-2 text-left transition-colors active:opacity-70 ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "bg-secondary/60 border-white/[0.06]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                        {ex.thumbnailUrl ? (
                          <img src={ex.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Dumbbell className="w-4 h-4 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-foreground truncate">{ex.name}</p>
                        <p className="text-[11px] text-muted-foreground capitalize truncate">
                          {[ex.muscle, ex.equipment].filter(Boolean).join(" · ") || "Sin datos"}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
            </div>

            {/* Prescripción — solo en "add", una vez que eligió cuál agregar */}
            {mode === "add" && selected && (
              <div className="mt-4 rounded-2xl bg-secondary/40 border border-white/[0.06] p-4 space-y-3">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.14em]">
                  Cómo lo hacés
                </p>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-foreground">Series</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Quitar una serie"
                      onClick={() => setSets((s) => clamp(s - 1, 1, 10))}
                      className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground active:opacity-70"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-black tabular-nums text-foreground">{sets}</span>
                    <button
                      type="button"
                      aria-label="Agregar una serie"
                      onClick={() => setSets((s) => clamp(s + 1, 1, 10))}
                      className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground active:opacity-70"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Texto libre: acepta "8-12", "al fallo", "12 por lado" */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-foreground">Reps</span>
                  <input
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    inputMode="text"
                    enterKeyHint="done"
                    placeholder="8-12"
                    aria-label="Repeticiones"
                    className="w-28 h-9 rounded-lg bg-secondary border border-border px-3 text-sm font-bold text-center text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-foreground">Descanso</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Menos descanso"
                      onClick={() => setRestSeconds((r) => clamp(r - REST_STEP, 15, 300))}
                      className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground active:opacity-70"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-black tabular-nums text-foreground">
                      {fmtRest(restSeconds)}
                    </span>
                    <button
                      type="button"
                      aria-label="Más descanso"
                      onClick={() => setRestSeconds((r) => clamp(r + REST_STEP, 15, 300))}
                      className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground active:opacity-70"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onSelect({
                      exercise: selected,
                      sets,
                      // Si borró el campo, cae al default para no guardar reps vacías
                      reps: reps.trim() || DEFAULT_REPS,
                      restSeconds,
                    })
                  }
                  className="w-full py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold active:scale-[0.99] transition-transform"
                >
                  Agregar al entreno
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExercisePickerSheet;
