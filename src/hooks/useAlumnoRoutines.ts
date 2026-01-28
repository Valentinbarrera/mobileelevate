/**
 * Hook para obtener las rutinas asignadas al alumno autenticado
 * Consulta el proyecto Coach y filtra por student_id y status = 'active'
 */
import { useQuery } from "@tanstack/react-query";
import { coachSupabase } from "@/integrations/coach/client";
import type { AlumnoRoutineWithDetails, Routine, RoutineDay, RoutineExercise } from "@/integrations/coach/types";

interface UseAlumnoRoutinesOptions {
  studentId: string | null;
  status?: 'active' | 'completed' | 'paused' | 'all';
}

export function useAlumnoRoutines({ studentId, status = 'active' }: UseAlumnoRoutinesOptions) {
  return useQuery({
    queryKey: ['alumno-routines', studentId, status],
    queryFn: async (): Promise<AlumnoRoutineWithDetails[]> => {
      if (!studentId) {
        return [];
      }

      // Build the query
      let query = coachSupabase
        .from('routine_assignments')
        .select(`
          *,
          routine:routines (
            *,
            routine_days (
              *,
              routine_exercises (
                *,
                exercise:exercises (*)
              )
            )
          )
        `)
        .eq('student_id', studentId)
        .order('assigned_at', { ascending: false });

      // Filter by status if not 'all'
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching alumno routines:', error);
        throw new Error(`Error al cargar rutinas: ${error.message}`);
      }

      // Sort routine_days by day_number and routine_exercises by order_index
      const sortedData = (data || []).map((assignment: any) => ({
        ...assignment,
        routine: assignment.routine ? {
          ...assignment.routine,
          routine_days: (assignment.routine.routine_days || [])
            .sort((a: RoutineDay, b: RoutineDay) => (a.day_number || 0) - (b.day_number || 0))
            .map((day: any) => ({
              ...day,
              routine_exercises: (day.routine_exercises || [])
                .sort((a: RoutineExercise, b: RoutineExercise) => (a.order_index || 0) - (b.order_index || 0))
            }))
        } : null
      })) as AlumnoRoutineWithDetails[];

      return sortedData;
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for fetching a single routine with full details
export function useAlumnoRoutineDetail(routineId: string | null) {
  return useQuery({
    queryKey: ['alumno-routine-detail', routineId],
    queryFn: async () => {
      if (!routineId) return null;

      const { data, error } = await coachSupabase
        .from('routines')
        .select(`
          *,
          routine_days (
            *,
            routine_exercises (
              *,
              exercise:exercises (*)
            )
          )
        `)
        .eq('id', routineId)
        .single();

      if (error) {
        console.error('Error fetching routine detail:', error);
        throw new Error(`Error al cargar rutina: ${error.message}`);
      }

      // Sort days and exercises
      const result = data as any;
      if (result && result.routine_days) {
        result.routine_days = (result.routine_days || [])
          .sort((a: RoutineDay, b: RoutineDay) => (a.day_number || 0) - (b.day_number || 0))
          .map((day: any) => ({
            ...day,
            routine_exercises: (day.routine_exercises || [])
              .sort((a: RoutineExercise, b: RoutineExercise) => (a.order_index || 0) - (b.order_index || 0))
          }));
      }

      return result as Routine & { routine_days: (RoutineDay & { routine_exercises: RoutineExercise[] })[] };
    },
    enabled: !!routineId,
    staleTime: 1000 * 60 * 5,
  });
}
