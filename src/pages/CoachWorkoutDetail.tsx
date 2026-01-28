/**
 * Workout Detail page that loads exercises from Coach database
 * Uses routine_day_id from route params or navigation state
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCoachAuthContext } from "@/contexts/CoachAuthContext";
import { useCoachHomeData, TodayRoutineDay } from "@/hooks/useCoachHomeData";
import { useAlumnoRoutineDetail } from "@/hooks/useAlumnoRoutines";
import RestTimer from "@/components/workout/RestTimer";
import WorkoutHero from "@/components/workout/WorkoutHero";
import WorkoutFloatingButton from "@/components/workout/WorkoutFloatingButton";
import ActiveWorkoutHeader from "@/components/workout/ActiveWorkoutHeader";
import CoachExerciseCard from "@/components/workout/CoachExerciseCard";
import CoachExerciseListItem from "@/components/workout/CoachExerciseListItem";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { toast } from "sonner";

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
  const { student, isAuthenticated } = useCoachAuthContext();
  const { allDays, activeRoutine } = useCoachHomeData();
  
  // Get routine day from navigation state or find in allDays
  const routineDayId = (location.state as any)?.routineDayId || id;
  
  const routineDay = useMemo(() => {
    return allDays.find(d => d.id === routineDayId) || null;
  }, [allDays, routineDayId]);

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

  const handleStartWorkout = () => {
    if (!isAuthenticated) {
      toast.error("Debés iniciar sesión para entrenar", {
        action: {
          label: "Iniciar sesión",
          onClick: () => navigate("/coach-login"),
        },
      });
      return;
    }

    setWorkoutStarted(true);
    if (routineDay?.exercises.length) {
      setActiveExerciseId(routineDay.exercises[0].id);
    }
    toast.success("¡Entrenamiento iniciado!");
  };

  const handleCompleteSet = useCallback((
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number,
    difficulty: string
  ) => {
    setExerciseStates(prev => {
      const newStates = new Map(prev);
      const state = newStates.get(exerciseId);
      
      if (!state || !routineDay) return prev;

      const exercise = routineDay.exercises.find(e => e.id === exerciseId);
      if (!exercise) return prev;

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

      // Handle rest timer or move to next exercise
      if (!isCompleted) {
        setRestDuration(exercise.restSeconds || 60);
        
        // Find next exercise
        const currentIndex = routineDay.exercises.findIndex(e => e.id === exerciseId);
        const nextEx = routineDay.exercises[currentIndex + 1];
        if (nextEx) {
          setNextExerciseForRest({
            name: nextEx.name,
            sets: nextEx.sets,
            reps: nextEx.reps,
          });
        } else {
          setNextExerciseForRest(null);
        }
        
        setShowRestTimer(true);
      } else {
        // Move to next exercise
        const currentIndex = routineDay.exercises.findIndex(e => e.id === exerciseId);
        const nextExercise = routineDay.exercises[currentIndex + 1];
        if (nextExercise) {
          setTimeout(() => setActiveExerciseId(nextExercise.id), 500);
        }
        toast.success("¡Ejercicio completado!");
      }

      return newStates;
    });
  }, [routineDay]);

  const handleRestComplete = useCallback(() => {
    setShowRestTimer(false);
  }, []);

  const handleSkipRest = () => {
    setShowRestTimer(false);
  };

  const handleFinishWorkout = () => {
    const exercises = routineDay?.exercises || [];
    const completedExercises = exercises.filter(e => exerciseStates.get(e.id)?.completed).length;
    const completedSets = exercises.reduce((acc, e) => {
      const state = exerciseStates.get(e.id);
      return acc + (state?.completedSets.length || 0);
    }, 0);
    const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0);
    
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

  // Loading state
  if (!routineDay) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
    </motion.div>
  );
};

export default CoachWorkoutDetail;
