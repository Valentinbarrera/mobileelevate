import React from "react";
import { Home, Dumbbell, TrendingUp, Trophy, User } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  id: string;
  path: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
}

const BottomNav = React.forwardRef<HTMLElement>((_, ref) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { 
      id: "home", 
      path: "/",
      icon: <Home className="w-5 h-5" strokeWidth={1.5} />,
      activeIcon: <Home className="w-5 h-5" strokeWidth={2.5} />,
      label: "Home" 
    },
    { 
      id: "routines", 
      path: "/routines",
      icon: <Dumbbell className="w-5 h-5" strokeWidth={1.5} />,
      activeIcon: <Dumbbell className="w-5 h-5" strokeWidth={2.5} />,
      label: "Rutinas" 
    },
    { 
      id: "progress", 
      path: "/progress",
      icon: <TrendingUp className="w-5 h-5" strokeWidth={1.5} />,
      activeIcon: <TrendingUp className="w-5 h-5" strokeWidth={2.5} />,
      label: "Progreso" 
    },
    { 
      id: "achievements", 
      path: "/achievements",
      icon: <Trophy className="w-5 h-5" strokeWidth={1.5} />,
      activeIcon: <Trophy className="w-5 h-5" strokeWidth={2.5} />,
      label: "Logros" 
    },
    { 
      id: "profile", 
      path: "/profile",
      icon: <User className="w-5 h-5" strokeWidth={1.5} />,
      activeIcon: <User className="w-5 h-5" strokeWidth={2.5} />,
      label: "Perfil" 
    },
  ];

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const item = navItems.find(item => item.path === currentPath);
    return item?.id || "home";
  };

  const activeTab = getActiveTab();

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 bg-background/98 backdrop-blur-xl border-t border-border z-50">
      <div className="flex items-stretch justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 touch-target"
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.1 }}
            >
              {/* Fondo activo con animación suave */}
              {isActive && (
                <motion.div 
                  className="absolute inset-x-2 inset-y-1 bg-primary/12 rounded-xl"
                  layoutId="activeNavTab"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              
              {/* Icono con transición de escala */}
              <motion.div 
                className="relative z-10 mb-0.5"
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -1 : 0
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <span className={isActive ? "text-primary" : "text-muted-foreground"}>
                  {isActive ? item.activeIcon : item.icon}
                </span>
              </motion.div>
              
              {/* Label con animación de opacidad */}
              <motion.span 
                className={`text-[10px] font-medium relative z-10 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                animate={{ opacity: isActive ? 1 : 0.7 }}
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = "BottomNav";

export default BottomNav;
