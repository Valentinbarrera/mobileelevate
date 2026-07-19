/**
 * Grupos musculares para el selector de ejercicios del wizard.
 * Cada uno trae una "ilustración" liviana (emoji + color de marca) y una lista
 * de sinónimos (`match`) para filtrar la biblioteca de ejercicios, que puede
 * usar términos en español o inglés según el ejercicio.
 */
export interface MuscleGroup {
  id: string;
  label: string;
  emoji: string;
  /** color de acento del tile (HSL) */
  hue: string;
  /** términos que, si aparecen en el `muscle` del ejercicio, lo asignan a este grupo */
  match: string[];
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  { id: "pecho", label: "Pecho", emoji: "🫀", hue: "0 84% 60%", match: ["pecho", "pectoral", "chest"] },
  { id: "espalda", label: "Espalda", emoji: "🔙", hue: "217 91% 60%", match: ["espalda", "dorsal", "back", "lat", "trapecio", "trap"] },
  { id: "hombros", label: "Hombros", emoji: "🏔️", hue: "43 96% 56%", match: ["hombro", "deltoide", "shoulder", "delt"] },
  { id: "biceps", label: "Bíceps", emoji: "💪", hue: "142 71% 45%", match: ["biceps", "bíceps", "brazo", "arm", "curl"] },
  { id: "triceps", label: "Tríceps", emoji: "🦾", hue: "168 76% 42%", match: ["triceps", "tríceps", "arm"] },
  { id: "cuadriceps", label: "Cuádriceps", emoji: "🦵", hue: "24 95% 53%", match: ["cuadriceps", "cuádriceps", "quad", "pierna", "leg"] },
  { id: "isquios", label: "Isquios", emoji: "🦿", hue: "271 76% 63%", match: ["isquio", "femoral", "hamstring", "posterior"] },
  { id: "gluteos", label: "Glúteos", emoji: "🍑", hue: "330 81% 60%", match: ["gluteo", "glúteo", "glute"] },
  { id: "gemelos", label: "Gemelos", emoji: "🐆", hue: "188 94% 43%", match: ["gemelo", "pantorrilla", "calf", "soleo"] },
  { id: "abdomen", label: "Abdomen", emoji: "🎯", hue: "48 96% 53%", match: ["abdomen", "abdominal", "core", "abs", "oblicuo"] },
  { id: "antebrazo", label: "Antebrazo", emoji: "✊", hue: "20 90% 48%", match: ["antebrazo", "forearm", "grip"] },
  { id: "cardio", label: "Cardio", emoji: "❤️", hue: "0 72% 51%", match: ["cardio", "hiit", "aerobic", "conditioning"] },
];

export const muscleById = (id: string): MuscleGroup | undefined =>
  MUSCLE_GROUPS.find((m) => m.id === id);

/** ¿El `muscle` de un ejercicio cae en este grupo? (case-insensitive, por sinónimos) */
export function exerciseMatchesGroup(exerciseMuscle: string | null | undefined, group: MuscleGroup): boolean {
  if (!exerciseMuscle) return false;
  const m = exerciseMuscle.toLowerCase();
  return group.match.some((kw) => m.includes(kw));
}
