import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AchievementsTabs from "@/components/achievements/AchievementsTabs";
import AchievementsStats from "@/components/achievements/AchievementsStats";
import AchievementsList from "@/components/achievements/AchievementsList";
import BottomNav from "@/components/home/BottomNav";

export type AchievementCategory = "all" | "workouts" | "consistency" | "progress" | "social";
export type AchievementStatus = "locked" | "unlocked" | "claimed";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  status: AchievementStatus;
  xpReward: number;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const mockAchievements: Achievement[] = [
  // Workouts
  {
    id: "1",
    name: "Primer Paso",
    description: "Completa tu primer entrenamiento",
    icon: "🎯",
    category: "workouts",
    status: "claimed",
    xpReward: 50,
    unlockedAt: "15 Ene 2026",
    rarity: "common",
  },
  {
    id: "2",
    name: "Guerrero de Hierro",
    description: "Completa 10 entrenamientos",
    icon: "⚔️",
    category: "workouts",
    status: "unlocked",
    xpReward: 150,
    progress: 10,
    maxProgress: 10,
    unlockedAt: "20 Ene 2026",
    rarity: "rare",
  },
  {
    id: "3",
    name: "Leyenda del Gym",
    description: "Completa 50 entrenamientos",
    icon: "👑",
    category: "workouts",
    status: "locked",
    xpReward: 500,
    progress: 48,
    maxProgress: 50,
    rarity: "legendary",
  },
  {
    id: "4",
    name: "Maratonista",
    description: "Completa 100 entrenamientos",
    icon: "🏃",
    category: "workouts",
    status: "locked",
    xpReward: 1000,
    progress: 48,
    maxProgress: 100,
    rarity: "legendary",
  },
  // Consistency
  {
    id: "5",
    name: "En Racha",
    description: "Entrena 3 días seguidos",
    icon: "🔥",
    category: "consistency",
    status: "claimed",
    xpReward: 75,
    unlockedAt: "18 Ene 2026",
    rarity: "common",
  },
  {
    id: "6",
    name: "Imparable",
    description: "Entrena 7 días seguidos",
    icon: "💪",
    category: "consistency",
    status: "unlocked",
    xpReward: 200,
    progress: 7,
    maxProgress: 7,
    unlockedAt: "22 Ene 2026",
    rarity: "rare",
  },
  {
    id: "7",
    name: "Máquina",
    description: "Entrena 30 días seguidos",
    icon: "🤖",
    category: "consistency",
    status: "locked",
    xpReward: 750,
    progress: 12,
    maxProgress: 30,
    rarity: "epic",
  },
  {
    id: "8",
    name: "Disciplina de Acero",
    description: "No faltes ningún día del mes",
    icon: "🗓️",
    category: "consistency",
    status: "locked",
    xpReward: 400,
    progress: 20,
    maxProgress: 30,
    rarity: "epic",
  },
  // Progress
  {
    id: "9",
    name: "Transformación",
    description: "Registra tu progreso 5 veces",
    icon: "📸",
    category: "progress",
    status: "claimed",
    xpReward: 100,
    unlockedAt: "10 Ene 2026",
    rarity: "common",
  },
  {
    id: "10",
    name: "Récord Personal",
    description: "Supera tu mejor marca en un ejercicio",
    icon: "🏆",
    category: "progress",
    status: "unlocked",
    xpReward: 150,
    unlockedAt: "23 Ene 2026",
    rarity: "rare",
  },
  {
    id: "11",
    name: "Metamorfosis",
    description: "Alcanza tu peso objetivo",
    icon: "🦋",
    category: "progress",
    status: "locked",
    xpReward: 500,
    progress: 78,
    maxProgress: 100,
    rarity: "legendary",
  },
  // Social
  {
    id: "12",
    name: "Social Fitness",
    description: "Comparte tu primer logro",
    icon: "📱",
    category: "social",
    status: "claimed",
    xpReward: 50,
    unlockedAt: "16 Ene 2026",
    rarity: "common",
  },
  {
    id: "13",
    name: "Motivador",
    description: "Comparte 10 entrenamientos",
    icon: "🌟",
    category: "social",
    status: "locked",
    xpReward: 200,
    progress: 6,
    maxProgress: 10,
    rarity: "rare",
  },
];

const Achievements = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<AchievementCategory>("all");

  const filteredAchievements = activeCategory === "all" 
    ? mockAchievements 
    : mockAchievements.filter(a => a.category === activeCategory);

  const unlockedCount = mockAchievements.filter(a => a.status !== "locked").length;
  const totalXp = mockAchievements
    .filter(a => a.status === "claimed")
    .reduce((acc, a) => acc + a.xpReward, 0);

  return (
    <motion.div 
      className="min-h-screen bg-background pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-lg font-bold text-foreground">Logros y Medallas</h1>
          
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
        </div>
      </motion.header>

      {/* Stats Summary */}
      <AchievementsStats 
        unlockedCount={unlockedCount}
        totalCount={mockAchievements.length}
        totalXp={totalXp}
      />

      {/* Category Tabs */}
      <AchievementsTabs 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Achievements List */}
      <AchievementsList achievements={filteredAchievements} />

      {/* Bottom Navigation */}
      <BottomNav />
    </motion.div>
  );
};

export default Achievements;
