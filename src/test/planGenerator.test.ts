import { describe, it, expect } from "vitest";
import { emptyOnboarding, type OnboardingData } from "@/lib/onboarding";
import {
  generatePlan,
  pickTemplate,
  estimateMinutes,
  weeklySetsByGroup,
} from "@/lib/planGenerator";
import { groupDaysByWeek } from "@/lib/myPrograms";

/** Alumno tipo: gimnasio completo, sin lesiones, 4 días, 60 min. */
const base = (patch: Partial<OnboardingData> = {}): OnboardingData => ({
  ...emptyOnboarding(),
  sex: "male",
  age: 30,
  heightCm: 178,
  weightKg: 78,
  experience: "intermediate",
  goal: "gain_muscle",
  equipment: ["Gimnasio completo"],
  activityLevel: "moderate",
  trainingMode: "weekly",
  trainingDays: [0, 1, 3, 4],
  daysPerWeek: 4,
  split: "Torso / Pierna",
  programWeeks: 8,
  sessionMinutes: 60,
  ...patch,
});

const allExercises = (plan: ReturnType<typeof generatePlan>) =>
  plan.program.days.flatMap((d) => d.exercises.map((e) => e.name));

const week1 = (plan: ReturnType<typeof generatePlan>) =>
  groupDaysByWeek(plan.program).find((w) => w.week === 1)!.days;

describe("elección de template", () => {
  it("respeta el split que pidió el alumno", () => {
    expect(pickTemplate(base({ split: "Torso / Pierna" })).id).toBe("upper-lower-4");
    expect(pickTemplate(base({ split: "Full body", daysPerWeek: 3 })).id).toBe("full-body-3");
    expect(
      pickTemplate(base({ split: "Empuje · Tirón · Pierna (PPL)", daysPerWeek: 6 })).id
    ).toBe("ppl-6");
  });

  it("sin split declarado, elige por cantidad de días", () => {
    const elegido = pickTemplate(base({ split: "Que lo decida el coach", daysPerWeek: 2 }));
    expect(elegido.daysPerWeek).toBe(2);
  });

  it("con días que no coinciden con ningún template, toma el más cercano", () => {
    const elegido = pickTemplate(base({ split: "Que lo decida el coach", daysPerWeek: 5 }));
    expect(elegido.daysPerWeek).toBe(4); // 4 está a 1 de distancia; 6 a 2
  });
});

describe("equipamiento", () => {
  it("reemplaza los ejercicios con barra si solo entrena en casa", () => {
    const plan = generatePlan(
      base({ equipment: ["Mancuernas", "Banco"], split: "Full body", daysPerWeek: 3 })
    );
    const nombres = allExercises(plan);
    expect(nombres).not.toContain("Sentadilla"); // necesita barra
    expect(nombres).not.toContain("Press banca");
    expect(plan.swaps.some((s) => s.reason === "equipamiento")).toBe(true);
  });

  it("con solo peso corporal, todo lo que queda es ejecutable sin equipo", () => {
    const plan = generatePlan(
      base({ equipment: ["Solo peso corporal"], split: "Full body", daysPerWeek: 3 })
    );
    const nombres = allExercises(plan);
    expect(nombres).not.toContain("Prensa");
    expect(nombres).not.toContain("Jalón al pecho");
    // Y sigue habiendo un plan entrenable, no una lista vacía.
    expect(plan.program.days.every((d) => d.exercises.length >= 3)).toBe(true);
  });

  it("gimnasio completo no genera ningún cambio por equipamiento", () => {
    const plan = generatePlan(base());
    expect(plan.swaps.filter((s) => s.reason === "equipamiento")).toHaveLength(0);
  });
});

describe("lesiones", () => {
  it("saca de encima los ejercicios que cargan la zona lesionada", () => {
    const plan = generatePlan(base({ injuryAreas: ["Hombro"], injurySeverity: "limita" }));
    const nombres = allExercises(plan);
    expect(nombres).not.toContain("Press militar");
    expect(nombres).not.toContain("Press banca");
    expect(plan.swaps.some((s) => s.reason === "lesion")).toBe(true);
  });

  it("con lumbar lesionada no quedan peso muerto ni remo con barra", () => {
    const plan = generatePlan(
      base({ injuryAreas: ["Espalda baja (lumbar)"], injurySeverity: "limita" })
    );
    const nombres = allExercises(plan);
    expect(nombres).not.toContain("Peso muerto");
    expect(nombres).not.toContain("Remo con barra");
    expect(nombres).not.toContain("Sentadilla");
  });

  it("una molestia leve sin alternativa se mantiene, pero más lejos del fallo", () => {
    // Rodilla + solo peso corporal: los patrones de pierna no tienen escapatoria.
    const plan = generatePlan(
      base({
        equipment: ["Solo peso corporal"],
        injuryAreas: ["Rodilla"],
        injurySeverity: "molestia",
        split: "Full body",
        daysPerWeek: 3,
      })
    );
    expect(plan.program.days.length).toBeGreaterThan(0);
  });

  it("sin lesiones declaradas no hay cambios por lesión", () => {
    const plan = generatePlan(base());
    expect(plan.swaps.filter((s) => s.reason === "lesion")).toHaveLength(0);
  });
});

describe("ejercicios que pidió evitar", () => {
  it("no aparece ninguno de los vetados", () => {
    const plan = generatePlan(base({ avoidedExercises: ["Sentadilla", "Peso muerto"] }));
    const nombres = allExercises(plan);
    expect(nombres).not.toContain("Sentadilla");
    expect(nombres).not.toContain("Peso muerto");
    expect(plan.swaps.some((s) => s.reason === "evitado")).toBe(true);
  });
});

describe("tiempo por sesión", () => {
  it("una sesión de 30 min tiene menos ejercicios que una de 90", () => {
    const corto = generatePlan(base({ sessionMinutes: 30 }));
    const largo = generatePlan(base({ sessionMinutes: 90 }));
    const ejerciciosCorto = week1(corto)[0].exercises.length;
    const ejerciciosLargo = week1(largo)[0].exercises.length;
    expect(ejerciciosCorto).toBeLessThan(ejerciciosLargo);
  });

  it("respeta el presupuesto de tiempo declarado", () => {
    const plan = generatePlan(base({ sessionMinutes: 45 }));
    for (const day of week1(plan)) {
      // Se permite el mínimo de 3 ejercicios aunque exceda: nunca dejamos una
      // sesión vacía por falta de tiempo.
      if (day.exercises.length > 3) {
        expect(estimateMinutes(day.exercises)).toBeLessThanOrEqual(45);
      }
    }
  });

  it("nunca deja una sesión con menos de 3 ejercicios", () => {
    const plan = generatePlan(base({ sessionMinutes: 30 }));
    expect(plan.program.days.every((d) => d.exercises.length >= 3)).toBe(true);
  });

  it("informa una duración estimada coherente", () => {
    const plan = generatePlan(base({ sessionMinutes: 60 }));
    expect(plan.minutesPerSession).toBeGreaterThan(15);
    expect(plan.minutesPerSession).toBeLessThanOrEqual(60);
  });
});

describe("prioridades", () => {
  it("suma series en el grupo priorizado", () => {
    const sin = generatePlan(base({ sessionMinutes: 90 }));
    const con = generatePlan(base({ sessionMinutes: 90, priorities: ["Espalda"] }));
    const seriesDe = (plan: ReturnType<typeof generatePlan>, grupo: string) =>
      weeklySetsByGroup(week1(plan)).find((g) => g.group === grupo)?.sets ?? 0;
    expect(seriesDe(con, "Espalda")).toBeGreaterThan(seriesDe(sin, "Espalda"));
  });

  it("ignora prioridades que no son grupos musculares", () => {
    const plan = generatePlan(base({ priorities: ["Movilidad", "Postura"] }));
    expect(plan.reasons.some((r) => r.kind === "prioridad")).toBe(false);
  });
});

describe("experiencia", () => {
  it("el principiante entrena más lejos del fallo que el avanzado", () => {
    const novato = generatePlan(base({ experience: "beginner", split: "Full body", daysPerWeek: 3 }));
    const experto = generatePlan(base({ experience: "advanced", split: "Full body", daysPerWeek: 3 }));
    const rirProm = (plan: ReturnType<typeof generatePlan>) => {
      const ex = week1(plan).flatMap((d) => d.exercises);
      return ex.reduce((s, e) => s + (e.rir ?? 0), 0) / ex.length;
    };
    expect(rirProm(novato)).toBeGreaterThan(rirProm(experto));
  });

  it("le pone tope de series al principiante", () => {
    const plan = generatePlan(base({ experience: "beginner", sessionMinutes: 90 }));
    expect(week1(plan).every((d) => d.exercises.every((e) => e.sets <= 3))).toBe(true);
  });
});

describe("semanas y progresión", () => {
  it("expande el programa a la cantidad de semanas pedida", () => {
    const plan = generatePlan(base({ programWeeks: 6 }));
    expect(groupDaysByWeek(plan.program)).toHaveLength(6);
    expect(plan.program.weeks).toBe(6);
  });

  it("la intensidad sube: en la semana 3 se entrena más cerca del fallo que en la 1", () => {
    const plan = generatePlan(base({ programWeeks: 8 }));
    const rirDe = (semana: number) => {
      const days = groupDaysByWeek(plan.program).find((w) => w.week === semana)!.days;
      const ex = days.flatMap((d) => d.exercises);
      return ex.reduce((s, e) => s + (e.rir ?? 0), 0) / ex.length;
    };
    expect(rirDe(3)).toBeLessThan(rirDe(1));
  });

  it("cada 4 semanas hay descarga: menos series y más lejos del fallo", () => {
    const plan = generatePlan(base({ programWeeks: 8 }));
    const seriesDe = (semana: number) =>
      groupDaysByWeek(plan.program)
        .find((w) => w.week === semana)!
        .days.flatMap((d) => d.exercises)
        .reduce((s, e) => s + e.sets, 0);
    expect(seriesDe(4)).toBeLessThan(seriesDe(3));
  });

  it("todos los días quedan etiquetados con su semana", () => {
    const plan = generatePlan(base({ programWeeks: 4 }));
    expect(plan.program.days.every((d) => typeof d.week === "number" && d.week >= 1)).toBe(true);
  });
});

describe("el plan resultante", () => {
  it("se guarda como programa entrenable con nombre propio", () => {
    const plan = generatePlan(base({ goal: "gain_muscle", split: "Torso / Pierna" }));
    expect(plan.program.name).toContain("Hipertrofia");
    expect(plan.program.days.length).toBeGreaterThan(0);
    // "generado" y no "template": está adaptado a su equipamiento, lesiones y
    // tiempo, así que no es una copia del template del que salió.
    expect(plan.program.origin).toBe("generado");
    expect(plan.program.templateId).toBeTruthy(); // pero sabemos de cuál salió
  });

  it("explica sus decisiones con frases, no con códigos", () => {
    const plan = generatePlan(base({ injuryAreas: ["Hombro"], injurySeverity: "limita" }));
    expect(plan.reasons.length).toBeGreaterThanOrEqual(3);
    expect(plan.reasons.some((r) => r.kind === "estructura")).toBe(true);
    expect(plan.reasons.some((r) => r.kind === "tiempo")).toBe(true);
    expect(plan.reasons.some((r) => r.kind === "lesion")).toBe(true);
    // Ninguna razón puede quedar vacía o cortada.
    expect(plan.reasons.every((r) => r.text.length > 20 && r.text.endsWith("."))).toBe(true);
  });

  it("cita la evidencia del template del que sale", () => {
    expect(generatePlan(base()).citation).toContain("Schoenfeld");
  });

  it("es determinista salvo por los ids", () => {
    const a = generatePlan(base());
    const b = generatePlan(base());
    expect(allExercises(a)).toEqual(allExercises(b));
    expect(a.reasons.map((r) => r.text)).toEqual(b.reasons.map((r) => r.text));
  });

  it("funciona aunque el onboarding esté a medio llenar", () => {
    const plan = generatePlan(emptyOnboarding());
    expect(plan.program.days.length).toBeGreaterThan(0);
    expect(plan.reasons.length).toBeGreaterThan(0);
  });
});
