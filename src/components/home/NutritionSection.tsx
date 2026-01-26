import { ChevronRight } from "lucide-react";

interface NutritionSectionProps {
  targetKcal: number;
  currentPercent: number;
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  nextMeal: string;
}

const NutritionSection = ({ targetKcal, currentPercent, protein, carbs, nextMeal }: NutritionSectionProps) => {
  return (
    <div className="mx-4 mt-6 bg-secondary border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground font-bold tracking-wide">NUTRICIÓN</h3>
        <span className="text-muted-foreground text-xs">META: {targetKcal.toLocaleString()} KCAL</span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Circular Progress */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeDasharray={`${(currentPercent / 100) * 220} 220`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground">{currentPercent}%</span>
            <span className="text-[10px] text-muted-foreground">KCAL</span>
          </div>
        </div>
        
        {/* Macros */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs uppercase">Prot</span>
            <span className="text-foreground text-sm font-semibold">{protein.current}g <span className="text-muted-foreground">/{protein.target}</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs uppercase">Carbs</span>
            <span className="text-foreground text-sm font-semibold">{carbs.current}g <span className="text-muted-foreground">/{carbs.target}</span></span>
          </div>
        </div>
      </div>
      
      {/* Next Meal */}
      <button className="w-full mt-4 flex items-center justify-between bg-muted rounded-xl px-4 py-3 hover:bg-muted/80 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-green-500 text-lg">🥗</span>
          </div>
          <div className="text-left">
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Próxima comida</p>
            <p className="text-foreground text-sm font-semibold">{nextMeal}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </button>
    </div>
  );
};

export default NutritionSection;
