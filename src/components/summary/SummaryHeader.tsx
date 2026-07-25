import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ElevateLockup } from "@/components/ui/elevate-mark";

interface SummaryHeaderProps {
  workoutName: string;
}

const SummaryHeader = ({ workoutName }: SummaryHeaderProps) => {
  return (
    // header-safe: el padding superior incluye el inset del notch/isla (iOS) →
    // la marca nunca queda tapada (requisito App Store).
    <div className="relative header-safe-xl pb-7 px-6 text-center">
      {/* Marca Elevate arriba de todo */}
      <motion.div
        className="flex justify-center mb-8"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ElevateLockup />
      </motion.div>

      {/* Sello de completado — círculo de marca (naranja), no trofeo dorado */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.1 }}
        className="relative inline-flex items-center justify-center mb-6"
      >
        <div className="absolute inset-0 rounded-full bg-primary/25 blur-2xl" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-2xl shadow-primary/40">
          <Check className="w-12 h-12 text-primary-foreground" strokeWidth={3} />
        </div>
      </motion.div>

      {/* Título */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-[2rem] leading-[1.05] font-black text-foreground tracking-tight mb-1.5">
          ¡Entrenamiento <span className="text-gradient-primary">completado!</span>
        </h1>
        <p className="text-muted-foreground font-semibold">{workoutName}</p>
      </motion.div>
    </div>
  );
};

export default SummaryHeader;
