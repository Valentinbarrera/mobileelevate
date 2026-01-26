import { Play } from "lucide-react";

interface WorkoutCardProps {
  label: string;
  duration: string;
  title: string;
  imageUrl: string;
  onStart?: () => void;
}

const WorkoutCard = ({ label, duration, title, imageUrl, onStart }: WorkoutCardProps) => {
  return (
    <div className="mx-4 mt-4 relative rounded-2xl overflow-hidden">
      <div 
        className="relative h-52 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            {label}
          </span>
          <span className="text-muted-foreground text-sm">• {duration}</span>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-2xl font-bold text-foreground mb-3">{title}</h2>
          
          <button 
            onClick={onStart}
            className="w-full flex items-center justify-center gap-2 bg-secondary/80 backdrop-blur-sm border border-border rounded-full py-3 hover:bg-muted transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center glow-primary group-hover:animate-pulse-glow">
              <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
            </div>
            <span className="text-foreground font-semibold tracking-wide">EMPEZAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
