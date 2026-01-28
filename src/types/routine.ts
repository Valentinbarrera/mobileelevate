/**
 * Tipos compartidos para la app de rutinas (mock data para UI legacy)
 */
export type RoutineStatus = "pending" | "completed" | "in_progress";
export type TabFilter = "today" | "week" | "completed";

export interface Routine {
  id: string;
  name: string;
  dayLabel: string;
  status: RoutineStatus;
  duration: string;
  intensity: "Principiante" | "Intermedio" | "Avanzado";
  muscleGroups: string[];
  exerciseCount: number;
  xpReward: number;
  thumbnail?: string;
}
