/**
 * Page to show routine detail with all days and exercises
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Dumbbell, Clock, Zap, Play } from "lucide-react";
import { useAlumnoRoutineDetail } from "@/hooks/useAlumnoRoutines";
import LoadingSpinner from "@/components/ui/loading-spinner";
import BottomNav from "@/components/home/BottomNav";
import { staggerContainer, fadeUp } from "@/lib/animations";

const RoutineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const { data: routine, isLoading, error } = useAlumnoRoutineDetail(id || null);

  const selectedDay = useMemo(() => {
    if (!routine?.routine_days) return null;
    if (selectedDayId) {
      return routine.routine_days.find(d => d.id === selectedDayId) || null;
    }
    return routine.routine_days[0] || null;
  }, [routine, selectedDayId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Dumbbell className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">Rutina no encontrada</h2>
        <p className="text-muted-foreground text-sm text-center mb-4">
          {(error as Error)?.message || "No se pudo cargar esta rutina"}
        </p>
        <button 
          onClick={() => navigate("/routines")}
          className="text-primary text-sm font-medium"
        >
          Volver a Rutinas
        </button>
      </div>
    );
  }

  const days = routine.routine_days || [];

  return (
    <motion.div 
      className="min-h-screen bg-background pb-28"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-4 pt-safe">
          <div className="flex items-center gap-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-black text-foreground">{routine.name}</h1>
              {routine.description && (
                <p className="text-xs text-muted-foreground truncate">{routine.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <motion.div className="px-5 py-4" variants={fadeUp}>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{days.length}</p>
            <p className="text-[9px] text-muted-foreground uppercase">Días</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Dumbbell className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">
              {days.reduce((acc, d) => acc + (d.routine_exercises?.length || 0), 0)}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase">Ejercicios</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground capitalize">
              {routine.difficulty || "Moderado"}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase">Nivel</p>
          </div>
        </div>
      </motion.div>

      {/* Day Selector */}
      <motion.div className="px-5 mb-4" variants={fadeUp}>
        <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
          Días de Entrenamiento
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {days.map((day) => (
            <button
              key={day.id}
              onClick={() => setSelectedDayId(day.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-all ${
                selectedDay?.id === day.id
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-border text-foreground"
              }`}
            >
              <span className="text-xs font-semibold">Día {day.day_number}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <motion.div className="px-5" variants={fadeUp}>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground">{selectedDay.name}</h3>
                {selectedDay.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedDay.description}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {selectedDay.routine_exercises?.length || 0} ejercicios
              </span>
            </div>

            {/* Exercises */}
            <div className="space-y-2">
              {(selectedDay.routine_exercises || []).map((re, index) => (
                <div 
                  key={re.id}
                  className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {re.exercise?.name || "Ejercicio"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {re.sets} series × {re.reps} reps
                    </p>
                  </div>
                  {re.exercise?.video_url && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Play className="w-3 h-3 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Start Workout Button */}
            <motion.button
              onClick={() => navigate(`/workout/${selectedDay.id}`, {
                state: { routineDayId: selectedDay.id, routineId: routine.id, fromCoach: true }
              })}
              className="w-full mt-4 py-4 bg-gradient-primary rounded-xl text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-4 h-4 fill-current" />
              Iniciar Día {selectedDay.day_number}
            </motion.button>
          </div>
        </motion.div>
      )}

      <BottomNav />
    </motion.div>
  );
};

export default RoutineDetail;
