import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

/**
 * Splash "Streak Rise" — animación de marca de Elevate.
 *
 * Handoff invisible: el splash nativo de iOS/Android muestra el logo naranja
 * centrado en reposo (frame fijo). Este overlay web arranca EXACTAMENTE desde
 * ese estado (logo ya centrado, opacity 1) y le suma la energía: un streak que
 * barre, el glow que enciende, el wordmark que sube y todo el conjunto que se
 * "eleva" y funde revelando la app. Sin salto = sin costura.
 *
 * En cuanto monta, oculta el splash nativo (Capacitor) para que la capa web
 * tome la posta en el mismo instante.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const TOTAL = 1.9; // segundos

const ORANGE = "#FF4E00";

function ElevateMark({ size = 132 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 102) / 139} viewBox="0 0 139 102" aria-label="Elevate" role="img" style={{ overflow: "visible" }}>
      <path d="M56 48.9999C36.8 48.9999 10.6667 63.3333 0 70.4999C35.2 27.2999 81.6667 19.8333 100.5 21.4999C90.9 27.0999 81.5 43.4999 78 50.9999L36.5 70.4999L35 65.4999L56 48.9999Z" fill={ORANGE} />
      <path d="M43 82.5001C47 89.3001 48.3333 98.3334 48.5 102C79.7 71.6001 121.5 57.0001 138.5 53.5001C103.7 49.5001 60.3333 71.1667 43 82.5001Z" fill={ORANGE} />
      <path d="M93.5 0L83.5 15.5H106L117 4.5L93.5 0Z" fill={ORANGE} />
    </svg>
  );
}

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    // Ocultar el splash nativo apenas la capa web está lista (handoff).
    (async () => {
      try {
        const { SplashScreen: NativeSplash } = await import("@capacitor/splash-screen");
        await NativeSplash.hide();
      } catch {
        /* web / plugin no disponible — no pasa nada */
      }
    })();

    const t = setTimeout(() => {
      if (!cancelled) onFinish();
    }, (reduce ? 0.7 : TOTAL) * 1000);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [onFinish, reduce]);

  // ---- Modo accesible: sin movimiento, sólo logo + fade out ----
  if (reduce) {
    return (
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-7 bg-[#09090b]"
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 1, 0] }}
        transition={{ duration: 0.7, times: [0, 0.5, 1] }}
      >
        <ElevateMark />
        <div style={wordmarkStyle}>ELEVATE</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#09090b]"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: TOTAL, times: [0, 0.82, 1], ease: "easeIn" }}
    >
      {/* Lockup que se eleva y funde al final ("Elevate") */}
      <motion.div
        className="flex flex-col items-center justify-center gap-7"
        animate={{ y: [0, 0, -46], opacity: [1, 1, 0] }}
        transition={{ duration: TOTAL, times: [0, 0.72, 1], ease: EASE }}
      >
        {/* Logo + glow + streak */}
        <div className="relative grid place-items-center" style={{ width: 132, height: 100 }}>
          {/* Glow que enciende detrás del logo */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 240,
              height: 240,
              background:
                "radial-gradient(circle, rgba(255,78,0,0.55), rgba(255,78,0,0.12) 42%, transparent 68%)",
              filter: "blur(8px)",
              zIndex: -1,
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0, 0.95, 0.5], scale: [0.7, 1.06, 1] }}
            transition={{ duration: 1.1, delay: 0.12, ease: "easeOut", times: [0, 0.45, 1] }}
          />
          {/* Streak de velocidad que barre sobre el logo */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 210,
              height: 5,
              top: "46%",
              filter: "blur(1.5px)",
              background: "linear-gradient(90deg, transparent, #FF6A2B, transparent)",
              zIndex: 1,
            }}
            initial={{ x: -130, scaleX: 0.3, opacity: 0 }}
            animate={{ x: [-130, -10, 100], scaleX: [0.3, 1, 1.15], opacity: [0, 1, 0] }}
            transition={{ duration: 0.55, delay: 0.05, ease: "easeOut", times: [0, 0.5, 1] }}
          />
          {/* El logo: parte en reposo (match con el splash nativo) + leve "respiración" */}
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.045, 1] }}
            transition={{ duration: 0.75, delay: 0.08, ease: "easeOut", times: [0, 0.4, 1] }}
          >
            <ElevateMark />
          </motion.div>
        </div>

        {/* Wordmark que sube con máscara */}
        <motion.div
          style={wordmarkStyle}
          initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)", y: 14, skewX: -6 }}
          animate={{ opacity: 1, clipPath: "inset(0 0 -20% 0)", y: 0, skewX: -6 }}
          transition={{ duration: 0.55, delay: 0.5, ease: EASE }}
        >
          ELEVATE
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

const wordmarkStyle: React.CSSProperties = {
  fontWeight: 800,
  fontStyle: "italic",
  letterSpacing: "0.34em",
  textIndent: "0.34em",
  fontSize: 24,
  color: "#F7F4F2",
  fontFamily: "Inter, sans-serif",
};
