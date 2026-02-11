import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Dumbbell, Flame, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

type Goal = "muscle" | "fat_loss" | "performance" | "wellness";

interface GoalOption {
  id: Goal;
  title: string;
  subtitle: string;
  icon: typeof Dumbbell;
  emoji: string;
}

const goals: GoalOption[] = [
  {
    id: "muscle",
    title: "GANAR MUSCULATURA",
    subtitle: "Hipertrofia & Fuerza Máxima",
    icon: Dumbbell,
    emoji: "💪",
  },
  {
    id: "fat_loss",
    title: "PÉRDIDA DE GRASA",
    subtitle: "Definición & Metabolismo",
    icon: Flame,
    emoji: "🔥",
  },
  {
    id: "performance",
    title: "RENDIMIENTO ATLÉTICO",
    subtitle: "Potencia, Agilidad & VO2 Max",
    icon: Zap,
    emoji: "⚡",
  },
  {
    id: "wellness",
    title: "BIENESTAR VITAL",
    subtitle: "Longevidad & Salud Integral",
    icon: Heart,
    emoji: "🧘",
  },
];

const GoalSelection = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleContinue = () => {
    if (selectedGoal) {
      localStorage.setItem("onboarding_goal", selectedGoal);
      navigate("/onboarding/data");
    }
  };

  return (
    <OnboardingLayout currentStep={1} totalSteps={3} onBack={() => navigate("/welcome")}>
      <div className="flex-1 flex flex-col px-5 pt-4 pb-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-xs font-bold text-primary tracking-[0.2em] mb-2">OBJETIVO PRINCIPAL</p>
          <h1 className="text-3xl font-black text-foreground leading-[1.1]">
            ¿QUÉ QUIERES
          </h1>
          <h1 className="text-3xl font-black leading-[1.1]">
            <span className="text-gradient-primary italic">LOGRAR</span>?
          </h1>
        </motion.div>

        {/* Goal Cards */}
        <div className="flex-1 space-y-2.5">
          {goals.map((goal, index) => {
            const isSelected = selectedGoal === goal.id;
            const Icon = goal.icon;

            return (
              <motion.button
                key={goal.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.08, type: "spring", stiffness: 400, damping: 30 }}
                onClick={() => setSelectedGoal(goal.id)}
                whileTap={{ scale: 0.97 }}
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                  isSelected
                    ? "bg-card border-primary/60 glow-primary-sm"
                    : "bg-card/40 border-border/50 hover:border-muted-foreground/20"
                }`}
              >
                {/* Selected background pulse */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative flex items-center gap-4">
                  {/* Icon container */}
                  <motion.div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${
                      isSelected
                        ? "bg-primary/20 border border-primary/30"
                        : "bg-secondary/80"
                    }`}
                    animate={isSelected ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className={`w-5 h-5 transition-colors duration-300 ${
                      isSelected ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </motion.div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className={`font-bold text-sm tracking-wide transition-colors duration-300 ${
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {goal.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {goal.subtitle}
                    </p>
                  </div>

                  {/* Checkbox */}
                  <motion.div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/20"
                    }`}
                    animate={isSelected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pt-6"
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedGoal}
            className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-base disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <AnimatePresence>
              {selectedGoal && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                />
              )}
            </AnimatePresence>
            <span className="relative z-10 flex items-center gap-2">
              SIGUIENTE
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
};

export default GoalSelection;
