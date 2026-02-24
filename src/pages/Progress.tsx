import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import BottomNav from "@/components/home/BottomNav";
import WeeklyActivity from "@/components/progress/WeeklyActivity";
import ActivityStreak from "@/components/progress/ActivityStreak";
import VolumeProgressChart from "@/components/progress/VolumeProgressChart";
import PageLoading from "@/components/ui/page-loading";
import { useProgressData } from "@/hooks/useProgressData";
import { staggerContainer, fadeUp } from "@/lib/animations";

const Progress = () => {
  const {
    totalMinutesThisWeek,
    currentStreak,
    activeDaysThisMonth,
    weeklyVolume,
    loading,
  } = useProgressData();

  const currentMonth = new Date().toLocaleString('es-AR', { month: 'long' });
  const currentYear = new Date().getFullYear();

  // Format weekly volume for chart
  const chartData = useMemo(() => {
    if (!weeklyVolume || weeklyVolume.length === 0) {
      return [
        { date: "2026-01-06", volume: 0, label: "Sem 1" },
        { date: "2026-01-13", volume: 0, label: "Sem 2" },
        { date: "2026-01-20", volume: 0, label: "Sem 3" },
        { date: "2026-01-27", volume: 0, label: "Sem 4" },
      ];
    }
    return weeklyVolume.map((wv, index) => ({
      date: wv.week,
      volume: wv.volume,
      label: `Sem ${index + 1}`,
    }));
  }, [weeklyVolume]);

  if (loading) {
    return <PageLoading message="Analizando tu progreso..." />;
  }

  return (
    <motion.div
      className="min-h-screen bg-background pb-28"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50"
        variants={fadeUp}
      >
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Estadísticas</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Tu Progreso</h1>
          </div>
        </div>
      </motion.header>

      <div className="px-5 pt-5 space-y-4">
        <motion.div variants={fadeUp}>
          <WeeklyActivity
            totalMinutes={totalMinutesThisWeek ?? 0}
            goalMet={(totalMinutesThisWeek ?? 0) >= 150}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <ActivityStreak
            currentStreak={currentStreak ?? 0}
            month={currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
            year={currentYear}
            activeDays={activeDaysThisMonth ?? []}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <VolumeProgressChart data={chartData} title="Entrenamientos Semanales" />
        </motion.div>
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default Progress;
