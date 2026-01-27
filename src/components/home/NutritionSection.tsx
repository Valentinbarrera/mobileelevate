import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface NutritionSectionProps {
  targetKcal: number;
  currentPercent: number;
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat?: { current: number; target: number };
  nextMeal: string;
}

const NutritionSection = ({ targetKcal, currentPercent, protein, carbs, fat = { current: 65, target: 80 }, nextMeal }: NutritionSectionProps) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="mx-4 mt-5 bg-card border border-border rounded-2xl p-4 cursor-pointer"
      whileHover={{ borderColor: "hsl(var(--primary) / 0.3)" }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate("/nutrition")}
    >
      {/* Header con título y meta */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground font-bold text-xs tracking-wide uppercase">Nutrición</h3>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-[10px] font-medium">{targetKcal.toLocaleString()} kcal</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Circular Progress - Compacto */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="5"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 176" }}
              animate={{ strokeDasharray: `${(currentPercent / 100) * 176} 176` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black text-foreground">{currentPercent}%</span>
          </div>
        </div>
        
        {/* Macros con barras de progreso - Compactas */}
        <div className="flex-1 space-y-2">
          {/* Proteína */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-8">PRO</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(protein.current / protein.target) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
            <span className="text-[10px] text-foreground font-medium w-10 text-right">{protein.current}g</span>
          </div>
          
          {/* Carbohidratos */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-8">CAR</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(carbs.current / carbs.target) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </div>
            <span className="text-[10px] text-foreground font-medium w-10 text-right">{carbs.current}g</span>
          </div>
          
          {/* Grasas */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-8">GRA</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(fat.current / fat.target) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </div>
            <span className="text-[10px] text-foreground font-medium w-10 text-right">{fat.current}g</span>
          </div>
        </div>
      </div>
      
      {/* Próxima comida - CTA secundario */}
      <div className="flex items-center gap-3 mt-4 bg-secondary/50 rounded-xl px-3 py-2.5">
        <span className="text-lg">🥗</span>
        <div className="flex-1">
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Próxima</p>
          <p className="text-foreground text-xs font-semibold">{nextMeal}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </motion.div>
  );
};

export default NutritionSection;
