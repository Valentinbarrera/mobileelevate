import { useState } from "react";
import { motion } from "framer-motion";
import PageLoading from "@/components/ui/page-loading";
import { Dumbbell } from "lucide-react";
import RoutinesHeader from "@/components/routines/RoutinesHeader";
import RoutinesTabs from "@/components/routines/RoutinesTabs";
import AlumnoRoutineCard from "@/components/routines/AlumnoRoutineCard";
import BottomNav from "@/components/home/BottomNav";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAlumnoRoutines } from "@/hooks/useAlumnoRoutines";

export type TabFilter = "today" | "week" | "completed";

const Routines = () => {
  const [activeTab, setActiveTab] = useState<TabFilter>("week");
  const [searchQuery, setSearchQuery] = useState("");
  const { student, isAuthenticated } = useAuthContext();

  // Fetch routines from Coach database
  const { data: routines, isLoading, error } = useAlumnoRoutines({
    studentId: student?.id || null,
    status: activeTab === "completed" ? "completed" : "active",
  });

  // Filter by search query
  const filteredRoutines = (routines || []).filter((assignment) => {
    if (!searchQuery) return true;
    const routine = assignment.routine;
    if (!routine) return false;
    return (
      routine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      routine.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const completedCount = (routines || []).filter(
    (r) => r.status === "completed"
  ).length;

  // Show message if not authenticated with Coach
  if (!isAuthenticated) {
    return (
      <motion.div
        className="min-h-screen bg-background pb-28 flex flex-col items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Dumbbell className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">
          Conecta tu cuenta
        </h2>
        <p className="text-muted-foreground text-sm text-center mb-4">
          Inicia sesión con tu cuenta de Elevate Coach para ver las rutinas
          asignadas por tu entrenador.
        </p>
        <BottomNav />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background pb-28"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <RoutinesHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <motion.div variants={fadeUp}>
        <RoutinesTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          completedCount={completedCount}
        />
      </motion.div>

      {/* Loading state */}
      {isLoading && <PageLoading message="Cargando rutinas..." />}

      {/* Error state */}
      {error && (
        <div className="px-5 py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-destructive text-sm">Error al cargar rutinas</p>
          <p className="text-muted-foreground text-xs mt-1">
            {(error as Error).message}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredRoutines.length === 0 && (
        <motion.div
          className="px-5 py-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-semibold">No hay rutinas</p>
          <p className="text-muted-foreground text-sm mt-1">
            {activeTab === "completed"
              ? "Aún no completaste ninguna rutina"
              : "Tu coach no te ha asignado rutinas todavía"}
          </p>
        </motion.div>
      )}

      {/* Routine list */}
      {!isLoading && !error && filteredRoutines.length > 0 && (
        <div className="px-5 mt-4 space-y-3">
          {filteredRoutines.map((assignment, index) => (
            <AlumnoRoutineCard
              key={assignment.id}
              assignment={assignment}
              index={index}
            />
          ))}
        </div>
      )}

      <BottomNav />
    </motion.div>
  );
};

export default Routines;
