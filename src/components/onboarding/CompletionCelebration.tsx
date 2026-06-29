/**
 * Pantalla de celebración al completar el onboarding: estallido de confetti +
 * check animado con spring + copy motivacional. El pico de dopamina del flujo.
 */
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const COLORS = ["#ff6a2b", "#ffb648", "#ffd24d", "#34d399", "#60a5fa", "#f472b6", "#a78bfa"];

// Partículas precalculadas en módulo (no se re-randomizan en cada render).
const PARTICLES = Array.from({ length: 32 }, (_, i) => {
  const angle = (i / 32) * Math.PI * 2 + (i % 2 ? 0.2 : 0);
  const dist = 90 + (i % 5) * 30;
  return {
    id: i,
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist,
    color: COLORS[i % COLORS.length],
    delay: (i % 6) * 0.03,
    w: 6 + (i % 3) * 2,
    h: 9 + (i % 3) * 3,
    rot: (i * 47) % 360,
  };
});

interface Props {
  name?: string | null;
  synced?: boolean;
  onDone: () => void;
}

export default function CompletionCelebration({ name, synced = true, onDone }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="relative flex items-center justify-center">
        {/* Confetti burst */}
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-[2px]"
            style={{ width: p.w, height: p.h, backgroundColor: p.color }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: [0, p.dx, p.dx * 1.1],
              y: [0, p.dy, p.dy + 160],
              opacity: [1, 1, 0],
              scale: [0, 1, 1],
              rotate: p.rot + 220,
            }}
            transition={{ duration: 1.5, delay: 0.15 + p.delay, ease: "easeOut" }}
          />
        ))}

        {/* Halo que respira */}
        <motion.div
          className="absolute w-28 h-28 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(18 100% 55% / 0.35), transparent 70%)" }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.9, 1.15, 0.9], opacity: 1 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Check */}
        <motion.div
          className="relative w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center glow-primary"
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.34, type: "spring", stiffness: 420, damping: 17 }}
          >
            <Check className="w-12 h-12 text-primary-foreground" strokeWidth={3.5} />
          </motion.div>
        </motion.div>
      </div>

      <motion.h1
        className="text-3xl font-black tracking-tight text-foreground mt-9 leading-tight"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, ...{ duration: 0.4 } }}
      >
        ¡Perfil completo{name ? `, ${name}` : ""}! 🎉
      </motion.h1>

      <motion.p
        className="text-base text-muted-foreground mt-2.5 max-w-xs leading-relaxed"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.62, duration: 0.4 }}
      >
        {synced
          ? "Tu coach ya tiene todo para armarte el mejor plan. 💪"
          : "Lo guardamos. Se sincroniza con tu coach cuando tengas conexión. 💪"}
      </motion.p>

      <motion.button
        onClick={onDone}
        className="mt-10 h-14 px-8 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-base flex items-center gap-2 glow-primary"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
      >
        Ver mi perfil <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}
