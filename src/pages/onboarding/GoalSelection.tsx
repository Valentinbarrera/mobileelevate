import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Dumbbell, Flame, Zap, Heart, ChevronRight } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

type Goal = "muscle" | "fat_loss" | "performance" | "wellness";

interface GoalOption {
  id: Goal;
  title: string;
  subtitle: string;
  icon: typeof Dumbbell;
  gradient: string;
  glowColor: string;
}

const goals: GoalOption[] = [
  {
    id: "muscle",
    title: "GANAR MUSCULATURA",
    subtitle: "Hipertrofia & Fuerza Máxima",
    icon: Dumbbell,
    gradient: "linear-gradient(135deg, hsl(18 100% 55% / 0.15), hsl(28 100% 60% / 0.05))",
    glowColor: "hsl(18 100% 55%)",
  },
  {
    id: "fat_loss",
    title: "PÉRDIDA DE GRASA",
    subtitle: "Definición & Metabolismo",
    icon: Flame,
    gradient: "linear-gradient(135deg, hsl(30 100% 50% / 0.15), hsl(40 100% 55% / 0.05))",
    glowColor: "hsl(30 100% 50%)",
  },
  {
    id: "performance",
    title: "RENDIMIENTO ATLÉTICO",
    subtitle: "Potencia, Agilidad & VO2 Max",
    icon: Zap,
    gradient: "linear-gradient(135deg, hsl(45 100% 50% / 0.15), hsl(50 100% 55% / 0.05))",
    glowColor: "hsl(45 100% 50%)",
  },
  {
    id: "wellness",
    title: "BIENESTAR VITAL",
    subtitle: "Longevidad & Salud Integral",
    icon: Heart,
    gradient: "linear-gradient(135deg, hsl(10 100% 60% / 0.15), hsl(15 100% 55% / 0.05))",
    glowColor: "hsl(10 100% 60%)",
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
      <div className="flex-1 flex flex-col px-5 pt-6 pb-10">
        {/* Title section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-8"
        >
          <motion.p
            className="text-[11px] font-bold text-primary tracking-[0.25em] mb-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            OBJETIVO PRINCIPAL
          </motion.p>
          <h1 className="text-[2rem] font-black text-foreground leading-[1.1] tracking-tight">
            ¿QUÉ QUIERES
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-[2rem] font-black leading-[1.1] tracking-tight">
              <span className="text-gradient-primary italic">LOGRAR</span>
              <span className="text-foreground">?</span>
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="h-[2px] flex-1 bg-gradient-to-r from-primary/50 to-transparent origin-left"
            />
          </div>
        </motion.div>

        {/* Goal Cards */}
        <div className="flex-1 space-y-3">
          {goals.map((goal, index) => {
            const isSelected = selectedGoal === goal.id;
            const Icon = goal.icon;

            return (
              <motion.button
                key={goal.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.25 + index * 0.1,
                  type: "spring",
                  stiffness: 350,
                  damping: 28,
                }}
                onClick={() => setSelectedGoal(goal.id)}
                whileTap={{ scale: 0.97 }}
                className="w-full text-left relative overflow-hidden group"
              >
                <motion.div
                  className="p-4 rounded-2xl border transition-colors duration-300"
                  style={{
                    background: isSelected ? goal.gradient : "rgba(255,255,255,0.02)",
                    borderColor: isSelected
                      ? "hsl(18 100% 55% / 0.4)"
                      : "rgba(255,255,255,0.06)",
                    boxShadow: isSelected
                      ? `0 4px 24px ${goal.glowColor.replace(")", " / 0.15)")}, inset 0 1px 0 rgba(255,255,255,0.05)`
                      : "none",
                  }}
                  animate={isSelected ? { scale: [1, 1.01, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative flex items-center gap-4">
                    {/* Icon */}
                    <motion.div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                      style={{
                        background: isSelected
                          ? "linear-gradient(135deg, hsl(18 100% 55% / 0.2), hsl(28 100% 60% / 0.1))"
                          : "rgba(255,255,255,0.04)",
                        border: isSelected
                          ? "1px solid hsl(18 100% 55% / 0.3)"
                          : "1px solid rgba(255,255,255,0.06)",
                      }}
                      animate={isSelected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                      <Icon
                        className={`w-6 h-6 transition-colors duration-300 ${
                          isSelected ? "text-primary" : "text-muted-foreground/60"
                        }`}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />
                      {/* Icon glow */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 rounded-2xl"
                            style={{
                              boxShadow: `inset 0 0 16px ${goal.glowColor.replace(")", " / 0.2)")}`,
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-bold text-[13px] tracking-wide transition-colors duration-300 ${
                          isSelected ? "text-foreground" : "text-foreground/60"
                        }`}
                      >
                        {goal.title}
                      </h3>
                      <p
                        className={`text-xs mt-1 transition-colors duration-300 ${
                          isSelected ? "text-muted-foreground" : "text-muted-foreground/50"
                        }`}
                      >
                        {goal.subtitle}
                      </p>
                    </div>

                    {/* Selection indicator */}
                    <motion.div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                        isSelected
                          ? "border-primary"
                          : "border-muted-foreground/15"
                      }`}
                      style={{
                        background: isSelected
                          ? "linear-gradient(135deg, hsl(18 100% 55%), hsl(25 100% 48%))"
                          : "transparent",
                        boxShadow: isSelected
                          ? "0 2px 12px hsl(18 100% 55% / 0.4)"
                          : "none",
                      }}
                      animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          >
                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Selected bottom energy bar */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        className="mt-3 h-[2px] rounded-full overflow-hidden"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{ originX: 0 }}
                      >
                        <motion.div
                          className="h-full w-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${goal.glowColor}, transparent)`,
                          }}
                          animate={{ x: ["-100%", "0%"] }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="pt-8"
        >
          <motion.button
            onClick={handleContinue}
            disabled={!selectedGoal}
            className="relative w-full h-[58px] rounded-2xl font-bold text-base tracking-wide text-white overflow-hidden disabled:opacity-25 disabled:cursor-not-allowed"
            style={{
              background: selectedGoal
                ? "linear-gradient(135deg, hsl(18 100% 52%), hsl(25 100% 48%), hsl(15 100% 45%))"
                : "rgba(255,255,255,0.06)",
              boxShadow: selectedGoal
                ? "0 8px 32px hsl(18 100% 50% / 0.35), 0 2px 8px hsl(18 100% 50% / 0.25), inset 0 1px 0 hsl(28 100% 70% / 0.25)"
                : "none",
            }}
            whileHover={selectedGoal ? { scale: 1.02, y: -1 } : {}}
            whileTap={selectedGoal ? { scale: 0.98 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Shimmer */}
            <AnimatePresence>
              {selectedGoal && (
                <motion.div
                  className="absolute inset-0 opacity-25"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
                  }}
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{
                    delay: 0.5,
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                />
              )}
            </AnimatePresence>
            {/* Top highlight */}
            {selectedGoal && (
              <div
                className="absolute inset-x-6 top-0 h-[1px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2.5">
              <Zap className="w-5 h-5" strokeWidth={2.5} />
              SIGUIENTE
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
};

export default GoalSelection;
