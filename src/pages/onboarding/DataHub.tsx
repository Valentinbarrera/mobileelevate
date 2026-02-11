import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, User, Activity, Zap, Flame, Sofa, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

type Gender = "M" | "F";
type ActivityLevel = "sedentary" | "light" | "moderate" | "intense";

const activityLevels: { id: ActivityLevel; label: string; icon: typeof Sofa }[] = [
  { id: "sedentary", label: "SEDENTARIO", icon: Sofa },
  { id: "light", label: "LIGERO", icon: User },
  { id: "moderate", label: "MODERADO", icon: Activity },
  { id: "intense", label: "INTENSO", icon: Zap },
];

const DataHub = () => {
  const navigate = useNavigate();
  const [weight, setWeight] = useState(74.5);
  const [height, setHeight] = useState(178);
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<Gender>("M");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");

  const [bmi, setBmi] = useState(0);
  const [bmr, setBmr] = useState(0);

  useEffect(() => {
    const heightInMeters = height / 100;
    const calculatedBmi = weight / (heightInMeters * heightInMeters);
    setBmi(Math.round(calculatedBmi * 10) / 10);

    let calculatedBmr;
    if (gender === "M") {
      calculatedBmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      calculatedBmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    setBmr(Math.round(calculatedBmr));
  }, [weight, height, age, gender]);

  const handleContinue = () => {
    const userData = {
      weight, height, age, gender, activityLevel, bmi, bmr,
      goal: localStorage.getItem("onboarding_goal"),
    };
    localStorage.setItem("onboarding_data", JSON.stringify(userData));
    navigate("/auth");
  };

  return (
    <OnboardingLayout currentStep={2} totalSteps={3} onBack={() => navigate("/onboarding/goal")}>
      <div className="flex-1 flex flex-col px-5 pt-4 pb-8 overflow-y-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <p className="text-xs font-bold text-primary tracking-[0.2em] mb-2">DATOS BIOMÉTRICOS</p>
          <h1 className="text-2xl font-black text-foreground leading-[1.1]">
            CUÉNTANOS
          </h1>
          <h1 className="text-2xl font-black leading-[1.1]">
            <span className="text-gradient-primary italic">SOBRE TI</span>
          </h1>
        </motion.div>

        {/* Sliders Section */}
        <div className="space-y-5 flex-1">
          {/* Weight */}
          <motion.div
            className="space-y-2.5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground tracking-wider">PESO</span>
              <div className="flex items-baseline gap-1">
                <motion.span
                  key={weight}
                  className="text-2xl font-black text-primary tabular-nums"
                  initial={{ scale: 1.15, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {weight}
                </motion.span>
                <span className="text-xs text-muted-foreground font-bold">KG</span>
              </div>
            </div>
            <Slider
              value={[weight]}
              onValueChange={(v) => setWeight(Math.round(v[0] * 10) / 10)}
              min={40} max={150} step={0.5}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/50 font-medium">
              <span>40</span><span>95</span><span>150</span>
            </div>
          </motion.div>

          {/* Height */}
          <motion.div
            className="space-y-2.5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground tracking-wider">ALTURA</span>
              <div className="flex items-baseline gap-1">
                <motion.span
                  key={height}
                  className="text-2xl font-black text-primary tabular-nums"
                  initial={{ scale: 1.15, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {height}
                </motion.span>
                <span className="text-xs text-muted-foreground font-bold">CM</span>
              </div>
            </div>
            <Slider
              value={[height]}
              onValueChange={(v) => setHeight(Math.round(v[0]))}
              min={140} max={220} step={1}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/50 font-medium">
              <span>140</span><span>180</span><span>220</span>
            </div>
          </motion.div>

          {/* Age & Gender */}
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {/* Age */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground tracking-wider">EDAD</span>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setAge(Math.max(16, age - 1))}
                  className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center active:bg-secondary"
                >
                  <Minus className="w-4 h-4 text-muted-foreground" />
                </motion.button>
                <motion.span
                  key={age}
                  className="text-xl font-black text-foreground w-10 text-center tabular-nums"
                  initial={{ scale: 1.2, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {age}
                </motion.span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setAge(Math.min(80, age + 1))}
                  className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center active:bg-secondary"
                >
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground tracking-wider">GÉNERO</span>
              <div className="flex gap-2">
                {(["M", "F"] as Gender[]).map((g) => (
                  <motion.button
                    key={g}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setGender(g)}
                    className={`flex-1 h-10 rounded-xl font-bold text-sm transition-all duration-200 ${
                      gender === g
                        ? "bg-primary text-primary-foreground glow-primary-sm"
                        : "bg-card border border-border/50 text-muted-foreground"
                    }`}
                  >
                    {g}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Activity Level */}
          <motion.div
            className="space-y-2.5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-xs font-bold text-muted-foreground tracking-wider">NIVEL DE ACTIVIDAD</span>
            <div className="grid grid-cols-4 gap-1.5">
              {activityLevels.map((level) => {
                const isSelected = activityLevel === level.id;
                const Icon = level.icon;
                return (
                  <motion.button
                    key={level.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActivityLevel(level.id)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/15 border border-primary/40"
                        : "bg-card/50 border border-border/40"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground/60"}`} />
                    <span className={`text-[8px] font-bold leading-tight ${isSelected ? "text-primary" : "text-muted-foreground/60"}`}>
                      {level.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* BMR Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card/80 border border-border/40 rounded-2xl p-4 relative overflow-hidden"
          >
            {/* Subtle shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-primary tracking-[0.15em]">TU METABOLISMO</span>
                <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <motion.div
                    key={bmr}
                    className="flex items-baseline gap-1"
                    initial={{ scale: 1.05, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <span className="text-3xl font-black text-foreground tabular-nums">{bmr.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground font-bold">KCAL/DÍA</span>
                  </motion.div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                      ))}
                    </div>
                    <span className="text-[9px] text-muted-foreground/60 ml-0.5">PRECISIÓN ALTA</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground/60">BMI</span>
                  <motion.p
                    key={bmi}
                    className="text-lg font-black text-foreground tabular-nums"
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {bmi}
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Continue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-5"
        >
          <Button
            onClick={handleContinue}
            className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-base relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            />
            <span className="relative z-10 flex items-center gap-2">
              CONTINUAR
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
};

export default DataHub;
