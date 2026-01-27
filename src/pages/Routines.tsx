import { useState } from "react";
import { motion } from "framer-motion";
import RoutinesHeader from "@/components/routines/RoutinesHeader";
import RoutinesTabs from "@/components/routines/RoutinesTabs";
import ActiveProgram from "@/components/routines/ActiveProgram";
import RoutinesList from "@/components/routines/RoutinesList";
import BottomNav from "@/components/home/BottomNav";
import { staggerContainer, fadeUp } from "@/lib/animations";

export type RoutineStatus = "pending" | "completed" | "in_progress";
export type TabFilter = "today" | "week" | "completed";

export interface Routine {
  id: string;
  name: string;
  dayLabel: string;
  status: RoutineStatus;
  duration: string;
  intensity: "Principiante" | "Intermedio" | "Avanzado";
  muscleGroups: string[];
  exerciseCount: number;
  xpReward: number;
  thumbnail?: string;
}

const mockRoutines: Routine[] = [
  {
    id: "1",
    name: "Pecho y Tríceps",
    dayLabel: "Lunes",
    status: "completed",
    duration: "45 min",
    intensity: "Intermedio",
    muscleGroups: ["Pecho", "Tríceps"],
    exerciseCount: 6,
    xpReward: 200,
    thumbnail: "💪",
  },
  {
    id: "2",
    name: "Piernas y Glúteos",
    dayLabel: "Martes",
    status: "in_progress",
    duration: "50 min",
    intensity: "Avanzado",
    muscleGroups: ["Cuádriceps", "Glúteos", "Isquios"],
    exerciseCount: 7,
    xpReward: 250,
    thumbnail: "🦵",
  },
  {
    id: "3",
    name: "Espalda y Bíceps",
    dayLabel: "Miércoles",
    status: "pending",
    duration: "45 min",
    intensity: "Intermedio",
    muscleGroups: ["Espalda", "Bíceps"],
    exerciseCount: 6,
    xpReward: 200,
    thumbnail: "🏋️",
  },
  {
    id: "4",
    name: "Descanso Activo",
    dayLabel: "Jueves",
    status: "pending",
    duration: "20 min",
    intensity: "Principiante",
    muscleGroups: ["Movilidad", "Flexibilidad"],
    exerciseCount: 8,
    xpReward: 100,
    thumbnail: "🧘",
  },
  {
    id: "5",
    name: "Hombros y Core",
    dayLabel: "Viernes",
    status: "pending",
    duration: "40 min",
    intensity: "Intermedio",
    muscleGroups: ["Hombros", "Abdomen"],
    exerciseCount: 6,
    xpReward: 180,
    thumbnail: "🎯",
  },
  {
    id: "6",
    name: "Full Body HIIT",
    dayLabel: "Sábado",
    status: "pending",
    duration: "35 min",
    intensity: "Avanzado",
    muscleGroups: ["Full Body"],
    exerciseCount: 10,
    xpReward: 300,
    thumbnail: "🔥",
  },
];

const programInfo = {
  name: "VOLUMEN ÉLITE",
  subtitle: "8 semanas • Hipertrofia",
  progress: 35,
};

const Routines = () => {
  const [activeTab, setActiveTab] = useState<TabFilter>("week");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoutines = mockRoutines.filter((routine) => {
    if (activeTab === "today") {
      const today = new Date().toLocaleDateString("es-ES", { weekday: "long" });
      const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);
      return routine.dayLabel.toLowerCase() === todayCapitalized.toLowerCase();
    }
    if (activeTab === "completed") {
      return routine.status === "completed";
    }
    return true;
  }).filter((routine) => {
    if (!searchQuery) return true;
    return routine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           routine.muscleGroups.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const completedCount = mockRoutines.filter(r => r.status === "completed").length;
  const inProgressRoutine = mockRoutines.find(r => r.status === "in_progress");

  return (
    <motion.div 
      className="min-h-screen bg-background pb-24"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <RoutinesHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <motion.div variants={fadeUp}>
        <RoutinesTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          completedCount={completedCount}
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <ActiveProgram 
          name={programInfo.name}
          subtitle={programInfo.subtitle}
          progress={programInfo.progress}
        />
      </motion.div>

      {inProgressRoutine && activeTab !== "completed" && (
        <motion.div 
          className="px-5 mb-3"
          variants={fadeUp}
        >
          <p className="text-label-primary">
            Continuar donde lo dejaste
          </p>
        </motion.div>
      )}

      <RoutinesList 
        routines={filteredRoutines}
        emptyMessage={
          activeTab === "today" 
            ? "No hay rutina programada para hoy" 
            : activeTab === "completed"
              ? "Aún no completaste ninguna rutina"
              : "No se encontraron rutinas"
        }
      />

      <BottomNav />
    </motion.div>
  );
};

export default Routines;
