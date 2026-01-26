import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, Clock, Zap, Target, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExerciseCard from "@/components/workout/ExerciseCard";
import RestTimer from "@/components/workout/RestTimer";
import WorkoutHero from "@/components/workout/WorkoutHero";
import WorkoutExerciseList from "@/components/workout/WorkoutExerciseList";
import WorkoutFloatingButton from "@/components/workout/WorkoutFloatingButton";
import ActiveWorkoutHeader from "@/components/workout/ActiveWorkoutHeader";

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

const mockExercises: Exercise[] = [
  {
    id: "1",
    name: "Sentadilla Búlgara",
    sets: 4,
    reps: "12 c/pierna",
    weight: "10kg",
    restSeconds: 60,
    notes: "Mantené la espalda recta y bajá hasta que la rodilla trasera casi toque el suelo.",
    completed: false,
    currentSet: 0,
    thumbnail: "🏋️",
  },
  {
    id: "2",
    name: "Hip Thrust",
    sets: 4,
    reps: "15",
    weight: "40kg",
    restSeconds: 90,
    notes: "Apretá los glúteos arriba y mantené 2 segundos.",
    completed: false,
    currentSet: 0,
    thumbnail: "🍑",
  },
  {
    id: "3",
    name: "Peso Muerto Rumano",
    sets: 3,
    reps: "12",
    weight: "30kg",
    restSeconds: 75,
    notes: "Sentí el estiramiento en los isquiotibiales. No redondees la espalda.",
    completed: false,
    currentSet: 0,
    thumbnail: "💪",
  },
  {
    id: "4",
    name: "Zancadas Caminando",
    sets: 3,
    reps: "10 c/pierna",
    restSeconds: 60,
    notes: "Pasos largos, rodilla delantera no pasa la punta del pie.",
    completed: false,
    currentSet: 0,
    thumbnail: "🦵",
  },
  {
    id: "5",
    name: "Elevación de Talones",
    sets: 4,
    reps: "20",
    restSeconds: 45,
    notes: "Subí lento, bajá controlado. Sentí la contracción en los gemelos.",
    completed: false,
    currentSet: 0,
    thumbnail: "🦶",
  },
];

const workoutInfo = {
  title: "PIERNAS Y GLÚTEOS",
  subtitle: "Rutina de Profe Martín",
  duration: "45 min",
  intensity: "Intermedio",
  focus: "Tren Inferior",
  description: "Sesión diseñada para fortalecer y tonificar piernas y glúteos. Enfocada en ejercicios compuestos para maximizar resultados y mejorar la fuerza funcional.",
  coachNote: "¡Hoy toca darle duro a las piernas! Recordá calentar bien antes de arrancar. Cualquier duda me escribís. 💪",
};

const WorkoutDetail = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const completedExercises = exercises.filter(e => e.completed).length;
  const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0);
  const completedSets = exercises.reduce((acc, e) => acc + e.currentSet, 0);

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
    setWorkoutStarted(true);
    if (exercises.length > 0) {
      setActiveExerciseId(exercises[0].id);
    }
  };

  const handleCompleteSet = useCallback((exerciseId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        const newCurrentSet = ex.currentSet + 1;
        const isCompleted = newCurrentSet >= ex.sets;
        
        if (!isCompleted) {
          setRestDuration(ex.restSeconds);
          setShowRestTimer(true);
        }
        
        return {
          ...ex,
          currentSet: newCurrentSet,
          completed: isCompleted,
        };
      }
      return ex;
    }));
  }, []);

  const handleRestComplete = useCallback(() => {
    setShowRestTimer(false);
    
    const currentExercise = exercises.find(e => e.id === activeExerciseId);
    if (currentExercise?.completed) {
      const nextExercise = exercises.find(e => !e.completed && e.id !== activeExerciseId);
      if (nextExercise) {
        setActiveExerciseId(nextExercise.id);
      }
    }
  }, [exercises, activeExerciseId]);

  const handleSkipRest = () => {
    setShowRestTimer(false);
  };

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Active Workout Header - Only when workout started */}
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

      {/* Hero Section - Hidden when workout active */}
      {!workoutStarted && (
        <WorkoutHero
          title={workoutInfo.title}
          subtitle={workoutInfo.subtitle}
          duration={workoutInfo.duration}
          intensity={workoutInfo.intensity}
          focus={workoutInfo.focus}
          onBack={() => navigate("/")}
        />
      )}

      {/* Exercise List */}
      <WorkoutExerciseList
        exercises={exercises}
        activeExerciseId={activeExerciseId}
        workoutStarted={workoutStarted}
        onSelectExercise={setActiveExerciseId}
        onCompleteSet={handleCompleteSet}
      />

      {/* Description Section */}
      {!workoutStarted && (
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
            {workoutInfo.description}
          </p>
          
          {/* Coach Note */}
          <div className="mt-4 p-4 rounded-2xl bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                👨‍🏫
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-primary mb-1">Profe Martín</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {workoutInfo.coachNote}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating Button */}
      <WorkoutFloatingButton
        workoutStarted={workoutStarted}
        isCompleted={completedExercises === exercises.length}
        onStart={handleStartWorkout}
        onFinish={() => navigate("/workout-summary", {
          state: {
            summaryData: {
              workoutName: workoutInfo.title,
              duration: elapsedTime,
              exercisesCompleted: completedExercises,
              totalExercises: exercises.length,
              setsCompleted: completedSets,
              totalSets: totalSets,
              caloriesBurned: Math.round(elapsedTime / 60 * 7.5), // Estimate ~7.5 kcal/min
            }
          }
        })}
      />

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {showRestTimer && (
          <RestTimer 
            duration={restDuration}
            onComplete={handleRestComplete}
            onSkip={handleSkipRest}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorkoutDetail;
