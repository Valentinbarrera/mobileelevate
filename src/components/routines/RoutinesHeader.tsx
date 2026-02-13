import { motion } from "framer-motion";
import { Search, Calendar, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface RoutinesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const RoutinesHeader = ({ searchQuery, onSearchChange }: RoutinesHeaderProps) => {
  const navigate = useNavigate();
  const today = new Date();
  const formattedDate = today.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <motion.div 
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/30"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="px-4 pt-safe">
        {/* Top Bar */}
        <div className="flex items-center gap-3 py-4">
          <motion.button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center text-foreground"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="flex-1">
            <h1 className="text-xl font-black text-foreground tracking-tight">
              Mis Rutinas
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3 h-3 text-primary" />
              <span className="text-[11px] text-muted-foreground capitalize">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar rutina..."
              className="pl-10 h-11 rounded-xl bg-secondary/60 border-border/40 focus:border-primary/50 focus:bg-secondary/80 transition-all text-sm"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RoutinesHeader;
