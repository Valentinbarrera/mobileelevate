/**
 * Historial de comidas — la vista "¿qué vengo comiendo?" del alumno: tendencia
 * de macros en el tiempo + registro día por día. Datos LOCALES (localStorage)
 * via useNutritionHistory.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Utensils, Flame, Beef, CalendarCheck } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageLoading from "@/components/ui/page-loading";
import MacroTrendChart from "@/components/nutrition/MacroTrendChart";
import NutritionHistoryList from "@/components/nutrition/NutritionHistoryList";
import { useNutritionHistory } from "@/hooks/useNutritionHistory";
import { useStudentNutrition } from "@/hooks/useStudentNutrition";
import { useCustomDiet } from "@/hooks/useCustomDiet";
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsDesktop } from "@/hooks/use-media-query";
import { staggerContainer, fadeUp } from "@/lib/animations";

const StatCard = ({
  icon,
  value,
  unit,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  unit?: string;
  label: string;
}) => (
  <div className="card-elevated rounded-2xl p-3 flex-1 min-w-0">
    <div className="flex items-center gap-1.5 mb-1 text-primary">{icon}</div>
    <p className="text-xl font-black text-foreground tabular-nums leading-none">
      {value}
      {unit && <span className="text-xs font-bold text-muted-foreground ml-0.5">{unit}</span>}
    </p>
    <p className="text-[11px] text-muted-foreground font-medium mt-1">{label}</p>
  </div>
);

export default function NutritionHistory() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { isAdminMode } = useAuthContext();
  const { days, summary, loading } = useNutritionHistory();
  const { data: plan } = useStudentNutrition();
  const { calorieGoal: ownGoal } = useCustomDiet();

  // Objetivo para el anillo diario: plan del coach → dieta propia → fallback demo
  const calorieGoal = plan?.calories_target ?? ownGoal ?? (isAdminMode ? 3000 : null);

  const statsRow = (
    <motion.div variants={fadeUp} className="flex gap-3">
      <StatCard
        icon={<CalendarCheck className="w-4 h-4" />}
        value={summary.daysTracked}
        label="Días registrados"
      />
      <StatCard
        icon={<Flame className="w-4 h-4" />}
        value={summary.avgCalories || "—"}
        unit={summary.avgCalories ? "kcal" : undefined}
        label="Promedio/día"
      />
      <StatCard
        icon={<Beef className="w-4 h-4" />}
        value={summary.avgProtein || "—"}
        unit={summary.avgProtein ? "g" : undefined}
        label="Proteína prom."
      />
    </motion.div>
  );

  const chart = (
    <motion.div variants={fadeUp}>
      <MacroTrendChart days={days} />
    </motion.div>
  );

  const list = (
    <motion.div variants={fadeUp}>
      <NutritionHistoryList days={days} calorieGoal={calorieGoal} />
    </motion.div>
  );

  if (loading) {
    return <PageLoading message="Cargando tu historial..." />;
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
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-4xl mx-auto flex items-center gap-3 px-5 lg:px-8 py-3">
            <button onClick={() => navigate(-1)} className="text-muted-foreground" aria-label="Volver">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <Utensils className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Nutrición</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-foreground">Historial de comidas</h1>
            </div>
          </div>
        </header>

        {isDesktop ? (
          <div className="max-w-6xl mx-auto px-8 pt-5">
            <div className="grid grid-cols-12 gap-5 items-start">
              <div className="col-span-7 space-y-4">
                {statsRow}
                {chart}
              </div>
              <div className="col-span-5 space-y-4">{list}</div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-5 pt-5 space-y-4">
            {statsRow}
            {chart}
            {list}
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
