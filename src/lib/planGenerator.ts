/**
 * Generador de plan a partir del onboarding.
 *
 * POR QUÉ EXISTE
 * Hasta ahora el alumno contestaba 11 pasos y la app no usaba nada de eso para
 * entrenarlo: los datos iban a un PDF para el coach y a la calculadora de
 * calorías. El alumno terminaba armándose el programa a mano, que es justo lo
 * que el producto promete evitar.
 *
 * Este módulo cierra ese círculo: entra `OnboardingData`, sale un `MyProgram`
 * completo con sus semanas, más las RAZONES de cada decisión para poder
 * mostrarlas. Sin modelo de lenguaje: son reglas deterministas sobre los
 * templates con evidencia que ya existían (`programTemplates.ts`) y el catálogo
 * de requisitos de `exerciseCatalog.ts`. Eso lo hace instantáneo, offline y
 * testeable — y, sobre todo, explicable.
 *
 * El orden de las reglas importa y es deliberado:
 *   1. elegir template   → estructura base según días + split + nivel
 *   2. sustituir         → equipamiento, lesiones y ejercicios vetados
 *   3. ajustar por nivel → margen de RIR y tope de series
 *   4. priorizar         → +1 serie en los grupos que el alumno eligió
 *   5. recortar          → que la sesión entre en el tiempo REAL que tiene
 *   6. expandir semanas  → progresión de RIR + descarga cada 4 semanas
 * El recorte va al final a propósito: el tiempo disponible manda sobre las
 * ganas de sumar volumen. Un plan que no entra en la agenda no se cumple.
 */
import type { OnboardingData, Experience, Goal } from "./onboarding";
import { PROGRAM_TEMPLATES, type ProgramTemplate } from "./programTemplates";
import { newId, type MyProgram, type ProgramDay, type ProgramExercise } from "./myPrograms";
import {
  describeRequirement,
  findExercise,
  findSubstitute,
  isAvailable,
  normalizeName,
  stressesInjury,
} from "./exerciseCatalog";

// ── Tipos de salida ─────────────────────────────────────────────────────────

/** Una decisión del generador, contada en voz de entrenador. */
export interface PlanReason {
  kind: "estructura" | "equipamiento" | "lesion" | "tiempo" | "prioridad" | "nivel" | "progresion";
  text: string;
}

export interface PlanSwap {
  from: string;
  to: string;
  reason: "equipamiento" | "lesion" | "evitado";
  detail: string;
}

export interface PlanDrop {
  name: string;
  detail: string;
}

export interface GeneratedPlan {
  program: MyProgram;
  templateId: string;
  templateName: string;
  /** Frases listas para mostrar, en orden de importancia. */
  reasons: PlanReason[];
  swaps: PlanSwap[];
  drops: PlanDrop[];
  /** Duración estimada de una sesión promedio (minutos). */
  minutesPerSession: number;
  /** Series semanales por grupo muscular en la semana 1. */
  weeklySets: { group: string; sets: number }[];
  citation: string;
}

// ── Constantes de cálculo ───────────────────────────────────────────────────

/** Segundos de trabajo efectivo de una serie (subir, bajar, acomodarse). */
const WORK_SECONDS_PER_SET = 45;
/** Entrada en calor antes de la primera serie. */
const WARMUP_SECONDS = 300;
/** Nunca dejamos una sesión con menos de esto, por más apurado que esté. */
const MIN_EXERCISES_PER_DAY = 3;
/** Tope de series por ejercicio al sumar volumen por prioridad. */
const MAX_SETS_PER_EXERCISE = 5;

const DEFAULT_WEEKS = 8;
const DEFAULT_SESSION_MINUTES = 60;

/** Familias de split: agrupan la preferencia del alumno con los templates. */
type SplitFamily = "full" | "upper_lower" | "ppl";

const SPLIT_TO_FAMILY: Record<string, SplitFamily> = {
  "Full body": "full",
  "Torso / Pierna": "upper_lower",
  "Empuje · Tirón · Pierna (PPL)": "ppl",
};

const TEMPLATE_TO_FAMILY: Record<string, SplitFamily> = {
  "full-body-2": "full",
  "full-body-3": "full",
  "upper-lower-4": "upper_lower",
  "ppl-6": "ppl",
};

const FAMILY_LABEL: Record<SplitFamily, string> = {
  full: "Cuerpo completo",
  upper_lower: "Torso / Pierna",
  ppl: "Empuje · Tirón · Pierna",
};

const LEVEL_ORDER: Record<string, number> = { principiante: 0, intermedio: 1, avanzado: 2 };
const EXPERIENCE_TO_LEVEL: Record<Experience, string> = {
  beginner: "principiante",
  intermediate: "intermedio",
  advanced: "avanzado",
};

const GOAL_WORD: Record<Goal, string> = {
  lose_fat: "Definición",
  gain_muscle: "Hipertrofia",
  recomp: "Recomposición",
  maintain: "Mantenimiento",
  performance: "Fuerza",
};

/** RIR mínimo al que puede llegar la progresión, según experiencia. */
const MIN_RIR: Record<Experience, number> = { beginner: 2, intermediate: 1, advanced: 0 };
/** Tope de series por ejercicio según experiencia (el principiante no necesita más). */
const MAX_SETS_BY_EXPERIENCE: Record<Experience, number> = {
  beginner: 3,
  intermediate: 4,
  advanced: 5,
};

// ── 1. Elección del template ────────────────────────────────────────────────

/**
 * Puntúa cada template contra lo que pidió el alumno. El split explícito pesa
 * más que todo lo demás (es una preferencia declarada), después la cantidad de
 * días —que es una restricción de agenda real— y al final el nivel.
 */
export function scoreTemplate(template: ProgramTemplate, data: OnboardingData): number {
  let score = 0;

  const wantedFamily = data.split ? SPLIT_TO_FAMILY[data.split] : undefined;
  if (wantedFamily && TEMPLATE_TO_FAMILY[template.id] === wantedFamily) score += 100;

  const days = data.daysPerWeek ?? data.trainingDays.length ?? template.daysPerWeek;
  score -= 20 * Math.abs(days - template.daysPerWeek);

  if (data.experience) {
    const want = LEVEL_ORDER[EXPERIENCE_TO_LEVEL[data.experience]];
    const have = LEVEL_ORDER[template.level];
    const gap = Math.abs(want - have);
    score += gap === 0 ? 15 : gap === 1 ? 5 : 0;
  }

  return score;
}

export function pickTemplate(data: OnboardingData): ProgramTemplate {
  return [...PROGRAM_TEMPLATES].sort((a, b) => scoreTemplate(b, data) - scoreTemplate(a, data))[0];
}

// ── 2. Adaptación de ejercicios ─────────────────────────────────────────────

interface AdaptContext {
  equipment: string[];
  injuries: string[];
  severity: OnboardingData["injurySeverity"];
  avoid: string[];
  swaps: PlanSwap[];
  drops: PlanDrop[];
}

/**
 * Devuelve el ejercicio adaptado, o null si hay que sacarlo del plan.
 * Prioridad de los motivos: primero lo que el alumno pidió evitar, después el
 * equipamiento (es binario: no lo tiene, no lo puede hacer) y por último las
 * lesiones, donde la severidad define si sustituimos o directamente sacamos.
 */
function adaptExercise(ex: ProgramExercise, ctx: AdaptContext): ProgramExercise | null {
  const entry = findExercise(ex.name);
  // Si el ejercicio no está en el catálogo no podemos razonar sobre él: lo
  // dejamos como está en vez de inventar una restricción que no conocemos.
  if (!entry) return ex;

  const isAvoided = ctx.avoid.some((a) => normalizeName(a) === normalizeName(ex.name));
  const lacksEquipment = !isAvailable(entry, ctx.equipment);
  const hurts = stressesInjury(entry, ctx.injuries);

  if (!isAvoided && !lacksEquipment && !hurts) return ex;

  const substitute = findSubstitute(entry, {
    equipment: ctx.equipment,
    injuries: ctx.injuries,
    avoid: ctx.avoid,
  });

  if (substitute) {
    const reason: PlanSwap["reason"] = isAvoided
      ? "evitado"
      : lacksEquipment
        ? "equipamiento"
        : "lesion";
    const detail = isAvoided
      ? "lo marcaste como ejercicio a evitar"
      : lacksEquipment
        ? `necesita ${describeRequirement(entry)}`
        : `carga ${entry.joints.filter((j) => ctx.injuries.includes(j)).join(" y ").toLowerCase()}`;
    ctx.swaps.push({ from: ex.name, to: substitute.name, reason, detail });
    return { ...ex, name: substitute.name, muscleGroup: substitute.muscleGroup };
  }

  // No hay alternativa posible con lo que tiene.
  if (hurts && ctx.severity === "limita") {
    ctx.drops.push({
      name: ex.name,
      detail: `no encontré un reemplazo que no cargue ${entry.joints
        .filter((j) => ctx.injuries.includes(j))
        .join(" y ")
        .toLowerCase()}`,
    });
    return null;
  }
  if (lacksEquipment || isAvoided) {
    ctx.drops.push({
      name: ex.name,
      detail: isAvoided
        ? "lo pediste evitar y no hay otro del mismo patrón disponible"
        : `necesita ${describeRequirement(entry)} y no hay alternativa`,
    });
    return null;
  }

  // Molestia leve sin alternativa: se mantiene, pero más lejos del fallo.
  return { ...ex, rir: (ex.rir ?? 2) + 1 };
}

// ── 3-5. Ajustes de nivel, prioridades y tiempo ─────────────────────────────

const setsOf = (ex: ProgramExercise) => ex.sets;

/** Duración estimada de una sesión, en segundos. */
export function estimateSeconds(exercises: ProgramExercise[]): number {
  return (
    WARMUP_SECONDS +
    exercises.reduce((total, ex) => total + ex.sets * (WORK_SECONDS_PER_SET + ex.restSeconds), 0)
  );
}

export const estimateMinutes = (exercises: ProgramExercise[]) =>
  Math.round(estimateSeconds(exercises) / 60);

function applyExperience(exercises: ProgramExercise[], experience: Experience | null) {
  if (!experience) return exercises;
  const maxSets = MAX_SETS_BY_EXPERIENCE[experience];
  // El principiante entrena más lejos del fallo: la técnica primero.
  const rirBump = experience === "beginner" ? 1 : 0;
  return exercises.map((ex) => ({
    ...ex,
    sets: Math.min(ex.sets, maxSets),
    rir: (ex.rir ?? 2) + rirBump,
  }));
}

function applyPriorities(exercises: ProgramExercise[], priorities: string[]) {
  if (!priorities.length) return exercises;
  const out = exercises.map((ex) => ({ ...ex }));
  for (const group of priorities) {
    // Sumamos la serie al accesorio del grupo, no al básico: es donde el
    // volumen extra se tolera mejor sin comerse la calidad de la sesión.
    const candidates = out
      .map((ex, i) => ({ ex, i, demand: findExercise(ex.name)?.demand ?? 2 }))
      .filter((c) => c.ex.muscleGroup === group && c.ex.sets < MAX_SETS_PER_EXERCISE)
      .sort((a, b) => a.demand - b.demand);
    if (candidates.length) out[candidates[0].i].sets += 1;
  }
  return out;
}

/** Saca ejercicios —del menos importante al más— hasta entrar en el tiempo. */
function trimToTime(
  exercises: ProgramExercise[],
  budgetMinutes: number,
  drops: PlanDrop[]
): ProgramExercise[] {
  const out = [...exercises];
  const budgetSeconds = budgetMinutes * 60;
  while (out.length > MIN_EXERCISES_PER_DAY && estimateSeconds(out) > budgetSeconds) {
    let worstIdx = 0;
    let worstDemand = Infinity;
    out.forEach((ex, i) => {
      const demand = findExercise(ex.name)?.demand ?? 2;
      // <= para quedarnos con el ÚLTIMO de igual demanda: los templates van de
      // básico a accesorio, así que el final es siempre lo más prescindible.
      if (demand <= worstDemand) {
        worstDemand = demand;
        worstIdx = i;
      }
    });
    const [removed] = out.splice(worstIdx, 1);
    drops.push({ name: removed.name, detail: `no entraba en ${budgetMinutes} min` });
  }
  return out;
}

// ── 6. Expansión a semanas con progresión ───────────────────────────────────

const isDeloadWeek = (week: number) => week % 4 === 0;

function progressExercise(
  ex: ProgramExercise,
  week: number,
  experience: Experience | null
): ProgramExercise {
  const floor = MIN_RIR[experience ?? "intermediate"];
  const baseRir = ex.rir ?? 2;
  if (isDeloadWeek(week)) {
    // Descarga: menos series y bien lejos del fallo.
    return { ...ex, sets: Math.max(2, ex.sets - 1), rir: baseRir + 2 };
  }
  // Cada 2 semanas nos acercamos un punto al fallo.
  const step = Math.floor((week - 1) / 2);
  return { ...ex, rir: Math.max(floor, baseRir - step) };
}

// ── Orquestación ────────────────────────────────────────────────────────────

export function generatePlan(data: OnboardingData): GeneratedPlan {
  const template = pickTemplate(data);
  const weeks = data.programWeeks ?? DEFAULT_WEEKS;
  const budget = data.sessionMinutes ?? DEFAULT_SESSION_MINUTES;
  const experience = data.experience;

  const swaps: PlanSwap[] = [];
  const drops: PlanDrop[] = [];
  const ctx: AdaptContext = {
    equipment: data.equipment,
    injuries: data.injuryAreas,
    severity: data.injurySeverity,
    avoid: data.avoidedExercises ?? [],
    swaps,
    drops,
  };

  // Días base (semana 1), ya adaptados a la persona.
  const baseDays = template.days.map((day) => {
    const adapted = day.exercises
      .map((ex) => adaptExercise({ ...ex }, ctx))
      .filter((ex): ex is ProgramExercise => ex !== null);
    const leveled = applyExperience(adapted, experience);
    const prioritized = applyPriorities(leveled, data.priorities);
    const trimmed = trimToTime(prioritized, budget, drops);
    return { name: day.name, exercises: trimmed };
  });

  // Expansión del mesociclo.
  const days: ProgramDay[] = [];
  for (let week = 1; week <= weeks; week++) {
    for (const base of baseDays) {
      days.push({
        id: newId(),
        name: base.name,
        week,
        exercises: base.exercises.map((ex) => progressExercise(ex, week, experience)),
      });
    }
  }

  const family = TEMPLATE_TO_FAMILY[template.id];
  const goalWord = data.goal ? GOAL_WORD[data.goal] : "Entrenamiento";
  const daysPerWeek = baseDays.length;

  // Se calcula antes del programa para que el encabezado y las razones digan
  // exactamente el mismo número.
  const minutesPerSession = Math.round(
    baseDays.reduce((sum, d) => sum + estimateMinutes(d.exercises), 0) / (baseDays.length || 1)
  );

  const program: MyProgram = {
    id: newId(),
    name: `${goalWord} · ${FAMILY_LABEL[family]}`,
    description: `${weeks} semanas · ${daysPerWeek} días por semana · sesiones de ~${minutesPerSession} min. Generado desde tu cuestionario y supervisado por tu coach.`,
    level: template.level,
    weeks,
    daysPerWeek,
    days,
    origin: "generado",
    templateId: template.id,
    createdAt: new Date().toISOString(),
  };

  return {
    program,
    templateId: template.id,
    templateName: template.name,
    reasons: buildReasons(data, template, baseDays, swaps, drops, weeks, minutesPerSession),
    swaps,
    drops,
    minutesPerSession,
    weeklySets: weeklySetsByGroup(baseDays),
    citation: template.citation,
  };
}

/** Series semanales por grupo muscular (semana 1), de mayor a menor. */
export function weeklySetsByGroup(
  baseDays: { exercises: ProgramExercise[] }[]
): { group: string; sets: number }[] {
  const totals = new Map<string, number>();
  for (const day of baseDays) {
    for (const ex of day.exercises) {
      const group = ex.muscleGroup || "Otros";
      totals.set(group, (totals.get(group) ?? 0) + setsOf(ex));
    }
  }
  return [...totals.entries()]
    .map(([group, sets]) => ({ group, sets }))
    .sort((a, b) => b.sets - a.sets);
}

// ── Las razones, en voz de entrenador ───────────────────────────────────────

/** Une una lista en castellano natural: "a, b y c". */
const joinEs = (items: string[]) =>
  items.length <= 1
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;

/**
 * Igual que joinEs pero cortando en `max`. Una razón que enumera siete cambios
 * deja de leerse como una explicación y pasa a ser un listado: preferimos
 * nombrar los primeros y resumir el resto.
 */
const joinCapped = (items: string[], max = 3) =>
  items.length <= max
    ? joinEs(items)
    : `${items.slice(0, max).join(", ")} y ${items.length - max} cambio${
        items.length - max === 1 ? "" : "s"
      } más`;

/** Deduplica manteniendo el orden de aparición. */
const uniq = <T,>(items: T[]) => [...new Set(items)];

function buildReasons(
  data: OnboardingData,
  template: ProgramTemplate,
  baseDays: { name: string; exercises: ProgramExercise[] }[],
  swaps: PlanSwap[],
  drops: PlanDrop[],
  weeks: number,
  minutes: number
): PlanReason[] {
  const reasons: PlanReason[] = [];
  const days = baseDays.length;
  const family = TEMPLATE_TO_FAMILY[template.id];

  // Estructura
  reasons.push({
    kind: "estructura",
    text: `Armé ${days} días por semana porque es lo que me dijiste que podés sostener. Elegí ${FAMILY_LABEL[
      family
    ].toLowerCase()} para que cada grupo se entrene más de una vez por semana.`,
  });

  // Tiempo
  reasons.push({
    kind: "tiempo",
    text: `Cada sesión queda en ~${minutes} min, dentro de los ${
      data.sessionMinutes ?? DEFAULT_SESSION_MINUTES
    } que tenés disponibles.`,
  });

  // Lesiones
  const injurySwaps = swaps.filter((s) => s.reason === "lesion");
  if (injurySwaps.length) {
    const list = uniq(injurySwaps.map((s) => `${s.from} por ${s.to}`));
    reasons.push({
      kind: "lesion",
      text: `Por lo de ${joinEs(data.injuryAreas.map((a) => a.toLowerCase()))} cambié ${joinCapped(
        list
      )}.`,
    });
  }

  // Equipamiento
  const equipSwaps = swaps.filter((s) => s.reason === "equipamiento");
  if (equipSwaps.length) {
    const list = uniq(equipSwaps.map((s) => `${s.from} por ${s.to}`));
    reasons.push({
      kind: "equipamiento",
      text: `Con el equipamiento que tenés, cambié ${joinCapped(list)}.`,
    });
  }

  // Ejercicios vetados
  const avoidSwaps = swaps.filter((s) => s.reason === "evitado");
  if (avoidSwaps.length) {
    const list = uniq(avoidSwaps.map((s) => `${s.from} por ${s.to}`));
    reasons.push({
      kind: "equipamiento",
      text: `Saqué lo que pediste evitar: ${joinEs(list)}.`,
    });
  }

  // Prioridades
  const groups = weeklySetsByGroup(baseDays).map((g) => g.group);
  const honored = data.priorities.filter((p) => groups.includes(p));
  if (honored.length) {
    reasons.push({
      kind: "prioridad",
      text: `Sumé volumen en ${joinEs(honored.map((g) => g.toLowerCase()))}, que marcaste como prioridad.`,
    });
  }

  // Nivel
  if (data.experience === "beginner") {
    reasons.push({
      kind: "nivel",
      text: "Arrancás con margen de repeticiones en reserva: primero la técnica, la carga viene sola.",
    });
  } else if (data.experience === "advanced") {
    reasons.push({
      kind: "nivel",
      text: "Al ser avanzado, la progresión llega hasta el fallo técnico en las semanas fuertes.",
    });
  }

  // Progresión
  const deloads = Array.from({ length: weeks }, (_, i) => i + 1).filter(isDeloadWeek);
  reasons.push({
    kind: "progresion",
    text: deloads.length
      ? `Son ${weeks} semanas: cada 2 te acercás un punto al fallo, y ${
          deloads.length === 1 ? `la semana ${deloads[0]} es` : `las semanas ${joinEs(deloads.map(String))} son`
        } de descarga para recuperar.`
      : `Son ${weeks} semanas con progresión de intensidad cada 2.`,
  });

  // Lo que se cayó, dicho de frente (mejor que el alumno lo note solo).
  if (drops.length) {
    reasons.push({
      kind: "tiempo",
      text: `Dejé afuera ${joinEs(uniq(drops.map((d) => d.name)))} para que el plan entre y se cumpla.`,
    });
  }

  return reasons;
}
