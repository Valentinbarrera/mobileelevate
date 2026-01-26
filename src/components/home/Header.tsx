import { Flame, Bell, ChevronRight } from "lucide-react";

interface HeaderProps {
  userName: string;
  streakDays: number;
}

const Header = ({ userName, streakDays }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            CO
          </div>
          <span className="absolute -bottom-1 -right-1 text-[8px] bg-primary text-primary-foreground px-1 rounded font-semibold">
            COACH
          </span>
        </div>
        <span className="text-foreground font-bold text-lg tracking-wide">ELEVATE</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="relative flex items-center gap-1 bg-secondary rounded-full px-3 py-2 hover:bg-muted transition-colors">
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-foreground text-sm font-semibold">{streakDays}</span>
        </button>
        <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </header>
  );
};

export default Header;
