import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const ShimmerBlock = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <div className={`relative overflow-hidden rounded-2xl bg-card border border-border ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    {children}
  </div>
);

const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-background/98 backdrop-blur-xl z-40 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="w-16 h-3.5 rounded" />
            <Skeleton className="w-10 h-2 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-9 rounded-xl" />
          <Skeleton className="w-9 h-9 rounded-xl" />
        </div>
      </div>

      <div className="px-4 space-y-3 mt-1">
        {/* Greeting skeleton */}
        <div className="pt-2 pb-1">
          <Skeleton className="w-48 h-6 rounded-lg" />
          <Skeleton className="w-full h-10 rounded-xl mt-2" />
        </div>

        {/* Progress upload skeleton */}
        <Skeleton className="w-full h-14 rounded-xl" />
      </div>

      {/* Workout card skeleton */}
      <div className="px-4 mt-5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ShimmerBlock className="h-56 p-5">
            <div className="flex items-center justify-between mb-auto">
              <div className="flex gap-2">
                <Skeleton className="w-14 h-7 rounded-lg" />
                <Skeleton className="w-24 h-7 rounded-lg" />
              </div>
              <Skeleton className="w-28 h-7 rounded-lg" />
            </div>
            <div className="absolute bottom-5 left-5 right-5">
              <Skeleton className="w-3/4 h-7 rounded-lg mb-2" />
              <Skeleton className="w-1/2 h-4 rounded mb-4" />
              <Skeleton className="w-full h-14 rounded-xl" />
            </div>
          </ShimmerBlock>
        </motion.div>
        <Skeleton className="w-full h-11 rounded-xl mt-2" />
      </div>

      {/* Stats zone skeleton */}
      <div className="px-4 mt-6 space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ShimmerBlock className="p-4 h-[88px]">
            <div className="flex items-center gap-3">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-32 h-4 rounded" />
                <Skeleton className="w-full h-2 rounded-full" />
                <Skeleton className="w-24 h-3 rounded" />
              </div>
            </div>
          </ShimmerBlock>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ShimmerBlock className="p-4 h-[140px]">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="w-32 h-4 rounded" />
              <Skeleton className="w-10 h-4 rounded" />
            </div>
            <Skeleton className="w-full h-2 rounded-full mb-4" />
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  <Skeleton className="w-5 h-2 rounded" />
                </div>
              ))}
            </div>
          </ShimmerBlock>
        </motion.div>
      </div>

      {/* Programs skeleton */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between px-4 mb-3">
          <Skeleton className="w-28 h-4 rounded" />
          <Skeleton className="w-16 h-4 rounded" />
        </div>
        <div className="flex gap-3 px-4">
          <Skeleton className="w-36 h-[150px] rounded-2xl flex-shrink-0" />
          <Skeleton className="w-36 h-[150px] rounded-2xl flex-shrink-0" />
        </div>
      </motion.div>

      {/* Nutrition skeleton */}
      <div className="px-4 mt-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ShimmerBlock className="p-4 h-[170px]">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="w-20 h-4 rounded" />
              <Skeleton className="w-24 h-4 rounded" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="w-full h-2 rounded-full" />
                <Skeleton className="w-full h-2 rounded-full" />
                <Skeleton className="w-full h-2 rounded-full" />
              </div>
            </div>
          </ShimmerBlock>
        </motion.div>
      </div>

      {/* Quick actions skeleton */}
      <div className="px-4 mt-6">
        <Skeleton className="w-28 h-4 rounded mb-3" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeSkeleton;
