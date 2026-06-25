/**
 * Lista LOCAL de ejercicios usados en entrenos libres, para ofrecerlos como
 * "recientes" y que el alumno los re-agregue de un toque.
 */
const keyFor = (studentId: string) => `elevate_free_ex_${studentId}`;

export function getRecentFreeExercises(studentId: string): string[] {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function recordFreeExercise(studentId: string, name: string) {
  const n = name.trim();
  if (!n) return;
  try {
    const cur = getRecentFreeExercises(studentId).filter((x) => x.toLowerCase() !== n.toLowerCase());
    localStorage.setItem(keyFor(studentId), JSON.stringify([n, ...cur].slice(0, 12)));
  } catch {
    /* almacenamiento no disponible */
  }
}
