/**
 * Hook para obtener las rutinas asignadas al alumno autenticado
 * Consulta el proyecto Coach y filtra por student_id y status = 'active'
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AlumnoRoutineWithDetails, PlannedSession, Routine, RoutineAssignment, RoutineDay, RoutineExercise } from "@/types/coach";

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
      // Columnas explícitas (no `*`) para no traer texto pesado ni columnas
      // que la UI del alumno nunca usa. Se listan SOLO columnas reales del
      // esquema (ej. routines usa `id/name/description`; los alias
      // duration_weeks/difficulty/image_url no existen en la DB y el código
      // ya los lee como undefined, así que se omiten sin cambiar el render).
      // exercises: se incluyen description/instructions porque el flujo de
      // entreno (CoachExerciseCard/CoachExerciseListItem → TechniqueBlock,
      // vía useCoachHomeData) sí los muestra.
      let query = supabase
        .from('routine_assignments')
        .select(`
          id,
          routine_id,
          student_id,
          status,
          start_date,
          created_at,
          planned_sessions (
            id,
            date,
            routine_day_id,
            student_id,
            assignment_id
          ),
          routine:routines (
            id,
            name,
            description,
            routine_days (
              id,
              routine_id,
              order_index,
              day_name,
              notes,
              routine_exercises (
                id,
                routine_day_id,
                exercise_id,
                name,
                series,
                reps,
                weight,
                rest,
                rir,
                tempo,
                type,
                training_method,
                intensity_modifier,
                notes,
                order_index,
                exercise:exercises (
                  id,
                  name,
                  video_url,
                  thumbnail_url,
                  muscle,
                  equipment,
                  description,
                  instructions
                )
              )
            )
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      // Filter by status if not 'all'
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        if (import.meta.env.DEV) console.error('Error fetching alumno routines:', error);
        throw new Error(`Error al cargar rutinas: ${error.message}`);
      }

      // Sort routine_days by order_index and routine_exercises by order_index
      type RawAssignment = RoutineAssignment & {
        planned_sessions: PlannedSession[];
        routine: (Routine & { routine_days: (RoutineDay & { routine_exercises: RoutineExercise[] })[] }) | null;
      };
      const rawData = (data || []) as unknown as RawAssignment[];
      const sortedData = rawData.map((assignment) => ({
        ...assignment,
        planned_sessions: assignment.planned_sessions || [],
        routine: assignment.routine ? {
          ...assignment.routine,
          routine_days: (assignment.routine.routine_days || [])
            .sort((a: RoutineDay, b: RoutineDay) => (a.order_index || 0) - (b.order_index || 0))
            .map((day: RoutineDay & { routine_exercises: RoutineExercise[] }) => ({
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

      // Mismas columnas explícitas que el listado (misma forma anidada) para
      // no traer columnas que la UI no usa. Un solo routine, a demanda.
      const { data, error } = await supabase
        .from('routines')
        .select(`
          id,
          name,
          description,
          routine_days (
            id,
            routine_id,
            order_index,
            day_name,
            notes,
            routine_exercises (
              id,
              routine_day_id,
              exercise_id,
              name,
              series,
              reps,
              weight,
              rest,
              rir,
              tempo,
              type,
              training_method,
              intensity_modifier,
              notes,
              order_index,
              exercise:exercises (
                id,
                name,
                video_url,
                thumbnail_url,
                muscle,
                equipment,
                description,
                instructions
              )
            )
          )
        `)
        .eq('id', routineId)
        .single();

      if (error) {
        if (import.meta.env.DEV) console.error('Error fetching routine detail:', error);
        throw new Error(`Error al cargar rutina: ${error.message}`);
      }

      // Sort days and exercises
      type RoutineWithDays = Routine & { routine_days: (RoutineDay & { routine_exercises: RoutineExercise[] })[] };
      const result = data as unknown as RoutineWithDays;
      if (result && result.routine_days) {
        result.routine_days = (result.routine_days || [])
          .sort((a: RoutineDay, b: RoutineDay) => (a.order_index || 0) - (b.order_index || 0))
          .map((day: RoutineDay & { routine_exercises: RoutineExercise[] }) => ({
            ...day,
            routine_exercises: (day.routine_exercises || [])
              .sort((a: RoutineExercise, b: RoutineExercise) => (a.order_index || 0) - (b.order_index || 0))
          }));
      }

      return result;
    },
    enabled: !!routineId,
    staleTime: 1000 * 60 * 5,
  });
}
