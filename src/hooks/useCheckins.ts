import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { WeeklyCheckin, CheckinFormData, EnergyLevel, AdherenceLevel } from "@/types/checkin";
import { toast } from "sonner";

export function useCheckins() {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<WeeklyCheckin[]>([]);
  const [currentCheckin, setCurrentCheckin] = useState<WeeklyCheckin | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current week info
  const getCurrentWeekInfo = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return { weekNumber, year: now.getFullYear() };
  };

  // Fetch all check-ins for user
  const fetchCheckins = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("weekly_checkins")
        .select(`
          *,
          coach_feedback(*)
        `)
        .eq("user_id", user.id)
        .order("year", { ascending: false })
        .order("week_number", { ascending: false });

      if (error) throw error;
      
      setCheckins(data as WeeklyCheckin[]);

      // Check if current week has a check-in
      const { weekNumber, year } = getCurrentWeekInfo();
      const current = data?.find(c => c.week_number === weekNumber && c.year === year);
      setCurrentCheckin(current as WeeklyCheckin || null);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  // Upload photo to storage
  const uploadPhoto = async (file: File, type: 'front' | 'side' | 'back'): Promise<string | null> => {
    if (!user) return null;

    const { weekNumber, year } = getCurrentWeekInfo();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${year}-W${weekNumber}-${type}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("checkin-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("checkin-photos")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Error al subir la foto");
      return null;
    }
  };

  // Create or update check-in
  const submitCheckin = async (
    formData: CheckinFormData,
    photos?: { front?: File; side?: File; back?: File }
  ): Promise<WeeklyCheckin | null> => {
    if (!user) {
      toast.error("Debés iniciar sesión");
      return null;
    }

    setLoading(true);
    const { weekNumber, year } = getCurrentWeekInfo();

    try {
      // Upload photos if provided
      let front_photo_url = currentCheckin?.front_photo_url || null;
      let side_photo_url = currentCheckin?.side_photo_url || null;
      let back_photo_url = currentCheckin?.back_photo_url || null;

      if (photos?.front) {
        front_photo_url = await uploadPhoto(photos.front, 'front');
      }
      if (photos?.side) {
        side_photo_url = await uploadPhoto(photos.side, 'side');
      }
      if (photos?.back) {
        back_photo_url = await uploadPhoto(photos.back, 'back');
      }

      const checkinData = {
        user_id: user.id,
        week_number: weekNumber,
        year,
        weight: formData.weight || null,
        body_fat_percentage: formData.body_fat_percentage || null,
        front_photo_url,
        side_photo_url,
        back_photo_url,
        energy_level: formData.energy_level,
        sleep_quality: formData.sleep_quality,
        stress_level: formData.stress_level,
        soreness_level: formData.soreness_level,
        training_adherence: formData.training_adherence,
        nutrition_adherence: formData.nutrition_adherence,
        workouts_completed: formData.workouts_completed,
        workouts_planned: formData.workouts_planned,
        wins: formData.wins || null,
        challenges: formData.challenges || null,
        notes: formData.notes || null,
      };

      const { data, error } = await supabase
        .from("weekly_checkins")
        .upsert(checkinData, {
          onConflict: "user_id,week_number,year",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("¡Check-in enviado!");
      await fetchCheckins();
      return data as WeeklyCheckin;
    } catch (error) {
      console.error("Error submitting check-in:", error);
      toast.error("Error al enviar el check-in");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get check-in for a specific week
  const getCheckinByWeek = useCallback((weekNumber: number, year: number): WeeklyCheckin | undefined => {
    return checkins.find(c => c.week_number === weekNumber && c.year === year);
  }, [checkins]);

  return {
    checkins,
    currentCheckin,
    loading,
    submitCheckin,
    getCheckinByWeek,
    getCurrentWeekInfo,
    refetch: fetchCheckins,
  };
}
