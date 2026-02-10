import React, { forwardRef } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Program {
  id: string;
  title: string;
  imageUrl: string;
  label?: string;
  progress?: number;
}

interface ActiveProgramsProps {
  programs: Program[];
}

const ActivePrograms = forwardRef<HTMLDivElement, ActiveProgramsProps>(
  ({ programs }, ref) => {
  const navigate = useNavigate();

  return (
    <div ref={ref}>
      {/* Header de sección con CTA */}
      <div className="flex items-center justify-between px-4 mb-3">

        <h3 className="text-foreground font-bold text-xs tracking-wide uppercase">Programas Activos</h3>
        <motion.button 
          className="text-primary text-xs font-semibold flex items-center gap-0.5 hover:opacity-80 transition-opacity min-h-[44px] px-2"
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/programs")}
        >
          VER TODO
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
      
      {/* Scroll horizontal de programas */}
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-2">
        {programs.map((program) => (
          <motion.button
            key={program.id}
            className="flex-shrink-0 w-36 rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/programs")}
          >
            <div 
              className="h-24 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${program.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              {program.label && (
                <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  {program.label}
                </span>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-foreground text-xs font-bold text-left truncate">{program.title}</p>
              {program.progress !== undefined && (
                <div className="mt-1.5">
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="text-primary font-semibold">{program.progress}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${program.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
});

ActivePrograms.displayName = "ActivePrograms";

export default ActivePrograms;
