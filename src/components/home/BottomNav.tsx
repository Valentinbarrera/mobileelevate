import React from "react";
import { Home, Dumbbell, TrendingUp, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  id: string;
  path: string;
  icon: typeof Home;
  label: string;
  isCenter?: boolean;
}

const triggerHaptic = () => {
  if (navigator.vibrate) navigator.vibrate(8);
};

const BottomNav = React.forwardRef<HTMLElement>((_, ref) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { id: "home", path: "/", icon: Home, label: "Inicio" },
    { id: "routines", path: "/routines", icon: Dumbbell, label: "Rutinas" },
    { id: "progress", path: "/progress", icon: TrendingUp, label: "Progreso", isCenter: true },
    { id: "messages", path: "/messages", icon: MessageCircle, label: "Mensajes" },
    { id: "profile", path: "/profile", icon: User, label: "Perfil" },
  ];

  const activeTab = navItems.find(item => item.path === location.pathname)?.id || "home";

  const handleNavClick = (item: NavItem) => {
    triggerHaptic();
    navigate(item.path);
  };

  return (
    <nav ref={ref} className="lg:hidden fixed bottom-0 left-0 right-0 z-50" role="navigation" aria-label="Navegación principal">
      {/* Fade transition to content */}
      <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="px-5 pb-2 max-w-lg mx-auto">
        <div
          className="flex items-center rounded-2xl px-2 h-[68px]"
          style={{
            background: 'rgba(14, 14, 14, 0.96)',
            backdropFilter: 'blur(24px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 -2px 24px rgba(0, 0, 0, 0.35)',
          }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            /* ── Center FAB ── */
            if (item.isCenter) {
              return (
                <div key={item.id} className="flex-1 flex justify-center">
                  <motion.button
                    onClick={() => handleNavClick(item)}
                    className="relative -mt-6 flex flex-col items-center"
                    whileTap={{ scale: 0.9 }}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <motion.div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(145deg, hsl(18 100% 58%), hsl(22 100% 48%))',
                        boxShadow: '0 8px 24px hsl(18 100% 55% / 0.35)',
                      }}
                      animate={{ y: isActive ? -2 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    >
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.2} />
                    </motion.div>

                    <span className={`text-[11px] font-semibold mt-1.5 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {item.label}
                    </span>
                  </motion.button>
                </div>
              );
            }

            /* ── Regular item ── */
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className="relative flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px]"
                whileTap={{ scale: 0.92 }}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="navPill"
                    className="absolute inset-x-2 inset-y-1.5 rounded-xl bg-white/[0.06]"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}

                <Icon
                  className={`relative z-10 w-[22px] h-[22px] transition-colors duration-150 ${
                    isActive ? "text-primary" : "text-muted-foreground/50"
                  }`}
                  strokeWidth={isActive ? 2.4 : 1.6}
                />

                <span className={`relative z-10 text-[11px] leading-none transition-colors duration-150 ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground/50 font-medium"
                }`}>
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="navDot"
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                    style={{ boxShadow: '0 0 6px hsl(18 100% 55% / 0.6)' }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Safe area spacer for devices with home indicator */}
      <div className="bg-background h-safe" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
});

BottomNav.displayName = "BottomNav";

export default BottomNav;
