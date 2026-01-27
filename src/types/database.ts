// Database types for the workout tracking system

export type DifficultyLevel = 'easy' | 'moderate' | 'hard' | 'max_effort';

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string | null;
  thumbnail: string | null;
  video_url: string | null;
  description: string | null;
  created_at: string;
}

export interface Workout {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  intensity: string;
  image_url: string | null;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  target_reps: string;
  target_weight: number | null;
  rest_seconds: number;
  notes: string | null;
  order_index: number;
  created_at: string;
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id: string;
  started_at: string;
  completed_at: string | null;
  total_duration_seconds: number | null;
  notes: string | null;
  overall_difficulty: DifficultyLevel | null;
  created_at: string;
  workout?: Workout;
}

export interface ExerciseSet {
  id: string;
  session_id: string;
  workout_exercise_id: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  difficulty: DifficultyLevel;
  is_pr: boolean;
  notes: string | null;
  completed_at: string;
  created_at: string;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  record_type: 'max_weight' | 'max_reps' | 'max_volume';
  value: number;
  weight: number | null;
  reps: number | null;
  achieved_at: string;
  exercise_set_id: string | null;
  created_at: string;
  exercise?: Exercise;
}

export interface ExerciseHistory {
  id: string;
  user_id: string;
  exercise_id: string;
  session_id: string;
  max_weight: number;
  total_reps: number;
  total_volume: number;
  avg_difficulty: DifficultyLevel | null;
  performed_at: string;
  created_at: string;
  exercise?: Exercise;
}

// Extended types for UI
export interface ExerciseWithTracking extends WorkoutExercise {
  exercise: Exercise;
  completed: boolean;
  currentSet: number;
  completedSets: ExerciseSet[];
  lastPerformance?: {
    weight: number;
    reps: number;
    date: string;
  };
  personalRecord?: {
    maxWeight: number;
    maxReps: number;
    maxVolume: number;
  };
}

export interface ActiveWorkoutState {
  session: WorkoutSession | null;
  exercises: ExerciseWithTracking[];
  activeExerciseId: string | null;
  elapsedTime: number;
  isPaused: boolean;
  showRestTimer: boolean;
  restDuration: number;
}

// Difficulty level helpers
export const difficultyLabels: Record<DifficultyLevel, string> = {
  easy: 'Fácil',
  moderate: 'Moderado',
  hard: 'Difícil',
  max_effort: 'Máximo esfuerzo'
};

export const difficultyColors: Record<DifficultyLevel, string> = {
  easy: 'text-emerald-500 bg-emerald-500/10',
  moderate: 'text-blue-500 bg-blue-500/10',
  hard: 'text-orange-500 bg-orange-500/10',
  max_effort: 'text-red-500 bg-red-500/10'
};
