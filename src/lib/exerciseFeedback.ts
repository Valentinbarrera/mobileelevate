/**
 * Feedback rápido al terminar CADA ejercicio. Es OPCIONAL.
 * Guardado LOCAL por alumno+fecha+ejercicio + push best-effort a Supabase para
 * que el COACH lo vea. Sin IA.
 *
 * Antes eran dos escalas de 1 a 5 (estímulo muscular / dolor articular): el
 * alumno tenía que traducir una sensación a dos números abstractos en medio de
 * la serie, y un "3" no quería decir lo mismo para dos personas. Ahora se
 * pregunta una sola cosa, en palabras, y se deja lugar para que lo cuente —
 * que es lo que el coach realmente lee.
 *
 * `stimulus` y `jointPain` quedan OPCIONALES a propósito: hay feedback viejo
 * guardado con esa forma y se sigue leyendo sin romper.
 */
import { pushExerciseFeedback } from "@/lib/athleteSyncApi";

export type ExerciseEffort = "liviano" | "intermedio" | "pesado";

export interface ExerciseFeedbackData {
  /** Cómo se sintió el ejercicio. */
  effort?: ExerciseEffort | null;
  /** Lo que el alumno quiera contar del ejercicio. */
  comment?: string | null;
  /** @deprecated escala vieja 1-5. Se lee, ya no se pide. */
  stimulus?: number;
  /** @deprecated escala vieja 1-5. Se lee, ya no se pide. */
  jointPain?: number;
}

export interface ExerciseFeedbackEntry extends ExerciseFeedbackData {
  date: string; // YYYY-MM-DD
  exerciseId: string;
  exerciseName: string;
}

const keyFor = (studentId: string) => `elevate_exfeedback_${studentId}`;

function read(studentId: string): ExerciseFeedbackEntry[] {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    return raw ? (JSON.parse(raw) as ExerciseFeedbackEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveExerciseFeedback(studentId: string, entry: ExerciseFeedbackEntry) {
  try {
    // reemplaza el feedback del mismo ejercicio en el mismo día
    const all = read(studentId).filter(
      (e) => !(e.date === entry.date && e.exerciseId === entry.exerciseId)
    );
    all.push(entry);
    localStorage.setItem(keyFor(studentId), JSON.stringify(all.slice(-500)));
  } catch {
    /* almacenamiento no disponible */
  }
  void pushExerciseFeedback(studentId, entry); // best-effort
}

export function getExerciseFeedback(
  studentId: string,
  date: string,
  exerciseId: string
): ExerciseFeedbackEntry | null {
  return read(studentId).find((e) => e.date === date && e.exerciseId === exerciseId) ?? null;
}
