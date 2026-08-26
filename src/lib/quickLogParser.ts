/**
 * Interpreta lo que el alumno escribe en el anotador.
 *
 * La idea es escribir como le hablarías a alguien ("sentadilla 100x8",
 * "2 kg de 3 repes", "3 series de 100 por 8") y que quede registrado, sin
 * llenar tres campos entre serie y serie.
 *
 * Es un parser, no un modelo: responde en el mismo frame, funciona sin señal en
 * el subsuelo de un gimnasio y no cuesta una llamada por serie. A cambio,
 * entiende una gramática acotada — la que la gente usa de verdad para esto — y
 * cuando no entiende lo dice en vez de inventar un número.
 */

export interface ParsedSet {
  weight: number;
  reps: number;
}

export interface ParsedEntry {
  /** Null cuando el mensaje no nombra ejercicio: sigue el de la anotación anterior. */
  exercise: string | null;
  sets: ParsedSet[];
}

/** Rangos de cordura: fuera de esto seguro no es una serie. */
const MAX_WEIGHT = 1000;
const MAX_REPS = 200;

const UNIT = "(?:kgs?|kilos?|kilo)";
// Ojo con el orden: la alternancia es golosa por izquierda, y con "reps?"
// primero, "repes" matcheaba solo "rep" y quedaba un "es" suelto que se
// colaba como nombre del ejercicio. De la mas larga a la mas corta.
const REP_WORD = "(?:repet\\w*|repes|repe|reps|rep|veces)";
/** Separadores entre peso y repeticiones: 100x8, 100 por 8, 2 kg de 3. */
const SEP = "(?:x|por|\\*|·|@|de)";

/** Palabras que sobran en el nombre del ejercicio una vez sacados los números. */
const FILLER = new Set([
  "hice", "hoy", "ayer", "de", "del", "con", "a", "al", "y", "el", "la", "los", "las",
  "un", "una", "unas", "unos", "series", "serie", "sets", "set", "reps", "rep", "repes",
  "repe", "repeticion", "repeticiones", "kg", "kgs", "kilo", "kilos", "veces", "vez",
  "por", "x", "en", "me", "salio", "salieron", "quedo", "fueron", "fue", "acabo",
]);

const num = (raw: string) => Number(raw.replace(",", "."));

const sane = (s: ParsedSet) =>
  Number.isFinite(s.weight) &&
  Number.isFinite(s.reps) &&
  s.weight >= 0 &&
  s.weight <= MAX_WEIGHT &&
  s.reps >= 1 &&
  s.reps <= MAX_REPS;

/** Saca tildes y unifica el signo × para que las regex vean un solo alfabeto. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[×✕]/g, "x")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Limpia el nombre: lo que queda del mensaje después de sacarle los números.
 * Se trabaja sobre el texto normalizado para no arrastrar signos, y se
 * capitaliza al final — el alumno escribe en minúscula y apurado.
 */
function cleanName(rest: string): string | null {
  const palabras = rest
    .replace(/[^\p{L}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w && !FILLER.has(w));
  if (!palabras.length) return null;
  const nombre = palabras.join(" ").trim();
  if (nombre.length < 2) return null;
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

/**
 * @param text lo que escribió el alumno.
 * @returns qué entendió, o null si no hay una serie ahí adentro.
 */
export function parseQuickLog(text: string): ParsedEntry | null {
  if (!text || !text.trim()) return null;
  let rest = normalize(text);

  // 1. "3 series de …" multiplica lo que venga después. Se saca primero para
  //    que ese 3 no se confunda con un peso.
  let multiplier = 1;
  rest = rest.replace(
    new RegExp(`(\\d{1,2})\\s*(?:series?|sets?)\\b(?:\\s*(?:de|x))?`, "g"),
    (_m, n: string) => {
      const v = Number(n);
      if (v >= 1 && v <= 20) multiplier = v;
      return " ";
    },
  );

  const sets: ParsedSet[] = [];

  // 2. Pares peso × reps: "100x8", "60 kg por 10", "2 kg de 3 repes".
  const par = new RegExp(
    `(\\d+(?:[.,]\\d+)?)\\s*${UNIT}?\\s*${SEP}\\s*(\\d+)\\s*${REP_WORD}?`,
    "g",
  );
  rest = rest.replace(par, (m, w: string, r: string) => {
    const s = { weight: num(w), reps: num(r) };
    if (!sane(s)) return m;
    sets.push(s);
    return " ";
  });

  // 3. Sin pares: peso y reps sueltos, cada uno con su palabra.
  //    "sentadilla 100 kg 8 reps" o, sin peso, "dominadas 12 repes".
  if (!sets.length) {
    let weight: number | null = null;
    rest = rest.replace(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*${UNIT}\\b`, "g"), (m, w: string) => {
      if (weight !== null) return m;
      weight = num(w);
      return " ";
    });

    let reps: number | null = null;
    rest = rest.replace(new RegExp(`(\\d+)\\s*${REP_WORD}\\b`, "g"), (m, r: string) => {
      if (reps !== null) return m;
      reps = Number(r);
      return " ";
    });

    // Un peso sin repeticiones no es una serie: no se asume nada.
    if (reps !== null) {
      const s = { weight: weight ?? 0, reps };
      if (sane(s)) sets.push(s);
    }
  }

  if (!sets.length) return null;

  // 4. "3 series de 100x8" = la misma serie tres veces. Si el mensaje ya trae
  //    varias series cargadas a mano, el multiplicador no aplica.
  const finales = multiplier > 1 && sets.length === 1 ? Array.from({ length: multiplier }, () => sets[0]) : sets;

  return { exercise: cleanName(rest), sets: finales };
}
