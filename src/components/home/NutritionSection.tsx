import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface NutritionSectionProps {
  targetKcal: number;
  currentPercent: number;
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat?: { current: number; target: number };
  nextMeal: string;
}

const NutritionSection = ({ targetKcal, currentPercent, protein, carbs, fat = { current: 65, target: 80 }, nextMeal }: NutritionSectionProps) => {
  return (
    <motion.div 
      className="mx-5 mt-6 bg-secondary/60 border border-border rounded-2xl p-5"
      whileHover={{ borderColor: "hsl(var(--primary) / 0.3)" }}
    >
      {/* Header con título y meta */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-foreground font-bold text-sm tracking-wide uppercase">Nutrición</h3>
        <span className="text-muted-foreground text-xs font-medium">Meta: {targetKcal.toLocaleString()} kcal</span>
      </div>
      
      <div className="flex items-start gap-5">
        {/* Circular Progress - Prominente */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="42"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="42"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 264" }}
              animate={{ strokeDasharray: `${(currentPercent / 100) * 264} 264` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-foreground">{currentPercent}%</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Consumido</span>
          </div>
        </div>
        
        {/* Macros con barras de progreso */}
        <div className="flex-1 space-y-3">
          {/* Proteína */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground text-xs uppercase tracking-wider">Proteína</span>
              <span className="text-foreground text-xs font-bold">{protein.current}g <span className="text-muted-foreground font-normal">/ {protein.target}g</span></span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(protein.current / protein.target) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
          
          {/* Carbohidratos */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground text-xs uppercase tracking-wider">Carbos</span>
              <span className="text-foreground text-xs font-bold">{carbs.current}g <span className="text-muted-foreground font-normal">/ {carbs.target}g</span></span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(carbs.current / carbs.target) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </div>
          </div>
          
          {/* Grasas */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground text-xs uppercase tracking-wider">Grasas</span>
              <span className="text-foreground text-xs font-bold">{fat.current}g <span className="text-muted-foreground font-normal">/ {fat.target}g</span></span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(fat.current / fat.target) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Próxima comida - CTA secundario */}
      <motion.button 
        className="w-full mt-5 flex items-center justify-between bg-muted/50 border border-border rounded-xl px-4 py-3 hover:bg-muted transition-colors group min-h-[56px]"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <span className="text-xl">🥗</span>
          </div>
          <div className="text-left">
            <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Próxima comida</p>
            <p className="text-foreground text-sm font-bold">{nextMeal}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </motion.button>
    </motion.div>
  );
};

export default NutritionSection;
