import { Home, Dumbbell, TrendingUp, MessageCircle, User } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface NavItem {
  id: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
}

const BottomNav = () => {
  const [activeTab, setActiveTab] = useState("home");

  const navItems: NavItem[] = [
    { 
      id: "home", 
      icon: <Home className="w-6 h-6" strokeWidth={1.5} />,
      activeIcon: <Home className="w-6 h-6" strokeWidth={2.5} />,
      label: "Home" 
    },
    { 
      id: "routines", 
      icon: <Dumbbell className="w-6 h-6" strokeWidth={1.5} />,
      activeIcon: <Dumbbell className="w-6 h-6" strokeWidth={2.5} />,
      label: "Rutinas" 
    },
    { 
      id: "progress", 
      icon: <TrendingUp className="w-6 h-6" strokeWidth={1.5} />,
      activeIcon: <TrendingUp className="w-6 h-6" strokeWidth={2.5} />,
      label: "Progreso" 
    },
    { 
      id: "chat", 
      icon: <MessageCircle className="w-6 h-6" strokeWidth={1.5} />,
      activeIcon: <MessageCircle className="w-6 h-6" strokeWidth={2.5} />,
      label: "Chat" 
    },
    { 
      id: "profile", 
      icon: <User className="w-6 h-6" strokeWidth={1.5} />,
      activeIcon: <User className="w-6 h-6" strokeWidth={2.5} />,
      label: "Perfil" 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border z-50">
      {/* Safe area para móviles con notch */}
      <div className="flex items-center justify-around py-2 px-1 pb-safe">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[56px] rounded-2xl transition-all duration-200 ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {/* Fondo activo */}
              {isActive && (
                <motion.div 
                  className="absolute inset-1 bg-primary/15 rounded-xl"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              {/* Icono */}
              <motion.div 
                className="relative z-10"
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isActive ? item.activeIcon : item.icon}
              </motion.div>
              
              {/* Label de texto - CRÍTICO para UX */}
              <span className={`text-[10px] font-semibold mt-1 relative z-10 tracking-wide ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                {item.label}
              </span>
              
              {/* Indicador de punto activo */}
              {isActive && (
                <motion.div 
                  className="absolute -top-1 w-1 h-1 bg-primary rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
