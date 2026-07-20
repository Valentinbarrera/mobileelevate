/**
 * Workout Detail page that loads exercises from Coach database
 * Uses routine_day_id from route params or navigation state
 * Persists workout data to local Lovable Cloud database
 */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Dumbbell, LayoutGrid, Check, ArrowUpDown, ChevronUp, ChevronDown, Plus, RotateCcw } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useCoachHomeData } from "@/hooks/useCoachHomeData";
import { useCoachWorkoutSession } from "@/hooks/useCoachWorkoutSession";
import { useOwnWorkoutSession } from "@/hooks/useOwnWorkoutSession";
import { getMyProgram } from "@/lib/myPrograms";
import RestBar from "@/components/workout/RestBar";
import WorkoutHero from "@/components/workout/WorkoutHero";
import WorkoutFloatingButton from "@/components/workout/WorkoutFloatingButton";
import ActiveWorkoutHeader from "@/components/workout/ActiveWorkoutHeader";
import CoachExerciseCard from "@/components/workout/CoachExerciseCard";
import CoachExerciseListItem from "@/components/workout/CoachExerciseListItem";
import ExerciseLibrary from "@/components/workout/ExerciseLibrary";
import ExerciseVideoPlayer from "@/components/workout/ExerciseVideoPlayer";
import ExerciseCompletedModal from "@/components/workout/ExerciseCompletedModal";
import WorkoutCheckIn from "@/components/workout/WorkoutCheckIn";
import ReadinessCheck from "@/components/workout/ReadinessCheck";
import { computeExerciseGroups } from "@/lib/exerciseGroups";
import { saveCheckIn, type CheckInData } from "@/lib/checkins";
import {
  saveReadiness,
  wasReadinessHandled,
  markReadinessSkipped,
  type ReadinessData,
} from "@/lib/readiness";
import { saveExerciseFeedback } from "@/lib/exerciseFeedback";
import { hydrateExerciseNotes } from "@/lib/exerciseNotes";
import ExercisePickerSheet, {
  type ExercisePickerResult,
} from "@/components/workout/ExercisePickerSheet";
import {
  loadSessionPlan,
  saveSessionPlan,
  clearSessionPlan,
  emptyPlan,
  planHasChanges,
  isCoachPrescribed,
  isExtraId,
  newExtraId,
  removeFromPlan,
  replaceInPlan,
  undoReplaceInPlan,
  addToPlan,
  moveInOrder,
  type SessionPlan,
} from "@/lib/sessionPlan";
import type { TodayRoutineDay } from "@/hooks/useCoachHomeData";
import { getLocalDateString } from "@/lib/date";
import { playStartSound } from "@/lib/sound";
import {
  saveActiveWorkout,
  loadActiveWorkout,
  clearActiveWorkout,
  elapsedAtSave,
  snapshotAge,
  type ActiveWorkoutSnapshot,
  type PersistedExerciseState,
} from "@/lib/activeWorkout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import type { DifficultyLevel } from "@/types/database";

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
  extraSets?: number; // series que el alumno sumó sobre la marcha, además de las prescritas
}

type SessionExercise = TodayRoutineDay["exercises"][number];

/**
 * Aplica los ajustes de hoy (cambiar / sacar / sumar / reordenar) sobre la
 * rutina del coach. La rutina original nunca se modifica: esto arma la lista
 * que se ve durante el entreno.
 *
 * Al cambiar un ejercicio se conserva la PRESCRIPCIÓN del coach (series, reps,
 * descanso, RIR, tempo, método): lo que cambia es el movimiento, no el estímulo
 * que pidió. Se descartan las notas y el video del original porque hablan del
 * ejercicio viejo y confundirían.
 */
function buildSessionExercises(
  coachExercises: SessionExercise[],
  plan: SessionPlan
): SessionExercise[] {
  const base = coachExercises
    .filter((e) => !plan.removed.includes(e.id))
    .map((e) => {
      const swap = plan.replaced[e.id];
      if (!swap) return e;
      return {
        ...e,
        exerciseId: swap.exerciseId,
        name: swap.name,
        muscleGroup: swap.muscleGroup ?? e.muscleGroup,
        equipment: swap.equipment ?? e.equipment,
        videoUrl: swap.videoUrl ?? null,
        thumbnail: swap.thumbnail ?? null,
        notes: null,
        description: null,
        instructions: null,
      };
    });

  const extras: SessionExercise[] = plan.extras.map((x) => ({
    id: x.id,
    exerciseId: x.exerciseId,
    name: x.name,
    sets: x.sets,
    reps: x.reps,
    restSeconds: x.restSeconds,
    rir: null,
    tempo: null,
    method: null,
    notes: null,
    videoUrl: x.videoUrl ?? null,
    thumbnail: x.thumbnail ?? null,
    muscleGroup: x.muscleGroup ?? null,
    equipment: x.equipment ?? null,
    description: null,
    instructions: null,
  }));

  const all = [...base, ...extras];

  // El orden guardado puede estar desactualizado (el coach editó la rutina):
  // se usa como preferencia, y lo que no figure queda al final en su orden.
  if (!plan.order.length) return all;
  const byId = new Map(all.map((e) => [e.id, e]));
  const ordered = plan.order.map((id) => byId.get(id)).filter(Boolean) as SessionExercise[];
  const seen = new Set(ordered.map((e) => e.id));
  return [...ordered, ...all.filter((e) => !seen.has(e.id))];
}

const CoachWorkoutDetail = () => {
  // La pantalla sirve para DOS fuentes: un día de la rutina del coach
  // (/workout/:id) y un día de un programa propio del alumno
  // (/programa/:programId/dia/:dayId/entrenar). Es la misma experiencia de
  // entreno; lo único que cambia es de dónde salen los ejercicios y dónde se
  // guarda la sesión.
  const { id, programId, dayId } = useParams<{ id: string; programId: string; dayId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, student, isAdminMode } = useAuthContext();
  const isDesktop = useIsDesktop();
  const { allDays, activeRoutine } = useCoachHomeData();

  const sid = student?.id || (isAdminMode ? "admin" : "anon");
  const isOwnMode = !!programId && !!dayId;

  // Get routine day from navigation state or find in allDays
  const navState = location.state as { routineDayId?: string; routineId?: string } | null;
  const routineDayId = isOwnMode ? dayId : navState?.routineDayId || id;

  // ── Fuente: programa propio ────────────────────────────────────────────────
  const ownProgram = useMemo(
    () => (programId ? getMyProgram(sid, programId) : null),
    [sid, programId]
  );

  const ownRoutineDay = useMemo<TodayRoutineDay | null>(() => {
    if (!ownProgram || !dayId) return null;
    const idx = ownProgram.days.findIndex((d) => d.id === dayId);
    const day = ownProgram.days[idx];
    if (!day) return null;
    return {
      id: day.id,
      name: day.name,
      dayNumber: idx + 1,
      description: null,
      // Los ejercicios de un programa propio no tienen id propio: derivamos uno
      // estable por posición para que el progreso y los PRs se sigan entre días.
      exercises: day.exercises.map((e, i) => ({
        id: `${day.id}:${i}`,
        exerciseId: e.exerciseId ?? "",
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds,
        rir: e.rir ?? null,
        tempo: null,
        method: null,
        notes: null,
        videoUrl: null,
        thumbnail: null,
        muscleGroup: e.muscleGroup ?? null,
        equipment: null,
        description: null,
        instructions: null,
      })),
      totalExercises: day.exercises.length,
      estimatedDuration: Math.max(20, day.exercises.length * 8),
    };
  }, [ownProgram, dayId]);

  const routineDay = useMemo(() => {
    if (isOwnMode) return ownRoutineDay;
    return allDays.find(d => d.id === routineDayId) || null;
  }, [isOwnMode, ownRoutineDay, allDays, routineDayId]);

  const routineId = navState?.routineId || activeRoutine?.id || "";
  
  // Persistencia de la sesión. Los dos hooks se llaman siempre (no se puede
  // llamar hooks condicionalmente) pero solo el elegido toca la red: el otro
  // queda inerte porque nadie invoca su startSession.
  const coachApi = useCoachWorkoutSession(routineDayId || "", routineId);
  const ownApi = useOwnWorkoutSession(
    routineDayId || "",
    ownProgram ? { id: ownProgram.id, name: ownProgram.name } : null,
    ownRoutineDay?.name ?? null
  );

  // Exponen la misma superficie; el cast evita que TS intente unir las dos
  // firmas de completeSet (una recibe el ejercicio completo del coach).
  const {
    session,
    startSession,
    resumeSession,
    completeSet: persistSet,
    updateSet: persistUpdateSet,
    deleteSet: persistDeleteSet,
    finishSession,
  } = (isOwnMode ? (ownApi as unknown as typeof coachApi) : coachApi);

  // State
  const [exerciseStates, setExerciseStates] = useState<Map<string, ExerciseState>>(new Map());
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [nextExerciseForRest, setNextExerciseForRest] = useState<{
    name: string;
    sets: number;
    reps: string;
  } | null>(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  // Ajustes del alumno sobre la sesión de HOY (cambiar / sacar / sumar / ordenar).
  // Es una capa aparte: la rutina del coach nunca se toca. Ver lib/sessionPlan.
  const [plan, setPlan] = useState<SessionPlan>(emptyPlan);
  const [reorderMode, setReorderMode] = useState(false);
  // Qué está pidiendo el selector de ejercicios: cambiar uno (con su id) o sumar.
  const [picker, setPicker] = useState<{ mode: "replace" | "add"; exerciseId?: string } | null>(
    null
  );
  const orderIds = plan.order;
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Cronómetro anclado a timestamp: sobrevive al background / throttling.
  const startedAtRef = useRef<number | null>(null); // Date.now() del arranque
  const pausedAtRef = useRef<number | null>(null); // instante en que se pausó
  const pausedTotalRef = useRef(0); // ms acumulados en pausa
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showReadiness, setShowReadiness] = useState(false);
  const [headerVideo, setHeaderVideo] = useState(false); // video del ejercicio activo, desde el header

  // Exercise completed modal state
  const [showExerciseCompleted, setShowExerciseCompleted] = useState(false);
  const [completedExerciseInfo, setCompletedExerciseInfo] = useState<{
    id: string;
    name: string;
    nextExercise: { id: string; name: string; sets: number; reps: string } | null;
    isLastExercise: boolean;
  } | null>(null);

  // Lista de ejercicios de HOY = rutina del coach + los ajustes del alumno.
  const sessionExercises = useMemo(
    () => buildSessionExercises(routineDay?.exercises ?? [], plan),
    [routineDay, plan]
  );

  // Al entrar al día, recuperamos los ajustes que el alumno ya hizo hoy (si
  // recargó la app o volvió a entrar). Mañana arranca limpio: la clave lleva la fecha.
  useEffect(() => {
    if (!routineDayId) return;
    setPlan(loadSessionPlan(sid, routineDayId, getLocalDateString()));
  }, [sid, routineDayId]);

  /** Único punto de escritura del plan: actualiza el estado y lo persiste. */
  const updatePlan = useCallback(
    (fn: (prev: SessionPlan) => SessionPlan) => {
      setPlan((prev) => {
        const next = fn(prev);
        if (routineDayId) saveSessionPlan(sid, routineDayId, getLocalDateString(), next);
        return next;
      });
    },
    [sid, routineDayId]
  );

  // Estados de ejercicio: se AGREGAN los que falten (un ejercicio nuevo del
  // alumno) sin pisar el progreso ya cargado de los demás. Al cambiar de día sí
  // se arranca de cero.
  useEffect(() => {
    setExerciseStates(new Map());
  }, [routineDayId]);

  useEffect(() => {
    setExerciseStates((prev) => {
      const missing = sessionExercises.filter((ex) => !prev.has(ex.id));
      if (!missing.length) return prev;
      const next = new Map(prev);
      missing.forEach((ex) =>
        next.set(ex.id, { id: ex.id, completed: false, currentSet: 0, completedSets: [] })
      );
      return next;
    });
  }, [sessionExercises]);

  // Reordenar ejercicios (preferencia del alumno para hoy). El orden se guarda
  // completo la primera vez, así no depende de la lista del coach.
  const moveExercise = (id: string, dir: -1 | 1) => {
    updatePlan((prev) => ({
      ...prev,
      order: moveInOrder(
        prev.order.length ? prev.order : sessionExercises.map((e) => e.id),
        id,
        dir
      ),
    }));
  };

  // Workout timer — keeps running during rest (the rest bar no longer blocks).
  // Anclado a timestamp: calcula el tiempo desde Date.now() para no driftear ni
  // pausarse cuando la app queda en background / pantalla bloqueada.
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workoutStarted && !isPaused) {
      const compute = () => {
        if (startedAtRef.current == null) return;
        setElapsedTime(
          Math.floor((Date.now() - startedAtRef.current - pausedTotalRef.current) / 1000)
        );
      };
      compute(); // recalcular inmediatamente (ej. al volver del background)
      interval = setInterval(compute, 500);
    }
    return () => clearInterval(interval);
  }, [workoutStarted, isPaused]);

  // ── Reanudar entreno ──────────────────────────────────────────────────────
  const [resumeSnapshot, setResumeSnapshot] = useState<ActiveWorkoutSnapshot | null>(null);

  // Al montar: si hay una sesión en curso de HOY para este día, ofrecer reanudar.
  useEffect(() => {
    if (!routineDayId || workoutStarted) return;
    const snap = loadActiveWorkout(sid, getLocalDateString());
    if (snap && snap.routineDayId === routineDayId) setResumeSnapshot(snap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineDayId, sid]);

  // Persistir la sesión en curso ante cada cambio relevante.
  useEffect(() => {
    if (!workoutStarted || !session || startedAtRef.current == null) return;
    const persisted: PersistedExerciseState[] = Array.from(exerciseStates.values()).map((s) => ({
      id: s.id,
      completed: s.completed,
      currentSet: s.currentSet,
      extraSets: s.extraSets,
      completedSets: s.completedSets.map((cs) => ({
        setNumber: cs.setNumber,
        weight: cs.weight,
        reps: cs.reps,
        difficulty: cs.difficulty,
        completedAt: (cs.completedAt instanceof Date ? cs.completedAt : new Date()).toISOString(),
      })),
    }));
    saveActiveWorkout(sid, {
      routineDayId: routineDayId || "",
      routineName: routineDay?.name,
      session,
      exerciseStates: persisted,
      activeExerciseId,
      orderIds,
      startedAt: startedAtRef.current,
      pausedTotal: pausedTotalRef.current,
      date: getLocalDateString(),
      savedAt: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutStarted, session, exerciseStates, activeExerciseId, orderIds]);

  const resumeWorkout = () => {
    if (!resumeSnapshot) return;
    const map = new Map<string, ExerciseState>();
    resumeSnapshot.exerciseStates.forEach((s) => {
      map.set(s.id, {
        id: s.id,
        completed: s.completed,
        currentSet: s.currentSet,
        extraSets: s.extraSets,
        completedSets: s.completedSets.map((cs) => ({
          setNumber: cs.setNumber,
          weight: cs.weight,
          reps: cs.reps,
          difficulty: cs.difficulty,
          completedAt: new Date(cs.completedAt),
        })),
      });
    });
    setExerciseStates(map);
    setActiveExerciseId(resumeSnapshot.activeExerciseId);
    if (resumeSnapshot.orderIds?.length) {
      updatePlan((prev) => ({ ...prev, order: resumeSnapshot.orderIds as string[] }));
    }
    // Si la sesión es de otro día, re-anclamos el cronómetro al tiempo que ya
    // llevaba entrenado: mantener el ancla original mostraría las horas que
    // pasaron desde que la dejó (un entreno de ayer arrancaría en 20 h).
    if (resumeSnapshot.date !== getLocalDateString()) {
      startedAtRef.current = Date.now() - elapsedAtSave(resumeSnapshot);
      pausedTotalRef.current = 0;
    } else {
      startedAtRef.current = resumeSnapshot.startedAt;
      pausedTotalRef.current = resumeSnapshot.pausedTotal;
    }
    pausedAtRef.current = null;
    resumeSession(resumeSnapshot.session);
    setWorkoutStarted(true);
    setResumeSnapshot(null);
    toast.success("Entrenamiento reanudado 💪");
  };

  const discardResume = () => {
    clearActiveWorkout(sid);
    setResumeSnapshot(null);
  };

  const resumeSetsDone = resumeSnapshot
    ? resumeSnapshot.exerciseStates.reduce((a, s) => a + s.completedSets.length, 0)
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tocar "Empezar" abre primero el readiness (¿cómo te sentís hoy?), omitible.
  // Es UNA vez por día: si ya lo contestó (otro entreno, o volvió a entrar a
  // este), se saltea y arranca derecho — si no, se siente repetido.
  const handleStartWorkout = () => {
    if (!isAuthenticated) {
      toast.error("Debés iniciar sesión para entrenar", {
        action: {
          label: "Iniciar sesión",
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }
    if (wasReadinessHandled(sid, getLocalDateString())) {
      beginWorkout();
      return;
    }
    setShowReadiness(true);
  };

  // Arranque real de la sesión (tras responder u omitir el readiness).
  const beginWorkout = async () => {
    setShowReadiness(false);
    if (workoutStarted) return; // ya está en curso, no re-iniciar

    // Sonido + vibración de arranque (dentro del gesto del usuario)
    playStartSound();

    // Start session in database
    const newSession = await startSession();
    if (newSession) {
      // Ancla del cronómetro: momento real de arranque de la sesión.
      startedAtRef.current = Date.now();
      pausedAtRef.current = null;
      pausedTotalRef.current = 0;
      setWorkoutStarted(true);
      if (sessionExercises.length) {
        setActiveExerciseId(sessionExercises[0].id);
      }
      toast.success("¡Entrenamiento iniciado!");
    }
  };

  // Trae de la nube las notas propias del alumno que no estén en este teléfono,
  // antes de que las tarjetas de ejercicio las lean (best-effort, no bloquea).
  useEffect(() => {
    if (student?.id) void hydrateExerciseNotes(student.id);
  }, [student?.id]);

  const handleReadinessComplete = (data: ReadinessData) => {
    const sid = student?.id || (isAdminMode ? "admin" : "anon");
    saveReadiness(sid, getLocalDateString(), data);
    beginWorkout();
  };

  // Guarda el feedback (estímulo/dolor) del ejercicio recién completado.
  const handleExerciseFeedback = (stimulus: number, jointPain: number) => {
    if (!completedExerciseInfo) return;
    const sid = student?.id || (isAdminMode ? "admin" : "anon");
    saveExerciseFeedback(sid, {
      date: getLocalDateString(),
      exerciseId: completedExerciseInfo.id,
      exerciseName: completedExerciseInfo.name,
      stimulus,
      jointPain,
    });
  };

  const handleCompleteSet = useCallback(async (
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number,
    difficulty: string
  ): Promise<boolean> => {
    if (!routineDay) return false;

    // Buscamos en la lista de HOY (con los ajustes del alumno), no en la del
    // coach: si no, un ejercicio cambiado o sumado no se encontraría.
    const exercise = sessionExercises.find(e => e.id === exerciseId);
    if (!exercise) return false;

    // Persist to database
    let savedSuccessfully = true;
    if (session) {
      const result = await persistSet(
        exercise,
        setNumber,
        weight,
        reps,
        difficulty as DifficultyLevel,
        !isCoachPrescribed(plan, exerciseId)
      );
      savedSuccessfully = result !== null;
    }

    setExerciseStates(prev => {
      const newStates = new Map(prev);
      const state = newStates.get(exerciseId);
      
      if (!state) return prev;

      const newCompletedSet: CompletedSet = {
        setNumber,
        weight,
        reps,
        difficulty,
        completedAt: new Date(),
      };

      const newCompletedSets = [...state.completedSets, newCompletedSet];
      const targetSets = exercise.sets + (state.extraSets || 0);
      const isCompleted = newCompletedSets.length >= targetSets;

      newStates.set(exerciseId, {
        ...state,
        currentSet: newCompletedSets.length,
        completedSets: newCompletedSets,
        completed: isCompleted,
      });

      // Handle rest timer or show exercise completed modal
      if (!isCompleted) {
        // Not completed yet - show rest timer
        setRestDuration(exercise.restSeconds || 60);
        
        // Set current exercise as next for rest timer hint
        setNextExerciseForRest({
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
        });
        
        setShowRestTimer(true);
      } else {
        // Exercise completed - show celebration modal
        const currentIndex = sessionExercises.findIndex(e => e.id === exerciseId);
        const nextExercise = sessionExercises[currentIndex + 1];
        const isLastExercise = currentIndex === sessionExercises.length - 1;
        
        setCompletedExerciseInfo({
          id: exercise.id,
          name: exercise.name,
          nextExercise: nextExercise ? {
            id: nextExercise.id,
            name: nextExercise.name,
            sets: nextExercise.sets,
            reps: nextExercise.reps,
          } : null,
          isLastExercise,
        });
        
        setShowExerciseCompleted(true);
      }

      return newStates;
    });

    return savedSuccessfully;
  }, [routineDay, sessionExercises, plan, session, persistSet]);

  // Editar una serie ya cargada (modificar kg/reps sobre la marcha)
  const handleUpdateSet = useCallback(async (
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number
  ): Promise<boolean> => {
    if (!routineDay) return false;
    const exercise = sessionExercises.find(e => e.id === exerciseId);
    if (!exercise) return false;

    let ok = true;
    // El nombre solo lo usa la sesión de programa propio (sus series no tienen
    // id de rutina); el hook del coach lo ignora.
    if (session) ok = await persistUpdateSet(exerciseId, setNumber, weight, reps, exercise.name);

    setExerciseStates(prev => {
      const newStates = new Map(prev);
      const state = newStates.get(exerciseId);
      if (!state) return prev;
      const completedSets = state.completedSets.map(s =>
        s.setNumber === setNumber ? { ...s, weight, reps } : s
      );
      newStates.set(exerciseId, { ...state, completedSets });
      return newStates;
    });

    return ok;
  }, [routineDay, sessionExercises, session, persistUpdateSet]);

  // Borrar una serie ya cargada (deshacer / volver atrás)
  const handleDeleteSet = useCallback(async (
    exerciseId: string,
    setNumber: number
  ): Promise<boolean> => {
    if (!routineDay) return false;
    const exercise = sessionExercises.find(e => e.id === exerciseId);
    if (!exercise) return false;

    let ok = true;
    if (session) ok = await persistDeleteSet(exerciseId, setNumber, exercise.name);

    setExerciseStates(prev => {
      const newStates = new Map(prev);
      const state = newStates.get(exerciseId);
      if (!state) return prev;
      const completedSets = state.completedSets.filter(s => s.setNumber !== setNumber);
      newStates.set(exerciseId, {
        ...state,
        completedSets,
        currentSet: completedSets.length,
        completed: completedSets.length >= exercise.sets + (state.extraSets || 0),
      });
      return newStates;
    });

    return ok;
  }, [routineDay, sessionExercises, session, persistDeleteSet]);

  // Sumar una serie extra (más allá de las prescritas). Si el ejercicio ya estaba
  // completado, lo reabre para que aparezca la nueva fila activa.
  const handleAddSet = useCallback((exerciseId: string) => {
    setExerciseStates(prev => {
      const newStates = new Map(prev);
      const state = newStates.get(exerciseId);
      if (!state) return prev;
      newStates.set(exerciseId, {
        ...state,
        extraSets: (state.extraSets || 0) + 1,
        completed: false,
      });
      return newStates;
    });
  }, []);

  // Quitar la última serie EXTRA (inverso de "Agregar serie"). No toca las
  // series prescritas por el coach.
  const handleRemoveSet = useCallback((exerciseId: string) => {
    setExerciseStates(prev => {
      const newStates = new Map(prev);
      const state = newStates.get(exerciseId);
      if (!state || (state.extraSets || 0) <= 0) return prev;
      const extraSets = (state.extraSets || 0) - 1;
      const exercise = sessionExercises.find(e => e.id === exerciseId);
      const target = (exercise?.sets || 0) + extraSets;
      newStates.set(exerciseId, {
        ...state,
        extraSets,
        completed: state.completedSets.length >= target,
      });
      return newStates;
    });
  }, [routineDay]);

  // Saltar este ejercicio hoy: pasa al siguiente (respetando el orden elegido).
  const handleSkipExercise = useCallback((exerciseId: string) => {
    const order = sessionExercises.map((e) => e.id);
    const idx = order.indexOf(exerciseId);
    const nextId = order[idx + 1];
    if (nextId) {
      setActiveExerciseId(nextId);
      toast.info("Pasaste al siguiente ejercicio");
    } else {
      toast.info("Ya es el último ejercicio");
    }
  }, [sessionExercises]);

  // ── Ajustes del alumno sobre los ejercicios del día ────────────────────────

  /** Saca el ejercicio de hoy. Si era el activo, mueve el foco al siguiente. */
  const handleRemoveExercise = useCallback(
    (exerciseId: string) => {
      const rest = sessionExercises.filter((e) => e.id !== exerciseId);
      if (!rest.length) {
        toast.error("Tiene que quedar al menos un ejercicio");
        return;
      }
      const wasExtra = isExtraId(exerciseId);
      updatePlan((prev) => removeFromPlan(prev, exerciseId));
      if (activeExerciseId === exerciseId) {
        const idx = sessionExercises.findIndex((e) => e.id === exerciseId);
        setActiveExerciseId((sessionExercises[idx + 1] ?? rest[rest.length - 1]).id);
      }
      toast.success(wasExtra ? "Ejercicio quitado" : "Sacado de la sesión de hoy");
    },
    [sessionExercises, activeExerciseId, updatePlan]
  );

  /** Vuelve al ejercicio que había prescrito el coach. */
  const handleUndoReplace = useCallback(
    (exerciseId: string) => {
      updatePlan((prev) => undoReplaceInPlan(prev, exerciseId));
      toast.success("Volviste al ejercicio del coach");
    },
    [updatePlan]
  );

  /** Resultado del selector: reemplaza el ejercicio pedido o suma uno nuevo. */
  const handlePickerSelect = useCallback(
    (result: ExercisePickerResult) => {
      const { exercise: lib } = result;
      const picked = {
        exerciseId: lib.id,
        name: lib.name,
        muscleGroup: lib.muscle,
        equipment: lib.equipment,
        videoUrl: lib.videoUrl,
        thumbnail: lib.thumbnailUrl,
      };

      if (picker?.mode === "replace" && picker.exerciseId) {
        updatePlan((prev) => replaceInPlan(prev, picker.exerciseId as string, picked));
        toast.success(`Cambiado por ${lib.name}`);
      } else {
        const id = newExtraId();
        updatePlan((prev) =>
          addToPlan(prev, {
            ...picked,
            id,
            sets: result.sets,
            reps: result.reps,
            restSeconds: result.restSeconds,
          })
        );
        toast.success(`${lib.name} agregado al entreno`);
      }
      setPicker(null);
    },
    [picker, updatePlan]
  );

  /** Descarta todos los ajustes y vuelve a la rutina tal cual la armó el coach. */
  const handleRestorePlan = useCallback(() => {
    if (routineDayId) clearSessionPlan(sid, routineDayId, getLocalDateString());
    setPlan(emptyPlan());
    toast.success("Volviste a la rutina de tu coach");
  }, [sid, routineDayId]);

  const handleRestComplete = useCallback(() => {
    setShowRestTimer(false);
  }, []);

  const handleSkipRest = () => {
    setShowRestTimer(false);
  };

  // Handle exercise completed modal actions
  const handleGoToNextExercise = useCallback(() => {
    if (!routineDay || !completedExerciseInfo?.nextExercise) return;
    
    // Look up by ID to avoid duplicate-name bugs
    const nextEx = sessionExercises.find(e => e.id === completedExerciseInfo.nextExercise?.id);
    if (nextEx) {
      setActiveExerciseId(nextEx.id);
    }
    setShowExerciseCompleted(false);
    setCompletedExerciseInfo(null);
  }, [routineDay, completedExerciseInfo]);

  const handleCloseExerciseCompleted = useCallback(() => {
    setShowExerciseCompleted(false);
    setCompletedExerciseInfo(null);
  }, []);

  const handleFinishWorkout = () => {
    if (!session) {
      toast.error("No pudimos guardar tu sesión. Reiniciá el entrenamiento para persistirlo correctamente.");
      return;
    }
    setShowCheckIn(true);
  };

  const completeWorkout = async (checkIn: CheckInData | null) => {
    setShowCheckIn(false);
    if (!session) return;

    if (checkIn) {
      const sid = student?.id || (isAdminMode ? "admin" : "anon");
      saveCheckIn(sid, {
        date: session.date,
        workoutName: routineDay?.name || "Entrenamiento",
        ...checkIn,
      });
    }

    const exercises = sessionExercises;
    const completedExercises = exercises.filter(e => exerciseStates.get(e.id)?.completed).length;
    const completedSets = exercises.reduce((acc, e) => {
      const state = exerciseStates.get(e.id);
      return acc + (state?.completedSets.length || 0);
    }, 0);
    const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0);

    // Persist session completion
    // La nota es lo que se ve como NOMBRE del entreno en el historial.
    const finishedSession = await finishSession(
      elapsedTime,
      isOwnMode
        ? `${ownProgram?.name ?? "Mi programa"} · ${routineDay?.name ?? ""}`.trim()
        : `Routine day: ${routineDay?.name}`
    );
    if (!finishedSession) {
      toast.error("No se pudo finalizar la sesión. Intentá nuevamente.");
      return;
    }

    clearActiveWorkout(sid); // entreno terminado → ya no hay nada que reanudar

    navigate("/workout-summary", {
      state: {
        summaryData: {
          workoutName: routineDay?.name || "Entrenamiento",
          duration: elapsedTime,
          exercisesCompleted: completedExercises,
          totalExercises: exercises.length,
          setsCompleted: completedSets,
          totalSets: totalSets,
          caloriesBurned: Math.round(elapsedTime / 60 * 7.5),
        }
      }
    });
  };

  // Loading state with timeout to show error if data not found
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingTimeout(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Loading state
  if (!routineDay && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state: No routine found
  if (!routineDay) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
        >
          <Dumbbell className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="text-xl font-black tracking-tight text-foreground mb-2">
          Rutina no encontrada
        </h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          {isAuthenticated 
            ? "Esta rutina no está disponible o aún no tenés asignada una rutina para hoy."
            : "Debés iniciar sesión con tu cuenta de Elevate Coach para acceder a tus rutinas personalizadas."
          }
        </p>
        <motion.button
          onClick={() => navigate(isAuthenticated ? "/routines" : "/auth")}
          className="px-6 py-3 bg-gradient-primary rounded-xl text-primary-foreground font-semibold"
          whileTap={{ scale: 0.98 }}
        >
          {isAuthenticated ? "Ver mis Rutinas" : "Iniciar Sesión"}
        </motion.button>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-muted-foreground text-sm"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  // La rutina del coach con los ajustes de hoy ya aplicados (ver sessionExercises).
  const exercises = sessionExercises;
  const activeExercise = exercises.find((e) => e.id === activeExerciseId) ?? null;

  // Video del ejercicio en curso desde el header: el del coach si lo cargó, y
  // si no una búsqueda en YouTube por el nombre (mismo criterio que la card).
  const openActiveVideo = () => {
    if (!activeExercise) return;
    if (activeExercise.videoUrl && !/youtu\.?be/i.test(activeExercise.videoUrl)) {
      setHeaderVideo(true);
      return;
    }
    const url =
      activeExercise.videoUrl ||
      `https://www.youtube.com/results?search_query=${encodeURIComponent(
        activeExercise.name + " técnica ejercicio"
      )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const hasPlanChanges = planHasChanges(plan);
  const exerciseGroups = computeExerciseGroups(exercises);
  const completedExercises = exercises.filter(e => exerciseStates.get(e.id)?.completed).length;
  const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0);
  const completedSets = exercises.reduce((acc, e) => {
    const state = exerciseStates.get(e.id);
    return acc + (state?.completedSets.length || 0);
  }, 0);

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Prompt de reanudar entreno en curso */}
      <AnimatePresence>
        {resumeSnapshot && !workoutStarted && (
          <motion.div
            className="fixed inset-0 z-[130] bg-black/70 flex items-end sm:items-center justify-center p-5"
            style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm card-elevated rounded-3xl p-6 text-center"
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Dumbbell className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-black text-foreground tracking-tight">Tenés un entreno en curso</h3>
              <p className="text-sm text-muted-foreground mt-1.5">
                Dejaste{" "}
                <span className="font-semibold text-foreground">{resumeSnapshot.routineName || "tu entreno"}</span> a mitad{" "}
                <span className="font-semibold text-foreground">
                  {snapshotAge(resumeSnapshot, getLocalDateString())}
                </span>
                {resumeSetsDone > 0
                  ? `, con ${resumeSetsDone} ${resumeSetsDone === 1 ? "serie cargada" : "series cargadas"}`
                  : ""}
                . ¿Retomamos donde ibas?
              </p>
              <button
                onClick={resumeWorkout}
                className="w-full mt-5 py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-black uppercase tracking-wide glow-primary active:scale-[0.98] transition-transform"
              >
                Reanudar entrenamiento
              </button>
              <button
                onClick={discardResume}
                className="w-full mt-2 py-2.5 rounded-xl text-sm font-bold text-muted-foreground active:text-foreground"
              >
                Empezar de nuevo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Workout Header */}
      <AnimatePresence>
        {workoutStarted && (
          <ActiveWorkoutHeader
            elapsedTime={formatTime(elapsedTime)}
            isPaused={isPaused}
            onPauseToggle={() =>
              setIsPaused((paused) => {
                if (!paused) {
                  // Pausando: guardamos el instante para descontarlo luego.
                  pausedAtRef.current = Date.now();
                } else if (pausedAtRef.current != null) {
                  // Reanudando: acumulamos el tiempo estado en pausa.
                  pausedTotalRef.current += Date.now() - pausedAtRef.current;
                  pausedAtRef.current = null;
                }
                return !paused;
              })
            }
            completedExercises={completedExercises}
            totalExercises={exercises.length}
            completedSets={completedSets}
            totalSets={totalSets}
            onFinish={handleFinishWorkout}
            activeExerciseName={activeExercise?.name}
            onOpenVideo={activeExercise ? openActiveVideo : undefined}
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      {!workoutStarted && (
        <WorkoutHero
          title={routineDay.name.toUpperCase()}
          subtitle={(isOwnMode ? ownProgram?.name : activeRoutine?.name) || ""}
          duration={`${routineDay.estimatedDuration} min`}
          intensity={activeRoutine?.difficulty || "Moderada"}
          focus={`Día ${routineDay.dayNumber}`}
          onBack={() => navigate("/")}
        />
      )}

      {/* Exercise List */}
      <div className="max-w-5xl mx-auto px-5 pb-32">
        <motion.div 
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-[11px] font-bold text-primary uppercase tracking-wider">
            Lista de Ejercicios
          </h2>
          <button
            onClick={() => setShowLibrary(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl card-elevated text-xs font-bold text-foreground active:scale-95 transition-transform"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-primary" />
            Ver todos
          </button>
        </motion.div>

        {workoutStarted && isDesktop ? (
          /* ── Desktop en entreno: master-detail (lista izq · ejercicio activo der) ── */
          <div className="grid grid-cols-12 gap-5 items-start">
            <aside className="col-span-5 xl:col-span-4 space-y-1.5 lg:sticky lg:top-24">
              {exercises.map((exercise, index) => {
                const state = exerciseStates.get(exercise.id);
                const done = state?.completed;
                const doneSets = state?.completedSets.length ?? 0;
                const active = activeExerciseId === exercise.id;
                const g = exerciseGroups.get(exercise.id);
                return (
                  <button
                    key={exercise.id}
                    onClick={() => setActiveExerciseId(exercise.id)}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left border transition-colors ${
                      active
                        ? "border-primary bg-primary/10"
                        : done
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-border bg-card hover:bg-secondary/40"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        done
                          ? "bg-emerald-500 text-white"
                          : active
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="w-4 h-4" strokeWidth={3} /> : index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${active ? "text-primary" : "text-foreground"}`}>
                        {g && <span className="text-amber-400">{g.letter}{g.position} · </span>}
                        {exercise.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {doneSets}/{exercise.sets} series
                      </p>
                    </div>
                  </button>
                );
              })}
            </aside>

            <div className="col-span-7 xl:col-span-8">
              {(() => {
                const idx = exercises.findIndex((e) => e.id === activeExerciseId);
                const exercise = exercises[idx] ?? exercises[0];
                if (!exercise) return null;
                const state = exerciseStates.get(exercise.id);
                return (
                  <CoachExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    state={state || { id: exercise.id, completed: false, currentSet: 0, completedSets: [] }}
                    index={idx < 0 ? 0 : idx}
                    isActive
                    group={exerciseGroups.get(exercise.id)}
                    onSelect={() => setActiveExerciseId(exercise.id)}
                    onCompleteSet={handleCompleteSet}
                    onUpdateSet={handleUpdateSet}
                    onDeleteSet={handleDeleteSet}
                    onAddSet={() => handleAddSet(exercise.id)}
                    onRemoveSet={() => handleRemoveSet(exercise.id)}
                    onSkipExercise={() => handleSkipExercise(exercise.id)}
                    onReplaceExercise={() => setPicker({ mode: "replace", exerciseId: exercise.id })}
                    onRemoveExercise={() => handleRemoveExercise(exercise.id)}
                    onUndoReplace={() => handleUndoReplace(exercise.id)}
                    isSubstituted={!!plan.replaced[exercise.id]}
                    isExtra={isExtraId(exercise.id)}
                  />
                );
              })()}
            </div>
          </div>
        ) : (
          <>
            {/* Ajustes del día: reordenar y sumar ejercicios. Disponibles también
                con el entreno en curso (la máquina ocupada aparece a mitad de sesión). */}
            <div className="flex items-center justify-between gap-2 mb-2">
              {hasPlanChanges ? (
                <button
                  type="button"
                  onClick={handleRestorePlan}
                  className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Volver a la rutina del coach
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPicker({ mode: "add" })}
                  className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar ejercicio
                </button>
                {exercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setReorderMode((v) => !v)}
                    className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                      reorderMode ? "bg-primary text-primary-foreground" : "text-primary hover:bg-primary/10"
                    }`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    {reorderMode ? "Listo" : "Reordenar"}
                  </button>
                )}
              </div>
            </div>

            <div className={reorderMode ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 lg:grid-cols-2 gap-3"}>
              {exercises.map((exercise, index) => {
                const state = exerciseStates.get(exercise.id);

                // El modo reordenar gana sobre el entreno en curso: si no, con la
                // sesión empezada no se podría reacomodar nada.
                if (reorderMode) {
                  return (
                    <div key={exercise.id} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0 pointer-events-none">
                        <CoachExerciseListItem
                          exercise={exercise}
                          index={index + 1}
                          group={exerciseGroups.get(exercise.id)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveExercise(exercise.id, -1)}
                          disabled={index === 0}
                          aria-label="Subir ejercicio"
                          className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground disabled:opacity-30 active:scale-95 transition-transform"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExercise(exercise.id, 1)}
                          disabled={index === exercises.length - 1}
                          aria-label="Bajar ejercicio"
                          className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground disabled:opacity-30 active:scale-95 transition-transform"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                }

                if (workoutStarted) {
                  return (
                    <CoachExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      state={state || { id: exercise.id, completed: false, currentSet: 0, completedSets: [] }}
                      index={index}
                      isActive={activeExerciseId === exercise.id}
                      group={exerciseGroups.get(exercise.id)}
                      onSelect={() => setActiveExerciseId(exercise.id)}
                      onCompleteSet={handleCompleteSet}
                      onUpdateSet={handleUpdateSet}
                      onDeleteSet={handleDeleteSet}
                      onAddSet={() => handleAddSet(exercise.id)}
                      onRemoveSet={() => handleRemoveSet(exercise.id)}
                      onSkipExercise={() => handleSkipExercise(exercise.id)}
                      onReplaceExercise={() =>
                        setPicker({ mode: "replace", exerciseId: exercise.id })
                      }
                      onRemoveExercise={() => handleRemoveExercise(exercise.id)}
                      onUndoReplace={() => handleUndoReplace(exercise.id)}
                      isSubstituted={!!plan.replaced[exercise.id]}
                      isExtra={isExtraId(exercise.id)}
                    />
                  );
                }

                return (
                  <CoachExerciseListItem
                    key={exercise.id}
                    exercise={exercise}
                    index={index + 1}
                    group={exerciseGroups.get(exercise.id)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Description Section */}
      {!workoutStarted && routineDay.description && (
        <motion.div 
          className="max-w-5xl mx-auto px-5 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-3">
            Descripción
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {routineDay.description}
          </p>
        </motion.div>
      )}

      {/* Floating Button */}
      <WorkoutFloatingButton
        workoutStarted={workoutStarted}
        isCompleted={completedExercises === exercises.length && exercises.length > 0}
        onStart={handleStartWorkout}
        onFinish={handleFinishWorkout}
      />

      {/* Rest Bar — mini, non-blocking (no longer hijacks the screen) */}
      <AnimatePresence>
        {showRestTimer && (
          <RestBar
            duration={restDuration}
            onComplete={handleRestComplete}
            onSkip={handleSkipRest}
            enableVibration={true}
          />
        )}
      </AnimatePresence>

      {/* Readiness pre-sesión (omitible) */}
      <ReadinessCheck
        open={showReadiness}
        onComplete={handleReadinessComplete}
        onSkip={() => {
          markReadinessSkipped(sid, getLocalDateString());
          beginWorkout();
        }}
      />

      {/* Exercise Completed Modal */}
      <ExerciseCompletedModal
        isOpen={showExerciseCompleted}
        onClose={handleCloseExerciseCompleted}
        onGoToNext={handleGoToNextExercise}
        completedExerciseName={completedExerciseInfo?.name || ""}
        nextExercise={completedExerciseInfo?.nextExercise}
        isLastExercise={completedExerciseInfo?.isLastExercise}
        totalCompleted={completedExercises}
        totalExercises={exercises.length}
        onSubmitFeedback={handleExerciseFeedback}
      />

      {/* Check-in post-entreno */}
      <WorkoutCheckIn
        open={showCheckIn}
        onComplete={completeWorkout}
        onSkip={() => completeWorkout(null)}
      />

      {/* "Ver todos": biblioteca de ejercicios sin salir del entreno */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            className="fixed inset-0 z-[120] bg-background overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ExerciseLibrary onClose={() => setShowLibrary(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video de técnica del ejercicio activo, abierto desde el header */}
      <AnimatePresence>
        {headerVideo && activeExercise?.videoUrl && (
          <motion.div
            className="fixed inset-0 z-[140] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHeaderVideo(false)}
          >
            <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <ExerciseVideoPlayer
                videoUrl={activeExercise.videoUrl}
                exerciseName={activeExercise.name}
                onClose={() => setHeaderVideo(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selector para cambiar un ejercicio por otro o sumar uno al día */}
      <ExercisePickerSheet
        open={!!picker}
        mode={picker?.mode ?? "add"}
        currentName={
          picker?.exerciseId
            ? exercises.find((e) => e.id === picker.exerciseId)?.name
            : undefined
        }
        /* El músculo sale del ejercicio ORIGINAL del coach: si tomáramos el del
           sustituto, cada cambio iría corriendo el filtro y el alumno se alejaría
           del estímulo que le pidieron. */
        suggestedMuscle={
          picker?.exerciseId
            ? (routineDay.exercises.find((e) => e.id === picker.exerciseId)?.muscleGroup ??
              exercises.find((e) => e.id === picker.exerciseId)?.muscleGroup)
            : null
        }
        excludeExerciseId={
          picker?.exerciseId
            ? exercises.find((e) => e.id === picker.exerciseId)?.exerciseId
            : null
        }
        onSelect={handlePickerSelect}
        onClose={() => setPicker(null)}
      />
    </motion.div>
  );
};

export default CoachWorkoutDetail;
