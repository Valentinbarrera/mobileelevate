/**
 * Hook para obtener datos del Home desde el proyecto Coach
 * Integra rutinas asignadas, día actual y estadísticas
 */
import { useMemo } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSessionOverrides } from "./useSessionOverrides";
import { useAlumnoRoutines } from "./useAlumnoRoutines";
import type { RoutineDay, RoutineExercise, Exercise } from "@/types/coach";
import { MOCK_ROUTINE_ASSIGNMENTS } from "@/lib/mock-data";

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
  /** Próximo día con sesión planificada (para el estado de descanso) */
  nextRoutineDay: TodayRoutineDay | null;
  /** Fecha (YYYY-MM-DD) de la próxima sesión planificada, o null */
  nextSessionDate: string | null;
  allDays: TodayRoutineDay[];
  currentDayIndex: number;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

// Estimate workout duration based on exercises
function estimateDuration(exercises: RoutineExercise[]): number {
  return exercises.reduce((acc, ex) => {
    const setsTime = ex.series * 1.5; // ~1.5 min per set
    const restTime = ((ex.rest || 60) * (ex.series - 1)) / 60;
    return acc + setsTime + restTime;
  }, 0);
}

// Transform routine day to our format
function transformRoutineDay(day: RoutineDay & { routine_exercises: (RoutineExercise & { exercise: Exercise })[] }): TodayRoutineDay {
  const exercises = (day.routine_exercises || []).map(re => ({
    id: re.id,
    exerciseId: re.exercise_id,
    name: re.exercise?.name || re.name || "Ejercicio",
    sets: re.series,
    reps: re.reps,
    restSeconds: re.rest,
    notes: re.notes,
    videoUrl: re.exercise?.video_url || null,
    thumbnail: re.exercise?.thumbnail || re.exercise?.thumbnail_url || null,
    muscleGroup: re.exercise?.muscle_group || re.exercise?.muscle || null,
    equipment: re.exercise?.equipment || null,
  }));

  return {
    id: day.id,
    name: day.day_name || day.name || "Día de entrenamiento",
    dayNumber: day.order_index ?? day.day_number ?? 1,
    description: day.notes,
    exercises,
    totalExercises: exercises.length,
    estimatedDuration: Math.round(estimateDuration(day.routine_exercises || [])),
  };
}

export function useCoachHomeData(): CoachHomeData {
  const { student, isAuthenticated, isAdminMode, loading: authLoading } = useAuthContext();
  const overrideSid = student?.id || (isAdminMode ? "admin" : "anon");
  const { overrides } = useSessionOverrides(overrideSid);

  const {
    data: routines,
    isLoading: routinesLoading,
    error: routinesError
  } = useAlumnoRoutines({
    studentId: isAdminMode ? null : (student?.id || null),
    status: 'active'
  });

  // In admin mode, use mock data
  const effectiveRoutines = isAdminMode ? MOCK_ROUTINE_ASSIGNMENTS as unknown as typeof routines : routines;

  const result = useMemo(() => {
    // Get the first active routine (primary routine)
    const activeAssignment = effectiveRoutines?.[0];
    
    if (!activeAssignment?.routine) {
      return {
        activeRoutine: null,
        todayRoutineDay: null,
        nextRoutineDay: null,
        nextSessionDate: null,
        allDays: [],
        currentDayIndex: 0,
      };
    }

    const routine = activeAssignment.routine;
    const days = routine.routine_days || [];

    // Transform all days
    const allDays = days.map(day => transformRoutineDay(day as RoutineDay & { routine_exercises: (RoutineExercise & { exercise: Exercise })[] }));

    // Determine today's routine day using planned_sessions (source of truth)
    // planned_sessions has exact date→routine_day_id mapping generated at assignment time
    // Use local date (not UTC) — toISOString() shifts timezone, format manually
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const plannedSessions = activeAssignment.planned_sessions || [];
    const todaySession = plannedSessions.find(s => s.date === todayStr);

    let currentDayIndex = todaySession
      ? days.findIndex(d => d.id === todaySession.routine_day_id)
      : -1; // genuine rest day — no session planned for today

    // Override local del alumno (reprogramar / swap / descanso) — pisa el plan
    const todayOverride = overrides[todayStr];
    if (todayOverride === "rest") {
      currentDayIndex = -1;
    } else if (todayOverride) {
      const oi = days.findIndex(d => d.id === todayOverride);
      if (oi !== -1) currentDayIndex = oi;
    }

    const todayDay = currentDayIndex !== -1 ? allDays[currentDayIndex] : null;

    // Próxima sesión planificada a futuro (la más cercana). Fallback: 1er día del plan.
    const futurePlanned = plannedSessions
      .filter(s => s.date > todayStr)
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    const nextPlanned = futurePlanned[0];
    const nextDayIndex = nextPlanned ? days.findIndex(d => d.id === nextPlanned.routine_day_id) : -1;
    const nextRoutineDay = nextDayIndex !== -1 ? allDays[nextDayIndex] : (allDays[0] ?? null);
    const nextSessionDate = nextPlanned?.date ?? null;

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
      nextRoutineDay,
      nextSessionDate,
      allDays,
      currentDayIndex: currentDayIndex !== -1 ? currentDayIndex : 0,
    };
  }, [effectiveRoutines, overrides]);

  return {
    ...result,
    loading: isAdminMode ? false : (authLoading || routinesLoading),
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
