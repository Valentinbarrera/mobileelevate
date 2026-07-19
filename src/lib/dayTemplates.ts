/**
 * Plantillas de DÍA reutilizables del alumno (ej: "Empuje pesado", "Glúteo A").
 * Guardado LOCAL por alumno, mismo patrón que myPrograms. Permite guardar los
 * ejercicios de un día y reusarlos en otro programa o día.
 */
import { newId, type ProgramExercise } from "@/lib/myPrograms";

export interface DayTemplate {
  id: string;
  name: string;
  exercises: ProgramExercise[];
  createdAt: string; // ISO
}

const keyFor = (studentId: string) => `elevate_day_templates_${studentId}`;

export function loadDayTemplates(studentId: string): DayTemplate[] {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    return raw ? (JSON.parse(raw) as DayTemplate[]) : [];
  } catch {
    return [];
  }
}

function persist(studentId: string, all: DayTemplate[]) {
  try {
    localStorage.setItem(keyFor(studentId), JSON.stringify(all.slice(-50)));
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Guarda (o reemplaza por nombre) una plantilla de día. Devuelve la lista nueva. */
export function saveDayTemplate(
  studentId: string,
  name: string,
  exercises: ProgramExercise[]
): DayTemplate[] {
  const clean = name.trim() || "Día sin nombre";
  const all = loadDayTemplates(studentId).filter((t) => t.name.toLowerCase() !== clean.toLowerCase());
  all.push({
    id: newId(),
    name: clean,
    exercises: exercises.map((e) => ({ ...e })),
    createdAt: new Date().toISOString(),
  });
  persist(studentId, all);
  return all;
}

export function deleteDayTemplate(studentId: string, id: string): DayTemplate[] {
  const all = loadDayTemplates(studentId).filter((t) => t.id !== id);
  persist(studentId, all);
  return all;
}
