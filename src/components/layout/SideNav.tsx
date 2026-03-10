/**
 * SideNav — Desktop/tablet lateral navigation (lg+)
 * Mirrors the same nav items as BottomNav
 */
import { Home, Dumbbell, Apple, TrendingUp, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { id: "home",      path: "/",           icon: Home,          label: "Inicio" },
  { id: "routines",  path: "/routines",   icon: Dumbbell,      label: "Entrenar" },
  { id: "nutrition", path: "/nutrition",  icon: Apple,         label: "Nutrición" },
  { id: "progress",  path: "/progress",   icon: TrendingUp,    label: "Progreso" },
  { id: "messages",  path: "/messages",   icon: MessageCircle, label: "Mensajes" },
  { id: "profile",   path: "/profile",    icon: User,          label: "Perfil" },
];

const SideNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = navItems.find(i => i.path === location.pathname)?.id || "home";

  return (
    <nav
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-50 w-[72px] xl:w-56"
      style={{
        background: "hsl(var(--sidebar-background))",
        borderRight: "1px solid hsl(var(--sidebar-border))",
      }}
      role="navigation"
      aria-label="Navegación lateral"
    >
      {/* Logo */}
      <div className="flex items-center justify-center xl:justify-start gap-3 px-4 py-6 border-b border-border/30">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(145deg, hsl(18 100% 58%), hsl(22 100% 48%))" }}
        >
          <Dumbbell className="w-5 h-5 text-white" strokeWidth={2.2} />
        </div>
        <span className="hidden xl:block text-base font-black tracking-[0.15em] text-foreground italic">
          ELEVATE
        </span>
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative flex items-center gap-3 px-3 py-3 rounded-xl w-full transition-colors duration-150 group
                ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              whileTap={{ scale: 0.97 }}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="sideNavPill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-primary"
                  style={{ boxShadow: "0 0 8px hsl(18 100% 55% / 0.6)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}

              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors duration-150 ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
              <span className="hidden xl:block text-sm font-medium">{item.label}</span>

              {/* Tooltip on collapsed (icon-only) mode */}
              <span className="xl:hidden absolute left-full ml-2 px-2 py-1 rounded-lg bg-card border border-border text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Version */}
      <div className="px-4 py-4 border-t border-border/30">
        <span className="hidden xl:block text-[10px] text-muted-foreground/50 tracking-wider">v1.0.0</span>
      </div>
    </nav>
  );
};

export default SideNav;
