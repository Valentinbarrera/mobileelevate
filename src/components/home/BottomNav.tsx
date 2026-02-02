import React from "react";
import { Home, Dumbbell, Plus, Trophy, User } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  id: string;
  path: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  isCenter?: boolean;
}

// Haptic feedback utility
const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10); // Light vibration
  }
};

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
      icon: <Plus className="w-6 h-6" strokeWidth={2} />,
      activeIcon: <Plus className="w-6 h-6" strokeWidth={2.5} />,
      label: "Progreso",
      isCenter: true
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

  const handleNavClick = (item: NavItem) => {
    triggerHaptic();
    navigate(item.path);
  };

  return (
    <nav 
      ref={ref} 
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '0.5px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="flex items-end justify-around px-2 pb-safe pt-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          // Center floating button
          if (item.isCenter) {
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className="relative flex flex-col items-center -mt-4"
                whileTap={{ scale: 0.9 }}
              >
                {/* Floating circle button */}
                <motion.div 
                  className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg"
                  style={{
                    boxShadow: '0 4px 20px hsl(18 100% 55% / 0.4)',
                  }}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                  }}
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <span className="text-primary-foreground">
                    {item.icon}
                  </span>
                </motion.div>
                
                {/* Label for center button */}
                <span className="text-[10px] font-medium text-primary mt-1">
                  {item.label}
                </span>
              </motion.button>
            );
          }
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 touch-target"
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.1 }}
            >
              {/* Icon with bounce animation */}
              <motion.div 
                className="relative z-10 mb-1"
                animate={{ 
                  scale: isActive ? [1, 1.2, 1.1] : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 15,
                  duration: 0.3
                }}
              >
                <motion.span 
                  className={isActive ? "text-primary" : "text-muted-foreground"}
                  animate={{ opacity: isActive ? 1 : 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {isActive ? item.activeIcon : item.icon}
                </motion.span>
              </motion.div>
              
              {/* Active indicator dot */}
              {isActive && (
                <motion.div 
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                  layoutId="activeNavDot"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    boxShadow: '0 0 8px hsl(18 100% 55% / 0.8)'
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 25 
                  }}
                  style={{
                    boxShadow: '0 0 8px hsl(18 100% 55% / 0.8)',
                  }}
                />
              )}
              
              {/* Label with opacity animation */}
              <motion.span 
                className={`text-[10px] font-medium relative z-10 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                animate={{ opacity: isActive ? 1 : 0.5 }}
                transition={{ duration: 0.2 }}
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
