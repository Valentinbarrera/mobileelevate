import { motion } from "framer-motion";
import { ClipboardCheck, ChevronRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCheckins } from "@/hooks/useCheckins";

const CheckinCTA = () => {
  const navigate = useNavigate();
  const { currentCheckin, getCurrentWeekInfo, loading } = useCheckins();
  const { weekNumber } = getCurrentWeekInfo();

  if (loading) {
    return (
      <div className="mx-5 mt-6 h-24 rounded-2xl bg-card border border-border animate-pulse" />
    );
  }

  const hasSubmitted = !!currentCheckin;

  return (
    <motion.button
      onClick={() => navigate("/checkin")}
      className={`mx-5 mt-6 p-4 rounded-2xl border transition-all w-[calc(100%-40px)] text-left ${
        hasSubmitted
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-primary/10 border-primary/30 glow-primary"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          hasSubmitted ? "bg-emerald-500/20" : "bg-primary/20"
        }`}>
          {hasSubmitted ? (
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          ) : (
            <ClipboardCheck className="w-7 h-7 text-primary" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-bold ${hasSubmitted ? "text-emerald-500" : "text-primary"}`}>
            {hasSubmitted ? "Check-in Completado" : "Check-in Semanal"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {hasSubmitted 
              ? `Semana ${weekNumber} enviado • Ver detalles`
              : `Semana ${weekNumber} • Registrá tu progreso`
            }
          </p>
        </div>

        <ChevronRight className={`w-5 h-5 ${hasSubmitted ? "text-emerald-500" : "text-primary"}`} />
      </div>

      {/* Coach feedback indicator */}
      {hasSubmitted && currentCheckin?.coach_feedback && currentCheckin.coach_feedback.length > 0 && (
        <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center gap-2">
          <span className="text-xs text-emerald-500 font-semibold">
            💬 Tu coach te dejó feedback
          </span>
        </div>
      )}
    </motion.button>
  );
};

export default CheckinCTA;
