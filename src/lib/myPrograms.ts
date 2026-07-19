/**
 * Programas PROPIOS del alumno (diseño propio o copiados de un template).
 * Conviven con los programas del coach, NO los reemplazan. Guardado LOCAL por
 * alumno (mismo patrón local-first del resto). Sin IA. Sync a Supabase = futuro.
 *
 * Los tipos ProgramExercise/ProgramDay/MyProgram son la fuente de verdad que
 * comparten el diseñador, los templates y el detalle de programa.
 */

export interface ProgramExercise {
  name: string;
  sets: number;
  reps: string; // rango libre, ej "8-12"
  restSeconds: number;
  rir?: number | null;
  muscleGroup?: string | null;
  exerciseId?: string | null; // id de la biblioteca si se enlazó
}

export interface ProgramDay {
  id: string;
  name: string; // ej "Full Body A" · "Torso" · "Empuje"
  exercises: ProgramExercise[];
}

export interface MyProgram {
  id: string;
  name: string;
  description?: string;
  level?: string; // principiante · intermedio · avanzado
  weeks?: number; // duración del mesociclo (semanas)
  daysPerWeek?: number;
  days: ProgramDay[];
  origin: "propio" | "template";
  templateId?: string; // de qué template salió (si aplica)
  splitId?: string; // split elegido en el wizard (si aplica)
  createdAt: string; // ISO
}

const keyFor = (studentId: string) => `elevate_myprograms_${studentId}`;

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

export function loadMyPrograms(studentId: string): MyProgram[] {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    return raw ? (JSON.parse(raw) as MyProgram[]) : [];
  } catch {
    return [];
  }
}

function persist(studentId: string, all: MyProgram[]) {
  try {
    localStorage.setItem(keyFor(studentId), JSON.stringify(all.slice(-100)));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function getMyProgram(studentId: string, id: string): MyProgram | null {
  return loadMyPrograms(studentId).find((p) => p.id === id) ?? null;
}

/** Crea o actualiza un programa (por id). Devuelve el programa guardado. */
export function saveMyProgram(studentId: string, program: MyProgram): MyProgram {
  const all = loadMyPrograms(studentId).filter((p) => p.id !== program.id);
  all.push(program);
  persist(studentId, all);
  return program;
}

export function deleteMyProgram(studentId: string, id: string) {
  persist(
    studentId,
    loadMyPrograms(studentId).filter((p) => p.id !== id)
  );
}

/** Crea un programa propio vacío listo para editar. */
export function emptyProgram(): MyProgram {
  return {
    id: newId(),
    name: "",
    days: [{ id: newId(), name: "Día 1", exercises: [] }],
    origin: "propio",
    createdAt: new Date().toISOString(),
  };
}
