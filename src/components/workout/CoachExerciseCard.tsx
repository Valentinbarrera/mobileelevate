/**
 * Tarjeta de ejercicio para el entrenamiento activo (estilo Hevy).
 * Registro de series INLINE: columna "ANTERIOR" precargada, inputs de
 * kg/reps con valores sugeridos, y un ✓ de un solo toque por serie.
 * Incluye calculadora de discos y aviso de PR en vivo.
 */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Play, ChevronDown, ChevronUp, Dumbbell, Calculator } from "lucide-react";
import { toast } from "sonner";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
import { PrescriptionStrip, TechniqueBlock } from "./ExerciseMeta";
import { calcPlates } from "@/lib/plates";
import { getLastPerformance, getPR } from "@/lib/workoutLog";
import { getLocalDateString } from "@/lib/date";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

interface CoachExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number | null;
  rir?: number | null;
  tempo?: string | null;
  method?: string | null;
  notes: string | null;
  videoUrl: string | null;
  thumbnail: string | null;
  muscleGroup: string | null;
  equipment: string | null;
  description?: string | null;
  instructions?: string[] | null;
}

interface CompletedSet {
  setNumber: number;
  weight: number;
  reps: number;
  difficulty: string;
  completedAt: Date;
}

interface ExerciseState {
  id: string;
  completed: boolean;
  currentSet: number;
  completedSets: CompletedSet[];
}

interface CoachExerciseCardProps {
  exercise: CoachExercise;
  state: ExerciseState;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onCompleteSet: (
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number,
    difficulty: string
  ) => Promise<boolean>;
}

interface PerformanceRecord {
  weight?: number;
  reps?: number;
  maxWeight?: number;
  maxReps?: number;
}

const parseFirstRep = (reps: string): number | null => {
  const m = reps?.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
};

const CoachExerciseCard = ({
  exercise,
  state,
  index,
  isActive,
  onSelect,
  onCompleteSet,
}: CoachExerciseCardProps) => {
  const { student, isAdminMode } = useAuthContext();
  const [showVideo, setShowVideo] = useState(false);
  const [expanded, setExpanded] = useState(isActive);
  const [lastPerformance, setLastPerformance] = useState<PerformanceRecord | null>(null);
  const [personalRecord, setPersonalRecord] = useState<PerformanceRecord | null>(null);

  // Inputs de la serie actual
  const [editWeight, setEditWeight] = useState("");
  const [editReps, setEditReps] = useState("");
  const [logging, setLogging] = useState(false);
  const [showPlates, setShowPlates] = useState(false);

  useEffect(() => {
    const sid = student?.id || (isAdminMode ? "admin" : null);
    if (!sid || !exercise.id) return;

    // 1) Registro LOCAL primero (fuente práctica en modo sin permisos)
    const today = getLocalDateString();
    const localLast = getLastPerformance(sid, exercise.id, today);
    const localPr = getPR(sid, exercise.id, today);
    if (localLast) setLastPerformance({ weight: localLast.weight, reps: localLast.reps });
    if (localPr) setPersonalRecord({ maxWeight: localPr.maxWeight, maxReps: localPr.maxReps });

    // 2) Base de datos como complemento (solo alumno real con permisos)
    if (!student) return;

    supabase
      .from("completed_exercises")
      .select("weight, reps, completed_sessions!inner(student_id, date)")
      .eq("routine_exercise_id", exercise.id)
      .eq("completed_sessions.student_id", student.id)
      .limit(50)
      .then(({ data }) => {
        if (!data || data.length === 0) return;

        const sorted = [...data].sort((a, b) => {
          const dateA = (a.completed_sessions as { date: string } | null)?.date ?? "";
          const dateB = (b.completed_sessions as { date: string } | null)?.date ?? "";
          return dateB.localeCompare(dateA);
        });

        const last = sorted[0];
        if (last.weight && last.reps) {
          setLastPerformance({ weight: last.weight, reps: last.reps });
        }

        const pr = data.reduce((max, s) => ((s.weight ?? 0) > (max.weight ?? 0) ? s : max), data[0]);
        if (pr.weight && pr.reps) {
          setPersonalRecord({ maxWeight: pr.weight, maxReps: pr.reps });
        }
      });
  }, [student, isAdminMode, exercise.id]);

  const isCompleted = state.completed;
  const doneCount = state.completedSets.length;
  const currentSetNumber = doneCount + 1;

  // Serie anterior dentro de esta misma sesión (para autocompletar)
  const previousSetInSession = doneCount > 0 ? state.completedSets[doneCount - 1] : null;

  // Texto de la columna "ANTERIOR"
  const previousHint = useMemo(() => {
    if (lastPerformance?.weight && lastPerformance?.reps) {
      return `${lastPerformance.weight}×${lastPerformance.reps}`;
    }
    return "—";
  }, [lastPerformance]);

  // Precargar los inputs cuando avanza la serie o llegan los datos previos
  useEffect(() => {
    const w = previousSetInSession?.weight ?? lastPerformance?.weight;
    const r = previousSetInSession?.reps ?? lastPerformance?.reps ?? parseFirstRep(exercise.reps);
    setEditWeight(w != null ? String(w) : "");
    setEditReps(r != null ? String(r) : "");
    setShowPlates(false);
  }, [doneCount, lastPerformance, exercise.reps, previousSetInSession?.weight, previousSetInSession?.reps]);

  const plates = useMemo(() => calcPlates(parseFloat(editWeight) || 0), [editWeight]);

  const handleLogCurrent = async () => {
    const w = parseFloat(editWeight) || 0;
    const r = parseInt(editReps, 10) || 0;
    if (r <= 0) {
      toast.error("Ingresá las repeticiones");
      return;
    }
    setLogging(true);
    const ok = await onCompleteSet(exercise.id, currentSetNumber, w, r, "moderate");
    setLogging(false);
    if (ok && personalRecord?.maxWeight && w > personalRecord.maxWeight) {
      toast.success(`🏆 ¡Nuevo PR en ${exercise.name}! ${w} kg`);
      setPersonalRecord({ ...personalRecord, maxWeight: w });
    }
  };

  // Filas de la tabla (una por serie planificada)
  const rows = Array.from({ length: exercise.sets }, (_, i) => {
    const setNum = i + 1;
    const logged = state.completedSets[i];
    const isCurrent = i === doneCount && !isCompleted;
    return { setNum, logged, isCurrent };
  });

  return (
    <>
      <motion.div
        className={`relative bg-card border rounded-2xl overflow-hidden transition-all ${
          isActive
            ? "border-primary shadow-lg shadow-primary/10"
            : isCompleted
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-border"
        } ${isCompleted ? "opacity-80" : ""}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => {
          if (!isActive) onSelect();
          setExpanded(!expanded);
        }}
      >
        {/* Completed badge */}
        {isCompleted && (
          <motion.div
            className="absolute top-3 right-3 z-10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="p-4 flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isCompleted ? "bg-emerald-500" : isActive ? "bg-primary" : "bg-secondary"
            }`}
          >
            {isCompleted ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <span className={`text-sm font-bold ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}>
                {index + 1}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm truncate ${isCompleted ? "text-emerald-500" : "text-foreground"}`}>
              {exercise.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs ${isCompleted ? "text-emerald-500/70" : "text-muted-foreground"}`}>
                {doneCount}/{exercise.sets} series • {exercise.reps} reps
              </span>
              {isCompleted && (
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">✓ Listo</span>
              )}
            </div>
          </div>

          <button
            className="p-2"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 pb-4 space-y-3">
                {/* Prescripción del coach: series · reps · descanso · RIR · tempo · método */}
                <PrescriptionStrip
                  data={{
                    sets: exercise.sets,
                    reps: exercise.reps,
                    restSeconds: exercise.restSeconds,
                    rir: exercise.rir,
                    tempo: exercise.tempo,
                    method: exercise.method,
                  }}
                />

                {/* Video preview */}
                {exercise.videoUrl && (
                  <div
                    className="relative h-40 rounded-xl overflow-hidden bg-secondary cursor-pointer"
                    onClick={() => setShowVideo(true)}
                  >
                    {exercise.thumbnail ? (
                      <img src={exercise.thumbnail} alt={exercise.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Dumbbell className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary fill-current ml-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Coach notes */}
                {exercise.notes && (
                  <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
                    <p className="text-xs text-foreground">
                      <span className="font-medium">💡 Nota:</span> {exercise.notes}
                    </p>
                  </div>
                )}

                {/* Técnica / ejecución + paso a paso */}
                <TechniqueBlock description={exercise.description} instructions={exercise.instructions} />

                {/* ─── Tabla de series inline ─── */}
                <div className="space-y-1.5">
                  {/* Header de columnas */}
                  <div className="grid grid-cols-[1.75rem_3.5rem_1fr_1fr_2.75rem] gap-2 px-1 items-center text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span className="text-center">Set</span>
                    <span className="text-center">Antes</span>
                    <span className="text-center">Kg</span>
                    <span className="text-center">Reps</span>
                    <span />
                  </div>

                  {rows.map(({ setNum, logged, isCurrent }) => (
                    <div
                      key={setNum}
                      className={`grid grid-cols-[1.75rem_3.5rem_1fr_1fr_2.75rem] gap-2 items-center rounded-xl px-1 py-1.5 transition-colors ${
                        logged
                          ? "bg-emerald-500/10"
                          : isCurrent
                            ? "bg-primary/5 ring-1 ring-primary/30"
                            : "opacity-50"
                      }`}
                    >
                      {/* Set # */}
                      <span
                        className={`text-center text-sm font-bold ${
                          logged ? "text-emerald-500" : "text-muted-foreground"
                        }`}
                      >
                        {setNum}
                      </span>

                      {/* Anterior */}
                      <span className="text-center text-xs text-muted-foreground tabular-nums">
                        {previousHint}
                      </span>

                      {logged ? (
                        <>
                          <span className="text-center text-base font-bold text-foreground tabular-nums">
                            {logged.weight}
                          </span>
                          <span className="text-center text-base font-bold text-foreground tabular-nums">
                            {logged.reps}
                          </span>
                          <div className="flex justify-center">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                          </div>
                        </>
                      ) : isCurrent ? (
                        <>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={editWeight}
                            onChange={(e) => setEditWeight(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                            className="w-full h-11 rounded-lg bg-secondary border border-border text-center text-base font-bold text-foreground focus:border-primary focus:outline-none"
                          />
                          <input
                            type="number"
                            inputMode="numeric"
                            value={editReps}
                            onChange={(e) => setEditReps(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                            className="w-full h-11 rounded-lg bg-secondary border border-border text-center text-base font-bold text-foreground focus:border-primary focus:outline-none"
                          />
                          <div className="flex justify-center">
                            <motion.button
                              onClick={handleLogCurrent}
                              disabled={logging}
                              whileTap={{ scale: 0.9 }}
                              className="w-full h-11 rounded-lg bg-primary flex items-center justify-center disabled:opacity-50"
                              aria-label={`Registrar serie ${setNum}`}
                            >
                              <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
                            </motion.button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-center text-sm text-muted-foreground/40">–</span>
                          <span className="text-center text-sm text-muted-foreground/40">–</span>
                          <span />
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Calculadora de discos (solo mientras hay serie activa) */}
                {!isCompleted && (parseFloat(editWeight) || 0) > 0 && (
                  <div className="rounded-xl bg-secondary/40 border border-border overflow-hidden">
                    <button
                      onClick={() => setShowPlates((v) => !v)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground"
                    >
                      <Calculator className="w-3.5 h-3.5 text-primary" />
                      Discos por lado ({editWeight} kg)
                      {showPlates ? (
                        <ChevronUp className="w-3.5 h-3.5 ml-auto" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 ml-auto" />
                      )}
                    </button>
                    <AnimatePresence>
                      {showPlates && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                            {plates.perSide.length > 0 ? (
                              plates.perSide.map((p, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 rounded-md bg-primary/15 border border-primary/30 text-xs font-bold text-primary tabular-nums"
                                >
                                  {p}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">Solo la barra (20 kg)</span>
                            )}
                            {plates.leftover > 0 && (
                              <span className="text-xs text-amber-500 self-center">
                                +{plates.leftover} kg no exacto
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {isCompleted && (
                  <div className="py-3 bg-emerald-500/10 rounded-xl text-emerald-500 font-semibold text-sm text-center flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    Ejercicio Completado
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Video Player Modal */}
      {showVideo && exercise.videoUrl && (
        <ExerciseVideoPlayer
          videoUrl={exercise.videoUrl}
          exerciseName={exercise.name}
          onClose={() => setShowVideo(false)}
        />
      )}
    </>
  );
};

export default CoachExerciseCard;
