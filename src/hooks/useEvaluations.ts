/**
 * Evaluaciones de antropometría del alumno logueado.
 *
 * Lee de localStorage (instantáneo, funciona sin red y en modo demo) y en el
 * primer render intenta traer de la nube lo que no esté local — por ejemplo lo
 * que cargó el coach desde la web, o lo propio después de reinstalar.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  listEvaluations,
  saveEvaluation as persistEvaluation,
  deleteEvaluation as removeEvaluation,
  hydrateEvaluations,
  type AnthropometryEvaluation,
} from "@/lib/evaluations";
import type { MeasurementValues } from "@/types/evaluation";

export function useEvaluations() {
  const { student, isAdminMode } = useAuthContext();
  const studentId = student?.id || (isAdminMode ? "admin" : "anon");

  const [evaluations, setEvaluations] = useState<AnthropometryEvaluation[]>(() =>
    listEvaluations(studentId)
  );

  useEffect(() => {
    setEvaluations(listEvaluations(studentId));
    let cancelled = false;
    hydrateEvaluations(studentId).then((merged) => {
      if (!cancelled && merged) setEvaluations(merged);
    });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const save = useCallback(
    (input: { date: string; values: MeasurementValues; sourceFileName?: string | null }) => {
      const entry = persistEvaluation(studentId, input);
      setEvaluations(listEvaluations(studentId));
      return entry;
    },
    [studentId]
  );

  const remove = useCallback(
    (id: string) => {
      removeEvaluation(studentId, id);
      setEvaluations(listEvaluations(studentId));
    },
    [studentId]
  );

  /** La más reciente y la anterior, que es contra la que se comparan los deltas. */
  const [latest, previous] = useMemo(
    () => [evaluations[0] ?? null, evaluations[1] ?? null],
    [evaluations]
  );

  return { evaluations, latest, previous, save, remove, studentId };
}
