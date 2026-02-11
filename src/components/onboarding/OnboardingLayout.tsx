import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onBack?: () => void;
}

const OnboardingLayout = ({ currentStep, totalSteps, children, onBack }: OnboardingLayoutProps) => {
  const navigate = useNavigate();
  const progress = (currentStep / totalSteps) * 100;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar with back + steps */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30 px-5 pt-3 pb-4">
        <div className="flex items-center justify-between mb-3">
          <motion.button
            onClick={handleBack}
            className="w-9 h-9 rounded-xl bg-card/60 border border-border/40 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
          </motion.button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground tracking-widest">
              PASO
            </span>
            <span className="text-xs font-black text-primary tabular-nums">
              {String(currentStep).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground/50">/</span>
            <span className="text-xs font-bold text-muted-foreground/50 tabular-nums">
              {String(totalSteps).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, hsl(18 100% 55%), hsl(28 100% 60%), hsl(38 100% 55%))",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          {/* Glow dot at the end */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"
            style={{
              boxShadow: "0 0 12px hsl(18 100% 55% / 0.8), 0 0 24px hsl(18 100% 55% / 0.4)",
            }}
            initial={{ left: 0 }}
            animate={{ left: `calc(${progress}% - 6px)` }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-between mt-2 px-0.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <motion.div
              key={i}
              className={`flex items-center gap-1 ${i + 1 <= currentStep ? "opacity-100" : "opacity-30"}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 500, damping: 25 }}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  i + 1 < currentStep
                    ? "bg-primary"
                    : i + 1 === currentStep
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                }`}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        className="flex-1 flex flex-col"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default OnboardingLayout;
