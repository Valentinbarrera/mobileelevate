/**
 * Catálogo de ejercicios con sus REQUISITOS, no solo su nombre.
 *
 * Es lo que le faltaba a la app para poder decidir sola: hasta ahora los
 * templates listaban nombres sueltos ("Press banca") y nadie sabía qué
 * equipamiento hace falta ni qué articulación carga. Sin eso es imposible
 * respetar lo que el alumno contestó en el onboarding.
 *
 * Cada entrada declara:
 *  • `pattern`  → patrón de movimiento. Dos ejercicios del mismo patrón son
 *                 intercambiables entre sí (es la base de las sustituciones).
 *  • `requires` → alternativas de equipamiento. Es una lista de COMBINACIONES:
 *                 el ejercicio se puede hacer si el alumno tiene TODO lo de
 *                 alguna de ellas. Press banca es [["Barra y discos","Banco"]]
 *                 —necesita las dos cosas— mientras que curl de bíceps es
 *                 [["Mancuernas"],["Barra y discos"],["Bandas elásticas"]],
 *                 con cualquiera alcanza. Lista vacía = peso corporal.
 *  • `joints`   → zonas de INJURY_AREAS con RIESGO ELEVADO en ese ejercicio, no
 *                 las que simplemente participan. La distinción es clave: casi
 *                 todo empuje involucra el hombro, pero el press con mancuernas
 *                 —recorrido libre, agarre neutro— es justamente la alternativa
 *                 que se prescribe cuando el hombro molesta. Si marcáramos
 *                 "Hombro" en todos, una molestia borraría el pecho entero en
 *                 vez de sustituirlo, que es lo contrario de lo que queremos.
 *  • `demand`   → 3 = básico pesado, 2 = accesorio importante, 1 = aislamiento.
 *                 Se usa para recortar por tiempo empezando por lo prescindible.
 *
 * Los nombres coinciden con los que usan los templates de `programTemplates.ts`.
 * Las alternativas extra existen solo acá: son el pool del que sale un reemplazo.
 */

/** Patrón de movimiento. Los reemplazos siempre se buscan dentro del mismo. */
export type MovementPattern =
  | "squat"
  | "lunge"
  | "hinge"
  | "knee_iso"
  | "hamstring_iso"
  | "calf"
  | "push_horizontal"
  | "push_vertical"
  | "chest_iso"
  | "pull_horizontal"
  | "pull_vertical"
  | "rear_delt"
  | "delt_iso"
  | "biceps"
  | "triceps"
  | "core";

export interface CatalogEntry {
  name: string;
  pattern: MovementPattern;
  muscleGroup: string;
  /** Combinaciones de equipamiento válidas (OR entre ellas, AND dentro). */
  requires: string[][];
  /** Zonas (INJURY_AREAS) que carga de forma relevante. */
  joints: string[];
  /** 3 = básico pesado · 2 = accesorio · 1 = aislamiento. */
  demand: 1 | 2 | 3;
}

/** Quita acentos y normaliza para comparar nombres escritos a mano. */
export const normalizeName = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const e = (
  name: string,
  pattern: MovementPattern,
  muscleGroup: string,
  requires: string[][],
  joints: string[],
  demand: 1 | 2 | 3
): CatalogEntry => ({ name, pattern, muscleGroup, requires, joints, demand });

// Atajos para que la tabla se lea de un vistazo.
const BARRA = "Barra y discos";
const MANCUERNAS = "Mancuernas";
const MAQUINAS = "Máquinas / poleas";
const BANDAS = "Bandas elásticas";
const KETTLE = "Kettlebells";
const BANCO = "Banco";
/** Peso corporal: sin requisitos, siempre disponible. */
const LIBRE: string[][] = [];

export const EXERCISE_CATALOG: CatalogEntry[] = [
  // ── Rodilla dominante ─────────────────────────────────────────────────────
  e("Sentadilla", "squat", "Cuádriceps", [[BARRA]], ["Rodilla", "Espalda baja (lumbar)"], 3),
  e("Sentadilla frontal", "squat", "Cuádriceps", [[BARRA]], ["Rodilla", "Muñeca", "Espalda baja (lumbar)"], 3),
  e("Sentadilla goblet", "squat", "Cuádriceps", [[MANCUERNAS], [KETTLE]], ["Rodilla"], 2),
  e("Prensa", "squat", "Cuádriceps", [[MAQUINAS]], ["Rodilla"], 2),
  e("Sentadilla con peso corporal", "squat", "Cuádriceps", LIBRE, ["Rodilla"], 1),
  e("Estocadas", "lunge", "Cuádriceps", LIBRE, ["Rodilla"], 2),
  e("Sentadilla búlgara", "lunge", "Cuádriceps", LIBRE, ["Rodilla"], 2),
  e("Step up al banco", "lunge", "Cuádriceps", [[BANCO]], ["Rodilla"], 1),
  e("Extensión de cuádriceps", "knee_iso", "Cuádriceps", [[MAQUINAS]], ["Rodilla"], 1),

  // ── Cadera dominante ──────────────────────────────────────────────────────
  e("Peso muerto", "hinge", "Espalda", [[BARRA]], ["Espalda baja (lumbar)", "Cadera"], 3),
  e("Peso muerto rumano", "hinge", "Isquios", [[BARRA], [MANCUERNAS]], ["Espalda baja (lumbar)", "Cadera"], 3),
  e("Hip thrust", "hinge", "Glúteos", [[BARRA, BANCO], [MANCUERNAS, BANCO]], ["Cadera"], 2),
  e("Puente de glúteos", "hinge", "Glúteos", LIBRE, ["Cadera"], 1),
  e("Curl femoral", "hamstring_iso", "Isquios", [[MAQUINAS]], ["Rodilla"], 1),
  e("Curl nórdico", "hamstring_iso", "Isquios", LIBRE, ["Rodilla"], 2),
  e("Gemelos", "calf", "Gemelos", LIBRE, ["Tobillo"], 1),

  // ── Empuje horizontal ─────────────────────────────────────────────────────
  e("Press banca", "push_horizontal", "Pecho", [[BARRA, BANCO]], ["Hombro", "Muñeca"], 3),
  e("Press inclinado", "push_horizontal", "Pecho", [[BARRA, BANCO]], ["Hombro", "Muñeca"], 3),
  e("Press con mancuernas", "push_horizontal", "Pecho", [[MANCUERNAS, BANCO]], [], 2),
  e("Press inclinado con mancuernas", "push_horizontal", "Pecho", [[MANCUERNAS, BANCO]], [], 2),
  e("Press en máquina", "push_horizontal", "Pecho", [[MAQUINAS]], [], 2),
  e("Flexiones", "push_horizontal", "Pecho", LIBRE, ["Muñeca"], 2),
  e("Aperturas", "chest_iso", "Pecho", [[MANCUERNAS, BANCO], [MAQUINAS]], ["Hombro"], 1),
  e("Cruce en polea", "chest_iso", "Pecho", [[MAQUINAS]], [], 1),

  // ── Empuje vertical ───────────────────────────────────────────────────────
  e("Press militar", "push_vertical", "Hombros", [[BARRA]], ["Hombro", "Codo", "Muñeca", "Cuello"], 3),
  e("Press militar con mancuernas", "push_vertical", "Hombros", [[MANCUERNAS]], ["Hombro"], 2),
  e("Press de hombros en máquina", "push_vertical", "Hombros", [[MAQUINAS]], ["Hombro"], 2),
  e("Elevaciones laterales", "delt_iso", "Hombros", [[MANCUERNAS], [MAQUINAS]], ["Hombro"], 1),
  e("Elevaciones laterales con banda", "delt_iso", "Hombros", [[BANDAS]], [], 1),

  // ── Tirón horizontal ──────────────────────────────────────────────────────
  e("Remo con barra", "pull_horizontal", "Espalda", [[BARRA]], ["Espalda baja (lumbar)"], 3),
  e("Remo en máquina", "pull_horizontal", "Espalda", [[MAQUINAS]], [], 2),
  e("Remo con mancuerna", "pull_horizontal", "Espalda", [[MANCUERNAS]], [], 2),
  e("Remo con banda", "pull_horizontal", "Espalda", [[BANDAS]], [], 1),
  e("Remo invertido", "pull_horizontal", "Espalda", LIBRE, [], 2),

  // ── Tirón vertical ────────────────────────────────────────────────────────
  // Dominadas cuenta como peso corporal: asumimos una barra fija disponible.
  e("Dominadas", "pull_vertical", "Espalda", LIBRE, ["Hombro", "Codo"], 3),
  e("Jalón al pecho", "pull_vertical", "Espalda", [[MAQUINAS]], [], 2),
  e("Jalón con banda", "pull_vertical", "Espalda", [[BANDAS]], [], 1),

  // ── Deltoide posterior ────────────────────────────────────────────────────
  e("Face pull", "rear_delt", "Hombros", [[MAQUINAS], [BANDAS]], [], 1),
  e("Pájaros con mancuernas", "rear_delt", "Hombros", [[MANCUERNAS]], [], 1),
  e("Pájaros con banda", "rear_delt", "Hombros", [[BANDAS]], [], 1),

  // ── Brazos ────────────────────────────────────────────────────────────────
  e("Curl de bíceps", "biceps", "Bíceps", [[MANCUERNAS], [BARRA], [BANDAS]], ["Codo"], 1),
  e("Curl martillo", "biceps", "Bíceps", [[MANCUERNAS]], [], 1),
  e("Curl en polea", "biceps", "Bíceps", [[MAQUINAS]], ["Codo"], 1),
  e("Press francés", "triceps", "Tríceps", [[BARRA], [MANCUERNAS]], ["Codo"], 1),
  e("Extensión de tríceps en polea", "triceps", "Tríceps", [[MAQUINAS]], ["Codo"], 1),
  e("Fondos", "triceps", "Tríceps", LIBRE, ["Hombro", "Codo"], 2),
  e("Fondos en banco", "triceps", "Tríceps", [[BANCO]], ["Hombro"], 1),

  // ── Core ──────────────────────────────────────────────────────────────────
  e("Plancha", "core", "Core / abdomen", LIBRE, ["Muñeca"], 1),
  e("Crunch abdominal", "core", "Core / abdomen", LIBRE, ["Cuello"], 1),
  e("Dead bug", "core", "Core / abdomen", LIBRE, [], 1),
];

const BY_NAME = new Map(EXERCISE_CATALOG.map((x) => [normalizeName(x.name), x]));

export const findExercise = (name: string): CatalogEntry | undefined =>
  BY_NAME.get(normalizeName(name));

/**
 * "Gimnasio completo" es un atajo que el alumno elige en vez de tildar cinco
 * cosas: se expande a lo que hay en cualquier gimnasio. No incluye bandas ni
 * kettlebells a propósito — no todos los tienen, y los ejercicios que las usan
 * siempre tienen alternativa con máquinas o mancuernas.
 */
const FULL_GYM = "Gimnasio completo";
const FULL_GYM_INCLUDES = [BARRA, MANCUERNAS, MAQUINAS, BANCO];

/** Expande los atajos del equipamiento declarado a la lista real. */
export function expandEquipment(equipment: string[]): string[] {
  const out = new Set(equipment);
  if (out.has(FULL_GYM)) for (const item of FULL_GYM_INCLUDES) out.add(item);
  return [...out];
}

/** ¿El alumno puede hacer este ejercicio con lo que declaró tener? */
export function isAvailable(entry: CatalogEntry, equipment: string[]): boolean {
  if (entry.requires.length === 0) return true; // peso corporal
  const have = expandEquipment(equipment);
  return entry.requires.some((combo) => combo.every((need) => have.includes(need)));
}

/** ¿Carga alguna de las zonas que el alumno marcó como lesionadas? */
export const stressesInjury = (entry: CatalogEntry, injuries: string[]): boolean =>
  entry.joints.some((j) => injuries.includes(j));

/** "barra y discos + banco" · "mancuernas o máquinas / poleas" */
export const describeRequirement = (entry: CatalogEntry): string =>
  entry.requires.map((combo) => combo.join(" + ")).join(" o ").toLowerCase();

/**
 * Busca el mejor reemplazo para un ejercicio: mismo patrón, disponible con su
 * equipamiento, que no cargue las zonas lesionadas y que no esté en la lista de
 * los que el alumno pidió evitar. Entre los candidatos gana el de mayor
 * `demand`, para no degradar un básico a un aislamiento si se puede evitar.
 */
export function findSubstitute(
  original: CatalogEntry,
  opts: { equipment: string[]; injuries: string[]; avoid: string[]; exclude?: string[] }
): CatalogEntry | null {
  const avoidSet = new Set(opts.avoid.map(normalizeName));
  const excludeSet = new Set((opts.exclude ?? []).map(normalizeName));
  const candidates = EXERCISE_CATALOG.filter(
    (c) =>
      c.pattern === original.pattern &&
      normalizeName(c.name) !== normalizeName(original.name) &&
      !avoidSet.has(normalizeName(c.name)) &&
      !excludeSet.has(normalizeName(c.name)) &&
      isAvailable(c, opts.equipment) &&
      !stressesInjury(c, opts.injuries)
  );
  if (!candidates.length) return null;
  return candidates.sort((a, b) => b.demand - a.demand)[0];
}
