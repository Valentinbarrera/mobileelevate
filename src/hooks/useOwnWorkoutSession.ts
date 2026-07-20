/**
 * Sesión de entrenamiento para los PROGRAMAS PROPIOS del alumno.
 *
 * Expone la MISMA superficie que `useCoachWorkoutSession` (session, startSession,
 * resumeSession, completeSet, updateSet, deleteSet, finishSession) para que la
 * pantalla de entreno sea una sola y no haya dos experiencias distintas según de
 * quién sea el programa.
 *
 * Va contra tablas propias (`own_workout_sessions` / `own_workout_sets`) porque
 * las del coach no admiten estos entrenos: `completed_sessions` exige un
 * `planned_session_id` y `completed_exercises.routine_exercise_id` es FK a la
 * rutina del coach. Requiere correr `scripts/setup-own-workouts.sql`; hasta
 * entonces la sesión corre en modo local (se registra igual en el historial
 * local, que alimenta PRs y "la vez pasada").
 */
import { useState, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getLocalDateString } from "@/lib/date";
import { logSet, updateLoggedSet, deleteLoggedSet } from "@/lib/workoutLog";
import {
  startOwnSession,
  logOwnSet,
  updateOwnSet,
  deleteOwnSet,
  finishOwnSession,
} from "@/lib/ownWorkoutsApi";
import { toast } from "sonner";

interface SessionExerciseLike {
  id: string;
  exerciseId: string;
  name: string;
}

interface CompletedSet {
  setNumber: number;
  weight: number;
  reps: number;
  completedAt: Date;
}

/** Misma forma que la sesión del coach: la reusa el snapshot de "reanudar". */
interface OwnWorkoutSession {
  id: string;
  plannedSessionId: string | null;
  routineDayId: string;
  date: string;
}

/** Sesión efímera: se entrena igual, pero no se guarda en la nube. */
const LOCAL_SESSION_ID = "local-own";

export function useOwnWorkoutSession(
  dayKey: string,
  program: { id: string; name: string } | null,
  dayName: string | null
) {
  const { student, isAdminMode } = useAuthContext();
  const [session, setSession] = useState<OwnWorkoutSession | null>(null);
  const [loading, setLoading] = useState(false);

  const sid = student?.id || (isAdminMode ? "admin" : "anon");

  const resumeSession = useCallback((s: OwnWorkoutSession) => {
    setSession(s);
  }, []);

  const startSession = useCallback(async () => {
    const date = getLocalDateString();
    const local: OwnWorkoutSession = {
      id: LOCAL_SESSION_ID,
      plannedSessionId: null,
      routineDayId: dayKey,
      date,
    };

    if (isAdminMode || !student) {
      setSession(local);
      return local;
    }

    setLoading(true);
    try {
      const remote = await startOwnSession(student.id, {
        programId: program?.id ?? null,
        programName: program?.name ?? null,
        dayName,
        date,
      });
      // Sin tabla todavía (o sin red): entrenamos igual, guardando local.
      const next: OwnWorkoutSession = remote
        ? { id: remote.id, plannedSessionId: null, routineDayId: dayKey, date }
        : local;
      if (!remote) toast.info("Entrenamiento sin guardar en la nube (se registra en este teléfono)");
      setSession(next);
      return next;
    } finally {
      setLoading(false);
    }
  }, [student, isAdminMode, dayKey, program, dayName]);

  const completeSet = useCallback(
    async (
      exercise: SessionExerciseLike,
      setNumber: number,
      weight: number,
      reps: number,
      _difficulty: string,
      _localOnly = false
    ): Promise<CompletedSet | null> => {
      if (!session) return null;

      // El historial local se escribe SIEMPRE: es lo que alimenta PRs,
      // "la vez pasada" y el progreso por ejercicio, persista o no en la nube.
      logSet(sid, { exerciseId: exercise.id, date: session.date, setNumber, weight, reps });

      if (session.id !== LOCAL_SESSION_ID) {
        await logOwnSet(session.id, {
          exerciseId: exercise.exerciseId || null,
          exerciseName: exercise.name,
          series: setNumber,
          reps,
          weight,
        });
      }
      return { setNumber, weight, reps, completedAt: new Date() };
    },
    [session, sid]
  );

  const updateSet = useCallback(
    async (
      exerciseId: string,
      setNumber: number,
      weight: number,
      reps: number,
      exerciseName?: string
    ): Promise<boolean> => {
      if (!session) return false;
      updateLoggedSet(sid, exerciseId, session.date, setNumber, { weight, reps });
      if (session.id !== LOCAL_SESSION_ID && exerciseName) {
        await updateOwnSet(session.id, exerciseName, setNumber, { reps, weight });
      }
      return true;
    },
    [session, sid]
  );

  const deleteSet = useCallback(
    async (exerciseId: string, setNumber: number, exerciseName?: string): Promise<boolean> => {
      if (!session) return false;
      deleteLoggedSet(sid, exerciseId, session.date, setNumber);
      if (session.id !== LOCAL_SESSION_ID && exerciseName) {
        await deleteOwnSet(session.id, exerciseName, setNumber);
      }
      return true;
    },
    [session, sid]
  );

  const finishSession = useCallback(
    async (totalDurationSeconds: number, notes?: string) => {
      if (!session) return null;
      if (session.id === LOCAL_SESSION_ID) {
        toast.success("¡Entrenamiento completado!");
        return { id: LOCAL_SESSION_ID };
      }
      const ok = await finishOwnSession(session.id, totalDurationSeconds, notes ?? null);
      toast[ok ? "success" : "error"](
        ok ? "¡Entrenamiento completado!" : "No se pudo cerrar la sesión"
      );
      return ok ? { id: session.id } : null;
    },
    [session]
  );

  return { session, loading, startSession, resumeSession, completeSet, updateSet, deleteSet, finishSession };
}
