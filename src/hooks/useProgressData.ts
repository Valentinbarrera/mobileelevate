/**
 * Hook para obtener datos de progreso del alumno
 * Consulta completed_sessions de Elevate Web Supabase
 * Schema: completed_sessions tiene date (YYYY-MM-DD), total_tonnage, notes
 *         NO tiene completed_at ni duration_seconds
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

interface WorkoutHistoryItem {
  id: string;
  workoutName: string;
  date: string;
  totalTonnage: number | null;
}

interface WeeklyVolume {
  week: string;
  volume: number;
}

export function useProgressData() {
  const { student } = useAuthContext();
  const [weeklyVolume, setWeeklyVolume] = useState<WeeklyVolume[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [sessionsThisWeek, setSessionsThisWeek] = useState(0);
  const [activeDaysThisMonth, setActiveDaysThisMonth] = useState<number[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const calculateStreak = (sessions: { date: string }[]): number => {
    if (!sessions.length) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const sessionDates = new Set(sessions.map(s => s.date));

    let streak = 0;
    let checkDate = new Date(today);

    // Check from today backwards
    while (sessionDates.has(checkDate.toISOString().split('T')[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // If no session today, check from yesterday
    if (streak === 0) {
      checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1);
      while (sessionDates.has(checkDate.toISOString().split('T')[0])) {
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
      const { data: sessions, error: sessionsError } = await supabase
        .from("completed_sessions")
        .select("id, date, total_tonnage, notes")
        .eq("student_id", student.id)
        .order("date", { ascending: false })
        .limit(50);

      if (sessionsError) throw sessionsError;

      // Workout history
      const history: WorkoutHistoryItem[] = (sessions || []).map(s => ({
        id: s.id,
        workoutName: s.notes || "Entrenamiento",
        date: s.date,
        totalTonnage: s.total_tonnage,
      }));
      setWorkoutHistory(history);

      // Streak
      const streak = calculateStreak(sessions || []);
      setCurrentStreak(streak);

      // Active days this month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const thisMonthSessions = (sessions || []).filter(s => {
        const [year, month] = s.date.split('-').map(Number);
        return month - 1 === currentMonth && year === currentYear;
      });

      const activeDays = [...new Set(thisMonthSessions.map(s => {
        return parseInt(s.date.split('-')[2], 10);
      }))];
      setActiveDaysThisMonth(activeDays);

      // Sessions this week
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      const dayOfWeek = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const startDateStr = startOfWeek.toISOString().split('T')[0];

      const thisWeekSessions = (sessions || []).filter(s => s.date >= startDateStr);
      setSessionsThisWeek(thisWeekSessions.length);

      // Weekly volume (sessions count per week)
      const volumeByWeek: { [key: string]: number } = {};
      (sessions || []).forEach(s => {
        const date = new Date(s.date + 'T00:00:00');
        const dow = date.getDay();
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - (dow === 0 ? 6 : dow - 1));
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
    sessionsThisWeek,
    activeDaysThisMonth,
    currentStreak,
    loading,
    refetch: fetchProgressData,
  };
}
