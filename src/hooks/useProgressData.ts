/**
 * Hook para obtener datos de progreso del alumno
 * Consulta completed_sessions de Elevate Web Supabase
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

interface WorkoutHistoryItem {
  id: string;
  workoutName: string;
  completedAt: string;
  duration: number;
}

interface WeeklyVolume {
  week: string;
  volume: number;
}

export function useProgressData() {
  const { student } = useAuthContext();
  const [weeklyVolume, setWeeklyVolume] = useState<WeeklyVolume[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [totalMinutesThisWeek, setTotalMinutesThisWeek] = useState(0);
  const [activeDaysThisMonth, setActiveDaysThisMonth] = useState<number[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const calculateStreak = (sessions: { completed_at: string }[]): number => {
    if (!sessions.length) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);

    const sessionDates = new Set(
      sessions.map(s => {
        const date = new Date(s.completed_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    while (sessionDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    if (streak === 0) {
      checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1);
      while (sessionDates.has(checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    return streak;
  };

  const fetchProgressData = useCallback(async () => {
    if (!student) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch completed sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("completed_sessions")
        .select("id, completed_at, duration_seconds, notes, routine_id")
        .eq("student_id", student.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(50);

      if (sessionsError) throw sessionsError;

      // Workout history
      const history: WorkoutHistoryItem[] = (sessions || []).map(s => ({
        id: s.id,
        workoutName: s.notes || "Entrenamiento",
        completedAt: s.completed_at!,
        duration: s.duration_seconds || 0,
      }));
      setWorkoutHistory(history);

      // Streak
      const streak = calculateStreak(
        (sessions || []).filter(s => s.completed_at) as { completed_at: string }[]
      );
      setCurrentStreak(streak);

      // Active days this month
      const now = new Date();
      const thisMonthSessions = (sessions || []).filter(s => {
        const sessionDate = new Date(s.completed_at!);
        return sessionDate.getMonth() === now.getMonth() &&
               sessionDate.getFullYear() === now.getFullYear();
      });

      const activeDays = [...new Set(thisMonthSessions.map(s => {
        return new Date(s.completed_at!).getDate();
      }))];
      setActiveDaysThisMonth(activeDays);

      // Weekly stats
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

      const thisWeekSessions = (sessions || []).filter(s =>
        new Date(s.completed_at!) >= startOfWeek
      );

      const totalMinutes = thisWeekSessions.reduce(
        (acc, s) => acc + (s.duration_seconds || 0) / 60, 0
      );
      setTotalMinutesThisWeek(Math.round(totalMinutes));

      // Weekly volume (sessions per week as proxy)
      const volumeByWeek: { [key: string]: number } = {};
      (sessions || []).forEach(s => {
        const date = new Date(s.completed_at!);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1);
        const weekKey = weekStart.toISOString().split('T')[0];
        volumeByWeek[weekKey] = (volumeByWeek[weekKey] || 0) + 1;
      });

      const volumeData = Object.entries(volumeByWeek)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-8)
        .map(([week, volume]) => ({ week, volume }));

      setWeeklyVolume(volumeData);

    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  return {
    weeklyVolume,
    workoutHistory,
    totalMinutesThisWeek,
    activeDaysThisMonth,
    currentStreak,
    loading,
    refetch: fetchProgressData,
  };
}
