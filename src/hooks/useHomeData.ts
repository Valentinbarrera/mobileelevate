import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Workout, WorkoutSession, ExerciseSet } from "@/types/database";

interface TodayWorkout {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  intensity: string;
  image_url: string | null;
  exerciseCount: number;
}

interface WeeklyStats {
  completedWorkouts: number;
  totalWorkouts: number;
  totalVolume: number;
  totalMinutes: number;
  streak: number;
}

interface UserProgress {
  level: number;
  currentXP: number;
  targetXP: number;
  badge: string;
}

export function useHomeData() {
  const { user } = useAuth();
  const [todayWorkout, setTodayWorkout] = useState<TodayWorkout | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    completedWorkouts: 0,
    totalWorkouts: 5,
    totalVolume: 0,
    totalMinutes: 0,
    streak: 0,
  });
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    currentXP: 0,
    targetXP: 1000,
    badge: "Principiante",
  });
  const [coachMessage, setCoachMessage] = useState<string>("¡Vamos por esa rutina hoy!");
  const [loading, setLoading] = useState(true);

  // Calculate streak from sessions
  const calculateStreak = useCallback((sessions: WorkoutSession[]): number => {
    if (!sessions.length) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let checkDate = new Date(today);
    
    // Sort sessions by date descending
    const sortedSessions = [...sessions]
      .filter(s => s.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());
    
    const sessionDates = new Set(
      sortedSessions.map(s => {
        const date = new Date(s.completed_at!);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );
    
    // Check consecutive days
    while (sessionDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // If today doesn't have a workout, check if yesterday did
    if (streak === 0) {
      checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1);
      while (sessionDates.has(checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    
    return streak;
  }, []);

  // Calculate user level from XP
  const calculateLevel = useCallback((totalVolume: number, completedWorkouts: number): UserProgress => {
    const xp = Math.floor(totalVolume / 10) + (completedWorkouts * 100);
    const level = Math.floor(xp / 1000) + 1;
    const currentXP = xp % 1000;
    const targetXP = 1000;
    
    let badge = "Principiante";
    if (level >= 20) badge = "Elite Athlete";
    else if (level >= 15) badge = "Pro Trainer";
    else if (level >= 10) badge = "Fitness Warrior";
    else if (level >= 5) badge = "Rising Star";
    
    return { level, currentXP, targetXP, badge };
  }, []);

  // Generate coach message based on stats
  const generateCoachMessage = useCallback((stats: WeeklyStats): string => {
    const messages = {
      noWorkouts: [
        "¡Hoy es un buen día para empezar!",
        "Tu cuerpo te lo va a agradecer 💪",
        "El primer paso es el más importante",
      ],
      lowProgress: [
        "¡Vamos! Aún hay tiempo para cumplir tu meta semanal",
        "Cada entrenamiento cuenta, seguí adelante",
        "No importa cuán lento vayas, vas más rápido que el que no empieza",
      ],
      onTrack: [
        "¡Excelente progreso! Mantené el ritmo 🔥",
        "Vas muy bien, no aflojes ahora",
        "Tu consistencia está dando resultados",
      ],
      completed: [
        "¡Meta semanal cumplida! Sos una máquina 💪",
        "¡Increíble semana! Tu dedicación inspira",
        "¡Aplausos! Superaste tu objetivo",
      ],
      highStreak: [
        `¡${stats.streak} días seguidos! Sos imparable`,
        "Tu racha es inspiradora, seguí así",
        "La constancia es tu superpoder",
      ],
    };

    if (stats.streak >= 7) {
      return messages.highStreak[Math.floor(Math.random() * messages.highStreak.length)];
    }
    if (stats.completedWorkouts >= stats.totalWorkouts) {
      return messages.completed[Math.floor(Math.random() * messages.completed.length)];
    }
    if (stats.completedWorkouts >= stats.totalWorkouts * 0.6) {
      return messages.onTrack[Math.floor(Math.random() * messages.onTrack.length)];
    }
    if (stats.completedWorkouts > 0) {
      return messages.lowProgress[Math.floor(Math.random() * messages.lowProgress.length)];
    }
    return messages.noWorkouts[Math.floor(Math.random() * messages.noWorkouts.length)];
  }, []);

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Fetch today's workout (for now, get the first available workout)
      const { data: workouts, error: workoutError } = await supabase
        .from("workouts")
        .select(`
          *,
          workout_exercises(count)
        `)
        .limit(1);

      if (workoutError) throw workoutError;

      if (workouts && workouts.length > 0) {
        const workout = workouts[0];
        setTodayWorkout({
          id: workout.id,
          title: workout.title,
          description: workout.description,
          duration_minutes: workout.duration_minutes,
          intensity: workout.intensity,
          image_url: workout.image_url,
          exerciseCount: (workout.workout_exercises as any)?.[0]?.count || 0,
        });
      }

      // If user is logged in, fetch their stats
      if (user) {
        // Get sessions from this week
        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday

        const { data: sessions, error: sessionsError } = await supabase
          .from("workout_sessions")
          .select("*")
          .eq("user_id", user.id)
          .gte("started_at", startOfWeek.toISOString());

        if (sessionsError) throw sessionsError;

        // Get all user sessions for streak calculation
        const { data: allSessions, error: allSessionsError } = await supabase
          .from("workout_sessions")
          .select("*")
          .eq("user_id", user.id)
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false })
          .limit(60);

        if (allSessionsError) throw allSessionsError;

        // Get total volume from exercise sets
        const { data: sets, error: setsError } = await supabase
          .from("exercise_sets")
          .select(`
            weight,
            reps,
            workout_sessions!inner(user_id)
          `)
          .eq("workout_sessions.user_id", user.id);

        if (setsError) throw setsError;

        const completedSessions = sessions?.filter(s => s.completed_at) || [];
        const totalVolume = sets?.reduce((acc, set) => acc + (set.weight * set.reps), 0) || 0;
        const totalMinutes = completedSessions.reduce((acc, s) => acc + (s.total_duration_seconds || 0), 0) / 60;
        const streak = calculateStreak(allSessions as WorkoutSession[] || []);

        const stats: WeeklyStats = {
          completedWorkouts: completedSessions.length,
          totalWorkouts: 5, // Default goal
          totalVolume,
          totalMinutes: Math.round(totalMinutes),
          streak,
        };

        setWeeklyStats(stats);
        setUserProgress(calculateLevel(totalVolume, completedSessions.length));
        setCoachMessage(generateCoachMessage(stats));
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, calculateStreak, calculateLevel, generateCoachMessage]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  return {
    todayWorkout,
    weeklyStats,
    userProgress,
    coachMessage,
    loading,
    refetch: fetchHomeData,
  };
}
