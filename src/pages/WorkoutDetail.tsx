import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, RotateCcw, Clock, CheckCircle2, ChevronDown, ChevronUp, Dumbbell, Target, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExerciseCard from "@/components/workout/ExerciseCard";
import RestTimer from "@/components/workout/RestTimer";
import WorkoutHeader from "@/components/workout/WorkoutHeader";
import WorkoutProgress from "@/components/workout/WorkoutProgress";
import CoachNote from "@/components/workout/CoachNote";

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
  },
];

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
    
    // Find next incomplete exercise if current is done
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
      {/* Header */}
      <WorkoutHeader 
        title="Piernas y Glúteos"
        subtitle="Rutina de tu profe"
        onBack={() => navigate("/")}
        elapsedTime={formatTime(elapsedTime)}
        isActive={workoutStarted}
        isPaused={isPaused}
        onPauseToggle={() => setIsPaused(!isPaused)}
      />

      {/* Progress Bar */}
      <WorkoutProgress 
        completedExercises={completedExercises}
        totalExercises={exercises.length}
        completedSets={completedSets}
        totalSets={totalSets}
      />

      {/* Coach Note */}
      <CoachNote 
        coachName="Profe Martín"
        message="¡Hoy toca darle duro a las piernas! Recordá calentar bien antes de arrancar. Cualquier duda me escribís. 💪"
      />

      {/* Exercises List */}
      <div className="px-5 pb-32">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Ejercicios</h2>
          <span className="text-sm text-muted-foreground">
            {completedExercises}/{exercises.length} completados
          </span>
        </div>

        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index + 1}
              isActive={activeExerciseId === exercise.id}
              onSelect={() => setActiveExerciseId(exercise.id)}
              onCompleteSet={() => handleCompleteSet(exercise.id)}
              workoutStarted={workoutStarted}
            />
          ))}
        </div>
      </div>

      {/* Start Workout Button */}
      {!workoutStarted && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background via-background to-transparent"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          <motion.button
            onClick={handleStartWorkout}
            className="w-full flex items-center justify-center gap-3 bg-gradient-primary rounded-2xl py-4 min-h-[56px] shadow-lg glow-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
            </div>
            <span className="text-primary-foreground font-bold text-base tracking-wide">
              COMENZAR ENTRENAMIENTO
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Finish Workout Button */}
      {workoutStarted && completedExercises === exercises.length && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background via-background to-transparent"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          <motion.button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-3 bg-gradient-primary rounded-2xl py-4 min-h-[56px] shadow-lg glow-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
            <span className="text-primary-foreground font-bold text-base tracking-wide">
              ¡ENTRENAMIENTO COMPLETADO!
            </span>
          </motion.button>
        </motion.div>
      )}

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
