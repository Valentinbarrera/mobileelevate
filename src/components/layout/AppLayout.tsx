/**
 * AppLayout — layout persistente para las pantallas con navegación.
 * Renderiza SideNav (desktop) + BottomNav (mobile) UNA sola vez y deja que
 * solo el contenido (Outlet) transicione entre pantallas. Así el nav no se
 * re-renderiza ni parpadea al navegar.
 *
 * Transición: solo opacidad (no transform), para no romper el position:fixed
 * del bottom nav ni los headers sticky de las páginas.
 */
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import SideNav from "@/components/layout/SideNav";
import BottomNav from "@/components/home/BottomNav";
import LoadingSpinner from "@/components/ui/loading-spinner";

const AppLayout = () => {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />

      <main className="flex-1 min-w-0 lg:ml-[72px] xl:ml-56">
        {/* Suspense POR FUERA del AnimatePresence: si un chunk lazy todavía no
            cargó (1ra vez que entrás a una pantalla), muestra el spinner en vez
            de quedar en negro (bug conocido de AnimatePresence + React.lazy). */}
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      <BottomNav />
    </div>
  );
};

export default AppLayout;
