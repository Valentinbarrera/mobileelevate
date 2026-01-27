import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, TrendingUp, TrendingDown, Trophy, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { ExerciseHistory, Exercise, PersonalRecord } from "@/types/database";

interface ExerciseHistoryCardProps {
  exerciseId: string;
}

const ExerciseHistoryCard = ({ exerciseId }: ExerciseHistoryCardProps) => {
  const { user } = useAuth();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [history, setHistory] = useState<ExerciseHistory[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch exercise details
        const { data: exerciseData } = await supabase
          .from("exercises")
          .select("*")
          .eq("id", exerciseId)
          .single();

        if (exerciseData) {
          setExercise(exerciseData as Exercise);
        }

        // Fetch history
        const { data: historyData } = await supabase
          .from("exercise_history")
          .select("*")
          .eq("user_id", user.id)
          .eq("exercise_id", exerciseId)
          .order("performed_at", { ascending: false })
          .limit(10);

        if (historyData) {
          setHistory(historyData as ExerciseHistory[]);
        }

        // Fetch PRs
        const { data: prData } = await supabase
          .from("personal_records")
          .select("*")
          .eq("user_id", user.id)
          .eq("exercise_id", exerciseId);

        if (prData) {
          setPrs(prData as PersonalRecord[]);
        }
      } catch (error) {
        console.error("Error fetching exercise history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, exerciseId]);

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-card border border-border animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  const maxWeightPR = prs.find(pr => pr.record_type === "max_weight");
  const maxRepsPR = prs.find(pr => pr.record_type === "max_reps");
  const maxVolumePR = prs.find(pr => pr.record_type === "max_volume");

  // Calculate trend
  const trend = history.length >= 2
    ? history[0].max_weight - history[1].max_weight
    : 0;

  return (
    <motion.div
      className="p-4 rounded-2xl bg-card border border-border"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
          {exercise.thumbnail || <Dumbbell className="w-6 h-6 text-primary" />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground">{exercise.name}</h3>
          <p className="text-xs text-muted-foreground">{exercise.muscle_group}</p>
        </div>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          }`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-xs font-bold">{trend > 0 ? "+" : ""}{trend}kg</span>
          </div>
        )}
      </div>

      {/* PRs */}
      {(maxWeightPR || maxRepsPR) && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {maxWeightPR && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <Trophy className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-black text-foreground">{maxWeightPR.value}kg</p>
              <p className="text-[10px] text-muted-foreground uppercase">Peso máx</p>
            </div>
          )}
          {maxRepsPR && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <Trophy className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-black text-foreground">{maxRepsPR.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Reps máx</p>
            </div>
          )}
          {maxVolumePR && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <Trophy className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-black text-foreground">{Math.round(maxVolumePR.value)}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Volumen</p>
            </div>
          )}
        </div>
      )}

      {/* History Chart Preview */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Últimas sesiones
            </span>
            <button className="text-xs text-primary font-semibold flex items-center gap-1">
              Ver todo
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex items-end gap-1 h-16">
            {history.slice(0, 8).reverse().map((entry, index) => {
              const maxWeight = Math.max(...history.map(h => h.max_weight));
              const height = (entry.max_weight / maxWeight) * 100;
              
              return (
                <div
                  key={entry.id}
                  className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/40"
                  style={{ height: `${height}%` }}
                  title={`${entry.max_weight}kg - ${new Date(entry.performed_at).toLocaleDateString()}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Aún no hay historial para este ejercicio
        </div>
      )}
    </motion.div>
  );
};

export default ExerciseHistoryCard;
