import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Header de sección consistente con título y acción opcional.
 */
const SectionHeader = ({ title, action, className = "" }: SectionHeaderProps) => {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider">
        {title}
      </h3>
      {action && (
        <button 
          onClick={action.onClick}
          className="flex items-center gap-1 text-xs text-primary font-semibold hover:opacity-80 transition-opacity"
        >
          {action.label}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
