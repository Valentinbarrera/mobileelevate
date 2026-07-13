/**
 * Workout Detail page that loads exercises from Coach database
 * Uses routine_day_id from route params or navigation state
 * Persists workout data to local Lovable Cloud database
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Dumbbell, LayoutGrid, Check, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useCoachHomeData } from "@/hooks/useCoachHomeData";
import { useCoachWorkoutSession } from "@/hooks/useCoachWorkoutSession";
import RestBar from "@/components/workout/RestBar";
import WorkoutHero from "@/components/workout/WorkoutHero";
import WorkoutFloatingButton from "@/components/workout/WorkoutFloatingButton";
import ActiveWorkoutHeader from "@/components/workout/ActiveWorkoutHeader";
import CoachExerciseCard from "@/components/workout/CoachExerciseCard";
import CoachExerciseListItem from "@/components/workout/CoachExerciseListItem";
import ExerciseLibrary from "@/components/workout/ExerciseLibrary";
import ExerciseCompletedModal from "@/components/workout/ExerciseCompletedModal";
import WorkoutCheckIn from "@/components/workout/WorkoutCheckIn";
import ReadinessCheck from "@/components/workout/ReadinessCheck";
import { computeExerciseGroups } from "@/lib/exerciseGroups";
import { saveCheckIn, type CheckInData } from "@/lib/checkins";
import { saveReadiness, type ReadinessData } from "@/lib/readiness";
import { saveExerciseFeedback } from "@/lib/exerciseFeedback";
import { getLocalDateString } from "@/lib/date";
import { playStartSound } from "@/lib/sound";
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

const CoachWorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, student, isAdminMode } = useAuthContext();
  const isDesktop = useIsDesktop();
  const { allDays, activeRoutine } = useCoachHomeData();
  
  // Get routine day from navigation state or find in allDays
  const navState = location.state as { routineDayId?: string; routineId?: string } | null;
  const routineDayId = navState?.routineDayId || id;

  const routineDay = useMemo(() => {
    return allDays.find(d => d.id === routineDayId) || null;
  }, [allDays, routineDayId]);

  const routineId = navState?.routineId || activeRoutine?.id || "";
  
  // Session persistence hook
  const {
    session,
    startSession,
    completeSet: persistSet,
    updateSet: persistUpdateSet,
    deleteSet: persistDeleteSet,
    finishSession
  } = useCoachWorkoutSession(routineDayId || "", routineId);

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
  const [orderIds, setOrderIds] = useState<string[]>([]); // orden (reordenable) de los ejercicios
  const [reorderMode, setReorderMode] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showReadiness, setShowReadiness] = useState(false);

  // Exercise completed modal state
  const [showExerciseCompleted, setShowExerciseCompleted] = useState(false);
  const [completedExerciseInfo, setCompletedExerciseInfo] = useState<{
    id: string;
    name: string;
    nextExercise: { id: string; name: string; sets: number; reps: string } | null;
    isLastExercise: boolean;
  } | null>(null);

  // Initialize exercise states
  useEffect(() => {
    if (routineDay?.exercises) {
      const states = new Map<string, ExerciseState>();
      routineDay.exercises.forEach(ex => {
        states.set(ex.id, {
          id: ex.id,
          completed: false,
          currentSet: 0,
          completedSets: [],
        });
      });
      setExerciseStates(states);
      setOrderIds(routineDay.exercises.map((e) => e.id));
    }
  }, [routineDay]);

  // Reordenar ejercicios (preferencia del alumno para esta sesión)
  const moveExercise = (id: string, dir: -1 | 1) => {
    setOrderIds((prev) => {
      const i = prev.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  // Workout timer — keeps running during rest (the rest bar no longer blocks)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workoutStarted && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutStarted, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tocar "Empezar" abre primero el readiness (¿cómo te sentís hoy?), omitible.
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
      setWorkoutStarted(true);
      if (routineDay?.exercises.length) {
        setActiveExerciseId(routineDay.exercises[0].id);
      }
      toast.success("¡Entrenamiento iniciado!");
    }
  };

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

    const exercise = routineDay.exercises.find(e => e.id === exerciseId);
    if (!exercise) return false;

    // Persist to database
    let savedSuccessfully = true;
    if (session) {
      const result = await persistSet(
        exercise,
        setNumber,
        weight,
        reps,
        difficulty as DifficultyLevel
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
        const currentIndex = routineDay.exercises.findIndex(e => e.id === exerciseId);
        const nextExercise = routineDay.exercises[currentIndex + 1];
        const isLastExercise = currentIndex === routineDay.exercises.length - 1;
        
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
  }, [routineDay, session, persistSet]);

  // Editar una serie ya cargada (modificar kg/reps sobre la marcha)
  const handleUpdateSet = useCallback(async (
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number
  ): Promise<boolean> => {
    if (!routineDay) return false;
    const exercise = routineDay.exercises.find(e => e.id === exerciseId);
    if (!exercise) return false;

    let ok = true;
    if (session) ok = await persistUpdateSet(exerciseId, setNumber, weight, reps);

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
  }, [routineDay, session, persistUpdateSet]);

  // Borrar una serie ya cargada (deshacer / volver atrás)
  const handleDeleteSet = useCallback(async (
    exerciseId: string,
    setNumber: number
  ): Promise<boolean> => {
    if (!routineDay) return false;
    const exercise = routineDay.exercises.find(e => e.id === exerciseId);
    if (!exercise) return false;

    let ok = true;
    if (session) ok = await persistDeleteSet(exerciseId, setNumber);

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
  }, [routineDay, session, persistDeleteSet]);

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
    const nextEx = routineDay.exercises.find(e => e.id === completedExerciseInfo.nextExercise?.id);
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

    const exercises = routineDay?.exercises || [];
    const completedExercises = exercises.filter(e => exerciseStates.get(e.id)?.completed).length;
    const completedSets = exercises.reduce((acc, e) => {
      const state = exerciseStates.get(e.id);
      return acc + (state?.completedSets.length || 0);
    }, 0);
    const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0);

    // Persist session completion
    const finishedSession = await finishSession(elapsedTime, `Routine day: ${routineDay?.name}`);
    if (!finishedSession) {
      toast.error("No se pudo finalizar la sesión. Intentá nuevamente.");
      return;
    }
    
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

  // Aplica el orden elegido por el alumno (si está completo); si no, el del coach.
  const orderedExercises = orderIds.length
    ? (orderIds.map((id) => routineDay.exercises.find((e) => e.id === id)).filter(Boolean) as typeof routineDay.exercises)
    : routineDay.exercises;
  const exercises =
    orderedExercises.length === routineDay.exercises.length ? orderedExercises : routineDay.exercises;
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
      {/* Active Workout Header */}
      <AnimatePresence>
        {workoutStarted && (
          <ActiveWorkoutHeader
            elapsedTime={formatTime(elapsedTime)}
            isPaused={isPaused}
            onPauseToggle={() => setIsPaused(!isPaused)}
            completedExercises={completedExercises}
            totalExercises={exercises.length}
            completedSets={completedSets}
            totalSets={totalSets}
            onFinish={handleFinishWorkout}
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      {!workoutStarted && (
        <WorkoutHero
          title={routineDay.name.toUpperCase()}
          subtitle={activeRoutine?.name || ""}
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
                  />
                );
              })()}
            </div>
          </div>
        ) : (
          <>
            {/* Reordenar ejercicios (solo antes de empezar) */}
            {!workoutStarted && exercises.length > 1 && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setReorderMode((v) => !v)}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    reorderMode ? "bg-primary text-primary-foreground" : "text-primary hover:bg-primary/10"
                  }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  {reorderMode ? "Listo" : "Reordenar"}
                </button>
              </div>
            )}

            <div className={reorderMode ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 lg:grid-cols-2 gap-3"}>
              {exercises.map((exercise, index) => {
                const state = exerciseStates.get(exercise.id);

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
                    />
                  );
                }

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
                          onClick={() => moveExercise(exercise.id, -1)}
                          disabled={index === 0}
                          aria-label="Subir ejercicio"
                          className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground disabled:opacity-30 active:scale-95 transition-transform"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                        <button
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
        onSkip={beginWorkout}
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
    </motion.div>
  );
};

export default CoachWorkoutDetail;
