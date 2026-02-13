import React from "react";
import { Home, Dumbbell, BarChart3, Trophy, User, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  id: string;
  path: string;
  icon: React.ReactNode;
  label: string;
  isCenter?: boolean;
}

const triggerHaptic = () => {
  if (navigator.vibrate) navigator.vibrate(10);
};

const BottomNav = React.forwardRef<HTMLElement>((_, ref) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { id: "home", path: "/", icon: <Home className="w-[22px] h-[22px]" />, label: "Inicio" },
    { id: "routines", path: "/routines", icon: <Dumbbell className="w-[22px] h-[22px]" />, label: "Rutinas" },
    { id: "progress", path: "/progress", icon: <Plus className="w-6 h-6" strokeWidth={2.5} />, label: "Progreso", isCenter: true },
    { id: "achievements", path: "/achievements", icon: <Trophy className="w-[22px] h-[22px]" />, label: "Logros" },
    { id: "profile", path: "/profile", icon: <User className="w-[22px] h-[22px]" />, label: "Perfil" },
  ];

  const activeTab = navItems.find(item => item.path === location.pathname)?.id || "home";

  const handleNavClick = (item: NavItem) => {
    triggerHaptic();
    navigate(item.path);
  };

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50">
      {/* Fade edge */}
      <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="px-4 pb-safe pb-2">
        <div
          className="relative flex items-center justify-between rounded-[20px] px-2 py-2"
          style={{
            background: 'rgba(18, 18, 18, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            if (item.isCenter) {
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="relative flex flex-col items-center -mt-7 mx-1"
                  whileTap={{ scale: 0.88 }}
                >
                  <motion.div
                    className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center relative"
                    style={{
                      background: 'linear-gradient(135deg, hsl(18 100% 55%), hsl(25 100% 48%))',
                      boxShadow: '0 6px 20px hsl(18 100% 55% / 0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}
                    animate={{ y: isActive ? -2 : 0 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {/* Shine */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-2xl" />
                    <span className="text-primary-foreground relative z-10">{item.icon}</span>
                  </motion.div>
                </motion.button>
              );
            }

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className="relative flex flex-col items-center justify-center flex-1 py-1.5"
                whileTap={{ scale: 0.88 }}
              >
                {/* Active background pill */}
                {isActive && (
                  <motion.div
                    layoutId="navActiveBg"
                    className="absolute inset-1 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  className="relative z-10 mb-0.5"
                  animate={{ 
                    scale: isActive ? 1 : 0.92,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                >
                  <span className={isActive ? "text-foreground" : "text-muted-foreground/50"}>
                    {React.cloneElement(item.icon as React.ReactElement, {
                      strokeWidth: isActive ? 2.5 : 1.8,
                    })}
                  </span>
                </motion.div>

                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="navActiveBar"
                    className="absolute bottom-1 w-5 h-[3px] rounded-full bg-primary"
                    style={{ boxShadow: '0 0 8px hsl(18 100% 55% / 0.6)' }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Label */}
                <motion.span
                  className={`text-[9px] font-semibold relative z-10 ${
                    isActive ? "text-foreground" : "text-muted-foreground/40"
                  }`}
                  animate={{ opacity: isActive ? 1 : 0.6 }}
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
