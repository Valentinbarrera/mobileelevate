/**
 * Cuestionario de intake del alumno (Fase 1, persistencia local).
 * Wizard de 11 pasos que captura el contexto para el coach. SIN motor de calorías.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, Pencil,
  Sprout, TrendingUp, Trophy,
  Flame, Dumbbell, RefreshCw, Minus, Zap,
  Armchair, Footprints, PersonStanding, Bike,
  CalendarDays, Repeat,
} from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import CompletionCelebration from "@/components/onboarding/CompletionCelebration";
import { StepHeader, ChoiceCard, Chip, ChipMultiSelect, NumberField, Stepper, NotesField } from "@/components/onboarding/controls";
import { useAuthContext } from "@/contexts/AuthContext";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { fetchOnboardingRemote, saveOnboardingRemote } from "@/lib/onboardingApi";
import {
  OnboardingData,
  loadOnboarding,
  saveOnboarding,
  SEX_OPTIONS,
  EXPERIENCE_OPTIONS,
  MASTERED_EXERCISES,
  INJURY_AREAS,
  GOAL_OPTIONS,
  PRIORITY_MUSCLES,
  EQUIPMENT_OPTIONS,
  ACTIVITY_OPTIONS,
  DIETARY_RESTRICTIONS,
  TRAINING_MODE_OPTIONS,
  SPLIT_OPTIONS,
  PROGRAM_WEEKS_OPTIONS,
} from "@/lib/onboarding";

const TOTAL = 11;

// Eyebrow (categoría) por paso
const EYEBROWS = [
  "", "Perfil", "Perfil", "Entrenamiento", "Entrenamiento", "Objetivo",
  "Objetivo", "Equipamiento", "Estilo de vida", "Nutrición", "Programa", "Listo",
];

const EXPERIENCE_ICONS = { beginner: Sprout, intermediate: TrendingUp, advanced: Trophy } as const;
const GOAL_ICONS = { lose_fat: Flame, gain_muscle: Dumbbell, recomp: RefreshCw, maintain: Minus, performance: Zap } as const;
const ACTIVITY_ICONS = { sedentary: Armchair, light: Footprints, moderate: PersonStanding, high: Bike, very_high: Flame } as const;
const MODE_ICONS = { weekly: CalendarDays, free_cycle: Repeat } as const;

const labelOf = (opts: { value: string; label: string }[], v: string | null) =>
  v ? opts.find((o) => o.value === v)?.label ?? v : "—";

const buzz = (pattern: number | number[] = 10) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
};

// Slide direccional entre pasos (premium): adelante entra desde la derecha.
const slideVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: (dir: number) => ({ x: dir >= 0 ? -48 : 48, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }),
};

// Pasos de selección única que auto-avanzan al elegir (best practice tipo Typeform).
const AUTO_ADVANCE_STEPS = new Set([2, 5, 8]);

const Onboarding = () => {
  const navigate = useNavigate();
  const { student, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");
  const isReal = !!student?.id && !isAdminMode;
  const firstName = student?.full_name?.trim().split(" ")[0] || null;

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState(false);
  const [synced, setSynced] = useState(true);
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>();
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<OnboardingData>(() => {
    const base = loadOnboarding(sid);
    return {
      ...base,
      age: base.age ?? student?.age ?? null,
      heightCm: base.heightCm ?? student?.height_cm ?? null,
      weightKg: base.weightKg ?? student?.weight_kg ?? null,
    };
  });

  // Hidratar desde Supabase al abrir (si es alumno real); cae a local si falla
  useEffect(() => {
    if (hydrated) return;
    if (!isReal) {
      setHydrated(true);
      return;
    }
    let cancelled = false;
    fetchOnboardingRemote(sid).then((remote) => {
      if (cancelled) return;
      if (remote) {
        setData((d) => ({
          ...remote,
          age: remote.age ?? d.age,
          heightCm: remote.heightCm ?? d.heightCm,
          weightKg: remote.weightKg ?? d.weightKg,
        }));
      }
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, [isReal, sid, hydrated]);

  // Persistir el progreso local (sin marcar completado)
  useEffect(() => {
    saveOnboarding(sid, data);
  }, [sid, data]);

  const update = (patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch }));
  const choose = (patch: Partial<OnboardingData>) => { buzz(); update(patch); };
  const toggle = (key: keyof OnboardingData, val: string) => {
    buzz();
    setData((d) => {
      const arr = (d[key] as string[]) || [];
      return { ...d, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  };
  const has = (key: keyof OnboardingData, val: string) => ((data[key] as string[]) || []).includes(val);

  // ── Reglas: cuándo se puede avanzar ──
  const isStepValid = (s: number): boolean => {
    switch (s) {
      case 1: return !!data.sex && !!data.age && !!data.heightCm && !!data.weightKg;
      case 2: return !!data.experience;
      case 5: return !!data.goal;
      case 7: return data.equipment.length > 0;
      case 8: return !!data.activityLevel;
      case 10: return !!data.trainingMode && !!data.daysPerWeek && !!data.split && !!data.programWeeks;
      default: return true; // 3,4,6,9 opcionales · 11 resumen
    }
  };
  const canContinue = isStepValid(step);

  const goTo = (s: number) => {
    setDirection(s >= step ? 1 : -1);
    clearTimeout(advanceTimer.current);
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Elegir en un paso de selección única → marca y auto-avanza (deja ver el check).
  const pickSingle = (patch: Partial<OnboardingData>) => {
    choose(patch);
    clearTimeout(advanceTimer.current);
    if (step < TOTAL) {
      const target = step + 1;
      advanceTimer.current = setTimeout(() => goTo(target), 420);
    }
  };

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  const finish = async () => {
    const final = { ...data, completedAt: new Date().toISOString() };
    saveOnboarding(sid, final);
    buzz([12, 40, 12, 40, 24]); // patrón celebratorio
    setDone(true);
    if (isReal) {
      const ok = await saveOnboardingRemote(sid, final);
      setSynced(ok);
    }
  };

  const next = async () => {
    if (!canContinue) return;
    if (step < TOTAL) {
      goTo(step + 1);
      return;
    }
    await finish();
  };

  const back = () => (step > 1 ? goTo(step - 1) : navigate(-1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <motion.div variants={fadeUp}>
              <StepHeader
                eyebrow={firstName ? `Hola, ${firstName} 👋` : "¡Empecemos!"}
                title="Armemos tu perfil"
                subtitle="Arranquemos por lo básico. Toma 2 minutos y tu coach lo usa para programarte."
              />
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
              {SEX_OPTIONS.map((o) => (
                <ChoiceCard key={o.value} label={o.label} selected={data.sex === o.value} onClick={() => choose({ sex: o.value })} />
              ))}
            </motion.div>
            <motion.div variants={fadeUp}><NumberField label="Edad" value={data.age} onChange={(v) => update({ age: v })} unit="años" /></motion.div>
            <motion.div variants={fadeUp}><NumberField label="Altura" value={data.heightCm} onChange={(v) => update({ heightCm: v })} unit="cm" /></motion.div>
            <motion.div variants={fadeUp}><NumberField label="Peso" value={data.weightKg} onChange={(v) => update({ weightKg: v })} unit="kg" /></motion.div>
          </>
        );
      case 2:
        return (
          <>
            <motion.div variants={fadeUp}>
              <StepHeader eyebrow={EYEBROWS[2]} title="Tu experiencia" subtitle="¿Hace cuánto venís entrenando?" />
            </motion.div>
            {EXPERIENCE_OPTIONS.map((o) => (
              <motion.div key={o.value} variants={fadeUp}>
                <ChoiceCard label={o.label} desc={o.desc} icon={EXPERIENCE_ICONS[o.value]} selected={data.experience === o.value} onClick={() => pickSingle({ experience: o.value })} />
              </motion.div>
            ))}
          </>
        );
      case 3:
        return (
          <>
            <motion.div variants={fadeUp}>
              <StepHeader eyebrow={EYEBROWS[3]} title="¿Qué ejercicios dominás?" subtitle="Marcá los que ya hacés con buena técnica. ¿Falta alguno? Agregalo abajo." />
            </motion.div>
            <motion.div variants={fadeUp}>
              <ChipMultiSelect
                options={MASTERED_EXERCISES}
                selected={data.masteredExercises}
                onToggle={(v) => toggle("masteredExercises", v)}
                allowCustom
                placeholder="Otro ejercicio…"
              />
            </motion.div>
          </>
        );
      case 4:
        return (
          <>
            <motion.div variants={fadeUp}>
              <StepHeader eyebrow={EYEBROWS[4]} title="Lesiones o molestias" subtitle="Marcá zonas con dolor o limitación (si las hay)." />
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              {INJURY_AREAS.map((a) => (
                <Chip key={a} label={a} selected={has("injuryAreas", a)} onClick={() => toggle("injuryAreas", a)} />
              ))}
            </motion.div>
            <motion.div variants={fadeUp}>
              <NotesField label="Detalle (opcional)" value={data.injuryNotes} onChange={(v) => update({ injuryNotes: v })} placeholder="Ej: molestia en el hombro derecho al hacer press" />
            </motion.div>
          </>
        );
      case 5:
        return (
          <>
            <motion.div variants={fadeUp}>
              <StepHeader eyebrow={EYEBROWS[5]} title="Tu objetivo principal" subtitle="¿Qué querés lograr ahora?" />
            </motion.div>
            {GOAL_OPTIONS.map((o) => (
              <motion.div key={o.value} variants={fadeUp}>
                <ChoiceCard label={o.label} desc={o.desc} icon={GOAL_ICONS[o.value]} selected={data.goal === o.value} onClick={() => pickSingle({ goal: o.value })} />
              </motion.div>
            ))}
          </>
        );
      case 6:
        return (
          <>
            <motion.div variants={fadeUp}>
              <StepHeader eyebrow={EYEBROWS[6]} title="¿Qué querés priorizar?" subtitle="Grupos o aspectos a darle más foco. Podés agregar otros." />
            </motion.div>
            <motion.div variants={fadeUp}>
              <ChipMultiSelect
                options={PRIORITY_MUSCLES}
                selected={data.priorities}
                onToggle={(v) => toggle("priorities", v)}
                allowCustom
                placeholder="Otra prioridad…"
              />
            </motion.div>
          </>
        );
      case 7:
        return (
          <>
            <motion.div variants={fadeUp}>
              <StepHeader eyebrow={EYEBROWS[7]} title="¿Qué equipamiento tenés?" subtitle="Con qué contás para entrenar. Podés agregar otros." />
            </motion.div>
            <motion.div variants={fadeUp}>
              <ChipMultiSelect
                options={EQUIPMENT_OPTIONS}
                selected={data.equipment}
                onToggle={(v) => toggle("equipment", v)}
                allowCustom
                placeholder="Otro equipo…"
              />
            </motion.div>
          </>
        );
      case 8:
        return (
          <>
            <motion.div variants={fadeUp}>
              <StepHeader eyebrow={EYEBROWS[8]} title="Nivel de actividad diaria" subtitle="Sin contar el entrenamiento." />
            </motion.div>
            {ACTIVITY_OPTIONS.map((o) => (
              <motion.div key={o.value} variants={fadeUp}>
                <ChoiceCard label={o.label} desc={o.desc} icon={ACTIVITY_ICONS[o.value]} selected={data.activityLevel === o.value} onClick={() => pickSingle({ activityLevel: o.value })} />
              </motion.div>
            ))}
          </>
        );
      case 9:
        return (
          <>
            <motion.div variants={fadeUp}>
              <StepHeader eyebrow={EYEBROWS[9]} title="Datos nutricionales" subtitle="Contexto para tu coach (no calculamos calorías acá)." />
            </motion.div>
            <motion.div variants={fadeUp}>
              <Stepper label="Comidas por día" value={data.mealsPerDay} onChange={(v) => update({ mealsPerDay: v })} min={1} max={8} />
            </motion.div>
            <motion.p variants={fadeUp} className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pt-1">Restricciones</motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              {DIETARY_RESTRICTIONS.map((r) => (
                <Chip key={r} label={r} selected={has("dietaryRestrictions", r)} onClick={() => toggle("dietaryRestrictions", r)} />
              ))}
            </motion.div>
            <motion.div variants={fadeUp}>
              <NotesField label="Notas (alergias, preferencias)" value={data.nutritionNotes} onChange={(v) => update({ nutritionNotes: v })} placeholder="Ej: alérgico a los frutos secos" />
            </motion.div>
          </>
        );
      case 10:
        return (
          <>
            <motion.div variants={fadeUp}>
              <StepHeader eyebrow={EYEBROWS[10]} title="Cómo programar tu entrenamiento" subtitle="Definí la estructura de tu plan." />
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
              {TRAINING_MODE_OPTIONS.map((o) => (
                <ChoiceCard key={o.value} label={o.label} desc={o.desc} icon={MODE_ICONS[o.value]} selected={data.trainingMode === o.value} onClick={() => choose({ trainingMode: o.value })} />
              ))}
            </motion.div>
            <motion.div variants={fadeUp}>
              <Stepper label="Días que entrenás por semana" value={data.daysPerWeek} onChange={(v) => update({ daysPerWeek: v })} min={1} max={7} />
            </motion.div>
            <motion.p variants={fadeUp} className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pt-1">Split de entrenamiento</motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              {SPLIT_OPTIONS.map((s) => (
                <Chip key={s} label={s} selected={data.split === s} onClick={() => choose({ split: s })} />
              ))}
            </motion.div>
            <motion.p variants={fadeUp} className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pt-1">¿De cuántas semanas?</motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              {PROGRAM_WEEKS_OPTIONS.map((w) => (
                <Chip key={w} label={`${w} semanas`} selected={data.programWeeks === w} onClick={() => choose({ programWeeks: w })} />
              ))}
            </motion.div>
          </>
        );
      case 11: {
        const rows: { k: string; v: string; step: number }[] = [
          { k: "Sexo", v: labelOf(SEX_OPTIONS, data.sex), step: 1 },
          { k: "Edad", v: data.age ? `${data.age} años` : "—", step: 1 },
          { k: "Altura", v: data.heightCm ? `${data.heightCm} cm` : "—", step: 1 },
          { k: "Peso", v: data.weightKg ? `${data.weightKg} kg` : "—", step: 1 },
          { k: "Experiencia", v: labelOf(EXPERIENCE_OPTIONS, data.experience), step: 2 },
          { k: "Domina", v: data.masteredExercises.join(", ") || "—", step: 3 },
          { k: "Lesiones", v: [data.injuryAreas.join(", "), data.injuryNotes].filter(Boolean).join(" · ") || "Ninguna", step: 4 },
          { k: "Objetivo", v: labelOf(GOAL_OPTIONS, data.goal), step: 5 },
          { k: "Prioridades", v: data.priorities.join(", ") || "—", step: 6 },
          { k: "Equipamiento", v: data.equipment.join(", ") || "—", step: 7 },
          { k: "Actividad", v: labelOf(ACTIVITY_OPTIONS, data.activityLevel), step: 8 },
          { k: "Comidas/día", v: data.mealsPerDay ? String(data.mealsPerDay) : "—", step: 9 },
          { k: "Restricciones", v: [data.dietaryRestrictions.join(", "), data.nutritionNotes].filter(Boolean).join(" · ") || "—", step: 9 },
          { k: "Programa", v: [labelOf(TRAINING_MODE_OPTIONS, data.trainingMode), data.daysPerWeek ? `${data.daysPerWeek} días/sem` : null, data.split, data.programWeeks ? `${data.programWeeks} sem` : null].filter(Boolean).join(" · ") || "—", step: 10 },
        ];
        return (
          <>
            <motion.div variants={fadeUp}>
              <StepHeader eyebrow={EYEBROWS[11]} title="Revisá tu perfil" subtitle="Tocá cualquier dato para editarlo antes de enviárselo al coach." />
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card divide-y divide-white/[0.05] overflow-hidden">
              {rows.map((r) => (
                <button key={r.k + r.v} onClick={() => goTo(r.step)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left active:bg-secondary/40 transition-colors">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider w-24 shrink-0 pt-0.5">{r.k}</span>
                  <span className="text-sm text-foreground flex-1 min-w-0">{r.v}</span>
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                </button>
              ))}
            </motion.div>
          </>
        );
      }
      default:
        return null;
    }
  };

  if (done) {
    return <CompletionCelebration name={firstName} synced={synced} onDone={() => navigate("/profile")} />;
  }

  return (
    <OnboardingLayout currentStep={step} totalSteps={TOTAL} onBack={back}>
      <div className="flex-1 pb-44 overflow-x-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="px-5 py-6"
          >
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
              {renderStep()}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer fijo: continuar / finalizar */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        {!canContinue && (
          <p className="text-center text-xs text-muted-foreground mb-2">Completá los campos para continuar</p>
        )}
        <motion.button
          onClick={next}
          disabled={!canContinue}
          whileTap={canContinue ? { scale: 0.98 } : undefined}
          className={`w-full max-w-2xl mx-auto h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
            canContinue
              ? "bg-gradient-primary text-primary-foreground glow-primary"
              : "bg-secondary text-muted-foreground/50 cursor-not-allowed"
          }`}
        >
          {step === TOTAL ? (
            <><Check className="w-5 h-5" /> Finalizar y enviar</>
          ) : (
            <>Continuar <ArrowRight className="w-5 h-5" /></>
          )}
        </motion.button>
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
