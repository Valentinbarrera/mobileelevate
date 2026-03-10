import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Ruler } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/home/BottomNav";
import WeeklyActivity from "@/components/progress/WeeklyActivity";
import ActivityStreak from "@/components/progress/ActivityStreak";
import VolumeProgressChart from "@/components/progress/VolumeProgressChart";
import BodyMetricChart from "@/components/progress/BodyMetricChart";
import PersonalRecords from "@/components/progress/PersonalRecords";
import PageLoading from "@/components/ui/page-loading";
import { useProgressData } from "@/hooks/useProgressData";
import { useAnthropometryData } from "@/hooks/useAnthropometryData";
import { usePRData } from "@/hooks/usePRData";
import { staggerContainer, fadeUp } from "@/lib/animations";

const Progress = () => {
  const navigate = useNavigate();
  const {
    sessionsThisWeek,
    currentStreak,
    activeDaysThisMonth,
    weeklySessions,
    loading,
  } = useProgressData();
  const { weightHistory, waistHistory } = useAnthropometryData();
  const { records } = usePRData();

  const currentMonth = new Date().toLocaleString('es-AR', { month: 'long' });
  const currentYear = new Date().getFullYear();

  const chartData = useMemo(() => {
    if (!weeklySessions || weeklySessions.length === 0) return [];
    return weeklySessions.map((wv, index) => ({
      date: wv.week,
      volume: wv.volume,
      label: `Sem ${index + 1}`,
    }));
  }, [weeklySessions]);

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
          <button
            onClick={() => navigate("/measurements")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-sm font-medium text-foreground"
          >
            <Ruler className="w-4 h-4" />
            Mediciones
          </button>
        </div>
      </motion.header>

      <div className="px-5 pt-5 space-y-4">
        <motion.div variants={fadeUp}>
          <WeeklyActivity
            sessionsThisWeek={sessionsThisWeek ?? 0}
            goalMet={(sessionsThisWeek ?? 0) >= 3}
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

        {chartData.length > 0 && (
          <motion.div variants={fadeUp}>
            <VolumeProgressChart data={chartData} title="Entrenamientos Semanales" />
          </motion.div>
        )}

        {/* Weight chart - STORY-016 */}
        {weightHistory.length > 0 && (
          <motion.div variants={fadeUp}>
            <BodyMetricChart data={weightHistory} title="Peso" unit="kg" />
          </motion.div>
        )}

        {/* Waist chart - STORY-016 */}
        {waistHistory.length > 0 && (
          <motion.div variants={fadeUp}>
            <BodyMetricChart data={waistHistory} title="Cintura" unit="cm" color="#f59e0b" />
          </motion.div>
        )}

        {/* Personal Records - STORY-017 */}
        <motion.div variants={fadeUp}>
          <PersonalRecords records={records} />
        </motion.div>
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default Progress;
