/**
 * Types for the Workout feature (UI-facing exercise model)
 */

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  restSeconds: number;
  notes?: string;
  videoUrl?: string;
  thumbnail?: string;
  completed: boolean;
  currentSet: number;
}
