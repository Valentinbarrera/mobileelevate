/**
 * Hook para obtener datos del Home desde el proyecto Coach
 * Integra rutinas asignadas, día actual y estadísticas
 */
import { useMemo } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAlumnoRoutines } from "./useAlumnoRoutines";
import type { RoutineDay, RoutineExercise, Exercise } from "@/types/coach";

export interface TodayRoutineDay {
  id: string;
  name: string;
  dayNumber: number;
  description: string | null;
  exercises: {
    id: string;
    exerciseId: string;
    name: string;
    sets: number;
    reps: string;
    restSeconds: number | null;
    notes: string | null;
    videoUrl: string | null;
    thumbnail: string | null;
    muscleGroup: string | null;
    equipment: string | null;
  }[];
  totalExercises: number;
  estimatedDuration: number; // in minutes
}

export interface ActiveRoutineInfo {
  id: string;
  assignmentId: string;
  name: string;
  description: string | null;
  durationWeeks: number | null;
  difficulty: string | null;
  imageUrl: string | null;
  totalDays: number;
  status: 'active' | 'completed' | 'paused';
  startDate: string | null;
}

export interface CoachHomeData {
  activeRoutine: ActiveRoutineInfo | null;
  todayRoutineDay: TodayRoutineDay | null;
  allDays: TodayRoutineDay[];
  currentDayIndex: number;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

// Estimate workout duration based on exercises
function estimateDuration(exercises: RoutineExercise[]): number {
  return exercises.reduce((acc, ex) => {
    const setsTime = ex.sets * 1.5; // ~1.5 min per set
    const restTime = ((ex.rest_seconds || 60) * (ex.sets - 1)) / 60;
    return acc + setsTime + restTime;
  }, 0);
}

// Transform routine day to our format
function transformRoutineDay(day: RoutineDay & { routine_exercises: (RoutineExercise & { exercise: Exercise })[] }): TodayRoutineDay {
  const exercises = (day.routine_exercises || []).map(re => ({
    id: re.id,
    exerciseId: re.exercise_id,
    name: re.exercise?.name || "Ejercicio",
    sets: re.sets,
    reps: re.reps,
    restSeconds: re.rest_seconds,
    notes: re.notes,
    videoUrl: re.exercise?.video_url || null,
    thumbnail: re.exercise?.thumbnail || null,
    muscleGroup: re.exercise?.muscle_group || null,
    equipment: re.exercise?.equipment || null,
  }));

  return {
    id: day.id,
    name: day.name,
    dayNumber: day.day_number,
    description: day.description,
    exercises,
    totalExercises: exercises.length,
    estimatedDuration: Math.round(estimateDuration(day.routine_exercises || [])),
  };
}

export function useCoachHomeData(): CoachHomeData {
  const { student, isAuthenticated, loading: authLoading } = useAuthContext();
  
  const { 
    data: routines, 
    isLoading: routinesLoading, 
    error: routinesError 
  } = useAlumnoRoutines({ 
    studentId: student?.id || null, 
    status: 'active' 
  });

  const result = useMemo(() => {
    // Get the first active routine (primary routine)
    const activeAssignment = routines?.[0];
    
    if (!activeAssignment?.routine) {
      return {
        activeRoutine: null,
        todayRoutineDay: null,
        allDays: [],
        currentDayIndex: 0,
      };
    }

    const routine = activeAssignment.routine;
    const days = routine.routine_days || [];

    // Transform all days
    const allDays = days.map(day => transformRoutineDay(day as RoutineDay & { routine_exercises: (RoutineExercise & { exercise: Exercise })[] }));

    // Determine current day based on day of week (1-7, Monday-Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday from 0 to 7
    
    // Find the day that matches today, or use first day as fallback
    let currentDayIndex = days.findIndex(d => d.day_number === dayOfWeek);
    if (currentDayIndex === -1) {
      // If no exact match, find closest day or use day 1
      currentDayIndex = 0;
    }

    const todayDay = allDays[currentDayIndex] || null;

    const activeRoutine: ActiveRoutineInfo = {
      id: routine.id,
      assignmentId: activeAssignment.id,
      name: routine.name,
      description: routine.description,
      durationWeeks: routine.duration_weeks,
      difficulty: routine.difficulty,
      imageUrl: routine.image_url,
      totalDays: days.length,
      status: activeAssignment.status,
      startDate: activeAssignment.start_date,
    };

    return {
      activeRoutine,
      todayRoutineDay: todayDay,
      allDays,
      currentDayIndex,
    };
  }, [routines]);

  return {
    ...result,
    loading: authLoading || routinesLoading,
    error: routinesError as Error | null,
    isAuthenticated,
  };
}

// Helper hook to get a specific routine day for workout
export function useRoutineDayForWorkout(routineDayId: string | null) {
  const { allDays } = useCoachHomeData();
  
  return useMemo(() => {
    if (!routineDayId) return null;
    return allDays.find(d => d.id === routineDayId) || null;
  }, [allDays, routineDayId]);
}
