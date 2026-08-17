/**
 * Intérprete del informe de antropometría en PDF que sube el alumno.
 *
 * No asume un formato fijo. `pdfText` reconstruye una grilla (filas × columnas)
 * a partir de las coordenadas del texto y acá la recorremos celda por celda
 * buscando etiquetas conocidas (ver `ANTHROPOMETRY_FIELDS`), tomando el valor
 * que está en la misma celda, a la derecha o justo abajo.
 *
 * Es el mismo motor de reconocimiento que la web del coach usa para los Excel,
 * así que ambos lados hablan el mismo vocabulario de variables.
 *
 * Lo que no reconoce NO rompe la importación: queda en `extra` y el alumno lo ve
 * (y lo corrige) en la pantalla de revisión.
 */
import {
  ANTHROPOMETRY_FIELDS,
  FIELDS_BY_ID,
  type AnthropometryField,
  type FieldGroup,
  type MeasurementValues,
} from "@/types/evaluation";
import { extractPdfGrids, type PdfPageGrid } from "@/lib/pdfText";

// =====================================================
// TIPOS
// =====================================================

export type Confidence = "high" | "medium" | "low";

export interface DetectedField {
  fieldId: string;
  value: number | string;
  /** Etiqueta tal cual aparece en el PDF. */
  rawLabel: string;
  page: number;
  confidence: Confidence;
  notes: string[];
}

export interface ParseIssue {
  fieldId?: string;
  level: "warning" | "info";
  message: string;
}

export interface ParseResult {
  /** Fecha de la evaluación, YYYY-MM-DD. */
  measurementDate: string;
  dateSource: "informe" | "nombre del archivo" | "hoy";
  values: MeasurementValues;
  detected: DetectedField[];
  /** Etiquetas numéricas que no pudimos mapear a una variable conocida. */
  extra: Record<string, number>;
  issues: ParseIssue[];
  fileName: string;
  pageCount: number;
}

// =====================================================
// NORMALIZACIÓN
// =====================================================

const UNIT_TOKENS = new Set([
  "kg", "kgs", "kilo", "kilos", "kilogramos",
  "cm", "cms", "centimetros",
  "mm", "milimetros",
  "g", "gr", "gramos",
  "m", "metros",
  "porcentaje", "anios", "anos", "years",
  "ud", "unidad", "valor", "resultado",
]);

/** minúsculas, sin acentos, sin puntuación, espacios colapsados. */
export function normalizeLabel(input: unknown): string {
  return String(input ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_/\\|]/g, " ")
    .replace(/[().,;:*"'\[\]#°]/g, " ")
    .replace(/[%]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Saca las unidades del principio y del final ("peso kg" -> "peso"). */
function stripUnitTokens(label: string): string {
  const words = label.split(" ").filter(Boolean);
  while (words.length > 1 && UNIT_TOKENS.has(words[words.length - 1])) words.pop();
  while (words.length > 1 && UNIT_TOKENS.has(words[0])) words.shift();
  return words.join(" ");
}

/** Unidad sugerida por la etiqueta ("pliegue tríceps (mm)" -> "mm"). */
function unitHintFromLabel(raw: string): string | null {
  const s = String(raw).toLowerCase();
  if (s.includes("%") || /\bporcentaje\b/.test(s)) return "%";
  if (/\bmm\b|milimetro/.test(s)) return "mm";
  if (/\bcm\b|centimetro/.test(s)) return "cm";
  if (/\bkg\b|kilogramo|\bkilos\b/.test(s)) return "kg";
  return null;
}

const ALIAS_INDEX: { alias: string; field: AnthropometryField }[] = ANTHROPOMETRY_FIELDS.flatMap(
  (field) => field.aliases.map((alias) => ({ alias: normalizeLabel(alias), field }))
).sort((a, b) => b.alias.length - a.alias.length);

/**
 * Encabezados de sección: dan contexto a etiquetas ambiguas ("muslo" es pliegue
 * Y perímetro en el proforma ISAK).
 *
 * Se buscan como PREFIJO, no como celda completa: en los informes reales el
 * rótulo de la sección es una etiqueta al margen izquierdo que, al reconstruir
 * la grilla, termina pegado al primer dato de su bloque
 * ("PERIMETROS (cm) Caderas (máxima)"). Exigir que estuviera solo en la fila
 * hacía que nunca se detectara.
 */
const SECTION_PREFIXES: { match: RegExp; group: FieldGroup }[] = [
  { match: /^pliegues( cutaneos| subcutaneos)?\b/, group: "skinfolds" },
  { match: /^perimetros?\b/, group: "circumferences" },
  { match: /^circunferencias?\b/, group: "circumferences" },
  { match: /^diametros?\b/, group: "breadths" },
  { match: /^composicion corporal\b/, group: "composition" },
  { match: /^fraccionamiento\b/, group: "composition" },
  { match: /^masas( corporales)?\b/, group: "composition" },
  { match: /^indices\b/, group: "indices" },
  { match: /^basicos\b/, group: "general" },
  { match: /^datos( generales| personales| basicos)?\b/, group: "general" },
];

const DATE_ALIASES = [
  "fecha",
  "fecha de medicion",
  "fecha medicion",
  "fecha de evaluacion",
  "fecha de valoracion",
  "fecha del estudio",
  "date",
  "measurement date",
].map(normalizeLabel);

// =====================================================
// NÚMEROS Y FECHAS
// =====================================================

/** Convierte a número tolerando coma decimal, unidades pegadas y espacios. */
export function parseNumericCell(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  let s = String(value).trim();
  if (!s) return null;

  s = s.replace(/[^0-9,.\-+]/g, "").trim();
  if (!s || s === "-" || s === "+") return null;

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    // "1.234,5" -> miles con punto ; "1,234.5" -> miles con coma
    s =
      s.lastIndexOf(",") > s.lastIndexOf(".")
        ? s.replace(/\./g, "").replace(",", ".")
        : s.replace(/,/g, "");
  } else if (hasComma) {
    s = s.replace(",", ".");
  }

  if (!/^[-+]?\d*\.?\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toISODate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const MONTHS: Record<string, number> = {
  ene: 0, enero: 0,
  feb: 1, febrero: 1,
  mar: 2, marzo: 2,
  abr: 3, abril: 3,
  may: 4, mayo: 4,
  jun: 5, junio: 5,
  jul: 6, julio: 6,
  ago: 7, agosto: 7,
  sep: 8, sept: 8, septiembre: 8,
  oct: 9, octubre: 9,
  nov: 10, noviembre: 10,
  dic: 11, diciembre: 11,
};

/** Fechas escritas a mano: dd/mm/yyyy, yyyy-mm-dd, "16 de agosto de 2026". */
export function parseDateString(input: unknown): Date | null {
  const s = String(input ?? "").trim();
  if (!s) return null;

  const iso = s.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const dmy = s.match(/(\d{1,2})[-/._](\d{1,2})[-/._](\d{2,4})/);
  if (dmy) {
    let year = Number(dmy[3]);
    if (year < 100) year += year > 50 ? 1900 : 2000;
    const d = new Date(year, Number(dmy[2]) - 1, Number(dmy[1]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // "16 de agosto de 2026" / "16 ago 2026"
  const textual = normalizeLabel(s).match(/(\d{1,2})\s*(?:de\s+)?([a-z]+)\.?\s*(?:de\s+)?(\d{4})/);
  if (textual) {
    const month = MONTHS[textual[2]];
    if (month !== undefined) {
      const d = new Date(Number(textual[3]), month, Number(textual[1]));
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }

  return null;
}

// =====================================================
// MOTOR DE RECONOCIMIENTO
// =====================================================

interface FieldMatch {
  field: AnthropometryField;
  score: number;
  exact: boolean;
  ambiguous: boolean;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Todas las variables que una etiqueta podría estar nombrando, de la más
 * probable a la menos. Gana el alias más largo; la sección del informe y la
 * unidad de la etiqueta desempatan.
 *
 * Devuelve la lista completa (no sólo la mejor) porque la desambiguación real
 * necesita el valor: ver `pickCandidate`.
 */
export function rankFields(rawLabel: string, section?: FieldGroup | null): FieldMatch[] {
  const normalized = stripUnitTokens(normalizeLabel(rawLabel));
  if (normalized.length < 2) return [];
  if (!hasLetters(normalized)) return [];

  const unitHint = unitHintFromLabel(rawLabel);
  const scored = new Map<string, FieldMatch>();

  for (const { alias, field } of ALIAS_INDEX) {
    if (!alias) continue;
    const exact = normalized === alias;
    // Coincidencia parcial sólo con palabras completas ("grasa" no matchea "grasas")
    const contained =
      !exact && new RegExp(`(^|\\s)${escapeRegExp(alias)}($|\\s)`).test(normalized);
    if (!exact && !contained) continue;

    let score = exact ? 1000 + alias.length : alias.length;
    if (section && field.group === section) score += 500;
    if (unitHint && field.unit === unitHint) score += 200;
    if (unitHint && field.unit && field.unit !== unitHint) score -= 200;

    const prev = scored.get(field.id);
    if (!prev || score > prev.score) {
      scored.set(field.id, { field, score, exact, ambiguous: false });
    }
  }

  const candidates = [...scored.values()].sort((a, b) => b.score - a.score);
  if (candidates.length > 1 && candidates[1].score === candidates[0].score) {
    candidates[0] = { ...candidates[0], ambiguous: true };
  }
  return candidates;
}

/** La mejor interpretación de una etiqueta, sin mirar el valor. */
export function matchField(rawLabel: string, section?: FieldGroup | null): FieldMatch | null {
  return rankFields(rawLabel, section)[0] ?? null;
}

const inRange = (field: AnthropometryField, value: number | string): boolean => {
  if (typeof value !== "number") return true;
  if (field.min !== undefined && value < field.min) return false;
  if (field.max !== undefined && value > field.max) return false;
  return true;
};

/**
 * Elige, entre los candidatos, cuál se queda con este valor.
 *
 * Dos reglas que salieron de informes reales:
 *  - **Descarte por rango**: "Tórax Transverso 24,2" contiene la palabra
 *    "tórax", pero 24 cm es imposible para un perímetro de tórax. Una
 *    coincidencia PARCIAL cuyo valor no entra en el rango se descarta; una
 *    coincidencia exacta se acepta igual (y después la validación avisa).
 *  - **Paso al siguiente candidato**: en el proforma ISAK "Muslo (medial)"
 *    aparece dos veces, primero como perímetro y después como pliegue. Cuando
 *    la mejor interpretación ya fue tomada por una fila anterior, el valor pasa
 *    a la siguiente en vez de perderse.
 */
function pickCandidate(
  candidates: FieldMatch[],
  value: number | string,
  taken: Set<string>
): FieldMatch | null {
  for (const candidate of candidates) {
    if (taken.has(candidate.field.id)) continue;
    if (!candidate.exact && !inRange(candidate.field, value)) continue;
    return candidate;
  }
  return null;
}

const isEmpty = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

/**
 * ¿La celda ES un número, o es texto que casualmente tiene dígitos?
 *
 * `parseNumericCell` es deliberadamente tolerante (le saca las unidades pegadas),
 * y eso lo hace peligroso como detector: "Teléfono: 2214955747" le devuelve un
 * número perfectamente válido. En un informe real eso hizo que el gasto
 * energético se llenara con el teléfono del antropometrista. Para decidir si una
 * celda es el VALOR de una etiqueta exigimos que no tenga palabras.
 */
function looksLikeNumber(cell: string): boolean {
  return /^[+-]?[\d.,]+\s*(%|kg|kgs|cm|cms|mm|m|kcal|años|anos|kg\/m2?)?\.?$/i.test(cell.trim());
}

/** Una etiqueta tiene que tener letras: "56 50" no nombra ninguna variable. */
const hasLetters = (normalized: string) => /[a-z]/.test(normalized);

function isUnitOnly(v: unknown): boolean {
  const n = normalizeLabel(v);
  return n.length > 0 && n.split(" ").every((w) => UNIT_TOKENS.has(w));
}

/**
 * En un PDF es habitual que etiqueta y valor terminen en la MISMA celda
 * ("Peso: 78,2 kg"). Separa la parte de texto del número final.
 */
function splitLabelAndValue(cell: string): { label: string; value: number } | null {
  const match = cell.match(/^(.*?[a-záéíóúñ%)])[\s:.…]*(-?\d+(?:[.,]\d+)?)\s*(kg|kgs|cm|mm|%|años|anos)?\.?$/i);
  if (!match) return null;
  const value = parseNumericCell(match[2]);
  if (value === null) return null;
  const label = match[1].trim();
  if (normalizeLabel(label).length < 2) return null;
  // La unidad pegada al número también sirve de pista para desambiguar.
  return { label: match[3] ? `${label} ${match[3]}` : label, value };
}

interface ValueHit {
  value: number | string;
  direction: "misma celda" | "derecha" | "abajo";
}

/**
 * Busca el valor de una etiqueta: primero a la derecha en la misma fila, después
 * justo abajo en la misma columna.
 *
 * Hacia la derecha recorre TODA la fila salteando celdas vacías, porque una
 * grilla reconstruida desde un PDF tiene columnas fantasma: en el informe real
 * el metabolismo basal está doce columnas a la derecha de su etiqueta. Corta en
 * cuanto aparece texto que no es un número, así no se roba el valor de otra
 * variable. Para etiquetas DESCONOCIDAS el alcance se limita (`maxRight`), que
 * si no se llena de ruido.
 */
function findValueFor(
  grid: string[][],
  row: number,
  col: number,
  field: AnthropometryField,
  maxRight = Infinity
): ValueHit | null {
  const wantsText = field.type === "text";

  const read = (r: number, c: number, direction: "derecha" | "abajo"): ValueHit | null | "skip" => {
    const raw = grid[r]?.[c];
    if (isEmpty(raw)) return "skip";
    if (isUnitOnly(raw)) return "skip";

    if (looksLikeNumber(raw)) {
      const num = parseNumericCell(raw);
      if (num !== null) return wantsText ? null : { value: num, direction };
    }
    if (wantsText) return { value: String(raw).trim(), direction };
    return null; // texto que no es valor: cortamos la búsqueda en esa dirección
  };

  const lastCol = Math.min(grid[row]?.length ?? 0, col + maxRight + 1);
  for (let c = col + 1; c < lastCol; c++) {
    const hit = read(row, c, "derecha");
    if (hit === "skip") continue;
    if (hit) return hit;
    break;
  }

  for (let dr = 1; dr <= 2; dr++) {
    const hit = read(row + dr, col, "abajo");
    if (hit === "skip") continue;
    if (hit) return hit;
    break;
  }

  return null;
}

/**
 * La sección a la que pertenece una celda que arranca con un rótulo de sección.
 * `only` indica que la celda es SÓLO el rótulo (no hay que interpretarla además
 * como etiqueta de una variable).
 */
function detectSection(cell: string): { group: FieldGroup; only: boolean } | null {
  const n = normalizeLabel(cell);
  if (!n) return null;
  for (const { match, group } of SECTION_PREFIXES) {
    const found = n.match(match);
    if (found) return { group, only: found[0].length === n.length };
  }
  return null;
}

/**
 * En las tablas de fraccionamiento cada masa trae los kg y, más a la derecha,
 * su porcentaje sobre el total. Ese porcentaje es un dato propio, así que se
 * rescata en vez de descartarlo.
 */
const PERCENTAGE_TWIN: Record<string, string> = {
  fat_mass: "body_fat_percentage",
  muscle_mass: "muscle_percentage",
};

function findPercentageInRow(row: string[], fromCol: number): number | null {
  for (let c = fromCol + 1; c < row.length; c++) {
    const cell = row[c];
    if (isEmpty(cell) || !cell.includes("%") || !looksLikeNumber(cell)) continue;
    const value = parseNumericCell(cell);
    if (value !== null && value > 0 && value < 100) return value;
  }
  return null;
}

function findDateNear(grid: string[][], row: number, col: number): Date | null {
  const candidates: string[] = [];
  for (let dc = 0; dc <= 4; dc++) candidates.push(grid[row]?.[col + dc] ?? "");
  for (let dr = 1; dr <= 2; dr++) candidates.push(grid[row + dr]?.[col] ?? "");

  for (const raw of candidates) {
    if (isEmpty(raw)) continue;
    const parsed = parseDateString(raw);
    if (parsed) return parsed;
  }
  return null;
}

// =====================================================
// PARSER PRINCIPAL
// =====================================================

const MAX_EXTRA_FIELDS = 80;

/** Ajustes de unidades que el informe suele traer distinto de lo que guardamos. */
function normalizeValue(
  field: AnthropometryField,
  value: number | string
): { value: number | string; notes: string[] } {
  const notes: string[] = [];
  let out = value;

  // Porcentajes guardados como fracción (0.198 -> 19.8)
  if (field.unit === "%" && typeof out === "number" && out > 0 && out <= 1) {
    out = Number((out * 100).toFixed(2));
    notes.push("El informe traía el porcentaje como fracción, se convirtió a %.");
  }

  // Alturas en metros (1.768 -> 176.8)
  if (field.id === "height" && typeof out === "number" && out > 0 && out < 3) {
    out = Number((out * 100).toFixed(1));
    notes.push("La altura venía en metros, se convirtió a cm.");
  }

  return { value: out, notes };
}

/**
 * Recorre las grillas ya extraídas del PDF. Separado de la lectura del archivo
 * para poder testearlo sin depender de pdf.js.
 */
export function parseAnthropometryGrids(
  pages: PdfPageGrid[],
  options: { fileName: string; pageCount?: number; today?: Date } = { fileName: "" }
): ParseResult {
  const values: MeasurementValues = {};
  const detected: DetectedField[] = [];
  const extra: Record<string, number> = {};
  const issues: ParseIssue[] = [];
  const seen = new Set<string>();
  let dateFromFile: Date | null = null;

  /** Registra una variable reconocida (y su porcentaje gemelo, si lo hay). */
  const record = (
    match: FieldMatch,
    rawValue: number | string,
    rawLabel: string,
    page: number,
    extraNotes: string[] = [],
    lowConfidence = false
  ) => {
    const { value, notes } = normalizeValue(match.field, rawValue);
    notes.push(...extraNotes);

    let confidence: Confidence = match.exact ? "high" : "medium";
    if (match.ambiguous) {
      confidence = "low";
      notes.push("La etiqueta podía corresponder a más de una variable. Revisalo.");
    }
    if (lowConfidence) confidence = "low";

    seen.add(match.field.id);
    values[match.field.id] = value;
    detected.push({ fieldId: match.field.id, value, rawLabel, page, confidence, notes });
  };

  const addExtra = (label: string, value: number) => {
    if (Object.keys(extra).length >= MAX_EXTRA_FIELDS) return;
    // Ninguna variable antropométrica llega a 10.000: lo que pasa de ahí es un
    // teléfono, un año o un número de documento que se coló.
    if (!Number.isFinite(value) || Math.abs(value) >= 10_000) return;
    const key = normalizeLabel(label).replace(/\s+/g, "_").slice(0, 60);
    if (key.length >= 3 && hasLetters(key) && !(key in extra)) extra[key] = value;
  };

  for (const { page, rows: grid } of pages) {
    let section: FieldGroup | null = null;

    for (let r = 0; r < grid.length; r++) {
      const row = grid[r] ?? [];

      for (let c = 0; c < row.length; c++) {
        const cell = row[c];
        if (isEmpty(cell)) continue;

        // --- Rótulo de sección (puede venir pegado al primer dato del bloque) ---
        const sectionHere = detectSection(cell);
        if (sectionHere) {
          section = sectionHere.group;
          if (sectionHere.only) continue;
        }

        const normalized = stripUnitTokens(normalizeLabel(cell));

        // --- Fecha de la evaluación ---
        if (!dateFromFile && DATE_ALIASES.includes(normalized)) {
          dateFromFile = findDateNear(grid, r, c);
          if (dateFromFile) continue;
        }
        if (!dateFromFile && /^fecha\b/.test(normalized)) {
          const fromCell = parseDateString(cell);
          if (fromCell) {
            dateFromFile = fromCell;
            continue;
          }
        }

        // --- Etiqueta y valor en la misma celda ("Peso: 78,2 kg") ---
        const inline = splitLabelAndValue(String(cell));
        if (inline) {
          const candidates = rankFields(inline.label, section);
          const chosen = pickCandidate(candidates, inline.value, seen);
          if (chosen) record(chosen, inline.value, inline.label, page);
          else if (!candidates.length) addExtra(inline.label, inline.value);
          continue;
        }

        const candidates = rankFields(String(cell), section);

        if (!candidates.length) {
          // Etiqueta desconocida con un número cerca -> extra_data.
          // Alcance corto a propósito: no queremos ruido de páginas de texto.
          if (normalized.length >= 3 && Object.keys(extra).length < MAX_EXTRA_FIELDS) {
            const anyField: AnthropometryField = {
              id: "",
              label: "",
              group: "general",
              unit: null,
              aliases: [],
            };
            const hit = findValueFor(grid, r, c, anyField, 4);
            if (hit && typeof hit.value === "number") addExtra(normalized, hit.value);
          }
          continue;
        }

        const hit = findValueFor(grid, r, c, candidates[0].field);
        if (!hit) continue;

        const chosen = pickCandidate(candidates, hit.value, seen);
        if (!chosen) continue;

        record(
          chosen,
          hit.value,
          String(cell).trim(),
          page,
          [],
          hit.direction === "abajo" && !chosen.exact
        );

        // El porcentaje que acompaña a la masa, unas columnas más a la derecha.
        const twin = PERCENTAGE_TWIN[chosen.field.id];
        if (twin && !seen.has(twin)) {
          const pct = findPercentageInRow(row, c);
          if (pct !== null) {
            seen.add(twin);
            values[twin] = pct;
            detected.push({
              fieldId: twin,
              value: pct,
              rawLabel: `${String(cell).trim()} (%)`,
              page,
              confidence: "medium",
              notes: ["Tomado de la columna de porcentaje de esa fila."],
            });
          }
        }
      }
    }
  }

  // --- Fecha: del informe, del nombre del archivo, o hoy ---
  const today = options.today ?? new Date();
  let measurementDate: string;
  let dateSource: ParseResult["dateSource"];

  if (dateFromFile) {
    measurementDate = toISODate(dateFromFile);
    dateSource = "informe";
  } else {
    const fromName = parseDateString(options.fileName.replace(/\.[a-z]+$/i, ""));
    if (fromName) {
      measurementDate = toISODate(fromName);
      dateSource = "nombre del archivo";
    } else {
      measurementDate = toISODate(today);
      dateSource = "hoy";
      issues.push({
        level: "warning",
        message: "No encontramos la fecha en el informe. Se usó la de hoy: revisala.",
      });
    }
  }

  if (!detected.length) {
    issues.push({
      level: "warning",
      message:
        "No reconocimos ninguna variable en el PDF. Podés cargar los datos a mano en el paso siguiente.",
    });
  }

  return {
    measurementDate,
    dateSource,
    values,
    detected,
    extra,
    issues,
    fileName: options.fileName,
    pageCount: options.pageCount ?? pages.length,
  };
}

export const ACCEPTED_EXTENSIONS = [".pdf"] as const;

export const MAX_FILE_BYTES = 20 * 1024 * 1024;

export function hasAcceptedExtension(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(".pdf");
}

/** Etapas del procesamiento, para que la pantalla muestre en qué anda. */
export type ParseStep = "received" | "reading" | "interpreting" | "finishing";

/** Lee el PDF del alumno y devuelve lo interpretado. Lanza Error en español. */
export async function parseAnthropometryPdf(
  file: File,
  onStep?: (step: ParseStep) => void
): Promise<ParseResult> {
  if (!hasAcceptedExtension(file.name)) {
    throw new Error("Formato no soportado. Subí el informe en PDF.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("El archivo pesa más de 20 MB. Probá con una versión más liviana.");
  }

  onStep?.("received");
  onStep?.("reading");
  const { pages, pageCount } = await extractPdfGrids(file);
  onStep?.("interpreting");

  if (pages.every((p) => p.rows.length === 0)) {
    throw new Error(
      "El PDF no tiene texto legible (parece un escaneo o una foto). Pedile a tu evaluador el informe original."
    );
  }

  const result = parseAnthropometryGrids(pages, { fileName: file.name, pageCount });
  onStep?.("finishing");
  return result;
}

// =====================================================
// VALIDACIONES Y DERIVADOS
// =====================================================

export interface ValidationIssue {
  fieldId: string;
  level: "warning" | "info";
  message: string;
}

/** Rangos razonables + coherencia interna. Nunca bloquea el guardado. */
export function validateMeasurement(values: MeasurementValues): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const [fieldId, value] of Object.entries(values)) {
    const field = FIELDS_BY_ID[fieldId];
    if (!field || typeof value !== "number") continue;
    const unit = field.unit && field.unit !== "años" ? ` ${field.unit}` : "";
    if (field.min !== undefined && value < field.min) {
      issues.push({
        fieldId,
        level: "warning",
        message: `${field.label}: ${value} parece bajo (esperado ${field.min}–${field.max}${unit}).`,
      });
    } else if (field.max !== undefined && value > field.max) {
      issues.push({
        fieldId,
        level: "warning",
        message: `${field.label}: ${value} parece alto (esperado ${field.min}–${field.max}${unit}).`,
      });
    }
  }

  const num = (id: string) => (typeof values[id] === "number" ? (values[id] as number) : null);

  // Suma de masas vs peso
  const parts = ["muscle_mass", "fat_mass", "bone_mass", "residual_mass", "skin_mass"].map(num);
  const weight = num("weight");
  if (weight && parts.every((p) => p !== null)) {
    const sum = (parts as number[]).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - weight) > 2) {
      issues.push({
        fieldId: "weight",
        level: "warning",
        message: `La suma de las masas (${sum.toFixed(1)} kg) no coincide con el peso (${weight.toFixed(1)} kg).`,
      });
    }
  }

  // % de grasa vs masa adiposa
  const fat = num("fat_mass");
  const fatPct = num("body_fat_percentage");
  if (weight && fat && fatPct) {
    const expected = (weight * fatPct) / 100;
    if (Math.abs(expected - fat) > 2) {
      issues.push({
        fieldId: "body_fat_percentage",
        level: "warning",
        message: `El % de grasa (${fatPct}%) no coincide con la masa adiposa (${fat} kg).`,
      });
    }
  }

  return issues;
}

export interface DerivedField {
  fieldId: string;
  value: number;
  from: string;
}

/** Lo que se puede deducir de lo que sí trajo el informe. */
export function deriveMissingFields(values: MeasurementValues): DerivedField[] {
  const derived: DerivedField[] = [];
  const num = (id: string) => (typeof values[id] === "number" ? (values[id] as number) : null);

  const weight = num("weight");
  const height = num("height");
  const fatPct = num("body_fat_percentage");
  const fatMass = num("fat_mass");

  if (num("bmi") === null && weight && height && height > 0) {
    const m = height / 100;
    derived.push({
      fieldId: "bmi",
      value: Number((weight / (m * m)).toFixed(2)),
      from: "peso y altura",
    });
  }

  if (fatPct === null && weight && fatMass && weight > 0) {
    derived.push({
      fieldId: "body_fat_percentage",
      value: Number(((fatMass / weight) * 100).toFixed(1)),
      from: "masa adiposa y peso",
    });
  }

  if (fatMass === null && weight && fatPct) {
    derived.push({
      fieldId: "fat_mass",
      value: Number(((weight * fatPct) / 100).toFixed(1)),
      from: "% de grasa y peso",
    });
  }

  return derived;
}
