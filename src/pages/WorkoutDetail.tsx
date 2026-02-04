import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";
import RestTimer from "@/components/workout/RestTimer";
import WorkoutHero from "@/components/workout/WorkoutHero";
import WorkoutFloatingButton from "@/components/workout/WorkoutFloatingButton";
import ActiveWorkoutHeader from "@/components/workout/ActiveWorkoutHeader";
import ExerciseTrackingCard from "@/components/workout/ExerciseTrackingCard";
import ExerciseListItem from "@/components/workout/ExerciseListItem";
import PageLoading from "@/components/ui/page-loading";
import { toast } from "sonner";
import type { 
  Workout, 
  Exercise as DbExercise, 
  ExerciseWithTracking,
  DifficultyLevel,
  ExerciseSet
} from "@/types/database";

// Legacy Exercise type for backwards compatibility with ExerciseListItem
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  restSeconds: number;
  notes?: string;
  videoUrl?: string;
  completed: boolean;
  currentSet: number;
  thumbnail?: string;
}

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<ExerciseWithTracking[]>([]);
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
  const [loading, setLoading] = useState(true);

  const [resolvedWorkoutId, setResolvedWorkoutId] = useState<string | null>(null);
  
  // Resolve workout ID - handle both UUID and non-UUID cases
  useEffect(() => {
    const resolveWorkoutId = async () => {
      // Check if the ID looks like a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (id && uuidRegex.test(id)) {
        setResolvedWorkoutId(id);
      } else {
        // If not a valid UUID, fetch the first available workout
        try {
          const { data, error } = await supabase
            .from("workouts")
            .select("id")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (data && !error) {
            setResolvedWorkoutId(data.id);
          } else {
            setResolvedWorkoutId(null);
          }
        } catch (err) {
          console.error("Error resolving workout ID:", err);
          setResolvedWorkoutId(null);
        }
      }
    };
    
    resolveWorkoutId();
  }, [id]);

  const { session, startSession, completeSet, finishSession, getLastPerformance, getPersonalRecords } = useWorkoutSession(resolvedWorkoutId || "");

  // Fetch workout data
  useEffect(() => {
    if (!resolvedWorkoutId) {
      setLoading(false);
      return;
    }

    const fetchWorkout = async () => {
      try {
        // Fetch workout
        const { data: workoutData, error: workoutError } = await supabase
          .from("workouts")
          .select("*")
          .eq("id", resolvedWorkoutId)
          .maybeSingle();

        if (workoutError) throw workoutError;
        if (!workoutData) {
          setLoading(false);
          return;
        }
        
        setWorkout(workoutData as Workout);

        // Fetch workout exercises with exercise details
        const { data: exercisesData, error: exercisesError } = await supabase
          .from("workout_exercises")
          .select(`
            *,
            exercise:exercises(*)
          `)
          .eq("workout_id", resolvedWorkoutId)
          .order("order_index");

        if (exercisesError) throw exercisesError;

        // Transform to ExerciseWithTracking
        const exercisesWithTracking: ExerciseWithTracking[] = await Promise.all(
          (exercisesData || []).map(async (we) => {
            let lastPerformance = null;
            let personalRecord = null;

            if (user) {
              lastPerformance = await getLastPerformance(we.exercise_id);
              personalRecord = await getPersonalRecords(we.exercise_id);
            }

            return {
              ...we,
              exercise: we.exercise as DbExercise,
              completed: false,
              currentSet: 0,
              completedSets: [],
              lastPerformance,
              personalRecord,
            } as ExerciseWithTracking;
          })
        );

        setExercises(exercisesWithTracking);
      } catch (error) {
        console.error("Error fetching workout:", error);
        toast.error("Error al cargar el entrenamiento");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [resolvedWorkoutId, user, getLastPerformance, getPersonalRecords]);

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
    if (!user) {
      toast.error("Debés iniciar sesión para entrenar", {
        action: {
          label: "Iniciar sesión",
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }

    const newSession = await startSession();
    if (newSession) {
      setWorkoutStarted(true);
      if (exercises.length > 0) {
        setActiveExerciseId(exercises[0].id);
      }
    }
  };

  const handleCompleteSet = useCallback(async (
    workoutExerciseId: string,
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number,
    difficulty: DifficultyLevel
  ): Promise<ExerciseSet | null> => {
    const result = await completeSet(workoutExerciseId, exerciseId, setNumber, weight, reps, difficulty);
    
    if (result) {
      // Update local state
      setExercises(prev => prev.map(ex => {
        if (ex.id === workoutExerciseId) {
          const newCompletedSets = [...ex.completedSets, result];
          const isCompleted = newCompletedSets.length >= ex.sets;
          
          if (!isCompleted) {
            // Show rest timer
            setRestDuration(ex.rest_seconds);
            
            // Find next exercise for preview
            const currentIndex = prev.findIndex(e => e.id === workoutExerciseId);
            const nextEx = prev[currentIndex + 1];
            if (nextEx && !nextEx.completed) {
              setNextExerciseForRest({
                name: nextEx.exercise?.name || "Ejercicio",
                sets: nextEx.sets,
                reps: nextEx.target_reps,
              });
            } else {
              setNextExerciseForRest(null);
            }
            
            setShowRestTimer(true);
          } else {
            // Move to next exercise
            const currentIndex = prev.findIndex(e => e.id === workoutExerciseId);
            const nextExercise = prev[currentIndex + 1];
            if (nextExercise && !nextExercise.completed) {
              setTimeout(() => setActiveExerciseId(nextExercise.id), 500);
            }
          }

          return {
            ...ex,
            currentSet: newCompletedSets.length,
            completedSets: newCompletedSets,
            completed: isCompleted,
          };
        }
        return ex;
      }));
    }

    return result;
  }, [completeSet]);

  const handleRestComplete = useCallback(() => {
    setShowRestTimer(false);
  }, []);

  const handleSkipRest = () => {
    setShowRestTimer(false);
  };

  const handleFinishWorkout = async () => {
    const completedSession = await finishSession(elapsedTime, undefined, undefined);
    
    const completedExercises = exercises.filter(e => e.completed).length;
    const completedSets = exercises.reduce((acc, e) => acc + e.completedSets.length, 0);
    const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0);
    
    navigate("/workout-summary", {
      state: {
        summaryData: {
          workoutName: workout?.title || "Entrenamiento",
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

  if (loading) {
    return <PageLoading message="Preparando entrenamiento..." />;
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Entrenamiento no encontrado</p>
      </div>
    );
  }

  const completedExercises = exercises.filter(e => e.completed).length;
  const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0);
  const completedSets = exercises.reduce((acc, e) => acc + e.completedSets.length, 0);

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
          title={workout.title.toUpperCase()}
          subtitle={workout.description || ""}
          duration={`${workout.duration_minutes} min`}
          intensity={workout.intensity}
          focus="Entrenamiento"
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
          {exercises.map((exercise, index) => (
            workoutStarted ? (
              <ExerciseTrackingCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                isActive={activeExerciseId === exercise.id}
                onSelect={() => setActiveExerciseId(exercise.id)}
                onCompleteSet={handleCompleteSet}
                workoutStarted={workoutStarted}
              />
            ) : (
              <ExerciseListItem
                key={exercise.id}
                exercise={{
                  id: exercise.id,
                  name: exercise.exercise?.name || "",
                  sets: exercise.sets,
                  reps: exercise.target_reps,
                  weight: exercise.target_weight ? `${exercise.target_weight}kg` : undefined,
                  restSeconds: exercise.rest_seconds,
                  notes: exercise.notes || undefined,
                  completed: false,
                  currentSet: 0,
                  thumbnail: exercise.exercise?.thumbnail || undefined,
                }}
                index={index + 1}
              />
            )
          ))}
        </div>
      </div>

      {/* Description Section */}
      {!workoutStarted && workout.description && (
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
            {workout.description}
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

export default WorkoutDetail;
