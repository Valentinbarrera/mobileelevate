/**
 * Barra de descanso (estilo Hevy/Strong) con 3 tamaños:
 *  - "bar"  → mini-barra abajo, no intrusiva (default). Deja seguir cargando series.
 *  - "big"  → cronómetro grande centrado (números enormes), para verlo de lejos.
 *  - "mini" → pastilla chiquita: lo escondés pero sigue contando; tap para volver.
 * El ±15s y "Saltar" están en los tres. El tiempo sigue corriendo siempre.
 */
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { SkipForward, Plus, Minus, Timer, Maximize2, Minimize2, ChevronDown } from "lucide-react";

interface RestBarProps {
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
  enableVibration?: boolean;
}

type View = "bar" | "big" | "mini";

const RestBar = ({ duration, onComplete, onSkip, enableVibration = true }: RestBarProps) => {
  const [total, setTotal] = useState(duration);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [view, setView] = useState<View>("bar");

  const buzz = useCallback((pattern: number | number[]) => {
    if (enableVibration && "vibrate" in navigator) navigator.vibrate(pattern);
  }, [enableVibration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      buzz([200, 100, 200]);
      onComplete();
      return;
    }
    if (timeLeft <= 3) buzz(50);
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, onComplete, buzz]);

  const addTime = (s: number) => {
    setTimeLeft((t) => Math.max(1, t + s));
    setTotal((t) => Math.max(1, t + s));
  };

  const pct = Math.max(0, Math.min(100, (timeLeft / total) * 100));
  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const isLow = timeLeft <= 5;

  // ───────── OCULTO: pastilla flotante (sigue contando) ─────────
  if (view === "mini") {
    return (
      <motion.button
        onClick={() => setView("bar")}
        className="fixed right-4 bottom-24 z-40 flex items-center gap-2 rounded-full bg-card/95 backdrop-blur-md border border-primary/30 shadow-xl shadow-black/20 pl-3 pr-3.5 py-2 active:scale-95 transition-transform"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        aria-label="Mostrar cronómetro"
      >
        <Timer className={`w-4 h-4 ${isLow ? "text-red-400" : "text-primary"}`} />
        <span className={`text-base font-black tabular-nums ${isLow ? "text-red-400" : "text-foreground"}`}>
          {fmt(timeLeft)}
        </span>
      </motion.button>
    );
  }

  // ───────── GRANDE: cronómetro centrado, números enormes ─────────
  if (view === "big") {
    return (
      <motion.div
        className="fixed left-0 right-0 bottom-24 z-40 px-4 pointer-events-none"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
      >
        <div className="max-w-2xl mx-auto pointer-events-auto rounded-3xl bg-card/95 backdrop-blur-md border border-primary/30 shadow-xl shadow-black/30 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1.5 bg-secondary">
            <motion.div
              className={`h-full ${isLow ? "bg-red-500" : "bg-gradient-primary"}`}
              animate={{ width: `${pct}%` }}
              transition={{ ease: "linear", duration: 0.5 }}
            />
          </div>

          <div className="px-5 pt-3 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className={`w-4 h-4 ${isLow ? "text-red-400" : "text-primary"}`} />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Descanso
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setView("bar")}
                  className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground"
                  aria-label="Achicar cronómetro"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("mini")}
                  className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground"
                  aria-label="Ocultar cronómetro"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p
              className={`text-center font-black tabular-nums leading-none my-3 text-7xl ${
                isLow ? "text-red-400" : "text-foreground"
              }`}
            >
              {fmt(timeLeft)}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => addTime(-15)}
                className="w-14 h-14 rounded-2xl bg-secondary/70 border border-border flex items-center justify-center text-foreground active:scale-90 transition-transform"
                aria-label="Restar 15 segundos"
              >
                <Minus className="w-6 h-6" />
              </button>
              <button
                onClick={onSkip}
                className="h-14 px-7 rounded-2xl bg-gradient-primary text-primary-foreground text-base font-bold flex items-center gap-2 active:scale-95 transition-transform glow-primary"
              >
                <SkipForward className="w-5 h-5" />
                Saltar
              </button>
              <button
                onClick={() => addTime(15)}
                className="w-14 h-14 rounded-2xl bg-secondary/70 border border-border flex items-center justify-center text-foreground active:scale-90 transition-transform"
                aria-label="Sumar 15 segundos"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ───────── BARRA: mini, no intrusiva (default) ─────────
  return (
    <motion.div
      className="fixed left-0 right-0 bottom-24 z-40 px-4 pointer-events-none"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
    >
      <div className="max-w-2xl mx-auto pointer-events-auto rounded-2xl bg-card/95 backdrop-blur-md border border-primary/30 shadow-xl shadow-black/20 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <motion.div
            className={`h-full ${isLow ? "bg-red-500" : "bg-gradient-primary"}`}
            animate={{ width: `${pct}%` }}
            transition={{ ease: "linear", duration: 0.5 }}
          />
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-2.5">
          {/* Cluster tocable → agranda el cronómetro */}
          <button
            onClick={() => setView("big")}
            className="flex items-center gap-2.5 active:scale-95 transition-transform"
            aria-label="Agrandar cronómetro"
          >
            <Timer className={`w-4 h-4 shrink-0 ${isLow ? "text-red-400" : "text-primary"}`} />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Descanso
            </span>
            <span className={`text-lg font-black tabular-nums ${isLow ? "text-red-400" : "text-foreground"}`}>
              {fmt(timeLeft)}
            </span>
            <Maximize2 className="w-3.5 h-3.5 text-muted-foreground/70" />
          </button>

          <div className="flex-1" />

          <button
            onClick={() => addTime(-15)}
            className="w-8 h-8 rounded-lg bg-secondary/70 border border-border flex items-center justify-center text-foreground active:scale-90 transition-transform"
            aria-label="Restar 15 segundos"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => addTime(15)}
            className="w-8 h-8 rounded-lg bg-secondary/70 border border-border flex items-center justify-center text-foreground active:scale-90 transition-transform"
            aria-label="Sumar 15 segundos"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onSkip}
            className="h-8 px-3 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Saltar
          </button>
          <button
            onClick={() => setView("mini")}
            className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"
            aria-label="Ocultar cronómetro"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RestBar;
