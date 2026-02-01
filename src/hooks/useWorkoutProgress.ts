/**
 * Hook para manejar el progreso del usuario después de completar un entrenamiento
 * Actualiza XP, nivel, streaks y estadísticas en la base de datos local
 */
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// XP por actividad
const XP_PER_SET = 10;
const XP_PER_EXERCISE = 25;
const XP_WORKOUT_COMPLETION = 100;
const XP_STREAK_BONUS = 50;
const XP_PERFECT_WORKOUT = 75; // 100% ejercicios completados

// Niveles y XP necesario
const LEVEL_THRESHOLDS = [0, 500, 1200, 2500, 5000, 8000, 12000, 18000, 25000, 35000];

function calculateLevel(xp: number): { level: number; currentXP: number; targetXP: number } {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
    if (xp >= LEVEL_THRESHOLDS[i + 1]) {
      level = i + 2;
    } else {
      break;
    }
  }
  
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 10000;
  
  return {
    level,
    currentXP: xp - currentThreshold,
    targetXP: nextThreshold - currentThreshold,
  };
}

interface WorkoutCompletionData {
  exercisesCompleted: number;
  totalExercises: number;
  setsCompleted: number;
  totalSets: number;
  durationSeconds: number;
  totalVolume?: number;
}

export function useWorkoutProgress() {
  const { user } = useAuth();

  const updateProgress = useCallback(async (data: WorkoutCompletionData) => {
    if (!user) return { success: false, xpGained: 0, newLevel: null, streakUpdated: false };

    try {
      // Calculate XP earned
      let xpGained = 0;
      
      // XP por series completadas
      xpGained += data.setsCompleted * XP_PER_SET;
      
      // XP por ejercicios completados
      xpGained += data.exercisesCompleted * XP_PER_EXERCISE;
      
      // XP por completar el entrenamiento
      xpGained += XP_WORKOUT_COMPLETION;
      
      // Bonus por perfección (100% ejercicios)
      if (data.exercisesCompleted === data.totalExercises && data.totalExercises > 0) {
        xpGained += XP_PERFECT_WORKOUT;
      }

      // Obtener perfil actual
      const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select("xp_total, level, streak_days")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        // Si no existe el perfil, crearlo
        if (profileError.code === "PGRST116") {
          await supabase.from("profiles").insert({
            user_id: user.id,
            xp_total: xpGained,
            level: 1,
            streak_days: 1,
          });
          return { success: true, xpGained, newLevel: 1, streakUpdated: true };
        }
        return { success: false, xpGained: 0, newLevel: null, streakUpdated: false };
      }

      // Calcular nuevo XP total
      const currentXP = currentProfile?.xp_total || 0;
      const currentStreak = currentProfile?.streak_days || 0;
      const currentLevel = currentProfile?.level || 1;
      
      // Verificar streak: revisar si entrenó ayer o hoy
      let newStreak = currentStreak;
      let streakUpdated = false;
      
      // Obtener la última sesión completada
      const { data: lastSession } = await supabase
        .from("workout_sessions")
        .select("completed_at")
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(2);

      if (lastSession && lastSession.length >= 2) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const lastWorkoutDate = new Date(lastSession[1].completed_at!);
        lastWorkoutDate.setHours(0, 0, 0, 0);
        
        if (lastWorkoutDate.getTime() === yesterday.getTime()) {
          // Entrenó ayer - continúa el streak
          newStreak = currentStreak + 1;
          xpGained += XP_STREAK_BONUS;
          streakUpdated = true;
        } else if (lastWorkoutDate.getTime() < yesterday.getTime()) {
          // No entrenó ayer - reiniciar streak
          newStreak = 1;
        }
        // Si es el mismo día, mantener el streak actual
      } else if (!lastSession || lastSession.length < 2) {
        // Primera sesión o solo una anterior
        newStreak = 1;
        streakUpdated = true;
      }

      const newTotalXP = currentXP + xpGained;
      const { level: newLevel } = calculateLevel(newTotalXP);
      const leveledUp = newLevel > currentLevel;

      // Actualizar perfil
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          xp_total: newTotalXP,
          level: newLevel,
          streak_days: newStreak,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        return { success: false, xpGained: 0, newLevel: null, streakUpdated: false };
      }

      return { 
        success: true, 
        xpGained, 
        newLevel: leveledUp ? newLevel : null, 
        streakUpdated,
        newStreak,
        leveledUp,
      };
    } catch (error) {
      console.error("Error updating workout progress:", error);
      return { success: false, xpGained: 0, newLevel: null, streakUpdated: false };
    }
  }, [user]);

  return { updateProgress };
}

export { calculateLevel, LEVEL_THRESHOLDS };
