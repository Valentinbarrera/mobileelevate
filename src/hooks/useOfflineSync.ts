/**
 * Offline-first persistence hook
 * Stores pending sets in localStorage and syncs when online
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { DifficultyLevel } from "@/types/database";

interface PendingSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  workoutExerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  difficulty: DifficultyLevel;
  createdAt: string;
  retryCount: number;
}

const STORAGE_KEY = "elevate_pending_sets";
const MAX_RETRIES = 5;

export function useOfflineSync() {
  const [pendingSets, setPendingSets] = useState<PendingSet[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load pending sets from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PendingSet[];
        setPendingSets(parsed);
      } catch (e) {
        console.error("Error parsing pending sets:", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save pending sets to localStorage whenever they change
  useEffect(() => {
    if (pendingSets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingSets));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [pendingSets]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.info("Conexión restablecida. Sincronizando...");
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Sin conexión. Los datos se guardarán localmente.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync pending sets when coming online
  useEffect(() => {
    if (isOnline && pendingSets.length > 0 && !isSyncing) {
      syncPendingSets();
    }
  }, [isOnline, pendingSets.length]);

  // Add a set to pending queue
  const addPendingSet = useCallback((set: Omit<PendingSet, "id" | "retryCount">) => {
    const newSet: PendingSet = {
      ...set,
      id: crypto.randomUUID(),
      retryCount: 0,
    };
    
    setPendingSets(prev => [...prev, newSet]);
    return newSet.id;
  }, []);

  // Remove a set from pending queue
  const removePendingSet = useCallback((id: string) => {
    setPendingSets(prev => prev.filter(s => s.id !== id));
  }, []);

  // Sync all pending sets
  const syncPendingSets = useCallback(async () => {
    if (isSyncing || pendingSets.length === 0) return;

    setIsSyncing(true);
    let syncedCount = 0;
    let failedCount = 0;

    for (const pendingSet of pendingSets) {
      try {
        const { error } = await supabase
          .from("exercise_sets")
          .insert({
            session_id: pendingSet.sessionId,
            exercise_id: pendingSet.exerciseId,
            workout_exercise_id: pendingSet.workoutExerciseId,
            set_number: pendingSet.setNumber,
            weight: pendingSet.weight,
            reps: pendingSet.reps,
            difficulty: pendingSet.difficulty,
          });

        if (error) {
          throw error;
        }

        removePendingSet(pendingSet.id);
        syncedCount++;
      } catch (error) {
        console.error("Error syncing set:", error);
        failedCount++;
        
        // Increment retry count
        setPendingSets(prev => 
          prev.map(s => 
            s.id === pendingSet.id 
              ? { ...s, retryCount: s.retryCount + 1 }
              : s
          )
        );

        // Remove if max retries exceeded
        if (pendingSet.retryCount >= MAX_RETRIES) {
          removePendingSet(pendingSet.id);
          toast.error(`Serie descartada tras ${MAX_RETRIES} intentos fallidos`);
        }
      }
    }

    setIsSyncing(false);

    if (syncedCount > 0) {
      toast.success(`${syncedCount} serie${syncedCount > 1 ? 's' : ''} sincronizada${syncedCount > 1 ? 's' : ''}`);
    }
  }, [isSyncing, pendingSets, removePendingSet]);

  return {
    pendingSets,
    isOnline,
    isSyncing,
    addPendingSet,
    removePendingSet,
    syncPendingSets,
    hasPendingSets: pendingSets.length > 0,
  };
}
