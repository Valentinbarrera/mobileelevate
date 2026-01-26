import { Footprints, Flame, Scale, Ruler, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  trend?: string;
}

const MetricCard = ({ icon, value, label, trend }: MetricCardProps) => {
  return (
    <motion.div 
      className="flex-1 bg-secondary/60 border border-border hover:border-primary/30 rounded-2xl p-4 min-h-[100px] transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          {icon}
        </div>
        <span className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium">{label}</span>
      </div>
      <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
      {trend && (
        <p className="text-primary text-xs font-medium mt-1">{trend}</p>
      )}
    </motion.div>
  );
};

const MetricsSection = () => {
  return (
    <div className="px-5 mt-6">
      {/* Título de sección - Jerarquía 2 */}
      <h3 className="text-foreground font-bold text-sm tracking-wide uppercase mb-3">Métricas de Hoy</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <MetricCard 
          icon={<Footprints className="w-4 h-4 text-blue-400" />}
          value="8,432"
          label="Pasos"
          trend="+12% vs ayer"
        />
        <MetricCard 
          icon={<Flame className="w-4 h-4 text-primary" />}
          value="1,920"
          label="Kcal"
          trend="Meta: 2,200"
        />
      </div>
      
      {/* Segunda fila de métricas */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <motion.div 
          className="bg-secondary/60 border border-border rounded-2xl p-3 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <Scale className="w-4 h-4 text-green-400 mx-auto mb-2" />
          <p className="text-foreground font-bold text-sm">72.5 kg</p>
          <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Peso</p>
        </motion.div>
        <motion.div 
          className="bg-secondary/60 border border-border rounded-2xl p-3 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <Ruler className="w-4 h-4 text-purple-400 mx-auto mb-2" />
          <p className="text-foreground font-bold text-sm">92 cm</p>
          <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Cintura</p>
        </motion.div>
        <motion.div 
          className="bg-secondary/60 border border-border rounded-2xl p-3 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-2" />
          <p className="text-foreground font-bold text-sm">85 kg</p>
          <p className="text-muted-foreground text-[10px] uppercase tracking-wider">PR Squat</p>
        </motion.div>
      </div>
    </div>
  );
};

export default MetricsSection;
