/**
 * Mock data for Admin mode — shown when user is not logged in via Supabase
 */

// ─── Student Profile ─────────────────────────────────────────────────────────

export const MOCK_STUDENT = {
  id: "admin-mock-student",
  coach_id: "admin-mock-coach",
  full_name: "Admin Demo",
  email: "admin@elevate.app",
  status: "active",
  goal: "Hipertrofia",
  level: "Intermedio",
  age: 26,
  height_cm: 178,
  weight_kg: 79.5,
  injuries: null,
  created_at: "2025-11-01T00:00:00Z",
  updated_at: "2026-06-15T00:00:00Z",
};

// ─── Exercises Library ───────────────────────────────────────────────────────

const EXERCISES = {
  benchPress: {
    id: "ex-001",
    name: "Press de Banca",
    video_url: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
    muscle_group: "Pecho",
    equipment: "Barra",
    thumbnail: null,
  },
  squat: {
    id: "ex-002",
    name: "Sentadilla",
    video_url: "https://www.youtube.com/watch?v=ultWZbUMPL8",
    muscle_group: "Piernas",
    equipment: "Barra",
    thumbnail: null,
  },
  deadlift: {
    id: "ex-003",
    name: "Peso Muerto",
    video_url: "https://www.youtube.com/watch?v=op9kVnSo6Wc",
    muscle_group: "Espalda",
    equipment: "Barra",
    thumbnail: null,
  },
  pullUp: {
    id: "ex-004",
    name: "Dominadas",
    video_url: null,
    muscle_group: "Espalda",
    equipment: "Barra fija",
    thumbnail: null,
  },
  shoulderPress: {
    id: "ex-005",
    name: "Press Militar",
    video_url: null,
    muscle_group: "Hombros",
    equipment: "Mancuernas",
    thumbnail: null,
  },
  bicepCurl: {
    id: "ex-006",
    name: "Curl de Bíceps",
    video_url: null,
    muscle_group: "Bíceps",
    equipment: "Mancuernas",
    thumbnail: null,
  },
  tricepExtension: {
    id: "ex-007",
    name: "Extensión de Tríceps",
    video_url: null,
    muscle_group: "Tríceps",
    equipment: "Polea",
    thumbnail: null,
  },
  legPress: {
    id: "ex-008",
    name: "Prensa de Piernas",
    video_url: null,
    muscle_group: "Piernas",
    equipment: "Máquina",
    thumbnail: null,
  },
  lateralRaise: {
    id: "ex-009",
    name: "Elevaciones Laterales",
    video_url: null,
    muscle_group: "Hombros",
    equipment: "Mancuernas",
    thumbnail: null,
  },
  cableRow: {
    id: "ex-010",
    name: "Remo en Polea",
    video_url: null,
    muscle_group: "Espalda",
    equipment: "Polea",
    thumbnail: null,
  },
  inclineBench: {
    id: "ex-011",
    name: "Press Inclinado",
    video_url: null,
    muscle_group: "Pecho",
    equipment: "Mancuernas",
    thumbnail: null,
  },
  hamstringCurl: {
    id: "ex-012",
    name: "Curl Femoral",
    video_url: null,
    muscle_group: "Piernas",
    equipment: "Máquina",
    thumbnail: null,
  },
};

// ─── Routine Days & Exercises ────────────────────────────────────────────────

function makeRoutineExercise(id: string, ex: typeof EXERCISES.benchPress, series: number, reps: string, rest: number, order: number) {
  return {
    id: `re-${id}`,
    routine_day_id: "",
    exercise_id: ex.id,
    name: ex.name,
    series,
    reps,
    weight: null,
    rest,
    rir: 2,
    tempo: null,
    type: null,
    training_method: null,
    intensity_modifier: null,
    notes: null,
    order_index: order,
    created_at: "2026-01-01T00:00:00Z",
    exercise: { ...ex, description: null, muscle: ex.muscle_group, category: null, thumbnail_url: null, is_system: true, created_at: "2026-01-01T00:00:00Z" },
  };
}

const ROUTINE_DAYS = [
  {
    id: "day-001",
    routine_id: "routine-001",
    order_index: 1,
    day_name: "Pecho y Tríceps",
    notes: "Enfocarse en la conexión mente-músculo. Controlar la fase excéntrica.",
    created_at: "2026-01-01T00:00:00Z",
    routine_exercises: [
      makeRoutineExercise("001", EXERCISES.benchPress, 4, "8-10", 90, 1),
      makeRoutineExercise("002", EXERCISES.inclineBench, 4, "10-12", 75, 2),
      makeRoutineExercise("003", EXERCISES.tricepExtension, 3, "12-15", 60, 3),
      makeRoutineExercise("004", EXERCISES.lateralRaise, 3, "15", 45, 4),
    ],
  },
  {
    id: "day-002",
    routine_id: "routine-001",
    order_index: 2,
    day_name: "Espalda y Bíceps",
    notes: "Priorizar dominadas con rango completo.",
    created_at: "2026-01-01T00:00:00Z",
    routine_exercises: [
      makeRoutineExercise("005", EXERCISES.pullUp, 4, "8-10", 90, 1),
      makeRoutineExercise("006", EXERCISES.cableRow, 4, "10-12", 75, 2),
      makeRoutineExercise("007", EXERCISES.deadlift, 3, "6-8", 120, 3),
      makeRoutineExercise("008", EXERCISES.bicepCurl, 3, "12-15", 60, 4),
    ],
  },
  {
    id: "day-003",
    routine_id: "routine-001",
    order_index: 3,
    day_name: "Piernas y Hombros",
    notes: "Calentar bien rodillas antes de sentadilla.",
    created_at: "2026-01-01T00:00:00Z",
    routine_exercises: [
      makeRoutineExercise("009", EXERCISES.squat, 4, "8-10", 120, 1),
      makeRoutineExercise("010", EXERCISES.legPress, 4, "12-15", 90, 2),
      makeRoutineExercise("011", EXERCISES.hamstringCurl, 3, "12-15", 60, 3),
      makeRoutineExercise("012", EXERCISES.shoulderPress, 4, "10-12", 75, 4),
    ],
  },
  {
    id: "day-004",
    routine_id: "routine-001",
    order_index: 4,
    day_name: "Full Body",
    notes: "Sesión de alta intensidad. Descansos cortos.",
    created_at: "2026-01-01T00:00:00Z",
    routine_exercises: [
      makeRoutineExercise("013", EXERCISES.deadlift, 4, "6-8", 120, 1),
      makeRoutineExercise("014", EXERCISES.benchPress, 3, "8-10", 90, 2),
      makeRoutineExercise("015", EXERCISES.squat, 3, "10-12", 90, 3),
      makeRoutineExercise("016", EXERCISES.pullUp, 3, "AMRAP", 90, 4),
    ],
  },
];

// ─── Routine Assignment (mock) ───────────────────────────────────────────────

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

// Determine which day to show today (cycle through days based on weekday)
const weekday = today.getDay(); // 0=Sun, 1=Mon...
const dayMapping: Record<number, string> = { 1: "day-001", 2: "day-002", 3: "day-003", 4: "day-004", 5: "day-001" };
const todayDayId = dayMapping[weekday] || null; // Sat/Sun = rest day

export const MOCK_ROUTINE_ASSIGNMENTS = [
  {
    id: "assignment-001",
    routine_id: "routine-001",
    student_id: MOCK_STUDENT.id,
    status: "active" as const,
    start_date: "2026-05-01",
    end_date: null,
    created_at: "2026-05-01T00:00:00Z",
    planned_sessions: todayDayId
      ? [{ id: "ps-001", date: todayStr, routine_day_id: todayDayId, student_id: MOCK_STUDENT.id, assignment_id: "assignment-001" }]
      : [],
    routine: {
      id: "routine-001",
      coach_id: "admin-mock-coach",
      name: "Programa Hipertrofia 12 Semanas",
      description: "Plan de entrenamiento enfocado en ganancia muscular con progresión lineal",
      duration_weeks: 12,
      difficulty: "Intermedio",
      image_url: null,
      created_at: "2026-01-01T00:00:00Z",
      routine_days: ROUTINE_DAYS,
    },
  },
];

// ─── Completed Sessions (history) ────────────────────────────────────────────

function generateCompletedSessions() {
  const sessions = [];
  const baseDate = new Date();

  // Generate 20 sessions over the last 30 days
  for (let i = 0; i < 20; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - Math.floor(i * 1.5));

    // Skip some days for realism
    if (i % 5 === 3) continue;

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const dayIndex = i % 4;
    const tonnage = 3500 + Math.floor(Math.random() * 2000);

    sessions.push({
      id: `cs-${String(i).padStart(3, "0")}`,
      student_id: MOCK_STUDENT.id,
      planned_session_id: `ps-${String(i).padStart(3, "0")}`,
      date: dateStr,
      total_tonnage: tonnage,
      duration_seconds: 2700 + Math.floor(Math.random() * 1800),
      notes: ROUTINE_DAYS[dayIndex].day_name,
    });
  }

  return sessions;
}

export const MOCK_COMPLETED_SESSIONS = generateCompletedSessions();

// ─── Completed Exercises (sets per session, for history + strength charts) ───

const BASE_WEIGHTS: Record<string, number> = {
  "Press de Banca": 80,
  "Press Inclinado": 60,
  "Extensión de Tríceps": 25,
  "Elevaciones Laterales": 12,
  "Dominadas": 10,
  "Remo en Polea": 70,
  "Peso Muerto": 120,
  "Curl de Bíceps": 22,
  "Sentadilla": 100,
  "Prensa de Piernas": 160,
  "Curl Femoral": 40,
  "Press Militar": 50,
};

function generateCompletedExercises() {
  const rows: {
    completed_session_id: string;
    series: number;
    weight: number;
    reps: number;
    routine_exercises: { name: string };
  }[] = [];

  // Las sesiones están ordenadas de más reciente (idx 0) a más vieja.
  // Progresión lineal: el peso sube ~0.5kg por sesión hacia las más recientes.
  MOCK_COMPLETED_SESSIONS.forEach((s, idx) => {
    const day = ROUTINE_DAYS.find((d) => d.day_name === s.notes) || ROUTINE_DAYS[0];
    const recencyBonus = Math.round((MOCK_COMPLETED_SESSIONS.length - 1 - idx) * 0.5);

    day.routine_exercises.forEach((re) => {
      const base = BASE_WEIGHTS[re.name] ?? 40;
      for (let set = 1; set <= re.series; set++) {
        rows.push({
          completed_session_id: s.id,
          series: set,
          weight: base + recencyBonus,
          reps: 8 + (set % 2),
          routine_exercises: { name: re.name },
        });
      }
    });
  });

  return rows;
}

export const MOCK_COMPLETED_EXERCISES = generateCompletedExercises();

// ─── Nutrition tracking history (demo del historial de comidas) ──────────────

function generateNutritionHistory() {
  const pool = [
    { name: "Avena con banana", mealType: "desayuno", calories: 420, protein: 14, carbs: 70, fats: 8 },
    { name: "Huevos revueltos", mealType: "desayuno", calories: 220, protein: 18, carbs: 2, fats: 15 },
    { name: "Pollo con arroz", mealType: "almuerzo", calories: 650, protein: 50, carbs: 70, fats: 12 },
    { name: "Ensalada con atún", mealType: "almuerzo", calories: 380, protein: 35, carbs: 15, fats: 18 },
    { name: "Yogur con frutos secos", mealType: "merienda", calories: 250, protein: 15, carbs: 22, fats: 10 },
    { name: "Batido de proteína", mealType: "merienda", calories: 180, protein: 30, carbs: 8, fats: 3 },
    { name: "Carne con puré", mealType: "cena", calories: 600, protein: 45, carbs: 50, fats: 20 },
    { name: "Salmón con vegetales", mealType: "cena", calories: 480, protein: 40, carbs: 18, fats: 25 },
    { name: "Manzana", mealType: "snack", calories: 95, protein: 0, carbs: 25, fats: 0 },
    { name: "Almendras", mealType: "snack", calories: 160, protein: 6, carbs: 6, fats: 14 },
  ];
  const base = new Date();
  const days = [];

  for (let i = 0; i < 14; i++) {
    if (i % 6 === 4) continue; // saltear algunos días (días sin registro)
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const count = 3 + (i % 3); // 3-5 comidas por día
    const foods = [];
    for (let j = 0; j < count; j++) {
      const p = pool[(i * 2 + j) % pool.length];
      foods.push({ id: `mnf-${i}-${j}`, ...p });
    }
    const totals = foods.reduce(
      (a, f) => ({
        calories: a.calories + f.calories,
        protein: a.protein + f.protein,
        carbs: a.carbs + f.carbs,
        fats: a.fats + f.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    days.push({ date: dateStr, foods, totals, water: 4 + (i % 5), checkedMealsCount: i % 4 });
  }

  return days;
}

export const MOCK_NUTRITION_HISTORY = generateNutritionHistory();

// ─── Anthropometry (Body measurements) ──────────────────────────────────────

export const MOCK_ANTHROPOMETRY = [
  { id: "anth-01", date: "2026-01-15", weight_kg: 82.0, waist_cm: 86, chest_cm: 101, arm_cm: 35.5, thigh_cm: 58, hips_cm: 98, body_fat: 18, notes: null },
  { id: "anth-02", date: "2026-02-15", weight_kg: 81.2, waist_cm: 85, chest_cm: 101.5, arm_cm: 35.8, thigh_cm: 58.5, hips_cm: 97, body_fat: 17, notes: null },
  { id: "anth-03", date: "2026-03-15", weight_kg: 80.5, waist_cm: 83, chest_cm: 102, arm_cm: 36, thigh_cm: 59, hips_cm: 97, body_fat: 16.5, notes: "Buen progreso" },
  { id: "anth-04", date: "2026-04-15", weight_kg: 80.0, waist_cm: 82, chest_cm: 102.5, arm_cm: 36.5, thigh_cm: 59.5, hips_cm: 96, body_fat: 15.5, notes: null },
  { id: "anth-05", date: "2026-05-15", weight_kg: 79.8, waist_cm: 81, chest_cm: 103, arm_cm: 37, thigh_cm: 60, hips_cm: 96, body_fat: 15, notes: null },
  { id: "anth-06", date: "2026-06-10", weight_kg: 79.5, waist_cm: 80, chest_cm: 103.5, arm_cm: 37.2, thigh_cm: 60.5, hips_cm: 95, body_fat: 14.5, notes: "Definición visible" },
];

// ─── Personal Records ────────────────────────────────────────────────────────

export const MOCK_PERSONAL_RECORDS = [
  { exerciseName: "Press de Banca", weight: 100, reps: 6, date: "2026-06-05" },
  { exerciseName: "Sentadilla", weight: 130, reps: 8, date: "2026-06-08" },
  { exerciseName: "Peso Muerto", weight: 150, reps: 5, date: "2026-05-28" },
  { exerciseName: "Press Militar", weight: 60, reps: 8, date: "2026-06-10" },
  { exerciseName: "Dominadas", weight: 15, reps: 10, date: "2026-06-12" },
  { exerciseName: "Remo en Polea", weight: 80, reps: 10, date: "2026-06-01" },
];

// ─── Nutrition Plan ──────────────────────────────────────────────────────────

export const MOCK_NUTRITION_PLAN = {
  id: "plan-001",
  name: "Plan Hipertrofia 3200 kcal",
  description: "Plan alto en proteínas para fase de volumen limpio",
  calories_target: 3200,
  protein_target: 200,
  carbs_target: 380,
  fats_target: 95,
  days: [
    {
      id: "npd-001",
      day_number: 1,
      day_name: "Día de Entrenamiento",
      notes: "Más carbohidratos los días de entreno para mejor rendimiento.",
      meals: [
        {
          id: "meal-001",
          meal_type: "breakfast",
          order_index: 1,
          notes: null,
          foods: [
            { id: "f-01", name: "Avena", calories: 370, protein: 13, carbs: 60, fats: 7, fiber: 8, serving_size: 100, serving_unit: "g", quantity: 1, notes: null },
            { id: "f-02", name: "Banana", calories: 89, protein: 1, carbs: 23, fats: 0.3, fiber: 2.6, serving_size: 1, serving_unit: "unidad", quantity: 2, notes: null },
            { id: "f-03", name: "Whey Protein", calories: 120, protein: 25, carbs: 3, fats: 1.5, fiber: 0, serving_size: 30, serving_unit: "g", quantity: 1, notes: "Con la avena" },
            { id: "f-04", name: "Mantequilla de maní", calories: 94, protein: 4, carbs: 3, fats: 8, fiber: 1, serving_size: 15, serving_unit: "g", quantity: 1, notes: null },
          ],
          totalCalories: 762,
          totalProtein: 47,
          totalCarbs: 112,
          totalFats: 17.1,
        },
        {
          id: "meal-002",
          meal_type: "lunch",
          order_index: 2,
          notes: null,
          foods: [
            { id: "f-05", name: "Pechuga de pollo", calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, serving_size: 100, serving_unit: "g", quantity: 2, notes: "A la plancha" },
            { id: "f-06", name: "Arroz integral", calories: 130, protein: 3, carbs: 28, fats: 1, fiber: 2, serving_size: 100, serving_unit: "g", quantity: 2, notes: null },
            { id: "f-07", name: "Brócoli", calories: 35, protein: 3, carbs: 7, fats: 0.4, fiber: 3, serving_size: 100, serving_unit: "g", quantity: 1.5, notes: "Al vapor" },
            { id: "f-08", name: "Aceite de oliva", calories: 120, protein: 0, carbs: 0, fats: 14, fiber: 0, serving_size: 15, serving_unit: "ml", quantity: 1, notes: null },
          ],
          totalCalories: 832.5,
          totalProtein: 72.5,
          totalCarbs: 66.5,
          totalFats: 26,
        },
        {
          id: "meal-003",
          meal_type: "pre_workout",
          order_index: 3,
          notes: "1 hora antes del entrenamiento",
          foods: [
            { id: "f-09", name: "Tostadas integrales", calories: 80, protein: 3, carbs: 15, fats: 1, fiber: 2, serving_size: 1, serving_unit: "unidad", quantity: 3, notes: null },
            { id: "f-10", name: "Mermelada light", calories: 30, protein: 0, carbs: 7, fats: 0, fiber: 0, serving_size: 15, serving_unit: "g", quantity: 2, notes: null },
            { id: "f-11", name: "Café negro", calories: 2, protein: 0, carbs: 0, fats: 0, fiber: 0, serving_size: 200, serving_unit: "ml", quantity: 1, notes: null },
          ],
          totalCalories: 302,
          totalProtein: 9,
          totalCarbs: 59,
          totalFats: 3,
        },
        {
          id: "meal-004",
          meal_type: "post_workout",
          order_index: 4,
          notes: "Dentro de los 30 min post entreno",
          foods: [
            { id: "f-12", name: "Whey Protein", calories: 120, protein: 25, carbs: 3, fats: 1.5, fiber: 0, serving_size: 30, serving_unit: "g", quantity: 1.5, notes: null },
            { id: "f-13", name: "Banana", calories: 89, protein: 1, carbs: 23, fats: 0.3, fiber: 2.6, serving_size: 1, serving_unit: "unidad", quantity: 1, notes: null },
            { id: "f-14", name: "Miel", calories: 64, protein: 0, carbs: 17, fats: 0, fiber: 0, serving_size: 20, serving_unit: "g", quantity: 1, notes: null },
          ],
          totalCalories: 333,
          totalProtein: 38.5,
          totalCarbs: 49.5,
          totalFats: 2.55,
        },
        {
          id: "meal-005",
          meal_type: "dinner",
          order_index: 5,
          notes: null,
          foods: [
            { id: "f-15", name: "Salmón", calories: 208, protein: 20, carbs: 0, fats: 13, fiber: 0, serving_size: 100, serving_unit: "g", quantity: 1.5, notes: "Al horno" },
            { id: "f-16", name: "Batata", calories: 86, protein: 2, carbs: 20, fats: 0.1, fiber: 3, serving_size: 100, serving_unit: "g", quantity: 2, notes: null },
            { id: "f-17", name: "Ensalada mixta", calories: 25, protein: 1.5, carbs: 4, fats: 0.3, fiber: 2, serving_size: 100, serving_unit: "g", quantity: 2, notes: null },
            { id: "f-18", name: "Aceite de oliva", calories: 120, protein: 0, carbs: 0, fats: 14, fiber: 0, serving_size: 15, serving_unit: "ml", quantity: 1, notes: "Para la ensalada" },
          ],
          totalCalories: 806,
          totalProtein: 37,
          totalCarbs: 52,
          totalFats: 40.25,
        },
      ],
    },
    {
      id: "npd-002",
      day_number: 2,
      day_name: "Día de Descanso",
      notes: "Menos carbohidratos, más grasas saludables en días de descanso.",
      meals: [
        {
          id: "meal-006",
          meal_type: "breakfast",
          order_index: 1,
          notes: null,
          foods: [
            { id: "f-19", name: "Huevos", calories: 155, protein: 13, carbs: 1, fats: 11, fiber: 0, serving_size: 2, serving_unit: "unidades", quantity: 2, notes: "Revueltos" },
            { id: "f-20", name: "Palta", calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7, serving_size: 100, serving_unit: "g", quantity: 1, notes: null },
            { id: "f-21", name: "Pan integral", calories: 80, protein: 4, carbs: 14, fats: 1, fiber: 2, serving_size: 1, serving_unit: "rebanada", quantity: 2, notes: "Tostado" },
          ],
          totalCalories: 790,
          totalProtein: 36,
          totalCarbs: 48,
          totalFats: 55,
        },
        {
          id: "meal-007",
          meal_type: "lunch",
          order_index: 2,
          notes: null,
          foods: [
            { id: "f-22", name: "Carne magra", calories: 250, protein: 26, carbs: 0, fats: 15, fiber: 0, serving_size: 100, serving_unit: "g", quantity: 2, notes: "A la parrilla" },
            { id: "f-23", name: "Quinoa", calories: 120, protein: 4, carbs: 21, fats: 2, fiber: 3, serving_size: 100, serving_unit: "g", quantity: 1.5, notes: null },
            { id: "f-24", name: "Verduras salteadas", calories: 50, protein: 2, carbs: 8, fats: 2, fiber: 3, serving_size: 100, serving_unit: "g", quantity: 2, notes: null },
          ],
          totalCalories: 880,
          totalProtein: 62,
          totalCarbs: 47.5,
          totalFats: 38,
        },
        {
          id: "meal-008",
          meal_type: "snack",
          order_index: 3,
          notes: null,
          foods: [
            { id: "f-25", name: "Yogurt griego", calories: 100, protein: 17, carbs: 6, fats: 1, fiber: 0, serving_size: 170, serving_unit: "g", quantity: 1, notes: null },
            { id: "f-26", name: "Almendras", calories: 160, protein: 6, carbs: 6, fats: 14, fiber: 3, serving_size: 28, serving_unit: "g", quantity: 1, notes: null },
            { id: "f-27", name: "Frutos rojos", calories: 50, protein: 1, carbs: 12, fats: 0.3, fiber: 4, serving_size: 100, serving_unit: "g", quantity: 1, notes: null },
          ],
          totalCalories: 310,
          totalProtein: 24,
          totalCarbs: 24,
          totalFats: 15.3,
        },
        {
          id: "meal-009",
          meal_type: "dinner",
          order_index: 4,
          notes: null,
          foods: [
            { id: "f-28", name: "Merluza", calories: 90, protein: 18, carbs: 0, fats: 1.5, fiber: 0, serving_size: 100, serving_unit: "g", quantity: 2, notes: "Al horno con limón" },
            { id: "f-29", name: "Espárragos", calories: 20, protein: 2, carbs: 4, fats: 0.1, fiber: 2, serving_size: 100, serving_unit: "g", quantity: 1.5, notes: "Grillados" },
            { id: "f-30", name: "Aceite de oliva", calories: 120, protein: 0, carbs: 0, fats: 14, fiber: 0, serving_size: 15, serving_unit: "ml", quantity: 1, notes: null },
          ],
          totalCalories: 380,
          totalProtein: 39,
          totalCarbs: 6,
          totalFats: 17.15,
        },
      ],
    },
  ],
};

// ─── Messages ────────────────────────────────────────────────────────────────

export const MOCK_MESSAGES = [
  {
    id: "msg-001",
    student_id: MOCK_STUDENT.id,
    coach_id: MOCK_STUDENT.coach_id,
    sender: "coach" as const,
    content: "¡Hola! Bienvenido a Elevate. Te armé un plan de 12 semanas enfocado en hipertrofia. Cualquier duda me escribís.",
    created_at: "2026-05-01T09:00:00Z",
    seen_at: "2026-05-01T10:30:00Z",
    file_url: null,
  },
  {
    id: "msg-002",
    student_id: MOCK_STUDENT.id,
    coach_id: MOCK_STUDENT.coach_id,
    sender: "student" as const,
    content: "Genial, gracias! Empiezo mañana lunes. Una pregunta: ¿en sentadilla llego hasta paralelo o más abajo?",
    created_at: "2026-05-01T11:00:00Z",
    seen_at: "2026-05-01T11:15:00Z",
    file_url: null,
  },
  {
    id: "msg-003",
    student_id: MOCK_STUDENT.id,
    coach_id: MOCK_STUDENT.coach_id,
    sender: "coach" as const,
    content: "Bajá hasta donde puedas manteniendo la espalda neutra. Si llegás por debajo de paralelo sin compensar, mejor. Si no, paralelo está perfecto.",
    created_at: "2026-05-01T11:20:00Z",
    seen_at: "2026-05-01T12:00:00Z",
    file_url: null,
  },
  {
    id: "msg-004",
    student_id: MOCK_STUDENT.id,
    coach_id: MOCK_STUDENT.coach_id,
    sender: "student" as const,
    content: "Perfecto, entendido. Hoy hice la primera sesión, me sentí muy bien. Press banca llegué a 85kg x 8 rep.",
    created_at: "2026-05-02T18:30:00Z",
    seen_at: "2026-05-02T19:00:00Z",
    file_url: null,
  },
  {
    id: "msg-005",
    student_id: MOCK_STUDENT.id,
    coach_id: MOCK_STUDENT.coach_id,
    sender: "coach" as const,
    content: "Excelente! Buen número para arrancar. La semana que viene intentá subirle 2.5kg si te sentís cómodo con la técnica. No olvides el plan nutricional 💪",
    created_at: "2026-05-02T19:10:00Z",
    seen_at: "2026-05-02T20:00:00Z",
    file_url: null,
  },
  {
    id: "msg-006",
    student_id: MOCK_STUDENT.id,
    coach_id: MOCK_STUDENT.coach_id,
    sender: "coach" as const,
    content: "Vi que completaste 4 entrenamientos esta semana. Muy buen ritmo! ¿Cómo estás de recuperación? ¿Dormís bien?",
    created_at: "2026-06-14T10:00:00Z",
    seen_at: "2026-06-14T12:00:00Z",
    file_url: null,
  },
  {
    id: "msg-007",
    student_id: MOCK_STUDENT.id,
    coach_id: MOCK_STUDENT.coach_id,
    sender: "student" as const,
    content: "Sí, durmiendo 7-8 horas. El único día que me cuesta un poco más es piernas, el día siguiente quedo bastante molido.",
    created_at: "2026-06-14T12:30:00Z",
    seen_at: "2026-06-14T13:00:00Z",
    file_url: null,
  },
  {
    id: "msg-008",
    student_id: MOCK_STUDENT.id,
    coach_id: MOCK_STUDENT.coach_id,
    sender: "coach" as const,
    content: "Es normal al principio. Si querés, después de piernas podemos meter un día de descanso activo (caminata, movilidad). Te actualizo el plan.",
    created_at: "2026-06-14T13:15:00Z",
    seen_at: null,
    file_url: null,
  },
];

// ─── Weekly progress (completed dates this week) ─────────────────────────────

export function getMockWeeklyProgress() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const sessions = [];
  // Mark Mon, Tue, Wed as completed (if we're past those days)
  for (let i = 0; i < Math.min(dayOfWeek === 0 ? 6 : dayOfWeek - 1, 3); i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    sessions.push({ id: `ws-${i}`, date: dateStr });
  }

  return { completedDays: sessions.length, totalDays: 5, sessions };
}
