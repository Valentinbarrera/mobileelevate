import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Trophy, Clock, Dumbbell, Flame, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/home/BottomNav";
import { staggerContainer, fadeUp } from "@/lib/animations";

import programShred from "@/assets/program-shred.jpg";
import programZen from "@/assets/program-zen.jpg";

interface Program {
  id: string;
  name: string;
  subtitle: string;
  duration: string;
  workoutsPerWeek: number;
  intensity: "Principiante" | "Intermedio" | "Avanzado";
  imageUrl: string;
  progress?: number;
  isActive: boolean;
  isLocked: boolean;
  totalWorkouts: number;
  completedWorkouts: number;
}

const mockPrograms: Program[] = [
  {
    id: "1",
    name: "6-Week Shred",
    subtitle: "Definición extrema",
    duration: "6 semanas",
    workoutsPerWeek: 5,
    intensity: "Avanzado",
    imageUrl: programShred,
    progress: 65,
    isActive: true,
    isLocked: false,
    totalWorkouts: 30,
    completedWorkouts: 19,
  },
  {
    id: "2",
    name: "Zen Mode",
    subtitle: "Flexibilidad & Mindfulness",
    duration: "4 semanas",
    workoutsPerWeek: 3,
    intensity: "Principiante",
    imageUrl: programZen,
    progress: 30,
    isActive: false,
    isLocked: false,
    totalWorkouts: 12,
    completedWorkouts: 4,
  },
  {
    id: "3",
    name: "Powerlifting Elite",
    subtitle: "Fuerza máxima",
    duration: "12 semanas",
    workoutsPerWeek: 4,
    intensity: "Avanzado",
    imageUrl: programShred,
    isActive: false,
    isLocked: true,
    totalWorkouts: 48,
    completedWorkouts: 0,
  },
  {
    id: "4",
    name: "Athletic Performance",
    subtitle: "Potencia & Agilidad",
    duration: "8 semanas",
    workoutsPerWeek: 4,
    intensity: "Intermedio",
    imageUrl: programZen,
    isActive: false,
    isLocked: true,
    totalWorkouts: 32,
    completedWorkouts: 0,
  },
];

const intensityConfig = {
  Principiante: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
  Intermedio: { color: "text-amber-400", bg: "bg-amber-500/10" },
  Avanzado: { color: "text-red-400", bg: "bg-red-500/10" },
};

const Programs = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "available">("all");

  const filteredPrograms = mockPrograms.filter(p => {
    if (activeFilter === "active") return p.isActive || (p.progress && p.progress > 0);
    if (activeFilter === "available") return !p.isLocked && !p.isActive;
    return true;
  });

  const activeProgram = mockPrograms.find(p => p.isActive);

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
            <div>
              <h1 className="text-xl font-black text-foreground">Programas</h1>
              <p className="text-xs text-muted-foreground">Tu biblioteca de entrenamiento</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 pb-4">
            {[
              { id: "all", label: "Todos" },
              { id: "active", label: "En Curso" },
              { id: "available", label: "Disponibles" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as typeof activeFilter)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === filter.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Program Hero */}
      {activeProgram && activeFilter !== "available" && (
        <motion.div 
          className="px-4 pt-4"
          variants={fadeUp}
        >
          <div className="relative rounded-3xl overflow-hidden">
            <img 
              src={activeProgram.imageUrl}
              alt={activeProgram.name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                  Programa Activo
                </span>
              </div>
              
              <h2 className="text-2xl font-black text-white mb-1">{activeProgram.name}</h2>
              <p className="text-white/70 text-sm mb-4">{activeProgram.subtitle}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-white/60" />
                  <span className="text-xs text-white/80">{activeProgram.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-white/60" />
                  <span className="text-xs text-white/80">{activeProgram.workoutsPerWeek}x/sem</span>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${intensityConfig[activeProgram.intensity].bg} ${intensityConfig[activeProgram.intensity].color}`}>
                  {activeProgram.intensity}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${activeProgram.progress}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <span className="text-sm font-bold text-white">{activeProgram.progress}%</span>
              </div>
              
              <p className="text-xs text-white/60 mt-2">
                {activeProgram.completedWorkouts} de {activeProgram.totalWorkouts} sesiones completadas
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Programs Grid */}
      <motion.div className="px-4 pt-6" variants={fadeUp}>
        <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">
          {activeFilter === "active" ? "Programas en Curso" : activeFilter === "available" ? "Programas Disponibles" : "Todos los Programas"}
        </h3>

        <div className="space-y-4">
          {filteredPrograms.filter(p => !p.isActive || activeFilter === "all").map((program, index) => (
            <motion.div
              key={program.id}
              className={`relative rounded-2xl overflow-hidden border ${
                program.isLocked 
                  ? "opacity-60 border-border" 
                  : program.progress 
                    ? "border-primary/30" 
                    : "border-border"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: program.isLocked ? 1 : 0.98 }}
            >
              <div className="flex">
                {/* Image */}
                <div className="w-28 h-28 flex-shrink-0 relative">
                  <img 
                    src={program.imageUrl}
                    alt={program.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card" />
                  
                  {program.isLocked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white/80" />
                    </div>
                  )}
                  
                  {program.isActive && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-[9px] font-bold text-primary-foreground uppercase">
                      Activo
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 bg-card">
                  <h3 className="font-bold text-foreground text-sm mb-0.5">{program.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{program.subtitle}</p>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] text-muted-foreground">{program.duration}</span>
                    <span className="text-[10px] text-muted-foreground">{program.workoutsPerWeek}x/sem</span>
                    <span className={`text-[10px] font-semibold ${intensityConfig[program.intensity].color}`}>
                      {program.intensity}
                    </span>
                  </div>

                  {program.progress !== undefined && program.progress > 0 && !program.isActive && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${program.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-primary font-semibold">{program.progress}%</span>
                    </div>
                  )}

                  {program.isLocked && (
                    <p className="text-[10px] text-muted-foreground">🔒 Completa el programa activo para desbloquear</p>
                  )}
                </div>

                <div className="flex items-center pr-4 bg-card">
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <BottomNav />
    </motion.div>
  );
};

export default Programs;
