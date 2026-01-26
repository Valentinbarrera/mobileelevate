interface LevelProgressProps {
  level: number;
  currentXP: number;
  targetXP: number;
  badge?: string;
}

const LevelProgress = ({ level, currentXP, targetXP, badge }: LevelProgressProps) => {
  const progressPercent = (currentXP / targetXP) * 100;
  
  return (
    <div className="mx-4 mt-6 mb-4 bg-secondary border border-border rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
          <span className="text-primary-foreground font-black text-lg">{level}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-foreground font-bold">LEVEL {level}</span>
            <span className="text-muted-foreground text-sm">{currentXP.toLocaleString()} / {targetXP.toLocaleString()} XP</span>
          </div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider">{badge || "Elite Athlete Status"}</p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-primary rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <p className="text-center text-primary text-xs mt-3 font-semibold uppercase tracking-wider">
        ⚡ Meta: Double XP Weekend
      </p>
    </div>
  );
};

export default LevelProgress;
