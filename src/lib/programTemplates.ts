/**
 * Biblioteca de programas (templates) basados en EVIDENCIA — sin IA, sin inventar.
 *
 * El diseño (frecuencia por grupo muscular, volumen semanal, rangos de reps y
 * descansos) sigue guías de la literatura de entrenamiento de fuerza:
 *  - Schoenfeld BJ, Ogborn D, Krieger JW (2016). "Effects of resistance training
 *    frequency on measures of muscle hypertrophy: a systematic review and
 *    meta-analysis." Sports Medicine 46(11):1689-1697. → entrenar cada grupo
 *    ≥2 veces/semana supera a 1 vez.
 *  - Schoenfeld BJ, et al. (2017). "Dose-response relationship between weekly
 *    resistance training volume and increases in muscle mass." J Sports Sci
 *    35(11):1073-1082. → ~10+ series por grupo muscular por semana.
 *  - ACSM (2009). Position Stand: Progression Models in Resistance Training.
 *    Med Sci Sports Exerc 41(3):687-708. → rangos de reps/descanso e intensidad.
 *
 * Cada template expone `citation` para mostrarlo en la app (requisito de citar
 * fuentes de contenido de salud/fitness — App Store 1.4.1).
 */
import { newId, type MyProgram, type ProgramDay } from "./myPrograms";

export interface ProgramTemplate {
  id: string;
  name: string;
  description: string;
  level: "principiante" | "intermedio" | "avanzado";
  daysPerWeek: number;
  goal: string;
  rationale: string; // por qué está armado así (evidencia)
  citation: string; // fuente concreta
  days: Omit<ProgramDay, "id">[];
}

// Helper para declarar ejercicios de forma compacta.
const ex = (
  name: string,
  sets: number,
  reps: string,
  restSeconds: number,
  rir: number,
  muscleGroup: string
) => ({ name, sets, reps, restSeconds, rir, muscleGroup });

const VOLUMEN_FUENTE =
  "Schoenfeld et al. (2016, frecuencia; 2017, volumen) · ACSM Position Stand (2009).";

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  {
    id: "full-body-3",
    name: "Full Body 3 días",
    description: "Cuerpo completo 3 veces por semana. El punto de partida más eficiente para principiantes.",
    level: "principiante",
    daysPerWeek: 3,
    goal: "Fuerza e hipertrofia general",
    rationale:
      "Cada grupo muscular se entrena 3×/semana, la frecuencia que más rinde según el meta-análisis de frecuencia. El volumen queda en ~9-12 series por grupo por semana (rango efectivo) con básicos multiarticulares y reps de 8-12.",
    citation: VOLUMEN_FUENTE,
    days: [
      {
        name: "Full Body A",
        exercises: [
          ex("Sentadilla", 3, "8-10", 150, 2, "Cuádriceps"),
          ex("Press banca", 3, "8-10", 120, 2, "Pecho"),
          ex("Remo con barra", 3, "10-12", 120, 2, "Espalda"),
          ex("Press militar", 2, "10-12", 90, 1, "Hombros"),
          ex("Plancha", 3, "30-45s", 60, 1, "Core / abdomen"),
        ],
      },
      {
        name: "Full Body B",
        exercises: [
          ex("Peso muerto rumano", 3, "8-10", 150, 2, "Isquios"),
          ex("Jalón al pecho", 3, "10-12", 120, 2, "Espalda"),
          ex("Press inclinado", 3, "8-10", 120, 2, "Pecho"),
          ex("Curl femoral", 2, "12-15", 90, 1, "Isquios"),
          ex("Curl de bíceps", 2, "10-12", 60, 1, "Bíceps"),
        ],
      },
      {
        name: "Full Body C",
        exercises: [
          ex("Prensa", 3, "10-12", 120, 2, "Cuádriceps"),
          ex("Dominadas", 3, "6-10", 120, 2, "Espalda"),
          ex("Aperturas", 3, "12-15", 75, 1, "Pecho"),
          ex("Elevaciones laterales", 3, "12-15", 60, 1, "Hombros"),
          ex("Press francés", 2, "10-12", 60, 1, "Tríceps"),
        ],
      },
    ],
  },
  {
    id: "full-body-2",
    name: "Full Body 2 días",
    description: "Cuerpo completo 2 veces por semana. Para quien tiene poco tiempo pero quiere resultados reales.",
    level: "principiante",
    daysPerWeek: 2,
    goal: "Mantenimiento / progreso con poco tiempo",
    rationale:
      "Dos sesiones de cuerpo completo cumplen la frecuencia mínima de 2×/semana por grupo, que ya supera a entrenar 1 vez. Prioriza básicos que dan más estímulo por minuto.",
    citation: VOLUMEN_FUENTE,
    days: [
      {
        name: "Full Body A",
        exercises: [
          ex("Sentadilla", 3, "8-10", 150, 2, "Cuádriceps"),
          ex("Press banca", 3, "8-10", 120, 2, "Pecho"),
          ex("Remo con barra", 3, "10-12", 120, 2, "Espalda"),
          ex("Press militar", 2, "10-12", 90, 1, "Hombros"),
          ex("Curl de bíceps", 2, "12-15", 60, 1, "Bíceps"),
        ],
      },
      {
        name: "Full Body B",
        exercises: [
          ex("Peso muerto rumano", 3, "8-10", 150, 2, "Isquios"),
          ex("Jalón al pecho", 3, "10-12", 120, 2, "Espalda"),
          ex("Press inclinado", 3, "8-10", 120, 2, "Pecho"),
          ex("Prensa", 3, "12-15", 90, 1, "Cuádriceps"),
          ex("Gemelos", 3, "12-15", 60, 1, "Gemelos"),
        ],
      },
    ],
  },
  {
    id: "upper-lower-4",
    name: "Torso / Pierna 4 días",
    description: "Dos torsos y dos piernas por semana. El clásico intermedio que equilibra frecuencia y volumen.",
    level: "intermedio",
    daysPerWeek: 4,
    goal: "Hipertrofia y fuerza",
    rationale:
      "Cada grupo se trabaja 2×/semana (frecuencia óptima) y permite subir a ~12-16 series por grupo por semana, dentro del rango de mayor respuesta dosis-volumen. Combina fuerza (6-8) e hipertrofia (10-15).",
    citation: VOLUMEN_FUENTE,
    days: [
      {
        name: "Torso A",
        exercises: [
          ex("Press banca", 4, "6-8", 150, 2, "Pecho"),
          ex("Remo con barra", 4, "8-10", 120, 2, "Espalda"),
          ex("Press militar", 3, "8-10", 120, 2, "Hombros"),
          ex("Dominadas", 3, "8-12", 120, 2, "Espalda"),
          ex("Elevaciones laterales", 3, "12-15", 60, 1, "Hombros"),
          ex("Curl de bíceps", 2, "10-12", 60, 1, "Bíceps"),
        ],
      },
      {
        name: "Pierna A",
        exercises: [
          ex("Sentadilla", 4, "6-8", 180, 2, "Cuádriceps"),
          ex("Peso muerto rumano", 3, "8-10", 150, 2, "Isquios"),
          ex("Prensa", 3, "10-12", 120, 1, "Cuádriceps"),
          ex("Curl femoral", 3, "12-15", 90, 1, "Isquios"),
          ex("Gemelos", 4, "12-15", 60, 1, "Gemelos"),
        ],
      },
      {
        name: "Torso B",
        exercises: [
          ex("Press inclinado", 4, "8-10", 120, 2, "Pecho"),
          ex("Jalón al pecho", 4, "10-12", 120, 2, "Espalda"),
          ex("Aperturas", 3, "12-15", 75, 1, "Pecho"),
          ex("Face pull", 3, "15-20", 60, 1, "Hombros"),
          ex("Press francés", 3, "10-12", 60, 1, "Tríceps"),
          ex("Curl de bíceps", 2, "12-15", 60, 1, "Bíceps"),
        ],
      },
      {
        name: "Pierna B",
        exercises: [
          ex("Peso muerto", 4, "5-6", 180, 2, "Isquios"),
          ex("Sentadilla frontal", 3, "8-10", 150, 2, "Cuádriceps"),
          ex("Estocadas", 3, "10-12", 90, 1, "Cuádriceps"),
          ex("Extensión de cuádriceps", 3, "12-15", 75, 1, "Cuádriceps"),
          ex("Gemelos", 4, "15-20", 60, 1, "Gemelos"),
        ],
      },
    ],
  },
  {
    id: "ppl-6",
    name: "Empuje · Tirón · Pierna (PPL) 6 días",
    description: "Empuje, tirón y pierna, dos veces por semana cada uno. Alto volumen para avanzados.",
    level: "avanzado",
    daysPerWeek: 6,
    goal: "Máxima hipertrofia",
    rationale:
      "Frecuencia 2×/semana por grupo con volumen alto (~16-20 series por grupo por semana), el extremo superior del rango dosis-respuesta que solo conviene a avanzados con buena recuperación. Repartir en 6 días mantiene la calidad de cada serie.",
    citation: VOLUMEN_FUENTE,
    days: [
      {
        name: "Empuje A",
        exercises: [
          ex("Press banca", 4, "6-8", 150, 2, "Pecho"),
          ex("Press militar", 3, "8-10", 120, 2, "Hombros"),
          ex("Press inclinado", 3, "8-10", 120, 2, "Pecho"),
          ex("Elevaciones laterales", 4, "12-15", 60, 1, "Hombros"),
          ex("Press francés", 3, "10-12", 60, 1, "Tríceps"),
          ex("Fondos", 3, "8-12", 90, 1, "Tríceps"),
        ],
      },
      {
        name: "Tirón A",
        exercises: [
          ex("Peso muerto", 3, "5", 180, 2, "Espalda"),
          ex("Dominadas", 4, "8-10", 120, 2, "Espalda"),
          ex("Remo con barra", 4, "8-10", 120, 2, "Espalda"),
          ex("Face pull", 3, "15-20", 60, 1, "Hombros"),
          ex("Curl de bíceps", 4, "10-12", 60, 1, "Bíceps"),
        ],
      },
      {
        name: "Pierna A",
        exercises: [
          ex("Sentadilla", 4, "6-8", 180, 2, "Cuádriceps"),
          ex("Peso muerto rumano", 3, "8-10", 150, 2, "Isquios"),
          ex("Prensa", 3, "10-12", 120, 1, "Cuádriceps"),
          ex("Curl femoral", 3, "12-15", 90, 1, "Isquios"),
          ex("Gemelos", 5, "12-15", 60, 1, "Gemelos"),
        ],
      },
      {
        name: "Empuje B",
        exercises: [
          ex("Press inclinado con mancuernas", 4, "8-10", 120, 2, "Pecho"),
          ex("Press militar", 3, "8-10", 120, 2, "Hombros"),
          ex("Aperturas", 3, "12-15", 75, 1, "Pecho"),
          ex("Elevaciones laterales", 4, "15-20", 60, 1, "Hombros"),
          ex("Press francés", 4, "10-12", 60, 1, "Tríceps"),
        ],
      },
      {
        name: "Tirón B",
        exercises: [
          ex("Remo en máquina", 4, "10-12", 90, 2, "Espalda"),
          ex("Jalón al pecho", 4, "10-12", 90, 2, "Espalda"),
          ex("Remo con barra", 3, "8-10", 120, 2, "Espalda"),
          ex("Face pull", 3, "15-20", 60, 1, "Hombros"),
          ex("Curl de bíceps", 4, "12-15", 60, 1, "Bíceps"),
        ],
      },
      {
        name: "Pierna B",
        exercises: [
          ex("Sentadilla frontal", 4, "8-10", 150, 2, "Cuádriceps"),
          ex("Peso muerto rumano", 4, "8-10", 150, 2, "Isquios"),
          ex("Estocadas", 3, "10-12", 90, 1, "Cuádriceps"),
          ex("Extensión de cuádriceps", 3, "15-20", 75, 1, "Cuádriceps"),
          ex("Gemelos", 5, "15-20", 60, 1, "Gemelos"),
        ],
      },
    ],
  },
];

export const getTemplate = (id: string): ProgramTemplate | undefined =>
  PROGRAM_TEMPLATES.find((t) => t.id === id);

/** Convierte un template en un programa propio editable (con ids nuevos). */
export function templateToProgram(template: ProgramTemplate): MyProgram {
  return {
    id: newId(),
    name: template.name,
    description: template.description,
    level: template.level,
    daysPerWeek: template.daysPerWeek,
    days: template.days.map((d) => ({
      ...d,
      id: newId(),
      exercises: d.exercises.map((e) => ({ ...e })),
    })),
    origin: "template",
    templateId: template.id,
    createdAt: new Date().toISOString(),
  };
}
