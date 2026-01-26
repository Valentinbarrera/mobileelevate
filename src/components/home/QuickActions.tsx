import { Dumbbell, TrendingUp, MessageCircle, Apple } from "lucide-react";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const QuickActions = () => {
  const actions: QuickAction[] = [
    { icon: <Dumbbell className="w-6 h-6" />, label: "Rutinas" },
    { icon: <TrendingUp className="w-6 h-6" />, label: "Progreso" },
    { icon: <MessageCircle className="w-6 h-6" />, label: "Chat" },
    { icon: <Apple className="w-6 h-6" />, label: "Nutrición" },
  ];

  return (
    <div className="mx-4 mt-6">
      <h3 className="text-foreground font-bold tracking-wide mb-3">ACCESOS RÁPIDOS</h3>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 bg-secondary border border-border rounded-2xl p-4 hover:border-primary/50 hover:bg-muted transition-all group"
          >
            <div className="text-muted-foreground group-hover:text-primary transition-colors">
              {action.icon}
            </div>
            <span className="text-foreground text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
