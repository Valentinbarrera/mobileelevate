import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, ChevronRight, Flame, Droplets, Wheat, Apple, Search, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/home/BottomNav";
import { staggerContainer, fadeUp } from "@/lib/animations";

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  icon: string;
  logged: boolean;
}

interface MacroData {
  current: number;
  target: number;
  color: string;
  label: string;
}

const mockMeals: Meal[] = [
  { id: "1", name: "Desayuno", time: "07:30", calories: 450, protein: 35, carbs: 45, fat: 15, icon: "🍳", logged: true },
  { id: "2", name: "Snack AM", time: "10:00", calories: 180, protein: 15, carbs: 20, fat: 5, icon: "🍌", logged: true },
  { id: "3", name: "Almuerzo", time: "13:00", calories: 650, protein: 45, carbs: 60, fat: 25, icon: "🥗", logged: true },
  { id: "4", name: "Snack PM", time: "16:30", calories: 200, protein: 12, carbs: 25, fat: 8, icon: "🥜", logged: false },
  { id: "5", name: "Cena", time: "20:00", calories: 550, protein: 40, carbs: 50, fat: 20, icon: "🍖", logged: false },
];

const Nutrition = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  // Calcular totales de comidas loggeadas
  const loggedMeals = mockMeals.filter(m => m.logged);
  const totalCalories = loggedMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = loggedMeals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = loggedMeals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = loggedMeals.reduce((acc, m) => acc + m.fat, 0);

  const targets = { calories: 2500, protein: 180, carbs: 280, fat: 80 };
  const caloriePercent = Math.round((totalCalories / targets.calories) * 100);

  const macros: MacroData[] = [
    { current: totalProtein, target: targets.protein, color: "bg-blue-500", label: "Proteína" },
    { current: totalCarbs, target: targets.carbs, color: "bg-primary", label: "Carbos" },
    { current: totalFat, target: targets.fat, color: "bg-emerald-500", label: "Grasas" },
  ];

  const formattedDate = selectedDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <motion.div 
      className="min-h-screen bg-background pb-28"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-4 pt-safe">
          <div className="flex items-center gap-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-black text-foreground">Nutrición</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground capitalize">{formattedDate}</span>
              </div>
            </div>
            <button className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Calorie Ring - Hero Section */}
      <motion.div 
        className="px-4 py-6"
        variants={fadeUp}
      >
        <div className="bg-card border border-border rounded-3xl p-6">
          <div className="flex items-center gap-6">
            {/* Circular Progress */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="10"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 352" }}
                  animate={{ strokeDasharray: `${(caloriePercent / 100) * 352} 352` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Flame className="w-5 h-5 text-primary mb-1" />
                <span className="text-3xl font-black text-foreground">{totalCalories}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">de {targets.calories}</span>
              </div>
            </div>

            {/* Macros */}
            <div className="flex-1 space-y-3">
              {macros.map((macro, i) => (
                <div key={macro.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{macro.label}</span>
                    <span className="text-xs font-bold text-foreground">
                      {macro.current}g <span className="text-muted-foreground font-normal">/ {macro.target}g</span>
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${macro.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((macro.current / macro.target) * 100, 100)}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-secondary/50 rounded-2xl p-3 text-center">
              <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-black text-foreground">6</p>
              <p className="text-[9px] text-muted-foreground uppercase">Vasos agua</p>
            </div>
            <div className="bg-secondary/50 rounded-2xl p-3 text-center">
              <Apple className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-lg font-black text-foreground">3</p>
              <p className="text-[9px] text-muted-foreground uppercase">Comidas</p>
            </div>
            <div className="bg-secondary/50 rounded-2xl p-3 text-center">
              <Wheat className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-black text-foreground">85%</p>
              <p className="text-[9px] text-muted-foreground uppercase">Adherencia</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Meals Section */}
      <motion.div className="px-4" variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
            Plan de Comidas
          </h2>
          <Button
            size="sm"
            className="h-9 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar
          </Button>
        </div>

        <div className="space-y-3">
          {mockMeals.map((meal, index) => (
            <motion.div
              key={meal.id}
              className={`bg-card border rounded-2xl p-4 ${
                meal.logged ? "border-border" : "border-dashed border-muted-foreground/30"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                  meal.logged ? "bg-primary/10" : "bg-secondary/50"
                }`}>
                  {meal.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-sm ${meal.logged ? "text-foreground" : "text-muted-foreground"}`}>
                      {meal.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">{meal.time}</span>
                  </div>
                  
                  {meal.logged ? (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-primary font-semibold">{meal.calories} kcal</span>
                      <span className="text-[10px] text-muted-foreground">P: {meal.protein}g</span>
                      <span className="text-[10px] text-muted-foreground">C: {meal.carbs}g</span>
                      <span className="text-[10px] text-muted-foreground">G: {meal.fat}g</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Sin registrar</p>
                  )}
                </div>

                <ChevronRight className={`w-5 h-5 ${meal.logged ? "text-muted-foreground" : "text-primary"}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Water Tracker FAB */}
      <motion.button
        className="fixed bottom-28 right-4 w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Droplets className="w-6 h-6" />
      </motion.button>

      <BottomNav />
    </motion.div>
  );
};

export default Nutrition;
