import React from "react";
import { Home, Dumbbell, Apple, TrendingUp, User } from "lucide-react";
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
    { id: "home",      path: "/",          icon: Home,       label: "Inicio" },
    { id: "nutrition", path: "/nutrition", icon: Apple,      label: "Nutrición" },
    { id: "routines",  path: "/routines",  icon: Dumbbell,   label: "Entrenar", isCenter: true },
    { id: "progress",  path: "/progress",  icon: TrendingUp, label: "Progreso" },
    { id: "profile",   path: "/profile",   icon: User,       label: "Perfil" },
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

      <div className="px-4 pb-2 max-w-lg mx-auto">
        <div
          className="flex items-center rounded-3xl px-1.5 h-[66px]"
          style={{
            background: 'rgba(16, 16, 16, 0.92)',
            backdropFilter: 'blur(28px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            boxShadow: '0 -1px 0 rgba(255,255,255,0.04) inset, 0 8px 28px rgba(0, 0, 0, 0.45)',
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
                    className="relative flex flex-col items-center justify-center min-h-[56px]"
                    whileTap={{ scale: 0.9 }}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <motion.div
                      className="-mt-9 mb-1 w-[54px] h-[54px] rounded-2xl flex items-center justify-center ring-[3px] ring-background"
                      style={{
                        background: 'linear-gradient(145deg, hsl(18 100% 60%), hsl(22 100% 47%))',
                        boxShadow: '0 10px 26px hsl(18 100% 55% / 0.45), 0 1px 0 rgba(255,255,255,0.25) inset',
                      }}
                      animate={{ y: isActive ? -2 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    >
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.4} />
                    </motion.div>

                    <span className={`text-[10px] leading-none ${
                      isActive ? "text-primary font-bold" : "text-muted-foreground/70 font-semibold"
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
                    isActive ? "text-primary" : "text-muted-foreground/70"
                  }`}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />

                <span className={`relative z-10 text-[10px] leading-none transition-colors duration-150 ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground/70 font-semibold"
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
