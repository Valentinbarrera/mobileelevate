import { motion } from "framer-motion";
import { Calendar, MessageSquare, Trophy, ChevronRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { WeeklyCheckin } from "@/types/checkin";
import { energyEmojis, adherenceLabels, adherenceColors } from "@/types/checkin";

interface CheckinHistoryCardProps {
  checkin: WeeklyCheckin;
  index: number;
}

const CheckinHistoryCard = ({ checkin, index }: CheckinHistoryCardProps) => {
  const navigate = useNavigate();
  const hasFeedback = checkin.coach_feedback && checkin.coach_feedback.length > 0;
  const adherencePercent = checkin.workouts_planned > 0 
    ? Math.round((checkin.workouts_completed / checkin.workouts_planned) * 100) 
    : 0;

  return (
    <motion.button
      onClick={() => navigate(`/checkin/${checkin.id}`)}
      className="w-full p-4 rounded-2xl bg-card border border-border text-left hover:border-primary/50 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-4">
        {/* Week indicator */}
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center">
          <span className="text-xs text-primary font-semibold">SEM</span>
          <span className="text-xl font-black text-primary">{checkin.week_number}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {new Date(checkin.submitted_at).toLocaleDateString()}
              </span>
            </div>
            {hasFeedback ? (
              <span className="flex items-center gap-1 text-xs text-emerald-500 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                Feedback
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Pendiente</span>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 mb-2">
            {checkin.weight && (
              <span className="text-sm font-bold text-foreground">{checkin.weight}kg</span>
            )}
            <span className="text-xl">{energyEmojis[checkin.energy_level]}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${adherenceColors[checkin.training_adherence]}`}>
              {adherenceLabels[checkin.training_adherence]}
            </span>
          </div>

          {/* Workouts Progress */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${adherencePercent}%` }}
                transition={{ delay: index * 0.05 + 0.2 }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {checkin.workouts_completed}/{checkin.workouts_planned}
            </span>
          </div>

          {/* Coach Feedback Preview */}
          {hasFeedback && checkin.coach_feedback?.[0] && (
            <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {checkin.coach_feedback[0].message}
                </p>
              </div>
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>
    </motion.button>
  );
};

export default CheckinHistoryCard;
