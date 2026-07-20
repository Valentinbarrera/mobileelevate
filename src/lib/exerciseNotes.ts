/**
 * Notas del ALUMNO por ejercicio (además de la nota del coach). Sirven para
 * anotar técnica, ajustes de máquina, sensaciones. Se pueden "fijar en todas las
 * semanas" (persisten siempre) o dejar solo para hoy. Local por alumno, sin IA,
 * con respaldo best-effort en Supabase (para no perderlas al reinstalar).
 */
import {
  pushExerciseNote,
  deleteExerciseNoteRemote,
  fetchExerciseNotes,
} from "@/lib/athleteSyncApi";
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
  const cleared = !note.text.trim();
  try {
    const all = readAll(studentId);
    if (cleared) delete all[exerciseId];
    else all[exerciseId] = note;
    localStorage.setItem(keyFor(studentId), JSON.stringify(all));
  } catch {
    /* almacenamiento no disponible */
  }
  // best-effort: borrar la nota vacía en vez de guardar una fila en blanco
  void (cleared
    ? deleteExerciseNoteRemote(studentId, exerciseId)
    : pushExerciseNote(studentId, exerciseId, note));
}

/**
 * Trae las notas guardadas en la nube y las mergea en local (gana la local, que
 * es la que el alumno acaba de editar en este dispositivo). Best-effort: si no
 * hay tabla/red no hace nada. Llamar al abrir la sesión de entrenamiento.
 */
export async function hydrateExerciseNotes(studentId: string): Promise<void> {
  const remote = await fetchExerciseNotes(studentId);
  if (!Object.keys(remote).length) return;
  try {
    const local = readAll(studentId);
    localStorage.setItem(keyFor(studentId), JSON.stringify({ ...remote, ...local }));
  } catch {
    /* almacenamiento no disponible */
  }
}
