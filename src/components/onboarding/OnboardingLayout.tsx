import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CountUp from "@/components/ui/count-up";

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onBack?: () => void;
}

// Microcopy motivacional según el avance (dopamina por progreso).
const encouragement = (step: number, total: number): string => {
  if (step >= total) return "Último paso 🎯";
  const pct = step / total;
  if (pct <= 0.15) return "¡Arrancamos! 🚀";
  if (pct < 0.4) return "Vas muy bien 💪";
  if (pct < 0.65) return "Mitad de camino 🔥";
  if (pct < 0.85) return "Ya casi ✨";
  return "Falta poquito 🙌";
};

const OnboardingLayout = ({ currentStep, totalSteps, children, onBack }: OnboardingLayoutProps) => {
  const navigate = useNavigate();
  const progress = (currentStep / totalSteps) * 100;

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar: back + progreso motivacional */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30 px-5 pt-3 pb-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <motion.button
            onClick={handleBack}
            className="w-9 h-9 rounded-xl bg-card/60 border border-border/40 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-[18px] h-[18px] text-foreground" />
          </motion.button>

          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-primary tabular-nums leading-none">
              <CountUp value={Math.round(progress)} />%
            </span>
            <span className="text-[11px] font-bold text-muted-foreground/70">completo</span>
          </div>
        </div>

        {/* Barra de progreso con glow */}
        <div className="relative h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(18 100% 55%), hsl(28 100% 60%), hsl(38 100% 55%))" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"
            style={{ boxShadow: "0 0 12px hsl(18 100% 55% / 0.8), 0 0 24px hsl(18 100% 55% / 0.4)" }}
            initial={{ left: 0 }}
            animate={{ left: `calc(${progress}% - 6px)` }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>

        {/* Microcopy + paso */}
        <div className="flex items-center justify-between mt-2">
          <motion.span
            key={encouragement(currentStep, totalSteps)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold text-foreground/90"
          >
            {encouragement(currentStep, totalSteps)}
          </motion.span>
          <span className="text-[11px] font-bold text-muted-foreground/60 tabular-nums">
            Paso {currentStep} de {totalSteps}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
};

export default OnboardingLayout;
