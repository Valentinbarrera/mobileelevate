/**
 * Tipos de las tablas de rutinas en Supabase (Elevate Web)
 */

export interface Exercise {
  id: string;
  name: string;
  video_url: string | null;
  description: string | null;
  muscle: string | null;       // actual DB column name
  muscle_group: string | null; // alias kept for compatibility
  category: string | null;
  equipment: string | null;
  thumbnail_url: string | null;
  thumbnail: string | null;    // alias kept for compatibility
  is_system: boolean | null;
  created_at: string;
}

export interface RoutineExercise {
  id: string;
  routine_day_id: string;
  exercise_id: string | null;
  name: string;               // exercise name stored directly on routine_exercise
  series: number;
  reps: string;
  weight: number | null;
  rest: number | null;
  rir: number | null;
  tempo: string | null;
  type: string | null;
  training_method: string | null;
  intensity_modifier: string | null;
  notes: string | null;
  order_index: number;
  created_at: string;
  exercise?: Exercise | null;
}

export interface RoutineDay {
  id: string;
  routine_id: string;
  order_index: number;        // actual DB column (was day_number)
  day_number?: number;        // alias kept for compatibility
  day_name: string;           // actual DB column (was name)
  name?: string;              // alias kept for compatibility
  notes: string | null;
  created_at: string;
  routine_exercises?: RoutineExercise[];
}

export interface Routine {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  duration_weeks: number | null;
  difficulty: string | null;
  image_url: string | null;
  created_at: string;
  routine_days?: RoutineDay[];
}

export interface RoutineAssignment {
  id: string;
  routine_id: string;
  student_id: string;
  status: 'active' | 'completed' | 'paused';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  routine?: Routine;
}

export interface AlumnoRoutineWithDetails extends RoutineAssignment {
  routine: Routine & {
    routine_days: (RoutineDay & {
      routine_exercises: (RoutineExercise & {
        exercise: Exercise;
      })[];
    })[];
  };
}
