/**
 * Workout Detail page that loads exercises from Coach database
 * Uses routine_day_id from route params or navigation state
 * Persists workout data to local Lovable Cloud database
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCoachHomeData } from "@/hooks/useCoachHomeData";
import { useCoachWorkoutSession } from "@/hooks/useCoachWorkoutSession";
import RestTimer from "@/components/workout/RestTimer";
import WorkoutHero from "@/components/workout/WorkoutHero";
import WorkoutFloatingButton from "@/components/workout/WorkoutFloatingButton";
import ActiveWorkoutHeader from "@/components/workout/ActiveWorkoutHeader";
import CoachExerciseCard from "@/components/workout/CoachExerciseCard";
import CoachExerciseListItem from "@/components/workout/CoachExerciseListItem";
import ExerciseCompletedModal from "@/components/workout/ExerciseCompletedModal";
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
}

const CoachWorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Exercise completed modal state
  const [showExerciseCompleted, setShowExerciseCompleted] = useState(false);
  const [completedExerciseInfo, setCompletedExerciseInfo] = useState<{
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
    }
  }, [routineDay]);

  // Workout timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workoutStarted && !isPaused && !showRestTimer) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutStarted, isPaused, showRestTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWorkout = async () => {
    if (!isAuthenticated) {
      toast.error("Debés iniciar sesión para entrenar", {
        action: {
          label: "Iniciar sesión",
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }

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
      const isCompleted = newCompletedSets.length >= exercise.sets;

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

  const handleFinishWorkout = async () => {
    const exercises = routineDay?.exercises || [];
    const completedExercises = exercises.filter(e => exerciseStates.get(e.id)?.completed).length;
    const completedSets = exercises.reduce((acc, e) => {
      const state = exerciseStates.get(e.id);
      return acc + (state?.completedSets.length || 0);
    }, 0);
    const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0);

    // Persist session completion
    if (session) {
      await finishSession(elapsedTime, `Routine day: ${routineDay?.name}`);
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
        <h2 className="text-xl font-bold text-foreground mb-2">
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

  const exercises = routineDay.exercises;
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
      <div className="px-5 pb-32">
        <motion.div 
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">
            Lista de Ejercicios
          </h2>
          <span className="text-xs text-muted-foreground">
            {exercises.length} ejercicios
          </span>
        </motion.div>

        <div className="space-y-3">
          {exercises.map((exercise, index) => {
            const state = exerciseStates.get(exercise.id);
            
            return workoutStarted ? (
              <CoachExerciseCard
                key={exercise.id}
                exercise={exercise}
                state={state || { id: exercise.id, completed: false, currentSet: 0, completedSets: [] }}
                index={index}
                isActive={activeExerciseId === exercise.id}
                onSelect={() => setActiveExerciseId(exercise.id)}
                onCompleteSet={handleCompleteSet}
              />
            ) : (
              <CoachExerciseListItem
                key={exercise.id}
                exercise={exercise}
                index={index + 1}
              />
            );
          })}
        </div>
      </div>

      {/* Description Section */}
      {!workoutStarted && routineDay.description && (
        <motion.div 
          className="px-5 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
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

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {showRestTimer && (
          <RestTimer 
            duration={restDuration}
            onComplete={handleRestComplete}
            onSkip={handleSkipRest}
            nextExercise={nextExerciseForRest}
            enableVibration={true}
            enableSound={true}
          />
        )}
      </AnimatePresence>

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
      />
    </motion.div>
  );
};

export default CoachWorkoutDetail;
