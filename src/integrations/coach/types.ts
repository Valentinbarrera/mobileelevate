/**
 * Tipos de la base de datos del proyecto Elevate Coach
 * Basado en el esquema proporcionado
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
  sets: number;
  reps: string;
  rest_seconds: number | null;
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
  assigned_at: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  routine?: Routine;
}

export interface Student {
  id: string;
  user_id: string;
  coach_id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
}

export interface CoachDatabase {
  public: {
    Tables: {
      students: {
        Row: Student;
      };
      routines: {
        Row: Routine;
      };
      routine_days: {
        Row: RoutineDay;
      };
      routine_exercises: {
        Row: RoutineExercise;
      };
      exercises: {
        Row: Exercise;
      };
      routine_assignments: {
        Row: RoutineAssignment;
      };
    };
  };
}

// Types for UI
export interface AlumnoRoutineWithDetails extends RoutineAssignment {
  routine: Routine & {
    routine_days: (RoutineDay & {
      routine_exercises: (RoutineExercise & {
        exercise: Exercise;
      })[];
    })[];
  };
}
