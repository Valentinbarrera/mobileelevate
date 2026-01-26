import { ChevronRight } from "lucide-react";

interface Program {
  id: string;
  title: string;
  imageUrl: string;
  label?: string;
}

interface ActiveProgramsProps {
  programs: Program[];
}

const ActivePrograms = ({ programs }: ActiveProgramsProps) => {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h3 className="text-foreground font-bold text-lg tracking-wide">PROGRAMAS ACTIVOS</h3>
        <button className="text-primary text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity">
          VER TODO
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-2">
        {programs.map((program) => (
          <button
            key={program.id}
            className="flex-shrink-0 w-36 rounded-2xl overflow-hidden bg-secondary border border-border hover:border-primary/50 transition-colors group"
          >
            <div 
              className="h-24 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${program.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent" />
              {program.label && (
                <span className="absolute top-2 left-2 bg-primary/80 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {program.label}
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-foreground text-sm font-semibold text-left">{program.title}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActivePrograms;
