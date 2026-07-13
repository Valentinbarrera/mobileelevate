/**
 * Notas del ALUMNO por ejercicio (además de la nota del coach). Sirven para
 * anotar técnica, ajustes de máquina, sensaciones. Se pueden "fijar en todas las
 * semanas" (persisten siempre) o dejar solo para hoy. Local por alumno, sin IA.
 */
export interface ExerciseNote {
  text: string;
  pinned: boolean; // fijada en todas las semanas
  date: string; // YYYY-MM-DD de la última edición
}

const keyFor = (studentId: string) => `elevate_exnotes_${studentId}`;

function readAll(studentId: string): Record<string, ExerciseNote> {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    return raw ? (JSON.parse(raw) as Record<string, ExerciseNote>) : {};
  } catch {
    return {};
  }
}

/** Devuelve la nota si está fijada, o si es de hoy; si no, null. */
export function getExerciseNote(
  studentId: string,
  exerciseId: string,
  today: string
): ExerciseNote | null {
  const n = readAll(studentId)[exerciseId];
  if (!n) return null;
  return n.pinned || n.date === today ? n : null;
}

export function saveExerciseNote(studentId: string, exerciseId: string, note: ExerciseNote) {
  try {
    const all = readAll(studentId);
    if (!note.text.trim()) delete all[exerciseId];
    else all[exerciseId] = note;
    localStorage.setItem(keyFor(studentId), JSON.stringify(all));
  } catch {
    /* almacenamiento no disponible */
  }
}
