import React from "react";
import { Home, Dumbbell, BarChart3, Trophy, User } from "lucide-react";
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

const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
};

const BottomNav = React.forwardRef<HTMLElement>((_, ref) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { 
      id: "home", 
      path: "/",
      icon: <Home className="w-[22px] h-[22px]" strokeWidth={1.8} />,
      activeIcon: <Home className="w-[22px] h-[22px]" strokeWidth={2.5} />,
      label: "Inicio" 
    },
    { 
      id: "routines", 
      path: "/routines",
      icon: <Dumbbell className="w-[22px] h-[22px]" strokeWidth={1.8} />,
      activeIcon: <Dumbbell className="w-[22px] h-[22px]" strokeWidth={2.5} />,
      label: "Rutinas" 
    },
    { 
      id: "progress", 
      path: "/progress",
      icon: <BarChart3 className="w-[22px] h-[22px]" strokeWidth={2} />,
      activeIcon: <BarChart3 className="w-[22px] h-[22px]" strokeWidth={2.5} />,
      label: "Progreso",
      isCenter: true
    },
    { 
      id: "achievements", 
      path: "/achievements",
      icon: <Trophy className="w-[22px] h-[22px]" strokeWidth={1.8} />,
      activeIcon: <Trophy className="w-[22px] h-[22px]" strokeWidth={2.5} />,
      label: "Logros" 
    },
    { 
      id: "profile", 
      path: "/profile",
      icon: <User className="w-[22px] h-[22px]" strokeWidth={1.8} />,
      activeIcon: <User className="w-[22px] h-[22px]" strokeWidth={2.5} />,
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
    >
      {/* Top fade edge */}
      <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(12, 12, 12, 0.92) 0%, rgba(8, 8, 8, 0.98) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderTop: '0.5px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="flex items-end justify-around px-1 pb-safe pt-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            
            if (item.isCenter) {
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="relative flex flex-col items-center -mt-5 px-2"
                  whileTap={{ scale: 0.88 }}
                >
                  {/* Outer glow ring */}
                  {isActive && (
                    <motion.div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-[60px] rounded-full"
                      style={{ boxShadow: '0 0 24px hsl(18 100% 55% / 0.35)' }}
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                  )}
                  
                  {/* Circle button */}
                  <motion.div 
                    className="w-[56px] h-[56px] rounded-full flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, hsl(18 100% 55%), hsl(25 100% 50%))',
                      boxShadow: '0 4px 20px hsl(18 100% 55% / 0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}
                    animate={{ y: isActive ? -2 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {/* Shine effect */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/12 to-transparent rounded-t-full" />
                    
                    <span className="text-primary-foreground relative z-10">
                      {item.activeIcon}
                    </span>
                  </motion.div>
                  
                  <motion.span 
                    className="text-[10px] font-semibold mt-1"
                    animate={{ 
                      color: isActive ? 'hsl(18 100% 55%)' : 'hsl(0 0% 45%)',
                    }}
                  >
                    {item.label}
                  </motion.span>
                </motion.button>
              );
            }
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className="relative flex-1 flex flex-col items-center justify-center py-2 touch-target"
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
              >
                {/* Active pill background */}
                {isActive && (
                  <motion.div
                    layoutId="navActivePill"
                    className="absolute top-1 w-10 h-[3px] rounded-full bg-primary"
                    style={{ boxShadow: '0 2px 8px hsl(18 100% 55% / 0.5)' }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <motion.div 
                  className="relative z-10 mb-0.5"
                  animate={{ 
                    y: isActive ? -1 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <motion.span 
                    className={isActive ? "text-primary" : "text-muted-foreground"}
                    animate={{ opacity: isActive ? 1 : 0.5 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isActive ? item.activeIcon : item.icon}
                  </motion.span>
                </motion.div>
                
                {/* Label */}
                <motion.span 
                  className={`text-[10px] font-medium relative z-10 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  animate={{ opacity: isActive ? 1 : 0.45 }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});

BottomNav.displayName = "BottomNav";

export default BottomNav;
