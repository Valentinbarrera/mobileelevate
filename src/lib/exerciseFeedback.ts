/**
 * Feedback rápido al terminar CADA ejercicio: estímulo muscular (1-5) y dolor
 * articular (1-5). Ayuda al alumno (y al coach) a afinar el plan. Es OPCIONAL.
 * Guardado LOCAL por alumno+fecha+ejercicio. Sin IA. Sync al coach = futuro.
 */
export interface ExerciseFeedbackData {
  stimulus: number; // 1-5 estímulo/sensación muscular (5 = mucho estímulo)
  jointPain: number; // 1-5 dolor articular (1 = nada, 5 = mucho)
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
}

export function getExerciseFeedback(
  studentId: string,
  date: string,
  exerciseId: string
): ExerciseFeedbackEntry | null {
  return read(studentId).find((e) => e.date === date && e.exerciseId === exerciseId) ?? null;
}
