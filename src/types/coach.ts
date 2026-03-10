/**
 * Tipos de las tablas de rutinas en Supabase (Elevate Web)
 */

export interface Exercise {
  id: string;
  name: string;
  video_url: string | null;
  description: string | null;
  muscle_group: string | null;
  equipment: string | null;
  thumbnail: string | null;
  created_at: string;
}

export interface RoutineExercise {
  id: string;
  routine_day_id: string;
  exercise_id: string;
  series: number;
  reps: string;
  rest: number | null;
  notes: string | null;
  order_index: number;
  created_at: string;
  exercise?: Exercise;
}

export interface RoutineDay {
  id: string;
  routine_id: string;
  day_number: number;
  name: string;
  description: string | null;
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
