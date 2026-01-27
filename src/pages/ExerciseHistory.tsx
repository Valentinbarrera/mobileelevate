import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Calendar, Dumbbell, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PageContainer from "@/components/ui/page-container";
import LoadingSpinner from "@/components/ui/loading-spinner";
import type { Exercise, ExerciseHistory as ExerciseHistoryType, PersonalRecord, ExerciseSet } from "@/types/database";
import { difficultyColors, difficultyLabels } from "@/types/database";

const ExerciseHistory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [history, setHistory] = useState<ExerciseHistoryType[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [recentSets, setRecentSets] = useState<ExerciseSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Fetch exercise details (public)
        const { data: exerciseData } = await supabase
          .from("exercises")
          .select("*")
          .eq("id", id)
          .single();

        if (exerciseData) {
          setExercise(exerciseData as Exercise);
        }

        if (user) {
          // Fetch history
          const { data: historyData } = await supabase
            .from("exercise_history")
            .select("*")
            .eq("user_id", user.id)
            .eq("exercise_id", id)
            .order("performed_at", { ascending: false })
            .limit(20);

          if (historyData) {
            setHistory(historyData as ExerciseHistoryType[]);
          }

          // Fetch PRs
          const { data: prData } = await supabase
            .from("personal_records")
            .select("*")
            .eq("user_id", user.id)
            .eq("exercise_id", id);

          if (prData) {
            setPrs(prData as PersonalRecord[]);
          }

          // Fetch recent sets
          const { data: setsData } = await supabase
            .from("exercise_sets")
            .select("*")
            .eq("exercise_id", id)
            .order("completed_at", { ascending: false })
            .limit(20);

          if (setsData) {
            setRecentSets(setsData as ExerciseSet[]);
          }
        }
      } catch (error) {
        console.error("Error fetching exercise data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [id, user, authLoading]);

  if (loading || authLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </PageContainer>
    );
  }

  if (!exercise) {
    return (
      <PageContainer>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Ejercicio no encontrado</p>
        </div>
      </PageContainer>
    );
  }

  const maxWeightPR = prs.find(pr => pr.record_type === "max_weight");
  const maxRepsPR = prs.find(pr => pr.record_type === "max_reps");
  const maxVolumePR = prs.find(pr => pr.record_type === "max_volume");

  // Calculate trend
  const trend = history.length >= 2
    ? history[0].max_weight - history[1].max_weight
    : 0;

  // Group sets by date
  const setsByDate = recentSets.reduce((acc, set) => {
    const date = new Date(set.completed_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(set);
    return acc;
  }, {} as Record<string, ExerciseSet[]>);

  return (
    <PageContainer>
      {/* Header */}
      <motion.div 
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{exercise.name}</h1>
            <p className="text-xs text-muted-foreground">{exercise.muscle_group}</p>
          </div>
        </div>
      </motion.div>

      <div className="px-5 py-6 space-y-6">
        {/* Exercise Icon */}
        <motion.div 
          className="flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-primary flex items-center justify-center text-5xl glow-primary">
            {exercise.thumbnail || <Dumbbell className="w-12 h-12 text-primary-foreground" />}
          </div>
        </motion.div>

        {/* Trend Badge */}
        {trend !== 0 && (
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            }`}>
              {trend > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span className="font-bold">{trend > 0 ? "+" : ""}{trend}kg vs última sesión</span>
            </div>
          </motion.div>
        )}

        {/* PRs Grid */}
        {user && (maxWeightPR || maxRepsPR || maxVolumePR) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Récords Personales
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {maxWeightPR && (
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                  <Trophy className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-black text-foreground">{maxWeightPR.value}kg</p>
                  <p className="text-[10px] text-muted-foreground uppercase mt-1">Peso máximo</p>
                </div>
              )}
              {maxRepsPR && (
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <Trophy className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-foreground">{maxRepsPR.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase mt-1">Reps máximas</p>
                </div>
              )}
              {maxVolumePR && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <Trophy className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-foreground">{Math.round(maxVolumePR.value)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase mt-1">Vol. máximo</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Progress Chart */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Evolución de Peso
            </h3>
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-end gap-1 h-32">
                {history.slice(0, 12).reverse().map((entry, index) => {
                  const maxWeight = Math.max(...history.map(h => h.max_weight));
                  const minWeight = Math.min(...history.map(h => h.max_weight));
                  const range = maxWeight - minWeight || 1;
                  const height = ((entry.max_weight - minWeight) / range) * 80 + 20;
                  
                  return (
                    <motion.div
                      key={entry.id}
                      className="flex-1 bg-gradient-to-t from-primary/40 to-primary rounded-t-lg relative group cursor-pointer"
                      style={{ height: `${height}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {entry.max_weight}kg
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                <span>{history.length > 0 ? new Date(history[history.length - 1].performed_at).toLocaleDateString() : ""}</span>
                <span>Hoy</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Sets History */}
        {user && Object.keys(setsByDate).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Historial de Series
            </h3>
            <div className="space-y-4">
              {Object.entries(setsByDate).slice(0, 5).map(([date, sets]) => (
                <div key={date} className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{date}</span>
                  </div>
                  <div className="space-y-2">
                    {sets.map((set, index) => (
                      <div key={set.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {set.set_number}
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            {set.weight}kg × {set.reps}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[set.difficulty]}`}>
                            {difficultyLabels[set.difficulty]}
                          </span>
                          {set.is_pr && <Trophy className="w-4 h-4 text-primary" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!user && (
          <motion.div
            className="text-center py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Iniciá sesión para ver tu historial y récords personales
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="px-6 py-3 bg-gradient-primary text-primary-foreground rounded-2xl font-bold"
            >
              Iniciar Sesión
            </button>
          </motion.div>
        )}

        {user && history.length === 0 && (
          <motion.div
            className="text-center py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aún no tenés historial para este ejercicio.
              <br />
              ¡Empezá a entrenar para ver tu progreso!
            </p>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
};

export default ExerciseHistory;
