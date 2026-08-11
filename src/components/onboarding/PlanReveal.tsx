/**
 * El remate del onboarding: en vez de mandar al alumno a una home que le ofrece
 * "crear programa", le mostramos el plan ya hecho y por qué quedó así.
 *
 * La pantalla tiene dos tiempos a propósito:
 *  1. TRABAJO VISIBLE — unos segundos nombrando lo que se está considerando,
 *     con SUS respuestas. No es un spinner decorativo: es la app demostrando
 *     que escuchó. Sin este momento, el plan aparece de la nada y se percibe
 *     como un template al azar.
 *  2. REVELACIÓN — el plan con nombre propio, las razones en voz de entrenador
 *     y un solo botón. Nada de "ver otras opciones" compitiendo al lado.
 *
 * El plan ya quedó guardado y activo antes de llegar acá, así que esta pantalla
 * no puede fallar ni dejar al alumno sin nada.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wrench,
} from "lucide-react";
import type { GeneratedPlan, PlanReason } from "@/lib/planGenerator";

/** Cuánto dura cada línea del "armando tu plan". */
const TICK_MS = 850;

const REASON_ICON: Record<PlanReason["kind"], typeof Target> = {
  estructura: CalendarDays,
  tiempo: Clock,
  lesion: ShieldCheck,
  equipamiento: Wrench,
  prioridad: Target,
  nivel: Dumbbell,
  progresion: TrendingUp,
};

interface Props {
  plan: GeneratedPlan;
  name?: string | null;
  synced?: boolean;
  /**
   * false cuando el coach ya tenía un plan asignado: ese sigue mandando y este
   * queda guardado como propuesta. Cambia el encabezado y el destino del botón,
   * pero nunca ofrece las dos opciones a la vez — el alumno no tiene cómo
   * decidir cuál es mejor, y esa decisión no le corresponde.
   */
  activated?: boolean;
  onStart: () => void;
}

export default function PlanReveal({
  plan,
  name,
  synced = true,
  activated = true,
  onStart,
}: Props) {
  const { program, reasons, minutesPerSession, weeklySets, citation } = plan;

  // Las líneas del "trabajo visible" salen de lo que el alumno contestó, no son
  // texto genérico: por eso la espera se siente trabajo y no relleno.
  const steps = useMemo(() => {
    const out = [`${program.daysPerWeek} días por semana`, `Sesiones de ~${minutesPerSession} min`];
    const lesion = reasons.find((r) => r.kind === "lesion");
    if (lesion) out.push("Cuidando tus molestias");
    const equipo = reasons.find((r) => r.kind === "equipamiento");
    if (equipo) out.push("Ajustando a tu equipamiento");
    out.push(`${program.weeks} semanas de progresión`);
    return out;
  }, [program.daysPerWeek, program.weeks, minutesPerSession, reasons]);

  // Quien pidió menos movimiento no quiere una espera coreografiada: va directo
  // al plan, que es la información que importa.
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [phase, setPhase] = useState<"working" | "plan">(reducedMotion ? "plan" : "working");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (phase !== "working") return;
    if (tick >= steps.length) {
      const t = setTimeout(() => setPhase("plan"), 320);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTick((n) => n + 1), TICK_MS);
    return () => clearTimeout(t);
  }, [phase, tick, steps.length]);

  const topGroups = weeklySets.slice(0, 4);

  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-y-auto">
      <AnimatePresence mode="wait">
        {phase === "working" ? (
          <motion.div
            key="working"
            className="min-h-full flex flex-col items-center justify-center px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <motion.div
              className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center glow-primary"
              animate={reducedMotion ? undefined : { scale: [1, 1.06, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-9 h-9 text-primary-foreground" />
            </motion.div>

            <h1 className="text-2xl font-black tracking-tight text-foreground mt-8">
              Armando tu plan{name ? `, ${name}` : ""}…
            </h1>

            <div className="mt-7 flex flex-col gap-2.5 w-full max-w-xs">
              {steps.map((label, i) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-2.5 text-left"
                  initial={{ opacity: 0, x: -8 }}
                  animate={i < tick ? { opacity: 1, x: 0 } : { opacity: 0.25, x: 0 }}
                  transition={{ duration: 0.28 }}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      i < tick ? "bg-primary" : "bg-muted-foreground/40"
                    }`}
                  />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="plan"
            className="min-h-full flex flex-col px-5 pt-14 pb-40"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[11px] font-bold text-primary uppercase tracking-[0.18em]">
              {activated ? "Tu plan está listo" : "Propuesta para tu coach"}
            </p>
            <h1 className="text-[2rem] leading-[1.08] font-black tracking-tight text-foreground mt-2">
              {program.name}
            </h1>

            {/* Datos duros del plan */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { icon: CalendarDays, label: `${program.weeks} semanas` },
                { icon: Dumbbell, label: `${program.daysPerWeek} días/sem` },
                { icon: Clock, label: `~${minutesPerSession} min` },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm font-semibold text-foreground"
                >
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </div>

            {/* El porqué, que es lo que convierte el plan en criterio */}
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-8 mb-3">
              Por qué te armé esto
            </p>
            <div className="flex flex-col gap-3">
              {reasons.map((reason, i) => {
                const Icon = REASON_ICON[reason.kind];
                return (
                  <motion.div
                    key={reason.text}
                    className="flex gap-3 items-start"
                    // El contenido nunca depende de que la animación corra: si
                    // no hay movimiento, aparece visible de entrada.
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.32 }}
                  >
                    <span className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-primary" />
                    </span>
                    <p className="text-[15px] leading-relaxed text-foreground/90 flex-1">
                      {reason.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Volumen semanal: el dato que un entrenador miraría primero */}
            {topGroups.length > 0 && (
              <>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-8 mb-3">
                  Series por semana
                </p>
                <div className="rounded-2xl border border-border bg-card divide-y divide-white/[0.05] overflow-hidden">
                  {topGroups.map((g) => (
                    <div key={g.group} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="text-[15px] text-foreground flex-1">{g.group}</span>
                      <span className="text-[15px] font-bold text-primary tabular-nums">
                        {g.sets}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* El coach sigue en el circuito: la IA propone, el humano valida */}
            <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/[0.07] px-4 py-3.5">
              <p className="text-[15px] leading-relaxed text-foreground/90">
                {activated ? (
                  <>
                    <span className="font-bold">Tu coach lo revisa.</span> Ya tiene tu cuestionario
                    y este plan: si algo no le cierra para vos, lo ajusta y te avisa.
                  </>
                ) : (
                  <>
                    <span className="font-bold">Tu coach ya te armó un plan</span>, así que ese es el
                    que vas a seguir. Este queda guardado en tus programas para que lo revise y
                    decida si te sirve.
                  </>
                )}
                {!synced && " Se lo enviamos apenas tengas conexión."}
              </p>
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground/70 mt-5">{citation}</p>

            {/* CTA fijo: un solo camino, sin alternativas compitiendo */}
            <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-5 bg-gradient-to-t from-background via-background/95 to-transparent">
              <motion.button
                onClick={onStart}
                whileTap={{ scale: 0.98 }}
                className="w-full max-w-2xl mx-auto h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 glow-primary"
              >
                {activated ? "Empezar" : "Ver mi plan"} <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
