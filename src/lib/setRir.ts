/**
 * RIR (reps in reserve) del ALUMNO por serie. El alumno anota, al lado de las
 * reps, cuántas repeticiones sintió que le quedaban en el tanque (entero 0–5).
 * Es opcional (puede quedar vacío) y se guarda LOCAL por alumno, sin IA y sin
 * tocar Supabase. Clave por ejercicio + fecha + número de serie.
 */
const keyFor = (studentId: string) => `elevate_setrir_${studentId}`;

// key: `${exerciseId}|${date}|${setNumber}`
type RirMap = Record<string, number>;

const cellKey = (exerciseId: string, date: string, setNumber: number) =>
  `${exerciseId}|${date}|${setNumber}`;

function readAll(studentId: string): RirMap {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    return raw ? (JSON.parse(raw) as RirMap) : {};
  } catch {
    return {};
  }
}

/** Devuelve el RIR guardado para esa serie, o null si no hay. */
export function getSetRir(
  studentId: string,
  exerciseId: string,
  date: string,
  setNumber: number
): number | null {
  const v = readAll(studentId)[cellKey(exerciseId, date, setNumber)];
  return typeof v === "number" ? v : null;
}

/**
 * Guarda (o borra) el RIR de una serie. Si `rir` es null o NaN, borra la key;
 * si no, la setea. Persiste con JSON.stringify.
 */
export function saveSetRir(
  studentId: string,
  exerciseId: string,
  date: string,
  setNumber: number,
  rir: number | null
): void {
  try {
    const all = readAll(studentId);
    const key = cellKey(exerciseId, date, setNumber);
    if (rir == null || Number.isNaN(rir)) delete all[key];
    else all[key] = rir;
    localStorage.setItem(keyFor(studentId), JSON.stringify(all));
  } catch {
    /* almacenamiento no disponible */
  }
}
