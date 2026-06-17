import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Dumbbell, Clock, Calendar } from "lucide-react";
import BottomNav from "@/components/home/BottomNav";
import { useAlumnoRoutineDetail } from "@/hooks/useAlumnoRoutines";
import PageLoading from "@/components/ui/page-loading";
import { staggerContainer, fadeUp } from "@/lib/animations";

const RoutineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: routine, isLoading, error } = useAlumnoRoutineDetail(id || null);

  if (isLoading) {
    return <PageLoading message="Cargando rutina..." />;
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Dumbbell className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-foreground font-semibold mb-2">Rutina no encontrada</p>
        <button onClick={() => navigate("/routines")} className="text-primary text-sm font-semibold">
          Volver a Rutinas
        </button>
        <BottomNav />
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
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">{routine.name}</h1>
            {routine.description && (
              <p className="text-xs text-muted-foreground">{routine.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 flex gap-4">
        {routine.duration_weeks && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{routine.duration_weeks} semanas</span>
          </div>
        )}
        {routine.difficulty && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>{routine.difficulty}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{days.length} días</span>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {days.map((day) => {
          const exercises = day.routine_exercises || [];
          return (
            <motion.button
              key={day.id}
              variants={fadeUp}
              className="w-full text-left p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
              onClick={() => navigate(`/workout/${day.id}`, {
                state: { routineDayId: day.id, routineId: routine.id }
              })}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">{day.day_name || day.name}</p>
                  {day.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{day.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {exercises.length} ejercicios
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">D{day.order_index ?? day.day_number}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default RoutineDetail;
