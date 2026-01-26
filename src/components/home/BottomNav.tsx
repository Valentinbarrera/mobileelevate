import { Home, Dumbbell, TrendingUp, MessageCircle, User } from "lucide-react";
import { useState } from "react";

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

const BottomNav = () => {
  const [activeTab, setActiveTab] = useState("home");

  const navItems: NavItem[] = [
    { id: "home", icon: <Home className="w-6 h-6" />, label: "Home" },
    { id: "routines", icon: <Dumbbell className="w-6 h-6" />, label: "Rutinas" },
    { id: "progress", icon: <TrendingUp className="w-6 h-6" />, label: "Progreso" },
    { id: "chat", icon: <MessageCircle className="w-6 h-6" />, label: "Chat" },
    { id: "profile", icon: <User className="w-6 h-6" />, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur-lg border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`relative ${isActive ? "scale-110" : ""} transition-transform duration-200`}>
                {item.icon}
                {isActive && (
                  <div className="absolute -inset-2 bg-primary/20 rounded-full -z-10 animate-scale-in" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
