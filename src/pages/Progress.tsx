import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Ruler,
  Camera,
  ChevronRight,
  CalendarCheck,
  CalendarDays,
  Dumbbell,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import ActivityStreak from "@/components/progress/ActivityStreak";
import VolumeProgressChart from "@/components/progress/VolumeProgressChart";
import BodyMetricChart from "@/components/progress/BodyMetricChart";
import WeightLogCard from "@/components/progress/WeightLogCard";
import WeightStats from "@/components/progress/WeightStats";
import PersonalRecords from "@/components/progress/PersonalRecords";
import ExerciseProgressCard from "@/components/progress/ExerciseProgressCard";
import WorkoutHistoryList from "@/components/progress/WorkoutHistoryList";
import CountUp from "@/components/ui/count-up";
import PageLoading from "@/components/ui/page-loading";
import { useProgressData } from "@/hooks/useProgressData";
import { useWorkoutDetails } from "@/hooks/useWorkoutDetails";
import { useAnthropometryData } from "@/hooks/useAnthropometryData";
import { useLocalBodyLog } from "@/hooks/useLocalBodyLog";
import { usePRData } from "@/hooks/usePRData";
import { useAuthContext } from "@/contexts/AuthContext";
import { getLatestCheckIn } from "@/lib/checkins";
import { getLatestReadiness } from "@/lib/readiness";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useIsDesktop } from "@/hooks/use-media-query";

const Progress = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const {
    sessionsThisWeek,
    currentStreak,
    activeDaysThisMonth,
    weeklySessions,
    loading,
  } = useProgressData();
  const { weightHistory, waistHistory } = useAnthropometryData();
  const { records } = usePRData();
  const { sessions: workoutSessions, exerciseProgress } = useWorkoutDetails();
  const { entries: localWeights, logWeight } = useLocalBodyLog();
  const { student, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");
  const latestCheckIn = getLatestCheckIn(sid);
  const latestReadiness = getLatestReadiness(sid);
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

  const weeklyGoalMet = (sessionsThisWeek ?? 0) >= 3;

  return (
    <AppShell>
      <PageHeader
        eyebrow={
          <>
            <TrendingUp className="w-3.5 h-3.5" />
            Estadísticas
          </>
        }
        title="Tu Progreso"
        maxWidth="max-w-5xl lg:max-w-6xl"
        right={
          <button
            onClick={() => navigate("/measurements")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl card-elevated text-sm font-semibold text-foreground active:scale-95 transition-transform"
          >
            <Ruler className="w-4 h-4" />
            Mediciones
          </button>
        }
      />

      <motion.div
        className="min-h-screen bg-background pb-nav lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {(() => {
          // ── Métricas clave (glance tipo cockpit Whoop/Oura) ──
          const metricsStrip = (
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2.5 md:gap-3">
              {/* Esta semana */}
              <div className="card-elevated rounded-2xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4 text-primary" />
                  </div>
                  {weeklyGoalMet && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <CountUp
                      value={sessionsThisWeek ?? 0}
                      className="text-2xl font-black tabular-nums text-foreground leading-none"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 leading-tight">
                    Esta semana
                  </p>
                </div>
              </div>

              {/* Días activos del mes (adherencia) */}
              <div className="card-elevated rounded-2xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <CountUp
                      value={activeDaysThisMonth?.length ?? 0}
                      className="text-2xl font-black tabular-nums text-foreground leading-none"
                    />
                    <span className="text-xs font-bold text-muted-foreground">días</span>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 leading-tight">
                    Activos este mes
                  </p>
                </div>
              </div>

              {/* Entrenos completados (histórico) */}
              <div className="card-elevated rounded-2xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <CountUp
                      value={workoutSessions.length}
                      className="text-2xl font-black tabular-nums text-foreground leading-none"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 leading-tight">
                    Entrenos totales
                  </p>
                </div>
              </div>
            </motion.div>
          );

          const streak = (
            <motion.div variants={fadeUp}>
              <ActivityStreak
                currentStreak={currentStreak ?? 0}
                month={currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
                year={currentYear}
                activeDays={activeDaysThisMonth ?? []}
                onOpenHistory={() => navigate("/progress/activity")}
              />
            </motion.div>
          );

          const volumeChart = chartData.length > 0 && (
            <motion.div variants={fadeUp}>
              <VolumeProgressChart
                data={chartData}
                title="Entrenamientos Semanales"
                unit="entrenos"
                legend="Entrenamientos completados por semana"
              />
            </motion.div>
          );

          const exerciseProgressCard = exerciseProgress.length > 0 && (
            <motion.div variants={fadeUp}>
              <ExerciseProgressCard exercises={exerciseProgress} />
            </motion.div>
          );

          const historyList = workoutSessions.length > 0 && (
            <motion.div variants={fadeUp}>
              <WorkoutHistoryList sessions={workoutSessions} />
            </motion.div>
          );

          const weightLog = (
            <motion.div variants={fadeUp}>
              <WeightLogCard current={currentWeight} previous={prevWeight} onLog={logWeight} />
            </motion.div>
          );

          const weightStats = mergedWeight.length > 0 && (
            <motion.div variants={fadeUp}>
              <WeightStats history={mergedWeight} onLog={logWeight} />
            </motion.div>
          );

          const bodySection = (mergedWeight.length > 0 || waistHistory.length > 0) && (
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
          );

          const wellbeing = latestCheckIn && (
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
          );

          const energyDaily = latestReadiness && (
            <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="accent-bar" />
                <h3 className="text-sm font-black text-foreground tracking-tight">Energía diaria</h3>
                <span className="ml-auto text-xs text-muted-foreground">último readiness</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center shrink-0">
                  <p className="text-3xl font-black text-primary tabular-nums leading-none">
                    <CountUp value={latestReadiness.vitality} />
                    <span className="text-sm text-muted-foreground">%</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide mt-1">Vitalidad</p>
                </div>
                <div className="flex-1 grid grid-cols-5 gap-1.5">
                  {[
                    { l: "Sueño", v: latestReadiness.sleep },
                    { l: "Energía", v: latestReadiness.energy },
                    { l: "Recup.", v: latestReadiness.recovery },
                    { l: "Estrés", v: latestReadiness.stress },
                    { l: "Motiv.", v: latestReadiness.motivation },
                  ].map((m) => (
                    <div key={m.l} className="text-center">
                      <p className="text-base font-black text-foreground tabular-nums leading-none">{m.v}</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wide mt-1">{m.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );

          const prs = (
            <motion.div variants={fadeUp}>
              <PersonalRecords records={records} />
            </motion.div>
          );

          const photosEntry = (
            <motion.button
              variants={fadeUp}
              onClick={() => navigate("/progress/photos")}
              className="w-full text-left rounded-2xl card-elevated p-4 flex items-center gap-3.5 active:scale-[0.99] hover:bg-secondary/30 transition-all"
            >
              <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Progreso visual</p>
                <p className="text-sm font-semibold text-foreground">Fotos mes a mes</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </motion.button>
          );

          // Desktop: gráficos a la izquierda, métricas/registro/PRs en rail derecho.
          if (isDesktop) {
            return (
              <div className="max-w-6xl mx-auto px-8 pt-5">
                <div className="grid grid-cols-12 gap-5 items-start">
                  <div className="col-span-8 space-y-5">
                    {metricsStrip}
                    {weightStats}
                    {bodySection}
                    {exerciseProgressCard}
                    {volumeChart}
                    {historyList}
                  </div>
                  <div className="col-span-4 space-y-5">
                    {streak}
                    {photosEntry}
                    {weightLog}
                    {prs}
                    {energyDaily}
                    {wellbeing}
                  </div>
                </div>
              </div>
            );
          }

          // Mobile: métricas clave → racha → gráficos (cuerpo, ejercicio, volumen) → PRs → historial.
          return (
            <div className="max-w-5xl mx-auto px-5 lg:px-8 pt-5 space-y-5">
              {metricsStrip}
              {streak}
              {photosEntry}
              {weightLog}
              {weightStats}
              {bodySection}
              {exerciseProgressCard}
              {volumeChart}
              {prs}
              {historyList}
              {energyDaily}
              {wellbeing}
            </div>
          );
        })()}
      </motion.div>
    </AppShell>
  );
};

export default Progress;
