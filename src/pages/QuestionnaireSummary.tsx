/**
 * Resumen del cuestionario de intake — pantalla read-only que le muestra al
 * alumno (y al coach) TODO lo que respondió en el onboarding, agrupado por
 * secciones. Los datos se leen local (loadOnboarding). La edición se hace en
 * "/onboarding".
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Pencil,
  Ruler,
  Target,
  Dumbbell,
  Soup,
  HeartPulse,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  loadOnboarding,
  SEX_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  ACTIVITY_OPTIONS,
  TRAINING_MODE_OPTIONS,
  type OnboardingData,
} from "@/lib/onboarding";

// value → label humano usando las listas de opciones.
const labelOf = (
  opts: { value: string; label: string }[],
  value: string | null
): string | null => (value ? opts.find((o) => o.value === value)?.label ?? value : null);

// Una fila simple label / valor.
const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/[0.05] last:border-0">
    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0 pt-0.5">
      {label}
    </p>
    <p className="text-sm font-semibold text-foreground text-right min-w-0">{value}</p>
  </div>
);

// Fila con lista de chips (para arrays de strings).
const ChipsRow = ({ label, items }: { label: string; items: string[] }) => (
  <div className="py-2.5 border-b border-white/[0.05] last:border-0">
    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <span
          key={it}
          className="text-xs font-semibold text-foreground px-2.5 py-1 rounded-lg bg-secondary/60 border border-white/[0.06]"
        >
          {it}
        </span>
      ))}
    </div>
  </div>
);

// Tarjeta-sección.
const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Ruler;
  title: string;
  children: React.ReactNode;
}) => (
  <motion.div variants={fadeUp} className="card-elevated rounded-2xl overflow-hidden">
    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06]">
      <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="text-sm font-black text-foreground tracking-tight">{title}</h2>
    </div>
    <div className="px-4 py-1.5">{children}</div>
  </motion.div>
);

const dash = "—";

export default function QuestionnaireSummary() {
  const navigate = useNavigate();
  const { student, isAdminMode } = useAuthContext();
  const studentId = student?.id || (isAdminMode ? "admin" : "anon");
  const data: OnboardingData = loadOnboarding(studentId);

  const header = (
    <PageHeader
      eyebrow={
        <>
          <ClipboardList className="w-3.5 h-3.5" />
          Cuestionario
        </>
      }
      title="Resumen de mi perfil"
      maxWidth="max-w-3xl"
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
  );

  // Empty state: cuestionario sin completar.
  if (!data.completedAt) {
    return (
      <AppShell>
        {header}
        <motion.div
          className="min-h-screen bg-background pb-nav lg:pb-10"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="max-w-3xl mx-auto px-5 lg:px-8 pt-5">
            <motion.div variants={fadeUp} className="card-hero rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-black text-foreground mb-1">Todavía no completaste el cuestionario</p>
              <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                Respondelo una vez para que tu coach conozca tu contexto y arme tu plan.
              </p>
              <button
                onClick={() => navigate("/onboarding")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold active:scale-95 transition-transform"
              >
                <ClipboardList className="w-4 h-4" /> Completar cuestionario
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AppShell>
    );
  }

  const fmt = (v: number | null, suffix = "") => (v != null ? `${v}${suffix}` : dash);

  return (
    <AppShell>
      {header}
      <motion.div
        className="min-h-screen bg-background pb-nav lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-3xl mx-auto px-5 lg:px-8 pt-5 space-y-4">
          {/* Datos corporales */}
          <Section icon={Ruler} title="Datos corporales">
            <Row label="Sexo" value={labelOf(SEX_OPTIONS, data.sex) ?? dash} />
            <Row label="Edad" value={fmt(data.age, " años")} />
            <Row label="Altura" value={fmt(data.heightCm, " cm")} />
            <Row label="Peso" value={fmt(data.weightKg, " kg")} />
          </Section>

          {/* Experiencia y objetivo */}
          <Section icon={Target} title="Experiencia y objetivo">
            <Row label="Experiencia" value={labelOf(EXPERIENCE_OPTIONS, data.experience) ?? dash} />
            <Row label="Objetivo" value={labelOf(GOAL_OPTIONS, data.goal) ?? dash} />
            <Row label="Actividad diaria" value={labelOf(ACTIVITY_OPTIONS, data.activityLevel) ?? dash} />
            {data.priorities.length > 0 && (
              <ChipsRow label="Prioridades" items={data.priorities} />
            )}
          </Section>

          {/* Entrenamiento */}
          <Section icon={Dumbbell} title="Entrenamiento">
            <Row label="Modalidad" value={labelOf(TRAINING_MODE_OPTIONS, data.trainingMode) ?? dash} />
            <Row label="Días por semana" value={fmt(data.daysPerWeek)} />
            <Row label="Split" value={data.split ?? dash} />
            <Row label="Duración del programa" value={fmt(data.programWeeks, " semanas")} />
            {data.equipment.length > 0 && <ChipsRow label="Equipamiento" items={data.equipment} />}
            {data.masteredExercises.length > 0 && (
              <ChipsRow label="Ejercicios que domina" items={data.masteredExercises} />
            )}
          </Section>

          {/* Nutrición */}
          <Section icon={Soup} title="Nutrición">
            <Row label="Comidas por día" value={fmt(data.mealsPerDay)} />
            {data.dietaryRestrictions.length > 0 && (
              <ChipsRow label="Restricciones" items={data.dietaryRestrictions} />
            )}
            {data.nutritionNotes.trim() && (
              <Row label="Notas" value={<span className="font-normal whitespace-pre-line">{data.nutritionNotes}</span>} />
            )}
          </Section>

          {/* Lesiones */}
          <Section icon={HeartPulse} title="Lesiones y molestias">
            {data.injuryAreas.length > 0 ? (
              <ChipsRow label="Zonas" items={data.injuryAreas} />
            ) : (
              <Row label="Zonas" value="Sin lesiones reportadas" />
            )}
            {data.injuryNotes.trim() && (
              <Row label="Notas" value={<span className="font-normal whitespace-pre-line">{data.injuryNotes}</span>} />
            )}
          </Section>

          {/* Editar */}
          <motion.div variants={fadeUp} className="pt-1 pb-2">
            <button
              onClick={() => navigate("/onboarding")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold active:scale-95 transition-transform"
            >
              <Pencil className="w-4 h-4" /> Editar cuestionario
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AppShell>
  );
}
