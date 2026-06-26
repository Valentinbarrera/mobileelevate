import React from "react";
import { Home, Dumbbell, Apple, TrendingUp, User } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItemData {
  id: string;
  path: string;
  icon: typeof Home;
  label: string;
  isCenter?: boolean;
}

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

const triggerHaptic = () => {
  if (navigator.vibrate) navigator.vibrate(8);
};

/* ── Átomo: ítem regular (icono + label + indicador superior) ── */
const NavItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.9 }}
    className="relative flex-1 flex flex-col items-center justify-center gap-1.5 h-full"
    aria-label={label}
    aria-current={active ? "page" : undefined}
  >
    {/* Indicador único: línea de acento arriba */}
    {active && (
      <motion.span
        layoutId="navIndicator"
        className="absolute top-0 h-[3px] w-6 rounded-full bg-gradient-primary"
        style={{ boxShadow: "0 0 8px hsl(18 100% 55% / 0.5)" }}
        transition={SPRING}
      />
    )}

    <motion.div animate={{ scale: active ? 1.06 : 1, y: active ? -1 : 0 }} transition={SPRING}>
      <Icon
        className={`w-[26px] h-[26px] transition-colors duration-200 ${
          active ? "text-primary" : "text-muted-foreground/55"
        }`}
        strokeWidth={active ? 2.3 : 1.8}
      />
    </motion.div>

    <span
      className={`text-[11px] leading-none tracking-tight transition-colors duration-200 ${
        active ? "text-primary font-bold" : "text-muted-foreground/55 font-semibold"
      }`}
    >
      {label}
    </span>
  </motion.button>
);

/* ── Átomo: botón central elevado (CTA "Entrenar") ──
   El label usa la misma estructura que NavItem (placeholder del tamaño del
   ícono) para alinearse con los demás; el círculo flota en absoluto. */
const NavFab = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.92 }}
    className="relative flex-1 flex flex-col items-center justify-center gap-1.5 h-full"
    aria-label={label}
    aria-current={active ? "page" : undefined}
  >
    {/* Placeholder con la altura del ícono regular → alinea el label */}
    <span className="block w-[26px] h-[26px]" aria-hidden />

    <span
      className={`text-[11px] leading-none tracking-tight transition-colors duration-200 ${
        active ? "text-primary font-bold" : "text-muted-foreground/55 font-semibold"
      }`}
    >
      {label}
    </span>

    {/* Círculo flotante (absoluto, centrado en la celda completa, elevado).
        Centrado por CSS puro — sin animar transform para no pisar el translate.
        Animación leve: el glow "respira" (solo box-shadow, no toca transform). */}
    <motion.span
      className="absolute left-1/2 -translate-x-1/2 -top-8 w-[60px] h-[60px] rounded-[20px] flex items-center justify-center ring-4 ring-background"
      style={{ background: "linear-gradient(145deg, hsl(18 100% 61%), hsl(22 100% 46%))" }}
      animate={{
        boxShadow: [
          "0 10px 24px hsl(18 100% 55% / 0.45), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0px hsl(18 100% 60% / 0)",
          "0 10px 24px hsl(18 100% 55% / 0.45), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 22px hsl(18 100% 60% / 0.55)",
          "0 10px 24px hsl(18 100% 55% / 0.45), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0px hsl(18 100% 60% / 0)",
        ],
      }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icon className="w-7 h-7 text-white" strokeWidth={2.4} />
    </motion.span>
  </motion.button>
);

/* ── Molécula: la barra ── */
const BottomNav = React.forwardRef<HTMLElement>((_, ref) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItemData[] = [
    { id: "home", path: "/", icon: Home, label: "Inicio" },
    { id: "nutrition", path: "/nutrition", icon: Apple, label: "Nutrición" },
    { id: "routines", path: "/routines", icon: Dumbbell, label: "Entrenar", isCenter: true },
    { id: "progress", path: "/progress", icon: TrendingUp, label: "Progreso" },
    { id: "profile", path: "/profile", icon: User, label: "Perfil" },
  ];

  const activeTab = navItems.find((item) => item.path === location.pathname)?.id || "home";

  const handleNavClick = (item: NavItemData) => {
    triggerHaptic();
    navigate(item.path);
  };

  return (
    <nav
      ref={ref}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="Navegación principal"
    >
      {/* Degradado de transición hacia el contenido */}
      <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="px-4 pb-2 max-w-lg mx-auto">
        <div
          className="flex items-stretch rounded-[28px] px-1.5 h-[74px]"
          style={{
            background: "rgba(15, 15, 15, 0.9)",
            backdropFilter: "blur(28px) saturate(1.8)",
            WebkitBackdropFilter: "blur(28px) saturate(1.8)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 -1px 0 rgba(255,255,255,0.05) inset, 0 10px 30px rgba(0, 0, 0, 0.5)",
          }}
        >
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return item.isCenter ? (
              <NavFab
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={active}
                onClick={() => handleNavClick(item)}
              />
            ) : (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={active}
                onClick={() => handleNavClick(item)}
              />
            );
          })}
        </div>
      </div>

      {/* Safe area para dispositivos con home indicator */}
      <div className="bg-background h-safe" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />
    </nav>
  );
});

BottomNav.displayName = "BottomNav";

export default BottomNav;
