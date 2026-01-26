interface WeeklyProgressProps {
  completedDays: number;
  totalDays: number;
}

const WeeklyProgress = ({ completedDays, totalDays }: WeeklyProgressProps) => {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  
  return (
    <div className="mx-4 mt-6 bg-secondary border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground font-bold tracking-wide">PROGRESO SEMANAL</h3>
        <span className="text-muted-foreground text-sm">{completedDays}/{totalDays} entrenamientos</span>
      </div>
      
      <div className="flex justify-between gap-2">
        {days.map((day, index) => {
          const isCompleted = index < completedDays;
          const isToday = index === completedDays;
          
          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                  ${isCompleted 
                    ? 'bg-gradient-primary text-primary-foreground' 
                    : isToday 
                      ? 'border-2 border-primary text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}
              >
                {isCompleted ? '✓' : day}
              </div>
              <span className={`text-xs ${isToday ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyProgress;
