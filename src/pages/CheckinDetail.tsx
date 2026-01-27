import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Scale, Percent, Battery, Moon, Brain, 
  AlertCircle, Dumbbell, Apple, MessageSquare, Trophy, Star,
  ChevronRight, User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PageContainer from "@/components/ui/page-container";
import LoadingSpinner from "@/components/ui/loading-spinner";
import type { WeeklyCheckin, CoachFeedback } from "@/types/checkin";
import { energyLabels, energyEmojis, adherenceLabels, adherenceColors } from "@/types/checkin";

const CheckinDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [checkin, setCheckin] = useState<WeeklyCheckin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckin = async () => {
      if (!id || !user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("weekly_checkins")
          .select(`
            *,
            coach_feedback(*)
          `)
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setCheckin(data as WeeklyCheckin);
      } catch (error) {
        console.error("Error fetching check-in:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchCheckin();
    }
  }, [id, user, authLoading]);

  if (loading || authLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </PageContainer>
    );
  }

  if (!checkin) {
    return (
      <PageContainer>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Check-in no encontrado</p>
        </div>
      </PageContainer>
    );
  }

  const feedback = checkin.coach_feedback?.[0];
  const adherencePercent = checkin.workouts_planned > 0
    ? Math.round((checkin.workouts_completed / checkin.workouts_planned) * 100)
    : 0;

  return (
    <PageContainer className="pb-safe">
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
            <h1 className="text-lg font-bold text-foreground">Check-in Semana {checkin.week_number}</h1>
            <p className="text-xs text-muted-foreground">
              {new Date(checkin.submitted_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="px-5 py-6 space-y-6">
        {/* Photos */}
        {(checkin.front_photo_url || checkin.side_photo_url || checkin.back_photo_url) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Fotos de Progreso
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {checkin.front_photo_url && (
                <img 
                  src={checkin.front_photo_url} 
                  alt="Frente" 
                  className="w-full aspect-[3/4] object-cover rounded-2xl"
                />
              )}
              {checkin.side_photo_url && (
                <img 
                  src={checkin.side_photo_url} 
                  alt="Perfil" 
                  className="w-full aspect-[3/4] object-cover rounded-2xl"
                />
              )}
              {checkin.back_photo_url && (
                <img 
                  src={checkin.back_photo_url} 
                  alt="Espalda" 
                  className="w-full aspect-[3/4] object-cover rounded-2xl"
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Physical Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            Métricas Físicas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {checkin.weight && (
              <div className="p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Peso</span>
                </div>
                <p className="text-2xl font-black text-foreground">{checkin.weight}kg</p>
              </div>
            )}
            {checkin.body_fat_percentage && (
              <div className="p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Grasa</span>
                </div>
                <p className="text-2xl font-black text-foreground">{checkin.body_fat_percentage}%</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Wellness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            Estado General
          </h3>
          <div className="p-4 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Energía</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{energyEmojis[checkin.energy_level]}</span>
                <span className="text-sm font-semibold text-foreground">
                  {energyLabels[checkin.energy_level]}
                </span>
              </div>
            </div>

            {checkin.sleep_quality && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm text-muted-foreground">Sueño</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < checkin.sleep_quality! ? "text-yellow-500 fill-yellow-500" : "text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {checkin.stress_level && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Estrés</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{checkin.stress_level}/5</span>
              </div>
            )}

            {checkin.soreness_level && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Dolor muscular</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{checkin.soreness_level}/5</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Adherence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            Adherencia
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Entrenamientos</span>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {checkin.workouts_completed}/{checkin.workouts_planned}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${adherencePercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Entrenamiento</span>
                </div>
                <span className={`text-sm font-bold px-2 py-1 rounded-lg ${adherenceColors[checkin.training_adherence]}`}>
                  {adherenceLabels[checkin.training_adherence]}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Apple className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Nutrición</span>
                </div>
                <span className={`text-sm font-bold px-2 py-1 rounded-lg ${adherenceColors[checkin.nutrition_adherence]}`}>
                  {adherenceLabels[checkin.nutrition_adherence]}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reflections */}
        {(checkin.wins || checkin.challenges || checkin.notes) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Reflexiones
            </h3>
            <div className="space-y-3">
              {checkin.wins && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-500">Logros</span>
                  </div>
                  <p className="text-sm text-foreground">{checkin.wins}</p>
                </div>
              )}
              {checkin.challenges && (
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-semibold text-orange-500">Desafíos</span>
                  </div>
                  <p className="text-sm text-foreground">{checkin.challenges}</p>
                </div>
              )}
              {checkin.notes && (
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">Notas</span>
                  </div>
                  <p className="text-sm text-foreground">{checkin.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Coach Feedback */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Feedback del Coach
            </h3>
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary mb-1">Tu Coach</p>
                  <p className="text-sm text-foreground leading-relaxed">{feedback.message}</p>
                </div>
              </div>

              {feedback.progress_rating && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < feedback.progress_rating! ? "text-yellow-500 fill-yellow-500" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {feedback.training_adjustment && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-2">
                  <p className="text-xs font-semibold text-blue-500 mb-1">Ajuste de Entrenamiento</p>
                  <p className="text-sm text-foreground">{feedback.training_adjustment}</p>
                </div>
              )}

              {feedback.nutrition_adjustment && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-xs font-semibold text-green-500 mb-1">Ajuste de Nutrición</p>
                  <p className="text-sm text-foreground">{feedback.nutrition_adjustment}</p>
                </div>
              )}

              {feedback.badges && feedback.badges.length > 0 && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {feedback.badges.map((badge, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* No Feedback Yet */}
        {!feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-card border border-dashed border-border text-center"
          >
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Tu coach todavía no dejó feedback para este check-in.
            </p>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
};

export default CheckinDetail;
