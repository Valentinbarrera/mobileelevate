import { Camera, ChevronRight } from "lucide-react";

const ProgressUploadCard = () => {
  return (
    <button className="mx-4 flex items-center justify-between w-[calc(100%-2rem)] bg-secondary border border-border rounded-2xl px-4 py-4 hover:bg-muted transition-all group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Camera className="w-5 h-5 text-primary" />
        </div>
        <span className="text-foreground font-semibold tracking-wide">SUBÍ TU PROGRESO</span>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
};

export default ProgressUploadCard;
