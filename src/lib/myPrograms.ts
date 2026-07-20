/**
 * Programas PROPIOS del alumno (diseño propio o copiados de un template).
 * Conviven con los programas del coach, NO los reemplazan. Guardado LOCAL por
 * alumno (fuente de verdad para la UI, sin latencia) + respaldo best-effort en
 * Supabase, así no se pierden al reinstalar y el coach puede verlos. Sin IA.
 *
 * Los tipos ProgramExercise/ProgramDay/MyProgram son la fuente de verdad que
 * comparten el diseñador, los templates y el detalle de programa.
 */
import { pushMyProgram, deleteMyProgramRemote, fetchMyPrograms } from "@/lib/athleteSyncApi";

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
  /**
   * Semana del mesociclo a la que pertenece (1-based). Es lo que permite
   * progresión real: la semana 1 no se entrena con las mismas cargas que la 4.
   * Opcional a propósito: los programas viejos no la tienen y se consideran
   * todos de la semana 1, así nada se rompe al actualizar la app.
   */
  week?: number;
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
  /** Fecha en que el alumno lo dio por terminado (ISO). null = sigue disponible. */
  completedAt?: string | null;
}

/**
 * Estado de un programa, DERIVADO (no se guarda): "en curso" es el que está
 * activo como plan, "terminado" el que el alumno cerró, y "guardado" el resto.
 * Que sea derivado evita que el estado y el plan activo se contradigan.
 */
export type ProgramStatus = "en_curso" | "guardado" | "terminado";

export function programStatus(program: MyProgram, isActivePlan: boolean): ProgramStatus {
  if (program.completedAt) return "terminado";
  return isActivePlan ? "en_curso" : "guardado";
}

export const PROGRAM_STATUS_LABEL: Record<ProgramStatus, string> = {
  en_curso: "En curso",
  guardado: "Guardado",
  terminado: "Terminado",
};

/** Da el programa por terminado (queda archivado, no se borra). */
export function finishProgram(studentId: string, id: string): MyProgram | null {
  const program = getMyProgram(studentId, id);
  if (!program) return null;
  return saveMyProgram(studentId, { ...program, completedAt: new Date().toISOString() });
}

/** Lo vuelve a poner disponible (deshace "terminar"). */
export function reopenProgram(studentId: string, id: string): MyProgram | null {
  const program = getMyProgram(studentId, id);
  if (!program) return null;
  return saveMyProgram(studentId, { ...program, completedAt: null });
}

/**
 * Agrupa los días por semana, en orden. Los días sin `week` caen en la 1, que
 * es como se comportaban antes de que existieran las semanas.
 */
export function groupDaysByWeek(program: MyProgram): { week: number; days: ProgramDay[] }[] {
  const byWeek = new Map<number, ProgramDay[]>();
  for (const day of program.days) {
    const w = day.week && day.week > 0 ? day.week : 1;
    const list = byWeek.get(w);
    if (list) list.push(day);
    else byWeek.set(w, [day]);
  }
  return [...byWeek.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([week, days]) => ({ week, days }));
}

/** Cantidad de semanas que ocupa el diseño (no la duración declarada). */
export const programWeekCount = (program: MyProgram) =>
  program.days.reduce((max, d) => Math.max(max, d.week && d.week > 0 ? d.week : 1), 1);

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
  void pushMyProgram(studentId, program); // best-effort
  return program;
}

export function deleteMyProgram(studentId: string, id: string) {
  persist(
    studentId,
    loadMyPrograms(studentId).filter((p) => p.id !== id)
  );
  void deleteMyProgramRemote(studentId, id); // best-effort
}

/**
 * Trae de la nube los programas que no estén en este dispositivo y los guarda
 * en local. Gana SIEMPRE la versión local (es la que el alumno viene editando
 * acá); el remoto solo aporta los que faltan. Devuelve la lista ya mergeada, o
 * null si no hubo nada nuevo que traer. Best-effort: sin tabla/red, no hace nada.
 */
export async function hydrateMyPrograms(studentId: string): Promise<MyProgram[] | null> {
  const remote = await fetchMyPrograms(studentId);
  if (!remote.length) return null;
  const local = loadMyPrograms(studentId);
  const localIds = new Set(local.map((p) => p.id));
  const missing = remote.filter((p) => !localIds.has(p.id));
  if (!missing.length) return null;
  const merged = [...local, ...missing];
  persist(studentId, merged);
  return merged;
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
