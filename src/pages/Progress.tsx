import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Ruler } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import WeeklyActivity from "@/components/progress/WeeklyActivity";
import ActivityStreak from "@/components/progress/ActivityStreak";
import VolumeProgressChart from "@/components/progress/VolumeProgressChart";
import BodyMetricChart from "@/components/progress/BodyMetricChart";
import WeightLogCard from "@/components/progress/WeightLogCard";
import PersonalRecords from "@/components/progress/PersonalRecords";
import PageLoading from "@/components/ui/page-loading";
import { useProgressData } from "@/hooks/useProgressData";
import { useAnthropometryData } from "@/hooks/useAnthropometryData";
import { useLocalBodyLog } from "@/hooks/useLocalBodyLog";
import { usePRData } from "@/hooks/usePRData";
import { useAuthContext } from "@/contexts/AuthContext";
import { getLatestCheckIn } from "@/lib/checkins";
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
  const { entries: localWeights, logWeight } = useLocalBodyLog();
  const { student, isAdminMode } = useAuthContext();
  const latestCheckIn = getLatestCheckIn(student?.id || (isAdminMode ? "admin" : "anon"));
  const [range, setRange] = useState(0); // 0 = todo · 30 = 1M · 90 = 3M

  // Peso = datos del coach + los que carga el alumno (local pisa por fecha)
  const mergedWeight = useMemo(() => {
    const map = new Map<string, number>();
    weightHistory.forEach((d) => map.set(d.date, d.value));
    localWeights.forEach((d) => map.set(d.date, d.value));
    return [...map.entries()]
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [weightHistory, localWeights]);

  const cutoff = useMemo(() => {
    if (!range) return null;
    const d = new Date();
    d.setDate(d.getDate() - range);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, [range]);

  const inRange = (arr: { date: string; value: number }[]) =>
    cutoff ? arr.filter((d) => d.date >= cutoff) : arr;

  const currentWeight = mergedWeight.length ? mergedWeight[mergedWeight.length - 1].value : null;
  const prevWeight = mergedWeight.length > 1 ? mergedWeight[mergedWeight.length - 2].value : null;

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
    <AppShell>
      <motion.div
        className="min-h-screen bg-background pb-28 lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <motion.header
          className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50"
          variants={fadeUp}
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Estadísticas</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Tu Progreso</h1>
            </div>
            <button
              onClick={() => navigate("/measurements")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl card-elevated text-sm font-semibold text-foreground"
            >
              <Ruler className="w-4 h-4" />
              Mediciones
            </button>
          </div>
        </motion.header>

        <div className="max-w-5xl mx-auto px-5 pt-5 space-y-4">
          <div className="md:grid md:grid-cols-2 md:gap-4 md:space-y-0 space-y-4">
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
          </div>

          {chartData.length > 0 && (
            <motion.div variants={fadeUp}>
              <VolumeProgressChart data={chartData} title="Entrenamientos Semanales" />
            </motion.div>
          )}

          {/* Registro de peso propio */}
          <motion.div variants={fadeUp}>
            <WeightLogCard current={currentWeight} previous={prevWeight} onLog={logWeight} />
          </motion.div>

          {/* Cuerpo: gráficos con filtro de tiempo */}
          {(mergedWeight.length > 0 || waistHistory.length > 0) && (
            <motion.div variants={fadeUp} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-0.5">
                  <span className="accent-bar" />
                  <h3 className="text-sm font-black text-foreground tracking-tight">Cuerpo</h3>
                </div>
                <div className="flex gap-1 p-1 rounded-xl bg-secondary/40 border border-white/[0.06]">
                  {[
                    { l: "1M", v: 30 },
                    { l: "3M", v: 90 },
                    { l: "Todo", v: 0 },
                  ].map((o) => (
                    <button
                      key={o.v}
                      onClick={() => setRange(o.v)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        range === o.v ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:grid md:grid-cols-2 md:gap-4 md:space-y-0 space-y-4">
                {mergedWeight.length > 0 && (
                  <BodyMetricChart data={inRange(mergedWeight)} title="Peso" unit="kg" />
                )}
                {waistHistory.length > 0 && (
                  <BodyMetricChart data={inRange(waistHistory)} title="Cintura" unit="cm" color="#f59e0b" />
                )}
              </div>
            </motion.div>
          )}

          {/* Bienestar — último check-in post-entreno */}
          {latestCheckIn && (
            <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="accent-bar" />
                <h3 className="text-sm font-black text-foreground tracking-tight">Bienestar</h3>
                <span className="ml-auto text-xs text-muted-foreground">último check-in</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-black text-foreground tabular-nums leading-none">
                    {latestCheckIn.rpe || "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide mt-1">RPE</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl leading-none">
                    {["—", "😫", "😕", "😐", "🙂", "🔥"][latestCheckIn.energy] || "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide mt-1">Energía</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl leading-none">
                    {["—", "😵", "😞", "😐", "😌", "😴"][latestCheckIn.sleep] || "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide mt-1">Sueño</p>
                </div>
              </div>
              {latestCheckIn.note && (
                <p className="text-xs text-muted-foreground mt-3 italic">"{latestCheckIn.note}"</p>
              )}
            </motion.div>
          )}

          {/* Personal Records */}
          <motion.div variants={fadeUp}>
            <PersonalRecords records={records} />
          </motion.div>
        </div>
      </motion.div>
    </AppShell>
  );
};

export default Progress;
