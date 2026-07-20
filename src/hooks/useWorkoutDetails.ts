/**
 * Hook que arma el HISTORIAL de entrenos del alumno y la PROGRESIÓN de kilos
 * por ejercicio, con una sola lectura de Supabase.
 *
 * Fuentes: completed_sessions (id, date, notes, total_tonnage) +
 *          completed_exercises (completed_session_id, series, weight, reps,
 *          routine_exercises(name)).
 *
 * En modo admin/demo usa los mocks (MOCK_COMPLETED_SESSIONS/EXERCISES) con la
 * MISMA forma que la query real, así el resto del hook no se ramifica.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { MOCK_COMPLETED_SESSIONS, MOCK_COMPLETED_EXERCISES } from "@/lib/mock-data";
import { fetchOwnWorkoutHistory } from "@/lib/ownWorkoutsApi";

/** Una serie cargada dentro de un ejercicio de una sesión. */
export interface SessionSet {
  series: number;
  weight: number | null;
  reps: number;
}

/** Un ejercicio dentro de una sesión, con sus series. */
export interface SessionExercise {
  name: string;
  sets: SessionSet[];
  topWeight: number | null;
}

/** Un entreno completado, listo para listar y desplegar. */
export interface SessionDetail {
  id: string;
  date: string;
  name: string;
  tonnage: number | null;
  exercises: SessionExercise[];
  exerciseCount: number;
  setCount: number;
}

export interface ExerciseProgressPoint {
  date: string;
  topWeight: number;
  reps: number;
}

/** Progresión de un ejercicio: el mejor peso de cada día + el PR histórico. */
export interface ExerciseProgress {
  name: string;
  points: ExerciseProgressPoint[];
  pr: number;
}

interface SessionRow {
  id: string;
  date: string;
  total_tonnage: number | null;
  notes: string | null;
}
interface ExerciseRow {
  completed_session_id: string;
  series: number | null;
  weight: number | null;
  reps: number | null;
  routine_exercises: { name: string } | null;
}

function build(sessions: SessionRow[], exercises: ExerciseRow[]) {
  const sessionById = new Map(sessions.map((s) => [s.id, s]));

  // ── Detalle por sesión (lista de entrenos) ──────────────────────────────
  const exsBySession = new Map<string, Map<string, SessionExercise>>();
  exercises.forEach((row) => {
    const name = row.routine_exercises?.name;
    if (!name || !sessionById.has(row.completed_session_id)) return;
    let byName = exsBySession.get(row.completed_session_id);
    if (!byName) {
      byName = new Map();
      exsBySession.set(row.completed_session_id, byName);
    }
    let ex = byName.get(name);
    if (!ex) {
      ex = { name, sets: [], topWeight: null };
      byName.set(name, ex);
    }
    ex.sets.push({ series: row.series ?? ex.sets.length + 1, weight: row.weight, reps: row.reps ?? 0 });
    if (row.weight != null && (ex.topWeight == null || row.weight > ex.topWeight)) {
      ex.topWeight = row.weight;
    }
  });

  const detailedSessions: SessionDetail[] = sessions.map((s) => {
    const byName = exsBySession.get(s.id);
    const exList = byName ? [...byName.values()] : [];
    exList.forEach((e) => e.sets.sort((a, b) => a.series - b.series));
    return {
      id: s.id,
      date: s.date,
      name: s.notes || "Entrenamiento",
      tonnage: s.total_tonnage,
      exercises: exList,
      exerciseCount: exList.length,
      setCount: exList.reduce((n, e) => n + e.sets.length, 0),
    };
  });
  // más reciente primero
  detailedSessions.sort((a, b) => (a.date < b.date ? 1 : -1));

  // ── Progresión por ejercicio (el mejor peso de cada día) ────────────────
  const byExercise = new Map<string, Map<string, ExerciseProgressPoint>>();
  exercises.forEach((row) => {
    const name = row.routine_exercises?.name;
    const session = sessionById.get(row.completed_session_id);
    if (!name || !session || row.weight == null || row.weight <= 0) return;
    let perDay = byExercise.get(name);
    if (!perDay) {
      perDay = new Map();
      byExercise.set(name, perDay);
    }
    const existing = perDay.get(session.date);
    if (!existing || row.weight > existing.topWeight) {
      perDay.set(session.date, { date: session.date, topWeight: row.weight, reps: row.reps ?? 0 });
    }
  });

  const exerciseProgress: ExerciseProgress[] = [...byExercise.entries()]
    .map(([name, perDay]) => {
      const points = [...perDay.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
      const pr = points.reduce((m, p) => (p.topWeight > m ? p.topWeight : m), 0);
      return { name, points, pr };
    })
    // primero los que más sesiones tienen (mejor gráfico)
    .sort((a, b) => b.points.length - a.points.length || b.pr - a.pr);

  return { sessions: detailedSessions, exerciseProgress };
}

export function useWorkoutDetails() {
  const { student, isAdminMode } = useAuthContext();

  const { data, isLoading } = useQuery({
    queryKey: ["workout-details", isAdminMode ? "admin" : student?.id],
    enabled: isAdminMode || !!student?.id,
    queryFn: async () => {
      if (isAdminMode) {
        return build(
          MOCK_COMPLETED_SESSIONS.map((s) => ({
            id: s.id,
            date: s.date,
            total_tonnage: s.total_tonnage,
            notes: s.notes,
          })),
          MOCK_COMPLETED_EXERCISES as ExerciseRow[]
        );
      }

      if (!student?.id) return { sessions: [], exerciseProgress: [] };

      // Los entrenos de programas PROPIOS viven en otras tablas (ver
      // ownWorkoutsApi) pero llegan con la misma forma, así que se concatenan y
      // `build` los trata igual: el historial y los PRs salen unificados.
      const own = await fetchOwnWorkoutHistory(student.id, 60);

      // Dos pasos (evita problemas de RLS con joins anidados), igual que usePRData
      const { data: sessions, error: sErr } = await supabase
        .from("completed_sessions")
        .select("id, date, total_tonnage, notes")
        .eq("student_id", student.id)
        .order("date", { ascending: false })
        .limit(60);

      if (sErr || !sessions?.length) {
        return build(own.sessions as SessionRow[], own.exercises as ExerciseRow[]);
      }

      const sessionIds = sessions.map((s) => s.id);
      const { data: exercises, error: eErr } = await supabase
        .from("completed_exercises")
        .select("completed_session_id, series, weight, reps, routine_exercises(name)")
        .in("completed_session_id", sessionIds);

      if (eErr && import.meta.env.DEV) console.error("Error fetching workout details:", eErr);

      return build(
        [...(sessions as SessionRow[]), ...(own.sessions as SessionRow[])],
        [...(((exercises as unknown) as ExerciseRow[]) || []), ...(own.exercises as ExerciseRow[])]
      );
    },
  });

  return {
    sessions: data?.sessions ?? [],
    exerciseProgress: data?.exerciseProgress ?? [],
    loading: isLoading,
  };
}
