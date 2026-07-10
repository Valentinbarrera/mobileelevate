import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const ShimmerBlock = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <div className={`relative overflow-hidden rounded-3xl bg-card border border-border ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    {children}
  </div>
);

/**
 * Esqueleto del Home — replica exactamente el nuevo header con safe-area
 * (pill avatar+racha a la izquierda, campana a la derecha) y la jerarquía
 * rediseñada (saludo → héroe → objetivo → accesos) para que NO salte al cargar.
 */
const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-nav">
      {/* Header skeleton — mismo layout que Header.tsx (pills flotantes + notch) */}
      <div className="flex items-center justify-between px-5 header-safe-xl pb-2">
        <div className="flex items-center gap-2.5 rounded-full card-elevated pl-1.5 pr-4 py-1.5">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-12 h-4 rounded" />
        </div>
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>

      <div className="max-w-2xl mx-auto px-5 mt-2 space-y-6">
        {/* Saludo (título de la página) */}
        <div className="pt-1 space-y-2">
          <Skeleton className="w-28 h-3.5 rounded" />
          <Skeleton className="w-52 h-8 rounded-lg" />
          <Skeleton className="w-44 h-4 rounded" />
        </div>

        {/* Héroe — el entreno de hoy */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <ShimmerBlock className="h-64 p-5">
            <div className="flex items-center gap-2">
              <Skeleton className="w-16 h-7 rounded-lg" />
              <Skeleton className="w-24 h-7 rounded-lg" />
            </div>
            <div className="absolute bottom-5 left-5 right-5 space-y-3">
              <Skeleton className="w-3/4 h-8 rounded-lg" />
              <Skeleton className="w-1/2 h-4 rounded" />
              <Skeleton className="w-full h-14 rounded-2xl" />
            </div>
          </ShimmerBlock>
        </motion.div>

        {/* Objetivo semanal */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <ShimmerBlock className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-[60px] h-[60px] rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-32 h-3 rounded" />
                <Skeleton className="w-24 h-6 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 mt-3.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Skeleton className="w-3 h-2 rounded" />
                  <Skeleton className="w-full aspect-square max-w-[2.25rem] rounded-xl" />
                </div>
              ))}
            </div>
          </ShimmerBlock>
        </motion.div>

        {/* Accesos rápidos — fila de 4 atajos */}
        <motion.div
          className="grid grid-cols-4 gap-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[74px] rounded-2xl" />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HomeSkeleton;
