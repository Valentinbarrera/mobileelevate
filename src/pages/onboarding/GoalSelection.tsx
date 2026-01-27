import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, Dumbbell, Flame, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

type Goal = "muscle" | "fat_loss" | "performance" | "wellness";

interface GoalOption {
  id: Goal;
  title: string;
  subtitle: string;
  icon: typeof Dumbbell;
}

const goals: GoalOption[] = [
  {
    id: "muscle",
    title: "GANAR MUSCULATURA",
    subtitle: "Hipertrofia & Fuerza Máxima",
    icon: Dumbbell,
  },
  {
    id: "fat_loss",
    title: "PÉRDIDA DE GRASA",
    subtitle: "Definición & Metabolismo",
    icon: Flame,
  },
  {
    id: "performance",
    title: "RENDIMIENTO ATLÉTICO",
    subtitle: "Potencia, Agilidad & VO2 Max",
    icon: Zap,
  },
  {
    id: "wellness",
    title: "BIENESTAR VITAL",
    subtitle: "Longevidad & Salud Integral",
    icon: Heart,
  },
];

const GoalSelection = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleContinue = () => {
    if (selectedGoal) {
      // Store in localStorage for now, will sync to DB later
      localStorage.setItem("onboarding_goal", selectedGoal);
      navigate("/onboarding/data");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <button
          onClick={() => navigate("/welcome")}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-xs font-bold text-primary tracking-widest">
          PASO 01/02
        </span>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-foreground leading-tight">
          DEFINE TU
        </h1>
        <h1 className="text-3xl font-black leading-tight">
          META <span className="text-gradient-primary italic">ELITE</span>
        </h1>
      </motion.div>

      {/* Goal Cards */}
      <div className="flex-1 space-y-3">
        {goals.map((goal, index) => {
          const isSelected = selectedGoal === goal.id;
          const Icon = goal.icon;
          
          return (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
              onClick={() => setSelectedGoal(goal.id)}
              className={`w-full p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                isSelected
                  ? "bg-card border-primary glow-primary-sm"
                  : "bg-card/50 border-border hover:border-muted-foreground/30"
              }`}
            >
              {/* Background gradient for selected */}
              {isSelected && (
                <motion.div
                  layoutId="goal-bg"
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-primary/20" : "bg-secondary"
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm tracking-wide ${
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {goal.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {goal.subtitle}
                    </p>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected 
                    ? "bg-primary border-primary" 
                    : "border-muted-foreground/30"
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pt-6"
      >
        <Button
          onClick={handleContinue}
          disabled={!selectedGoal}
          className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          SIGUIENTE
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};

export default GoalSelection;
