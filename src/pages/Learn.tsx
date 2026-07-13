/**
 * Aprendé — sección educativa del alumno (ruta futura "/aprender").
 *
 * Contenido 100% estático/determinista (SIN IA): cápsulas educativas + un
 * explicador de "Cómo usar la app", una guía de calentamiento, la escala
 * RPE/RIR, una calculadora de RM interactiva (reusa src/lib/strength-calculations)
 * y un espacio para el material (PDFs) que suba el coach en el futuro.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  ChevronDown,
  Home,
  Dumbbell,
  UtensilsCrossed,
  LineChart,
  User,
  Flame,
  Gauge,
  Calculator,
  FileText,
  FolderOpen,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { estimatedOneRepMax, formatWeight } from "@/lib/strength-calculations";
import { staggerContainer, fadeUp } from "@/lib/animations";

/* ─────────────────────────────────────────────────────────────
   1. Cómo usar la app — acordeón por función principal
   ───────────────────────────────────────────────────────────── */
const APP_GUIDE: { icon: typeof Home; title: string; body: string }[] = [
  {
    icon: Home,
    title: "Inicio",
    body: "Es tu punto de partida. Ves el entreno que te toca hoy según el plan de tu coach, tu meta semanal, tu racha y accesos rápidos al resto de la app. Si no podés entrenar hoy, podés reprogramar el día.",
  },
  {
    icon: Dumbbell,
    title: "Entrenar",
    body: "Abrí el entreno del día y registrá cada serie: peso y repeticiones. La app guarda tu progreso, te muestra tus marcas y te deja marcar cada ejercicio como completado. También podés hacer un entreno libre cuando quieras.",
  },
  {
    icon: UtensilsCrossed,
    title: "Nutrición",
    body: "Registrá lo que comés en el día y armá tu propia dieta con comidas y macros. Podés definir tu meta de calorías y ver cómo venís respecto a ella. El control de tu alimentación lo llevás vos.",
  },
  {
    icon: LineChart,
    title: "Progreso",
    body: "Seguí tu evolución en el tiempo: peso corporal, medidas, volumen de entrenamiento y tus récords personales. Es la foto de cómo vas mejorando semana a semana.",
  },
  {
    icon: User,
    title: "Perfil",
    body: "Tus datos, tu cuestionario de inicio y la configuración de tu cuenta. Desde acá también podés contactar a tu coach y ajustar tus preferencias.",
  },
];

/* ─────────────────────────────────────────────────────────────
   3. Escala RPE / RIR
   ───────────────────────────────────────────────────────────── */
const RPE_SCALE: { rir: string; rpe: string; meaning: string }[] = [
  { rir: "0", rpe: "10", meaning: "Esfuerzo máximo. No podías hacer ni una repetición más." },
  { rir: "1", rpe: "9", meaning: "Te quedaba 1 repetición en el tanque." },
  { rir: "2", rpe: "8", meaning: "Te quedaban 2 repeticiones. Zona de trabajo duro." },
  { rir: "3", rpe: "7", meaning: "Te quedaban 3 repeticiones. Esfuerzo moderado." },
  { rir: "4", rpe: "6", meaning: "Te quedaban 4 o más. Cómodo, buen margen." },
];

/* ─────────────────────────────────────────────────────────────
   5. Material del coach (PDFs)
   TODO: cablear a tabla de materiales del coach cuando exista.
   Por ahora es un array vacío → estado vacío elegante.
   ───────────────────────────────────────────────────────────── */
interface CoachMaterial {
  id: string;
  name: string;
  url: string;
}
const COACH_MATERIALS: CoachMaterial[] = [];

/* Porcentajes de 1RM que mostramos en la tabla de la calculadora */
const RM_PERCENTAGES = [100, 95, 90, 85, 80, 75, 70, 65, 60];

/* ── Tarjeta contenedora de cada cápsula ── */
const Capsule = ({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Home;
  title: string;
  children: React.ReactNode;
}) => (
  <motion.section variants={fadeUp} className="card-elevated rounded-2xl overflow-hidden">
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="text-sm font-black text-foreground tracking-tight">{title}</h2>
    </div>
    <div className="p-4">{children}</div>
  </motion.section>
);

/* ── Ítem de acordeón (Cómo usar la app) ── */
const AccordionItem = ({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Home;
  title: string;
  body: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-secondary/40 border border-white/[0.06] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-3.5 py-3 text-left active:scale-[0.99] transition-transform"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="flex-1 text-sm font-bold text-foreground">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="px-3.5 pb-3.5 text-[13px] leading-relaxed text-muted-foreground">
          {body}
        </p>
      )}
    </div>
  );
};

/* ── Calculadora de RM (interactiva, reusa la lib) ── */
const RMCalculator = () => {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  const w = parseFloat(weight);
  const r = parseInt(reps, 10);
  const valid = w > 0 && r > 0 && r <= 30;
  const oneRm = valid ? estimatedOneRepMax(w, r) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Peso (kg)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="80"
            className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-base font-bold text-foreground text-center tabular-nums focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Repeticiones
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="5"
            className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-base font-bold text-foreground text-center tabular-nums focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {valid ? (
        <>
          <div className="card-hero rounded-2xl p-4 text-center">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              1RM estimado
            </p>
            <p className="text-3xl font-black text-primary tabular-nums leading-tight mt-0.5">
              {formatWeight(oneRm)}
              <span className="text-base font-bold text-muted-foreground"> kg</span>
            </p>
          </div>

          <div className="rounded-2xl bg-secondary/40 border border-white/[0.06] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                % del 1RM
              </span>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Peso
              </span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {RM_PERCENTAGES.map((pct) => {
                const kg = Math.round((oneRm * pct) / 100 / 0.5) * 0.5;
                return (
                  <div key={pct} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm font-bold text-foreground tabular-nums">{pct}%</span>
                    <span className="text-sm font-black text-foreground tabular-nums">
                      {formatWeight(kg)}
                      <span className="text-[10px] font-bold text-muted-foreground"> kg</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Es una estimación (fórmulas Brzycki / Epley). Sirve como referencia para elegir cargas,
            no como una marca exacta. Ante la duda, empezá conservador.
          </p>
        </>
      ) : (
        <p className="text-[13px] text-muted-foreground text-center py-2">
          Ingresá el peso y las repeticiones de una serie exigente para estimar tu 1RM.
        </p>
      )}
    </div>
  );
};

export default function Learn() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <PageHeader
        eyebrow={
          <>
            <GraduationCap className="w-3.5 h-3.5" />
            Aprendé
          </>
        }
        title="Guía y recursos"
        maxWidth="max-w-2xl lg:max-w-3xl"
        left={
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground -ml-1 p-1"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />

      <motion.div
        className="min-h-screen bg-background pb-nav lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-2xl lg:max-w-3xl mx-auto px-5 lg:px-8 pt-5 space-y-4">
          {/* Intro */}
          <motion.p variants={fadeUp} className="text-sm text-muted-foreground leading-relaxed">
            Todo lo que necesitás para sacarle el máximo a tus entrenamientos: cómo funciona la app,
            conceptos clave y herramientas rápidas.
          </motion.p>

          {/* 1. Cómo usar la app */}
          <Capsule icon={GraduationCap} title="Cómo usar la app">
            <div className="space-y-2">
              {APP_GUIDE.map((item) => (
                <AccordionItem key={item.title} {...item} />
              ))}
            </div>
          </Capsule>

          {/* 2. Calentamiento */}
          <Capsule icon={Flame} title="Calentamiento (Warm Up)">
            <div className="space-y-4 text-[13px] leading-relaxed text-muted-foreground">
              <p>
                Un buen calentamiento prepara articulaciones y músculos, mejora tu técnica y baja el
                riesgo de lesión. Dedicale 8 a 12 minutos antes de entrenar.
              </p>
              <div>
                <p className="text-xs font-black text-foreground uppercase tracking-wider mb-2">
                  1 · Movilidad general (3–5 min)
                </p>
                <p>
                  Elevá tu temperatura con algo suave y continuo (bici, cinta, saltar la soga) y sumá
                  movilidad de las zonas que vas a trabajar: hombros, cadera, tobillos y columna.
                </p>
              </div>
              <div>
                <p className="text-xs font-black text-foreground uppercase tracking-wider mb-2">
                  2 · Series de aproximación
                </p>
                <p>
                  Antes de tu peso de trabajo, subí la carga de a poco para ensayar el patrón de
                  movimiento:
                </p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    "Barra vacía o muy liviano × 10–12 reps",
                    "~50% del peso de trabajo × 6–8 reps",
                    "~70% del peso de trabajo × 3–4 reps",
                    "~85% del peso de trabajo × 1–2 reps",
                  ].map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-[11px] text-foreground/70">
                Las aproximaciones no deberían fatigarte: descansá poco entre ellas y llegá fresco a
                tu primera serie efectiva.
              </p>
            </div>
          </Capsule>

          {/* 3. Escala RPE / RIR */}
          <Capsule icon={Gauge} title="Escala RPE / RIR">
            <p className="text-[13px] leading-relaxed text-muted-foreground mb-4">
              Son dos formas de medir cuán duro fue una serie. El{" "}
              <span className="font-bold text-foreground">RIR</span> (Reps In Reserve) es cuántas
              repeticiones te quedaban antes del fallo. El{" "}
              <span className="font-bold text-foreground">RPE</span> (esfuerzo percibido, del 1 al 10)
              es su cara opuesta: a más esfuerzo, menos reps en reserva.
            </p>
            <div className="rounded-2xl bg-secondary/40 border border-white/[0.06] overflow-hidden">
              <div className="grid grid-cols-[3rem_3rem_1fr] gap-2 px-3.5 py-2.5 border-b border-white/[0.06]">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">RIR</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">RPE</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Qué significa</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {RPE_SCALE.map((row) => (
                  <div key={row.rir} className="grid grid-cols-[3rem_3rem_1fr] gap-2 px-3.5 py-2.5 items-center">
                    <span className="text-sm font-black text-primary tabular-nums">{row.rir}</span>
                    <span className="text-sm font-black text-foreground tabular-nums">{row.rpe}</span>
                    <span className="text-[12px] leading-snug text-muted-foreground">{row.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          </Capsule>

          {/* 4. Calculadora de RM */}
          <Capsule icon={Calculator} title="Calculadora de RM">
            <p className="text-[13px] leading-relaxed text-muted-foreground mb-4">
              Estimá tu repetición máxima (1RM) a partir de una serie y obtené los pesos por
              porcentaje para planificar tus cargas.
            </p>
            <RMCalculator />
          </Capsule>

          {/* 5. Material del coach (PDFs) */}
          <Capsule icon={FileText} title="Material del coach">
            {COACH_MATERIALS.length > 0 ? (
              <div className="space-y-2">
                {COACH_MATERIALS.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-white/[0.06] px-3.5 py-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <span className="flex-1 text-sm font-bold text-foreground truncate">{mat.name}</span>
                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/25 text-xs font-bold text-primary active:scale-95 transition-transform"
                    >
                      Abrir
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-secondary/60 border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                  <FolderOpen className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-bold text-foreground mb-1">
                  Tu coach todavía no subió material
                </p>
                <p className="text-[13px] text-muted-foreground max-w-xs mx-auto">
                  Cuando tu coach comparta PDFs, guías o planes, van a aparecer acá para que los
                  abras cuando quieras.
                </p>
              </div>
            )}
          </Capsule>
        </div>
      </motion.div>
    </AppShell>
  );
}
