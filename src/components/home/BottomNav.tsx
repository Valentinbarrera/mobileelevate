import React, { useState } from "react";
import { Home, Dumbbell, Apple, TrendingUp, User, PencilRuler, Flame, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { hapticLight } from "@/lib/haptics";

interface NavItemData {
  id: string;
  path: string;
  icon: typeof Home;
  label: string;
  isCenter?: boolean;
}

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

const triggerHaptic = () => {
  hapticLight();
};

/* Acciones del "speed-dial" del botón central Entrenar */
interface TrainAction {
  icon: typeof Home;
  label: string;
  desc: string;
  path: string;
  hue: string;
}
const TRAIN_ACTIONS: TrainAction[] = [
  {
    icon: Dumbbell,
    label: "Entrenar con el coach",
    desc: "Seguí las rutinas que armó tu coach para vos.",
    path: "/rutinas-coach",
    hue: "18 100% 55%",
  },
  {
    icon: PencilRuler,
    label: "Crear programa",
    desc: "Diseñá tu propio plan paso a paso.",
    path: "/programas/nuevo",
    hue: "217 91% 60%",
  },
  {
    icon: Flame,
    label: "Mis entrenos",
    desc: "Tus programas, entreno libre y templates.",
    path: "/routines",
    hue: "142 71% 45%",
  },
];

/* ── Átomo: ítem regular (icono + label + lozenge de vidrio activo) ── */
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
    whileTap={{ scale: 0.92 }}
    className="relative flex-1 flex flex-col items-center justify-center gap-1 h-full"
    aria-label={label}
    aria-current={active ? "page" : undefined}
  >
    {/* Indicador iOS "Liquid Glass": lozenge translúcido que se desliza
        entre tabs (morph con layoutId) y se apoya detrás del icono + label. */}
    {active && (
      <motion.span
        layoutId="navGlass"
        className="absolute inset-x-1.5 inset-y-1.5 rounded-[18px]"
        style={{
          background:
            "linear-gradient(180deg, hsl(18 100% 55% / 0.20), hsl(18 100% 55% / 0.08))",
          border: "1px solid hsl(18 100% 60% / 0.30)",
          boxShadow:
            "0 0 20px hsl(18 100% 55% / 0.18), inset 0 1px 0 hsl(18 100% 70% / 0.25)",
        }}
        transition={SPRING}
      />
    )}

    <motion.div
      className="relative"
      animate={{ scale: active ? 1.05 : 1, y: active ? -1 : 0 }}
      transition={SPRING}
    >
      <Icon
        className={`w-[25px] h-[25px] transition-colors duration-200 ${
          active ? "text-primary" : "text-muted-foreground/55"
        }`}
        strokeWidth={active ? 2.4 : 1.9}
      />
    </motion.div>

    <span
      className={`relative text-[10.5px] leading-none tracking-tight transition-colors duration-200 ${
        active ? "text-primary font-bold" : "text-muted-foreground/55 font-semibold"
      }`}
    >
      {label}
    </span>
  </motion.button>
);

/* ── Átomo: botón central elevado (abre el speed-dial) ──
   Flota sobre la cápsula de vidrio; el ícono gira a ✕ cuando el menú está abierto. */
const NavFab = ({
  label,
  open,
  onClick,
}: {
  label: string;
  open: boolean;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.92 }}
    className="relative flex-1 flex flex-col items-center justify-center gap-1 h-full"
    aria-label={open ? "Cerrar menú de entrenar" : label}
    aria-expanded={open}
  >
    {/* Placeholder con la altura del ícono regular → alinea el label */}
    <span className="block w-[25px] h-[25px]" aria-hidden />

    <span
      className={`text-[10.5px] leading-none tracking-tight font-bold transition-colors duration-200 ${
        open ? "text-primary" : "text-muted-foreground/55"
      }`}
    >
      {label}
    </span>

    {/* Círculo flotante elevado. Centrado por CSS puro; sólo animamos el glow. */}
    <motion.span
      className="absolute left-1/2 -translate-x-1/2 -top-[34px] w-[58px] h-[58px] rounded-[19px] flex items-center justify-center"
      style={{
        background: "linear-gradient(145deg, hsl(18 100% 61%), hsl(22 100% 46%))",
        border: "1px solid hsl(22 100% 72% / 0.35)",
      }}
      animate={{
        boxShadow: [
          "0 8px 22px hsl(18 100% 50% / 0.5), inset 0 1px 0 rgba(255,255,255,0.35), 0 0 0 hsl(18 100% 60% / 0)",
          "0 8px 22px hsl(18 100% 50% / 0.5), inset 0 1px 0 rgba(255,255,255,0.35), 0 0 20px hsl(18 100% 60% / 0.55)",
          "0 8px 22px hsl(18 100% 50% / 0.5), inset 0 1px 0 rgba(255,255,255,0.35), 0 0 0 hsl(18 100% 60% / 0)",
        ],
      }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.span animate={{ rotate: open ? 135 : 0 }} transition={SPRING} className="flex">
        {open ? (
          <Plus className="w-[26px] h-[26px] text-white" strokeWidth={2.6} />
        ) : (
          <Dumbbell className="w-[26px] h-[26px] text-white" strokeWidth={2.4} />
        )}
      </motion.span>
    </motion.span>
  </motion.button>
);

/* ── Molécula: la barra "Liquid Glass" ── */
const BottomNav = React.forwardRef<HTMLElement>((_, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
    navigate(item.path);
  };

  const toggleMenu = () => {
    triggerHaptic();
    setMenuOpen((v) => !v);
  };

  const runAction = (path: string) => {
    triggerHaptic();
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <nav
      ref={ref}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="Navegación principal"
    >
      {/* Backdrop + acciones del speed-dial */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              key="backdrop"
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar menú"
              className="fixed inset-0 -z-10 bg-black/55"
              style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <div
              className="absolute inset-x-0 flex flex-col items-center gap-2.5"
              style={{ bottom: "calc(98px + env(safe-area-inset-bottom, 0px))" }}
            >
              {TRAIN_ACTIONS.map((a, i) => (
                <motion.button
                  key={a.path}
                  onClick={() => runAction(a.path)}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ ...SPRING, delay: (TRAIN_ACTIONS.length - 1 - i) * 0.05 }}
                  className="flex items-center gap-2.5 rounded-full pl-2 pr-4 py-2 active:scale-95 transition-transform"
                  style={{
                    background: "hsl(240 6% 12% / 0.92)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.45)",
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `hsl(${a.hue} / 0.18)`, border: `1px solid hsl(${a.hue} / 0.35)` }}
                  >
                    <a.icon className="w-[17px] h-[17px]" style={{ color: `hsl(${a.hue})` }} strokeWidth={2.3} />
                  </span>
                  <span className="text-sm font-bold text-foreground whitespace-nowrap pr-0.5">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Degradado sutil de transición hacia el contenido */}
      <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />

      <div className="px-4 pb-2 max-w-lg mx-auto">
        <div
          className="relative flex items-stretch rounded-[26px] px-1.5 h-[70px]"
          style={{
            background: "hsl(240 6% 9% / 0.60)",
            backdropFilter: "blur(40px) saturate(1.8)",
            WebkitBackdropFilter: "blur(40px) saturate(1.8)",
            border: "1px solid rgba(255, 255, 255, 0.10)",
            boxShadow:
              "0 8px 40px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.14)",
          }}
        >
          {/* Brillo especular superior (reflejo de vidrio líquido) */}
          <div
            className="absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-[26px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08), transparent)",
            }}
          />

          {navItems.map((item) => {
            const active = activeTab === item.id;
            return item.isCenter ? (
              <NavFab
                key={item.id}
                label={item.label}
                open={menuOpen}
                onClick={toggleMenu}
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
