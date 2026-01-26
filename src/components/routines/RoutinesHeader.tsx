import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";

interface RoutinesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const RoutinesHeader = ({ searchQuery, onSearchChange }: RoutinesHeaderProps) => {
  return (
    <motion.header 
      className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="px-5 pt-6 pb-4">
        {/* Title Section */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-foreground">Mis Rutinas</h1>
            <p className="text-sm text-muted-foreground">Tu plan de entrenamiento personalizado</p>
          </div>
          
          {/* Profile Avatar */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">JD</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar rutinas..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-secondary/80 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          
          <motion.button
            className="w-12 h-12 rounded-xl bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default RoutinesHeader;
