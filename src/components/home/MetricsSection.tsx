import { Footprints, Flame } from "lucide-react";

interface MetricCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const MetricCard = ({ icon, value, label }: MetricCardProps) => {
  return (
    <div className="flex-1 bg-secondary border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
};

const MetricsSection = () => {
  return (
    <div className="flex gap-3 px-4 mt-6">
      <MetricCard 
        icon={<Footprints className="w-5 h-5 text-blue-400" />}
        value="8,432"
        label="Pasos"
      />
      <MetricCard 
        icon={<Flame className="w-5 h-5 text-primary" />}
        value="1,920"
        label="Kcal"
      />
    </div>
  );
};

export default MetricsSection;
