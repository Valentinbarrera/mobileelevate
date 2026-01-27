import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, User, Activity, Zap, Flame, Sofa } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

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

  // Calculated values
  const [bmi, setBmi] = useState(0);
  const [bmr, setBmr] = useState(0);

  useEffect(() => {
    // Calculate BMI
    const heightInMeters = height / 100;
    const calculatedBmi = weight / (heightInMeters * heightInMeters);
    setBmi(Math.round(calculatedBmi * 10) / 10);

    // Calculate BMR using Mifflin-St Jeor
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
      weight,
      height,
      age,
      gender,
      activityLevel,
      bmi,
      bmr,
      goal: localStorage.getItem("onboarding_goal"),
    };
    localStorage.setItem("onboarding_data", JSON.stringify(userData));
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <button
          onClick={() => navigate("/onboarding/goal")}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-xs font-bold text-primary tracking-widest">
          PASO 02/02
        </span>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-black text-foreground leading-tight">
          CUÉNTANOS SOBRE TI
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Personaliza tu algoritmo de entrenamiento con tus datos biométricos exactos.
        </p>
      </motion.div>

      {/* Sliders Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 flex-1"
      >
        {/* Weight Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">PESO ACTUAL</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-primary">{weight}</span>
              <span className="text-sm text-muted-foreground">KG</span>
            </div>
          </div>
          <Slider
            value={[weight]}
            onValueChange={(v) => setWeight(Math.round(v[0] * 10) / 10)}
            min={40}
            max={150}
            step={0.5}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>40kg</span>
            <span>95kg</span>
            <span>150kg</span>
          </div>
        </div>

        {/* Height Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">ALTURA</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-primary">{height}</span>
              <span className="text-sm text-muted-foreground">CM</span>
            </div>
          </div>
          <Slider
            value={[height]}
            onValueChange={(v) => setHeight(Math.round(v[0]))}
            min={140}
            max={220}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>140cm</span>
            <span>180cm</span>
            <span>220cm</span>
          </div>
        </div>

        {/* Age & Gender Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Age */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">EDAD</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAge(Math.max(16, age - 1))}
                className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold text-foreground w-12 text-center">{age}</span>
              <button
                onClick={() => setAge(Math.min(80, age + 1))}
                className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">GÉNERO</span>
            <div className="flex gap-2">
              <button
                onClick={() => setGender("M")}
                className={`flex-1 h-10 rounded-xl font-bold text-sm transition-all ${
                  gender === "M"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground"
                }`}
              >
                M
              </button>
              <button
                onClick={() => setGender("F")}
                className={`flex-1 h-10 rounded-xl font-bold text-sm transition-all ${
                  gender === "F"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground"
                }`}
              >
                F
              </button>
            </div>
          </div>
        </div>

        {/* Activity Level */}
        <div className="space-y-3">
          <span className="text-sm font-medium text-muted-foreground">NIVEL DE ACTIVIDAD</span>
          <div className="grid grid-cols-4 gap-2">
            {activityLevels.map((level) => {
              const isSelected = activityLevel === level.id;
              const Icon = level.icon;
              return (
                <button
                  key={level.id}
                  onClick={() => setActivityLevel(level.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                    isSelected
                      ? "bg-primary/20 border border-primary"
                      : "bg-card border border-border"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-[9px] font-bold ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                    {level.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Feedback Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-primary tracking-widest">
              ESTIMACIÓN SAAS
            </span>
            <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-foreground mb-3">
            METABOLISMO BASAL
          </h3>
          
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-foreground">{bmr.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">KCAL/DÍA</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground ml-1">
                  NIVEL DE PRECISIÓN: ALTO
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-xs text-muted-foreground">BMI</span>
              <p className="text-xl font-bold text-foreground">{bmi}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pt-4"
      >
        <Button
          onClick={handleContinue}
          className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-base glow-primary"
        >
          CONTINUAR
        </Button>
      </motion.div>
    </div>
  );
};

export default DataHub;
