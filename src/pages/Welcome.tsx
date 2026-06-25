/**
 * Onboarding dopamínico — tour del producto con previews reales de cada
 * feature (coach, entrenamiento, nutrición, progreso), barra de progreso y
 * diseño premium. Termina llevando a /auth.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Dumbbell,
  Apple,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Check,
  Flame,
  Trophy,
} from "lucide-react";
import ProgressRing from "@/components/ui/progress-ring";

interface Slide {
  badge: string;
  title: string;
  desc: string;
}

const slides: Slide[] = [
  {
    badge: "Bienvenido",
    title: "Tu transformación empieza acá",
    desc: "Elevate es tu entrenador personal en el bolsillo. Todo lo que necesitás para progresar, en un solo lugar.",
  },
  {
    badge: "Coach 1-a-1",
    title: "Un coach de verdad, para vos",
    desc: "Un entrenador real te arma rutinas a tu medida, te corrige y te guía. Le escribís cuando quieras, sin vueltas.",
  },
  {
    badge: "Entrenamiento",
    title: "Entrená como un pro",
    desc: "Seguí tus rutinas día a día, registrá tus pesos y series, y rompé tus récords.",
  },
  {
    badge: "Nutrición",
    title: "Comé con un plan a tu medida",
    desc: "Tu plan de comidas, con tracking de adherencia y agua. Siempre sabés qué comer y cuánto te falta.",
  },
  {
    badge: "Progreso",
    title: "Mirá lo lejos que llegás",
    desc: "Racha, volumen, récords y gráficos. La satisfacción de ver, día a día, tu evolución real.",
  },
];

const floatT = (delay = 0) => ({ duration: 3.6, repeat: Infinity, ease: "easeInOut" as const, delay });

/* ── Preview visual por slide (mockups reales de cada feature) ── */
const SlideVisual = ({ step }: { step: number }) => {
  // 0 · Marca
  if (step === 0) {
    return (
      <div className="relative w-[17rem] h-[12rem] flex items-center justify-center">
        <div className="absolute w-40 h-40 rounded-full bg-primary/30 blur-3xl" />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={floatT()}
          className="relative w-28 h-28 rounded-[2rem] flex items-center justify-center"
          style={{
            background: "linear-gradient(145deg, hsl(18 100% 60%), hsl(22 100% 46%))",
            boxShadow: "0 22px 50px hsl(18 100% 55% / 0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          <span className="text-5xl font-black text-white italic">E</span>
        </motion.div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={floatT(0.3)} className="absolute top-1 left-2 px-3 py-1.5 rounded-full card-elevated flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-bold text-foreground">Coach</span>
        </motion.div>
        <motion.div animate={{ y: [0, -7, 0] }} transition={floatT(0.8)} className="absolute bottom-2 right-2 px-3 py-1.5 rounded-full card-elevated flex items-center gap-1.5">
          <Apple className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-bold text-foreground">Nutrición</span>
        </motion.div>
        <motion.div animate={{ y: [0, -9, 0] }} transition={floatT(1.2)} className="absolute top-10 right-0 px-3 py-1.5 rounded-full card-elevated flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-bold text-foreground">Progreso</span>
        </motion.div>
      </div>
    );
  }

  // 1 · Chat con el coach
  if (step === 1) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-primary/15 blur-2xl rounded-3xl" />
        <motion.div animate={{ y: [0, -6, 0] }} transition={floatT()} className="relative w-[17rem] space-y-2">
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-black shrink-0">
              C
            </div>
            <div className="card-elevated rounded-2xl rounded-bl-md px-3.5 py-2.5">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Tu coach</p>
              <p className="text-sm text-foreground">¡Gran semana! Subimos el peso en sentadilla 🔥</p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-gradient-primary rounded-2xl rounded-br-md px-3.5 py-2.5 max-w-[78%]">
              <p className="text-sm text-primary-foreground font-medium">¡Dale! Vamos por más 💪</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2 · Registro de serie
  if (step === 2) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-primary/15 blur-2xl rounded-3xl" />
        <motion.div animate={{ y: [0, -6, 0] }} transition={floatT()} className="relative card-elevated rounded-2xl p-4 w-[17rem]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-foreground">Press banca</h4>
            <span className="text-[11px] font-bold text-primary">2/4 series</span>
          </div>
          <div className="space-y-1.5">
            <div className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem] gap-2 items-center bg-emerald-500/10 rounded-lg px-1.5 py-1.5">
              <span className="text-center text-xs font-bold text-emerald-500">1</span>
              <span className="text-center text-sm font-bold text-foreground tabular-nums">80 kg</span>
              <span className="text-center text-sm font-bold text-foreground tabular-nums">8</span>
              <Check className="w-4 h-4 text-emerald-500 mx-auto" strokeWidth={3} />
            </div>
            <div className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem] gap-2 items-center rounded-lg px-1.5 py-1.5 ring-1 ring-primary/40 bg-primary/5">
              <span className="text-center text-xs font-bold text-primary">2</span>
              <span className="text-center text-sm font-bold text-foreground tabular-nums">82.5</span>
              <span className="text-center text-sm font-bold text-foreground tabular-nums">8</span>
              <div className="w-5 h-5 rounded bg-primary mx-auto flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Anterior: 80kg × 8 · 🏆 nuevo PR</p>
        </motion.div>
      </div>
    );
  }

  // 3 · Anillo de calorías
  if (step === 3) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-primary/15 blur-2xl rounded-3xl" />
        <motion.div animate={{ y: [0, -6, 0] }} transition={floatT()} className="relative card-elevated rounded-2xl p-4 w-[17rem] flex items-center gap-4">
          <ProgressRing progress={68} size={74} stroke={7} gradientId="onbRing">
            <span className="text-sm font-black text-foreground tabular-nums">68%</span>
          </ProgressRing>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Hoy</p>
            <p className="text-lg font-black text-foreground tabular-nums">
              1500 <span className="text-xs text-muted-foreground font-semibold">/ 2200 kcal</span>
            </p>
            <div className="flex gap-2.5 mt-1.5 text-[11px] font-bold">
              <span className="text-blue-400">P 120</span>
              <span className="text-amber-400">C 180</span>
              <span className="text-rose-400">G 50</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 4 · Progreso
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-primary/15 blur-2xl rounded-3xl" />
      <motion.div animate={{ y: [0, -6, 0] }} transition={floatT()} className="relative w-[17rem] space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="card-elevated rounded-2xl p-3">
            <Flame className="w-4 h-4 text-primary mb-1.5" />
            <p className="text-2xl font-black text-foreground leading-none tabular-nums">12</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide mt-1">Racha</p>
          </div>
          <div className="card-elevated rounded-2xl p-3">
            <Trophy className="w-4 h-4 text-amber-400 mb-1.5" />
            <p className="text-2xl font-black text-foreground leading-none tabular-nums">100</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide mt-1">PR banca (kg)</p>
          </div>
        </div>
        <div className="card-elevated rounded-2xl p-3">
          <div className="flex items-end gap-1.5 h-12">
            {[40, 55, 45, 72, 60, 85, 100].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary"
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Welcome = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const isLast = step === slides.length - 1;
  const slide = slides[step];

  const haptic = () => navigator.vibrate?.(10);
  const next = () => {
    haptic();
    if (isLast) navigate("/auth");
    else setStep((s) => s + 1);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      {/* Glow ambiental */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[440px] h-[440px] rounded-full bg-primary/20 blur-[130px]"
          animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-orange-500/10 blur-[120px]" />
        {/* grilla sutil */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Top: barra de progreso + saltar */}
      <div className="relative z-10 px-6 pt-12">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex gap-1.5">
            {slides.map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-primary rounded-full"
                  initial={false}
                  animate={{ width: i <= step ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            ))}
          </div>
          {!isLast && (
            <button onClick={() => navigate("/auth")} className="text-sm font-semibold text-muted-foreground active:text-foreground">
              Saltar
            </button>
          )}
        </div>
      </div>

      {/* Slide */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <div className="mb-8 flex items-center justify-center min-h-[12rem]">
              <SlideVisual step={step} />
            </div>

            <span className="text-[11px] font-black tracking-[0.3em] text-primary uppercase mb-3">{slide.badge}</span>
            <h1 className="text-[2.1rem] font-black text-foreground leading-[1.1] tracking-tight mb-3 max-w-[20rem]">
              {slide.title}
            </h1>
            <p className="text-muted-foreground text-[15px] leading-relaxed max-w-[19rem]">{slide.desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom: dots + CTA */}
      <div className="relative z-10 px-6 pb-10 space-y-5">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Ir al paso ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-primary" : "w-2 bg-white/15"
              }`}
            />
          ))}
        </div>

        <motion.button
          onClick={next}
          whileTap={{ scale: 0.98 }}
          className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-black uppercase tracking-wide text-sm flex items-center justify-center gap-2 glow-primary"
        >
          {isLast ? "Empezar" : "Siguiente"}
          <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>

        <p className="text-center text-sm text-muted-foreground h-5">
          {isLast && (
            <>
              ¿Ya tenés cuenta?{" "}
              <button onClick={() => navigate("/auth")} className="text-primary font-bold">
                Iniciar sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Welcome;
