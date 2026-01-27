import { motion } from "framer-motion";
import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RoutinesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const RoutinesHeader = ({ searchQuery, onSearchChange }: RoutinesHeaderProps) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <motion.div 
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="px-4 pt-safe">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Rutinas
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground capitalize">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar rutina o músculo..."
              className="pl-11 h-12 rounded-2xl bg-secondary/50 border-border/50 focus:border-primary/50 transition-all"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RoutinesHeader;
