import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { PersonalRecord, ExerciseHistory, WorkoutSession } from "@/types/database";

interface PRDisplay {
  id: string;
  name: string;
  value: string;
  unit: string;
  improvedDate: string;
  icon: 'strength' | 'cardio';
  exerciseId: string;
}

interface WeeklyVolume {
  week: string;
  volume: number;
}

interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  history: {
    date: string;
    maxWeight: number;
    totalVolume: number;
    totalReps: number;
  }[];
}

interface WorkoutHistoryItem {
  id: string;
  workoutName: string;
  completedAt: string;
  duration: number;
  exercisesCompleted: number;
  totalVolume: number;
}

export function useProgressData() {
  const { user } = useAuth();
  const [personalRecords, setPersonalRecords] = useState<PRDisplay[]>([]);
  const [weeklyVolume, setWeeklyVolume] = useState<WeeklyVolume[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [fitnessScore, setFitnessScore] = useState(0);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [weightTrend, setWeightTrend] = useState<number>(0);
  const [totalMinutesThisWeek, setTotalMinutesThisWeek] = useState(0);
  const [activeDaysThisMonth, setActiveDaysThisMonth] = useState<number[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const formatRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  const calculateFitnessScore = useCallback((
    streak: number,
    weeklyWorkouts: number,
    prCount: number,
    totalVolume: number
  ): number => {
    let score = 50; // Base score
    
    // Streak bonus (max +15)
    score += Math.min(streak * 2, 15);
    
    // Weekly workouts bonus (max +20)
    score += Math.min(weeklyWorkouts * 5, 20);
    
    // PRs bonus (max +10)
    score += Math.min(prCount * 2, 10);
    
    // Volume bonus (max +5)
    score += Math.min(Math.floor(totalVolume / 5000), 5);
    
    return Math.min(score, 100);
  }, []);

  const fetchProgressData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch personal records with exercise names
      const { data: prs, error: prsError } = await supabase
        .from("personal_records")
        .select(`
          *,
          exercises(name, muscle_group)
        `)
        .eq("user_id", user.id)
        .eq("record_type", "max_weight")
        .order("achieved_at", { ascending: false })
        .limit(10);

      if (prsError) throw prsError;

      const formattedPRs: PRDisplay[] = (prs || []).map(pr => ({
        id: pr.id,
        name: (pr.exercises as any)?.name || "Ejercicio",
        value: pr.value.toString(),
        unit: "kg",
        improvedDate: formatRelativeDate(pr.achieved_at),
        icon: ['Pecho', 'Brazos', 'Espalda', 'Hombros'].includes((pr.exercises as any)?.muscle_group) 
          ? 'strength' : 'cardio',
        exerciseId: pr.exercise_id,
      }));
      setPersonalRecords(formattedPRs);

      // Fetch workout sessions for history and stats
      const { data: sessions, error: sessionsError } = await supabase
        .from("workout_sessions")
        .select(`
          *,
          workouts(title)
        `)
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(50);

      if (sessionsError) throw sessionsError;

      // Calculate workout history
      const history: WorkoutHistoryItem[] = (sessions || []).map(session => ({
        id: session.id,
        workoutName: (session.workouts as any)?.title || "Entrenamiento",
        completedAt: session.completed_at!,
        duration: session.total_duration_seconds || 0,
        exercisesCompleted: 0, // Would need additional query
        totalVolume: 0, // Would need additional query
      }));
      setWorkoutHistory(history);

      // Calculate streak
      const streak = calculateStreak(sessions || []);
      setCurrentStreak(streak);

      // Calculate active days this month
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

      // Calculate weekly stats
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

      const thisWeekSessions = (sessions || []).filter(s => 
        new Date(s.completed_at!) >= startOfWeek
      );
      
      const totalMinutes = thisWeekSessions.reduce(
        (acc, s) => acc + (s.total_duration_seconds || 0) / 60, 0
      );
      setTotalMinutesThisWeek(Math.round(totalMinutes));

      // Fetch weekly volume for chart
      const { data: sets, error: setsError } = await supabase
        .from("exercise_sets")
        .select(`
          weight,
          reps,
          completed_at
        `)
        .gte("completed_at", new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000).toISOString());

      if (setsError) throw setsError;

      // Group by week
      const volumeByWeek: { [key: string]: number } = {};
      (sets || []).forEach(set => {
        const date = new Date(set.completed_at);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1);
        const weekKey = weekStart.toISOString().split('T')[0];
        
        volumeByWeek[weekKey] = (volumeByWeek[weekKey] || 0) + (set.weight * set.reps);
      });

      const volumeData = Object.entries(volumeByWeek)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-8)
        .map(([week, volume]) => ({ week, volume }));
      
      setWeeklyVolume(volumeData);

      // Fetch weight from latest check-in
      const { data: checkins, error: checkinsError } = await supabase
        .from("weekly_checkins")
        .select("weight, submitted_at")
        .eq("user_id", user.id)
        .not("weight", "is", null)
        .order("submitted_at", { ascending: false })
        .limit(2);

      if (!checkinsError && checkins && checkins.length > 0) {
        setCurrentWeight(checkins[0].weight);
        if (checkins.length > 1 && checkins[1].weight) {
          setWeightTrend(checkins[0].weight! - checkins[1].weight!);
        }
      }

      // Calculate fitness score
      const totalVolume = Object.values(volumeByWeek).reduce((a, b) => a + b, 0);
      const score = calculateFitnessScore(
        streak,
        thisWeekSessions.length,
        formattedPRs.length,
        totalVolume
      );
      setFitnessScore(score);

    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, calculateFitnessScore]);

  const calculateStreak = (sessions: any[]): number => {
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

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  return {
    personalRecords,
    weeklyVolume,
    workoutHistory,
    fitnessScore,
    currentWeight,
    weightTrend,
    totalMinutesThisWeek,
    activeDaysThisMonth,
    currentStreak,
    loading,
    refetch: fetchProgressData,
  };
}
